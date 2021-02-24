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
 * block-detail.component.ts
 */

import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { Location } from '@angular/common';
import { Block } from '../../classes/block.class';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BlockService } from '../../services/block.service';
import {Observable, Subscription} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {ExtrinsicService} from '../../services/extrinsic.service';
import {EventService} from '../../services/event.service';
import {AppConfigService} from '../../services/app-config.service';
import {BlockTotal} from '../../classes/block-total.class';
import {BlockTotalService} from '../../services/block-total.service';
import {LogService} from '../../services/log.service';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit, OnDestroy {

  block$: Observable<Block>;
  blockTotal$: Observable<BlockTotal>;

  public resourceNotFound: boolean;
  public blockId: string;

  private networkSubscription: Subscription;

  public networkURLPrefix: string;
  public networkTokenDecimals: number;
  public networkTokenSymbol: string;

  public currentTab: string;

  private fragmentSubsription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private blockService: BlockService,
    private blockTotalService: BlockTotalService,
    private extrinsicService: ExtrinsicService,
    private eventService: EventService,
    private logService: LogService,
    private location: Location,
    private appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.resourceNotFound = false;

    this.currentTab = 'transactions';

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {

      this.networkURLPrefix = this.appConfigService.getUrlPrefix();
      this.networkTokenDecimals = +network.attributes.token_decimals;
      this.networkTokenSymbol = network.attributes.token_symbol;

      this.block$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            if (params.get('id')) {
              this.blockId = params.get('id');
              return this.blockService.get(params.get('id'), { include: ['transactions', 'inherents', 'events', 'logs'] });
            }
        })
      );

      this.fragmentSubsription = this.route.fragment.subscribe(value => {
        if (value === 'transactions' || value === 'inherents' || value === 'events' || value === 'logs') {
          this.currentTab = value;
        }
      });

      this.block$.subscribe(value => {
        if (this.currentTab === 'transactions' && value.relationships.transactions.data.length === 0 &&
          value.relationships.inherents.data.length > 0) {
          this.currentTab = 'inherents';
        }
      }, error => {
        if (error.status === 404) {
          this.resourceNotFound = true;
        }
      });

      this.blockTotal$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            if (params.get('id')) {
              return this.blockTotalService.get(params.get('id'), { });
            }
        })
      );
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }

}
