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
 * transaction-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Extrinsic} from '../../classes/extrinsic.class';
import {ExtrinsicService} from '../../services/extrinsic.service';
import {AppConfigService} from '../../services/app-config.service';
import {EventService} from '../../services/event.service';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit, OnDestroy {

  extrinsic$: Observable<Extrinsic>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public resourceNotFound: boolean;
  public transactionHash: string;

  constructor(
    private route: ActivatedRoute,
    private extrinsicService: ExtrinsicService,
    private eventService: EventService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.resourceNotFound = false;

      this.extrinsic$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          this.transactionHash = params.get('id');
          return this.extrinsicService.get(params.get('id'), { include: ['events'] });
        })
      );

      this.extrinsic$.subscribe(res => {}, error => {
        if (error.status === 404) {
          this.resourceNotFound = true;
        }
      });
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }
}
