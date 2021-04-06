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
 * balances-transfer-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {BalanceTransfer} from '../../classes/balancetransfer.class';
import {BalanceTransferService} from '../../services/balance-transfer.service';
import {Subscription} from 'rxjs';
import {AppConfigService} from '../../services/app-config.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-balances-transfer-list',
  templateUrl: './balances-transfer-list.component.html',
  styleUrls: ['./balances-transfer-list.component.scss']
})
export class BalancesTransferListComponent implements OnInit, OnDestroy {

  public balanceTransfers: DocumentCollection<BalanceTransfer>;
  currentPage = 1;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;

  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  private fragmentSubsription: Subscription;

  constructor(
    private balanceTransferService: BalanceTransferService,
    private activatedRoute: ActivatedRoute,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
        this.currentPage = +queryParams.page || 1;
        this.getItems(this.currentPage);
      });
    });
  }

  getItems(page: number): void {

    const params = {
      page: { number: page, size: 25},
      remotefilter: {},
    };

    this.balanceTransferService.all(params).subscribe(balanceTransfers => {
      this.balanceTransfers = balanceTransfers;
    });
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }
}
