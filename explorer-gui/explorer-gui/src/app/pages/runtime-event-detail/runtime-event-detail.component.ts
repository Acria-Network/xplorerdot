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
 * runtime-event-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {RuntimeEvent} from "../../classes/runtime-event.class";
import {RuntimeEventService} from "../../services/runtime-event.service";
import {RuntimeEventAttributeService} from "../../services/runtime-event-attribute.service";
import {EventService} from "../../services/event.service";
import {AppConfigService} from "../../services/app-config.service";

@Component({
  selector: 'app-runtime-event-detail',
  templateUrl: './runtime-event-detail.component.html',
  styleUrls: ['./runtime-event-detail.component.scss']
})
export class RuntimeEventDetailComponent implements OnInit {

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public runtimeEvent$: Observable<RuntimeEvent>;

  constructor(
    private route: ActivatedRoute,
    private runtimeEventService: RuntimeEventService,
    private runtimeEventAttributeService: RuntimeEventAttributeService,
    private eventService: EventService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe(network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.runtimeEvent$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          if (params.get('id')) {
            return this.runtimeEventService.get(params.get('id'), {include: ['attributes', 'recent_events']});
          }
        })
      );
    });
  }

}
