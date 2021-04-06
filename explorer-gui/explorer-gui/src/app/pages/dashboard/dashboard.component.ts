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
 * dashboard.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {Block} from '../../classes/block.class';
import {interval, Observable, Subscription} from 'rxjs';
import {Networkstats} from '../../classes/networkstats.class';
import {BlockService} from '../../services/block.service';
import {NetworkstatsService} from '../../services/networkstats.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BalanceTransfer} from '../../classes/balancetransfer.class';
import {BalanceTransferService} from '../../services/balance-transfer.service';
import {AppConfigService} from '../../services/app-config.service';
import {environment} from '../../../environments/environment';
import {AnalyticsChart} from '../../classes/analytics-chart.class';
import {AnalyticsChartService} from '../../services/analytics-chart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public blocks: DocumentCollection<Block>;
  public balanceTransfers: DocumentCollection<BalanceTransfer>;
  public networkstats$: Observable<Networkstats>;

  blockSearchText: string;
  private blockUpdateSubsription: Subscription;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkTokenDecimals = 0;
  public networkTokenSymbol = '';
  public networkColor: string;

  public averageBlocktimeDaychart$: Observable<AnalyticsChart>;
  public totalTransactionsDaychart$: Observable<AnalyticsChart>;
  public cumulativeAccountsDayChart$: Observable<AnalyticsChart>;

  constructor(
    private blockService: BlockService,
    private balanceTransferService: BalanceTransferService,
    private networkstatsService: NetworkstatsService,
    private appConfigService: AppConfigService,
    private analyticsChartService: AnalyticsChartService,
    private router: Router,
    private http: HttpClient) {

  }

  ngOnInit() {
    this.blockSearchText = '';

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;
      this.getBlocks();
      this.networkstats$ = this.networkstatsService.get('latest');

      // Retrieve charts
      if (environment.jsonApiDiscoveryRootUrl) {

        this.networkColor = '#3498db';

        this.totalTransactionsDaychart$ = this.analyticsChartService.get('utcday-extrinsics_signed-sum-line-14');
        this.cumulativeAccountsDayChart$ = this.analyticsChartService.get('utcday-accounts_new-sum-line-14');
        this.averageBlocktimeDaychart$ = this.analyticsChartService.get('utcday-blocktime-avg-line-14');
      }
    });

    const blockUpdateCounter = interval(6000);

    this.blockUpdateSubsription = blockUpdateCounter.subscribe( n => {
      this.getBlocks();
      this.networkstats$ = this.networkstatsService.get('latest');
    });
  }

  getBlocks(): void {
    this.blockService.all({
      page: {number: 0}
    }).subscribe(blocks => (this.blocks = blocks));

    this.balanceTransferService.all({
      page: {number: 0}
    }).subscribe(balanceTransfers => (this.balanceTransfers = balanceTransfers));

  }

  search(): void {
    // Strip whitespace from search text
    this.blockSearchText = this.blockSearchText.trim();
    if (this.blockSearchText !== '') {
      this.router.navigate([this.networkURLPrefix, 'analytics', 'search', this.blockSearchText]);
    }
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.blockUpdateSubsription.unsubscribe();
    this.networkSubscription.unsubscribe();
  }
}
