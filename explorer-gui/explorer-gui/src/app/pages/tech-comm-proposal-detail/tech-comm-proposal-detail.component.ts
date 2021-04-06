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
 * tech-comm-proposal-detail.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {switchMap} from 'rxjs/operators';
import {TechCommProposal} from '../../classes/tech-comm-proposal.class';
import {TechCommProposalService} from '../../services/tech-comm-proposal.service';
import {TechCommProposalVoteService} from '../../services/tech-comm-proposal-vote.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-tech-comm-proposal-detail',
  templateUrl: './tech-comm-proposal-detail.component.html',
  styleUrls: ['./tech-comm-proposal-detail.component.scss']
})
export class TechCommProposalDetailComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public proposal$: Observable<TechCommProposal>;

  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public networkURLPrefix: string;
  public currentTab: string;

  private fragmentSubsription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private techCommProposalService: TechCommProposalService,
    private techCommProposalVoteService: TechCommProposalVoteService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.currentTab = 'proposal';

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.proposal$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.techCommProposalService.get(params.get('id'), { include: ['votes'] });
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
