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
 * block-list.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import { Block } from '../../classes/block.class';
import { BlockService} from '../../services/block.service';
import { DocumentCollection } from 'ngx-jsonapi';
import {interval, Subscription} from 'rxjs';
import {AppConfigService} from '../../services/app-config.service';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss']
})
export class BlockListComponent implements OnInit, OnDestroy {

  public blocks: DocumentCollection<Block>;
  private blockUpdateSubsription: Subscription;
  private fragmentSubsription: Subscription;

  public showLoading: boolean;

  private networkSubscription: Subscription;
  public networkURLPrefix: string;

  currentPage = 1;

  constructor(
    private blockService: BlockService,
    private activatedRoute: ActivatedRoute,
    private appConfigService: AppConfigService
  ) {

  }

  ngOnInit() {
    this.showLoading = true;

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkURLPrefix = this.appConfigService.getUrlPrefix();

      const blockUpdateCounter = interval(6000);
      this.blockUpdateSubsription = blockUpdateCounter.subscribe( n => {
        this.showLoading = false;
        this.getBlocks(this.currentPage);
      });

      this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(params => {
        this.showLoading = true;
        this.currentPage = +params.page || 1;
        this.getBlocks(this.currentPage);
      });

    });
  }

  getBlocks(page: number): void {

    this.blockService.all({
      page: {number: page, size: 25}
    }).subscribe(blocks => {
      this.blocks = blocks;
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.blockUpdateSubsription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }
}
