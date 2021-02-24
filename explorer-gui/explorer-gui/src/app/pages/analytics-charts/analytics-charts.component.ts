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
 * analytics-charts.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {AnalyticsChart} from '../../classes/analytics-chart.class';
import {AppConfigService} from '../../services/app-config.service';
import {AnalyticsChartService} from '../../services/analytics-chart.service';
import {DocumentCollection} from 'ngx-jsonapi';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-analytics-charts',
  templateUrl: './analytics-charts.component.html',
  styleUrls: ['./analytics-charts.component.scss']
})
export class AnalyticsChartsComponent implements OnInit, OnDestroy  {

  public charts: DocumentCollection<AnalyticsChart>;
  currentPage = 1;

  averageBlocktimeDaychart$: Observable<AnalyticsChart>;
  totalTransactionsDaychart$: Observable<AnalyticsChart>;
  cumulativeAccountsDayChart$: Observable<AnalyticsChart>;

  public networkURLPrefix: string;
  public networkColor: string;
  private networkSubscription: Subscription;
  private fragmentSubsription: Subscription;

  constructor(
    private appConfigService: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private analyticsChartService: AnalyticsChartService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkColor = '#' + network.attributes.color_code;

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
        this.currentPage = +queryParams.page || 1;
        this.getItems(this.currentPage);
      });

      // Retrieve charts
      this.totalTransactionsDaychart$ = this.analyticsChartService.get('utcday-extrinsics_signed-sum-line-0');
      this.cumulativeAccountsDayChart$ = this.analyticsChartService.get('utcday-accounts-tot-line-0');
      this.averageBlocktimeDaychart$ = this.analyticsChartService.get('utcday-blocktime-avg-line-14');
    });
  }

  getItems(page: number): void {

    const params = {
      page: { number: page, size: 25},
      remotefilter: {},
    };

    this.analyticsChartService.all(params).subscribe(charts => {
      this.charts = charts;
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }
}
