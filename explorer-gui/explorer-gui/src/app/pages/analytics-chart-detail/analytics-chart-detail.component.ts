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
 * analytics-chart-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AppConfigService} from '../../services/app-config.service';
import {switchMap} from 'rxjs/operators';
import {AnalyticsChart} from '../../classes/analytics-chart.class';
import {AnalyticsChartService} from '../../services/analytics-chart.service';

@Component({
  selector: 'app-analytics-chart-detail',
  templateUrl: './analytics-chart-detail.component.html',
  styleUrls: ['./analytics-chart-detail.component.scss']
})
export class AnalyticsChartDetailComponent implements OnInit, OnDestroy {

  public chart$: Observable<AnalyticsChart>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkColor: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private analyticsChartService: AnalyticsChartService,
    private router: Router,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkColor = '#' + network.attributes.color_code;

      this.chart$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.analyticsChartService.get(params.get('id'));
        })
      );

      this.chart$.subscribe(res => {}, error => {
        if (error.status === 404) {
          this.router.navigateByUrl('404', {skipLocationChange: true});
        }
      });
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }
}
