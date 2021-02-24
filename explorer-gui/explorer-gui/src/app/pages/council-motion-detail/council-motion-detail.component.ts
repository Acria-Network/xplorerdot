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
 * council-motion-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {CouncilMotion} from '../../classes/council-motion.class';
import {CouncilVoteService} from '../../services/council-vote.service';
import {CouncilMotionService} from '../../services/council-motion.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-council-motion-detail',
  templateUrl: './council-motion-detail.component.html',
  styleUrls: ['./council-motion-detail.component.scss']
})
export class CouncilMotionDetailComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public councilMotion$: Observable<CouncilMotion>;

  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public networkURLPrefix: string;
  public currentTab: string;

  private fragmentSubsription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private councilMotionService: CouncilMotionService,
    private councilVoteService: CouncilVoteService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.currentTab = 'proposal';

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.councilMotion$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.councilMotionService.get(params.get('id'), { include: ['votes'] });
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
    this.fragmentSubsription.unsubscribe();
    this.networkSubscription.unsubscribe();
  }

}
