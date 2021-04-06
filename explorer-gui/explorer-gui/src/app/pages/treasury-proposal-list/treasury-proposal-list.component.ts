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
 * treasury-proposal-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {TreasuryProposal} from '../../classes/treasury-proposal.class';
import {TreasuryProposalService} from '../../services/treasury-proposal.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-treasury-proposal-list',
  templateUrl: './treasury-proposal-list.component.html',
  styleUrls: ['./treasury-proposal-list.component.scss']
})
export class TreasuryProposalListComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public proposals: DocumentCollection<TreasuryProposal>;

  public networkTokenDecimals: number;
  public networkTokenSymbol: string;
  public networkURLPrefix: string;

  currentPage = 1;

  private fragmentSubsription: Subscription;

  constructor(
    private treasuryProposalService: TreasuryProposalService,
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
      page: {number: page, size: 25},
      remotefilter: {},
    };

    this.treasuryProposalService.all(params).subscribe(proposals => {
      this.proposals = proposals;
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
