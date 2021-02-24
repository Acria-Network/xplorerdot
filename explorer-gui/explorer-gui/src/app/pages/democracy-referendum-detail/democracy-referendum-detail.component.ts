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
 * democracy-referendum-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {DemocracyReferendum} from '../../classes/democracy-referendum.class';
import {DemocracyReferendumService} from '../../services/democracy-referendum.service';
import {AppConfigService} from '../../services/app-config.service';
import {DemocracyVoteService} from '../../services/democracy-vote.service';
import {DemocracyPreimageService} from '../../services/democracy-preimage.service';

@Component({
  selector: 'app-democracy-referendum-detail',
  templateUrl: './democracy-referendum-detail.component.html',
  styleUrls: ['./democracy-referendum-detail.component.scss']
})
export class DemocracyReferendumDetailComponent implements OnInit, OnDestroy {

  public referendum$: Observable<DemocracyReferendum>;

  private networkSubscription: Subscription;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public networkURLPrefix: string;
  public currentTab: string;

  private fragmentSubsription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private democracyReferendumService: DemocracyReferendumService,
    private democracyVoteService: DemocracyVoteService,
    private democracyPreimageService: DemocracyPreimageService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.currentTab = 'proposal';
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.referendum$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.democracyReferendumService.get(params.get('id'), { include: ['votes', 'preimages'] });
        })
      );
      this.fragmentSubsription = this.activatedRoute.fragment.subscribe(value => {
        if (value === 'proposal' || value === 'votes') {
          this.currentTab = value;
        }
      });
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
