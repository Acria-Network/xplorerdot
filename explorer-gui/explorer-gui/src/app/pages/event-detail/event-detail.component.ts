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
 * event-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Event} from '../../classes/event.class';
import {EventService} from '../../services/event.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event$: Observable<Event>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
   this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.getEvent();
    });
  }

  getEvent() {

    this.networkURLPrefix = this.appConfigService.getUrlPrefix();

    this.event$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.eventService.get(params.get('id'));
      })
    );

  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }
}
