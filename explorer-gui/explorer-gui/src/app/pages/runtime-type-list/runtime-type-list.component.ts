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
 * runtime-type-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {RuntimeType} from '../../classes/runtime-type.class';
import {RuntimeTypeService} from '../../services/runtime-type.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-runtime-type-list',
  templateUrl: './runtime-type-list.component.html',
  styleUrls: ['./runtime-type-list.component.scss']
})
export class RuntimeTypeListComponent implements OnInit, OnDestroy {

  public types: DocumentCollection<RuntimeType>;
  public currentPage = 1;
  public pageSize = 50;
  private fragmentSubsription: Subscription;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;


  constructor(
    private runtimeTypeService: RuntimeTypeService,
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
      remotefilter: {latestRuntime: true},
      page: { number: page, size: this.pageSize},
    };

    this.runtimeTypeService.all(params).subscribe(types => {
      this.types = types;
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }

}
