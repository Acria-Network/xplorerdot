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
 * transaction-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection, Service} from 'ngx-jsonapi';
import {ExtrinsicService} from '../../services/extrinsic.service';
import {Extrinsic} from '../../classes/extrinsic.class';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {RuntimeModule} from '../../classes/runtime-module.class';
import {RuntimeModuleService} from '../../services/runtime-module.service';
import {RuntimeCallService} from '../../services/runtime-call.service';
import {RuntimeCall} from '../../classes/runtime-call.class';
import {AppConfigService} from '../../services/app-config.service';
import {AccountService} from '../../services/account.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {

  public extrinsics: DocumentCollection<Extrinsic>;

  public runtimeModules: DocumentCollection<RuntimeModule>;
  public runtimeCalls: DocumentCollection<RuntimeCall>;
  public filterModule: RuntimeModule = null;
  public filterCall: RuntimeCall = null;

  currentPage = 1;

  private fragmentSubsription: Subscription;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;

  constructor(
    private extrinsicService: ExtrinsicService,
    private accountService: AccountService,
    private runtimeModuleService: RuntimeModuleService,
    private runtimeCallService: RuntimeCallService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      const params = {
        page: {number: 0, size: 100},
        remotefilter: {latestRuntime: true},
      };

      this.runtimeModuleService.all(params).subscribe(runtimeModules => {
        this.runtimeModules = runtimeModules;
      });

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
        this.currentPage = +queryParams.page || 1;
        this.filterModule = queryParams.module || null;

        if (this.filterModule != null) {
          this.selectModule(this.filterModule);
        }

        this.filterCall = queryParams.call || null;
        this.getExtrinsics(this.currentPage);
      });
    });
  }

  selectModule(module) {

    this.filterModule = module;
    this.filterCall = null;

    if (module !== null) {
      const params = {
        page: {number: 0, size: 100},
        remotefilter: {latestRuntime: true, module_id: this.filterModule},
      };

      this.runtimeCallService.all(params).subscribe(runtimeCalls => {
        this.runtimeCalls = runtimeCalls;
      });
    } else {
      this.runtimeCalls = null;
    }
  }

  applyFilters() {
    this.router.navigate([], { queryParams: {
        module: this.filterModule,
        call: this.filterCall,
        page: 1
      }
    });
  }

  getExtrinsics(page: number): void {

    // tslint:disable-next-line:prefer-const
    let params = {
      page: {number: page, size: 25},
      remotefilter: {
        signed: 1
      },
    };

    if (this.filterModule !== null) {
      // @ts-ignore
      params.remotefilter.module_id = this.filterModule;
    }

    if (this.filterCall !== null) {
      // @ts-ignore
      params.remotefilter.call_id = this.filterCall;
    }

    this.extrinsicService.all(params).subscribe(extrinsics => {
      this.extrinsics = extrinsics;
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }
}
