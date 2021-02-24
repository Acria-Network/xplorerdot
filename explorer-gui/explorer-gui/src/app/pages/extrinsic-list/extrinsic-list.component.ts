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
 * extrinsic-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection, Service} from 'ngx-jsonapi';
import {ExtrinsicService} from '../../services/extrinsic.service';
import {Extrinsic} from '../../classes/extrinsic.class';
import {Subscription} from 'rxjs';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-extrinsic-list',
  templateUrl: './extrinsic-list.component.html',
  styleUrls: ['./extrinsic-list.component.scss']
})
export class ExtrinsicListComponent implements OnInit, OnDestroy {

  public extrinsics: DocumentCollection<Extrinsic>;
  currentPage = 1;
  signedOnly = true;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;

  constructor(
    private extrinsicService: ExtrinsicService,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.getExtrinsics(this.currentPage, this.signedOnly);
    });
  }

  getExtrinsics(page: number, signedOnly: boolean): void {

    const params = {
      page: {number: page, size: 25},
      remotefilter: {},
    };

    if (this.signedOnly) {
      // tslint:disable-next-line:no-string-literal
      params['remotefilter']['signed'] = 1;
    }

    this.extrinsicService.all(params).subscribe(extrinsics => {
      this.extrinsics = extrinsics;
    });
  }

  refreshExtrinsics(): void {
    this.getExtrinsics(this.currentPage, this.signedOnly);
  }

  getNextExtrinsics(): void {
    this.currentPage += 1;
    this.refreshExtrinsics();
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }
}
