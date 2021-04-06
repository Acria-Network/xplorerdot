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
 * runtime-storage-detail.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {RuntimeStorage} from '../../classes/runtime-storage.class';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {RuntimeStorageService} from '../../services/runtime-storage.service';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-runtime-storage-detail',
  templateUrl: './runtime-storage-detail.component.html',
  styleUrls: ['./runtime-storage-detail.component.scss']
})
export class RuntimeStorageDetailComponent implements OnInit {

  runtimeStorage$: Observable<RuntimeStorage>;

  constructor(
    private route: ActivatedRoute,
    private runtimeStorageService: RuntimeStorageService
  ) { }

  ngOnInit() {
    this.runtimeStorage$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
          if (params.get('id')) {
            return this.runtimeStorageService.get(params.get('id'));
          }
      })
    );
  }

}
