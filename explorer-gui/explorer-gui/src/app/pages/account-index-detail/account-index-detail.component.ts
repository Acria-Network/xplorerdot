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
 * account-index-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {AccountIndex} from '../../classes/account-index.class';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {AccountIndexService} from '../../services/account-index.service';
import {switchMap} from 'rxjs/operators';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-account-index-detail',
  templateUrl: './account-index-detail.component.html',
  styleUrls: ['./account-index-detail.component.scss']
})
export class AccountIndexDetailComponent implements OnInit {

  public accountIndex$: Observable<AccountIndex>;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;

  constructor(
    private accountIndexService: AccountIndexService,
    private activatedRoute: ActivatedRoute,
    private appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.accountIndex$ = this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.accountIndexService.get(params.get('id'));
        })
      );
    });
  }
}
