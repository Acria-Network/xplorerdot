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
 * account-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {Account} from '../../classes/account.class';
import {AccountService} from '../../services/account.service';
import {AppConfigService} from '../../services/app-config.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit, OnDestroy {

  public accounts: DocumentCollection<Account>;
  currentPage = 1;

  private fragmentSubsription: Subscription;
  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public title: string;
  public showBalances: boolean;

  constructor(
    private accountService: AccountService,
    private appConfigService: AppConfigService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.showBalances = true;
    this.title = this.activatedRoute.snapshot.data.title;

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

    if (this.activatedRoute.snapshot.data.filter) {
      params.remotefilter[this.activatedRoute.snapshot.data.filter] = 1;
    }

    this.accountService.all(params).subscribe(accounts => {
      if (!accounts.is_loading && accounts.data.length > 0) {
        this.showBalances = accounts.data[0].attributes.balance_total !== null;
      }
      this.accounts = accounts;
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
