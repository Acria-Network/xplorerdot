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
 * runtime-constant-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {RuntimeConstant} from '../../classes/runtime-constant.class';
import {RuntimeConstantService} from '../../services/runtime-constant.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-runtime-constant-detail',
  templateUrl: './runtime-constant-detail.component.html',
  styleUrls: ['./runtime-constant-detail.component.scss']
})
export class RuntimeConstantDetailComponent implements OnInit {

  runtimeConstant$: Observable<RuntimeConstant>;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;

  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  constructor(
    private route: ActivatedRoute,
    private runtimeConstantService: RuntimeConstantService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe(network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;


      this.runtimeConstant$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          if (params.get('id')) {
            return this.runtimeConstantService.get(params.get('id'));
          }
        })
      );
    });
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

}
