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
 * address-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {BalanceTransferService} from '../../services/balance-transfer.service';
import {DocumentCollection} from 'ngx-jsonapi';
import {BalanceTransfer} from '../../classes/balancetransfer.class';
import {Subscription} from 'rxjs';
import {AppConfigService} from '../../services/app-config.service';
import {Extrinsic} from '../../classes/extrinsic.class';
import {ExtrinsicService} from '../../services/extrinsic.service';


@Component({
  selector: 'app-address-detail',
  templateUrl: './address-detail.component.html',
  styleUrls: ['./address-detail.component.scss']
})
export class AddressDetailComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public balanceTransfers: DocumentCollection<BalanceTransfer>;
  public extrinsics: DocumentCollection<Extrinsic>;

  public account: string;
  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  constructor(
    private balanceTransferService: BalanceTransferService,
    private extrinsicService: ExtrinsicService,
    private appConfigService: AppConfigService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.activatedRoute.params.subscribe(val => {
        this.account = val.id;

        this.balanceTransferService.all({
          remotefilter: {address: this.account},
          page: {number: 0}
        }).subscribe(balanceTransfers => (this.balanceTransfers = balanceTransfers));

        const params = {
          page: {number: 0, size: 25},
            remotefilter: {address: val.id},
          };

        this.extrinsicService.all(params).subscribe(extrinsics => {
          this.extrinsics = extrinsics;
        });
      });
    });
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }
}
