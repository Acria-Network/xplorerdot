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
 * council-motion-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DocumentCollection} from 'ngx-jsonapi';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CouncilMotion} from '../../classes/council-motion.class';
import {CouncilMotionService} from '../../services/council-motion.service';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-council-motion-list',
  templateUrl: './council-motion-list.component.html',
  styleUrls: ['./council-motion-list.component.scss']
})
export class CouncilMotionListComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public motions: DocumentCollection<CouncilMotion>;
  public networkURLPrefix;
  currentPage = 1;

  private fragmentSubsription: Subscription;

  constructor(
    private councilMotionService: CouncilMotionService,
    private activatedRoute: ActivatedRoute,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
        this.currentPage = +queryParams.page || 1;
        this.getItems(this.currentPage);
      });
    });
  }

  getItems(page: number): void {

    const params = {
      page: {number: page, size: 25},
      remotefilter: {},
    };

    this.councilMotionService.all(params).subscribe(motions => {
      this.motions = motions;
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.fragmentSubsription.unsubscribe();
    this.networkSubscription.unsubscribe();
  }
}
