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
 * democracy-preimage-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {AppConfigService} from '../../services/app-config.service';
import {switchMap} from 'rxjs/operators';
import {DemocracyPreimage} from '../../classes/democracy-preimage.class';
import {DemocracyPreimageService} from '../../services/democracy-preimage.service';

@Component({
  selector: 'app-democracy-preimage-detail',
  templateUrl: './democracy-preimage-detail.component.html',
  styleUrls: ['./democracy-preimage-detail.component.scss']
})
export class DemocracyPreimageDetailComponent implements OnInit, OnDestroy {

  public preimage$: Observable<DemocracyPreimage>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private democracyPreimageService: DemocracyPreimageService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.preimage$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.democracyPreimageService.get(params.get('id'));
        })
      );
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
