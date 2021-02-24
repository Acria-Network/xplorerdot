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
 * runtime-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Location} from "@angular/common";
import {switchMap} from "rxjs/operators";
import {Runtime} from "../../classes/runtime.class";
import {RuntimeService} from "../../services/runtime.service";
import {RuntimeModuleService} from "../../services/runtime-module.service";
import {RuntimeTypeService} from "../../services/runtime-type.service";
import {AppConfigService} from "../../services/app-config.service";

@Component({
  selector: 'app-runtime-detail',
  templateUrl: './runtime-detail.component.html',
  styleUrls: ['./runtime-detail.component.scss']
})
export class RuntimeDetailComponent implements OnInit {

  private networkSubscription: Subscription;
  public networkURLPrefix: string;
  public runtime$: Observable<Runtime>;

  constructor(
    private route: ActivatedRoute,
    private runtimeService: RuntimeService,
    private runtimeModuleService: RuntimeModuleService,
    private runtimeTypeService: RuntimeTypeService,
    private location: Location,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe(network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.runtime$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            if (params.get('id')) {
              return this.runtimeService.get(params.get('id'), { include: ['modules', 'types'] });
            }
        })
      );
    });
  }

  goBack(): void {
    this.location.back();
  }

}
