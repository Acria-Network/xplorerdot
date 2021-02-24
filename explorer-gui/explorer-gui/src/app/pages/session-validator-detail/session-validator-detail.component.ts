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
 * session-validator-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {SessionValidatorService} from '../../services/session-validator.service';
import {switchMap} from 'rxjs/operators';
import {SessionValidator} from '../../classes/session-validator.class';
import {SessionNominatorService} from '../../services/session-nominator.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-session-validator-detail',
  templateUrl: './session-validator-detail.component.html',
  styleUrls: ['./session-validator-detail.component.scss']
})
export class SessionValidatorDetailComponent implements OnInit {

  public sessionValidator$: Observable<SessionValidator>;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private sessionValidatorService: SessionValidatorService,
    private sessionNominatorService: SessionNominatorService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.sessionValidator$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.sessionValidatorService.get(params.get('id'), {include: ['nominators']});
        })
      );
    });
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

}
