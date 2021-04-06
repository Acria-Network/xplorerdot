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
 * log-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {Log} from "../../classes/log.class";
import {LogService} from "../../services/log.service";
import {AppConfigService} from "../../services/app-config.service";

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent implements OnInit {

  public log$: Observable<Log>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private logService: LogService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.log$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.logService.get(params.get('id'));
        })
      );
    });
  }

}
