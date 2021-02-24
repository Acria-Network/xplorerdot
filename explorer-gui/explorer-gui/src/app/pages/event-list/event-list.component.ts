/*
 * Polkascan Explorer GUI
 *
 * Copyright 2018-2020 openAware BV (NL).
 * This file is part of Polkascan.
 *
 * Polkascan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Polkascan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Polkascan. If not, see <http://www.gnu.org/licenses/>.
 *
 * event-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {Event} from '../../classes/event.class';
import {EventService} from '../../services/event.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {RuntimeModule} from '../../classes/runtime-module.class';
import {RuntimeEvent} from '../../classes/runtime-event.class';
import {RuntimeModuleService} from '../../services/runtime-module.service';
import {RuntimeEventService} from '../../services/runtime-event.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnDestroy {

  public events: DocumentCollection<Event>;

  public runtimeModules: DocumentCollection<RuntimeModule>;
  public runtimeEvents: DocumentCollection<RuntimeEvent>;
  public filterModule: RuntimeModule = null;
  public filterEvent: RuntimeEvent = null;

  public currentPage = 1;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;

  private fragmentSubsription: Subscription;

  constructor(
    private eventService: EventService,
    private runtimeModuleService: RuntimeModuleService,
    private runtimeEventService: RuntimeEventService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      // Fetch runtime modules for filtering
      const params = {
        page: {number: 0, size: 100},
        remotefilter: {latestRuntime: true},
      };

      this.runtimeModuleService.all(params).subscribe(runtimeModules => {
        this.runtimeModules = runtimeModules;
      });

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
        this.currentPage = +queryParams.page || 1;
        this.filterModule = queryParams.module || null;

        if (this.filterModule != null) {
          this.selectModule(this.filterModule);
        }

        this.filterEvent = queryParams.event || null;
        this.getEvents(this.currentPage);
      });
    });
  }

  selectModule(module) {

    this.filterModule = module;
    this.filterEvent = null;

    if (module !== null) {
      const params = {
        page: {number: 0, size: 100},
        remotefilter: {latestRuntime: true, module_id: this.filterModule},
      };

      this.runtimeEventService.all(params).subscribe(runtimeEvents => {
        this.runtimeEvents = runtimeEvents;
      });
    } else {
      this.runtimeEvents = null;
    }
  }

  applyFilters() {
    this.router.navigate([], { queryParams: {
        module: this.filterModule,
        event: this.filterEvent,
        page: 1
      }
    });
  }

  getEvents(page: number): void {

    // tslint:disable-next-line:prefer-const
    let params = {
      page: {number: page, size: 25},
      remotefilter: {}
    };

    if (this.filterModule !== null) {
      // @ts-ignore
      params.remotefilter.module_id = this.filterModule;
    }

    if (this.filterEvent !== null) {
      // @ts-ignore
      params.remotefilter.event_id = this.filterEvent;
    }

    this.eventService.all(params).subscribe(events => (this.events = events));
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }

}
