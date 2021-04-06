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
 * runtime-call-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {RuntimeCallService} from "../../services/runtime-call.service";
import {RuntimeCall} from "../../classes/runtime-call.class";
import {RuntimeCallParamService} from "../../services/runtime-call-param.service";
import {ExtrinsicService} from "../../services/extrinsic.service";
import {AppConfigService} from "../../services/app-config.service";

@Component({
  selector: 'app-runtime-call-detail',
  templateUrl: './runtime-call-detail.component.html',
  styleUrls: ['./runtime-call-detail.component.scss']
})
export class RuntimeCallDetailComponent implements OnInit {

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public runtimeCall$: Observable<RuntimeCall>;

  constructor(
    private route: ActivatedRoute,
    private runtimeCallService: RuntimeCallService,
    private runtimeCallParamService: RuntimeCallParamService,
    private extrinsicService: ExtrinsicService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe(network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.runtimeCall$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          if (params.get('id')) {
            return this.runtimeCallService.get(params.get('id'), {include: ['params', 'recent_extrinsics']});
          }
        })
      );
    });
  }

}
