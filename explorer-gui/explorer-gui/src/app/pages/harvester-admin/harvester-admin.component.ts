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
 * harvester-admin.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import {Networkstats} from '../../classes/networkstats.class';
import {NetworkstatsService} from '../../services/networkstats.service';
import { HttpClient } from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-harvester-admin',
  templateUrl: './harvester-admin.component.html',
  styleUrls: ['./harvester-admin.component.scss']
})
export class HarvesterAdminComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public networkstats$: Observable<Networkstats>;

  public harvesterQueue: Object;
  public harvesterQueue$: Observable<Object>;

  constructor(
    private networkstatsService: NetworkstatsService,
    private httpClient: HttpClient,
    private appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.harvesterQueue$ = this.httpClient.get(this.appConfigService.getNetworkApiUrlRoot() + '/harvester/queue');

      this.harvesterQueue$.subscribe((res: Object) => {
        this.harvesterQueue = res;
      });
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }

  startHarvester() {
    this.httpClient.post(this.appConfigService.getNetworkApiUrlRoot() + '/harvester/start', {}).subscribe((res: Object) => {

    });
  }
}
