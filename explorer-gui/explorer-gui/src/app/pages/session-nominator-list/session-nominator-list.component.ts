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
 * session-nominator-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {SessionValidator} from '../../classes/session-validator.class';
import {SessionValidatorService} from '../../services/session-validator.service';
import {environment} from '../../../environments/environment';
import {SessionNominator} from '../../classes/session-nominator.class';
import {SessionNominatorService} from '../../services/session-nominator.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-session-nominator-list',
  templateUrl: './session-nominator-list.component.html',
  styleUrls: ['./session-nominator-list.component.scss']
})
export class SessionNominatorListComponent implements OnInit, OnDestroy {

  public nominators: DocumentCollection<SessionNominator>;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  currentPage = 1;

  private fragmentSubsription: Subscription;

  constructor(
    private sessionNominatorService: SessionNominatorService,
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
      remotefilter: {latestSession: true},
    };

    this.sessionNominatorService.all(params).subscribe(nominators => {
      this.nominators = nominators;
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
