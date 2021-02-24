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
 * preimage-table.component.ts
 */

import {Component, Input, OnInit} from '@angular/core';
import {DemocracyPreimage} from '../../classes/democracy-preimage.class';
import {DemocracyPreimageService} from '../../services/democracy-preimage.service';

@Component({
  selector: 'app-preimage-table',
  templateUrl: './preimage-table.component.html',
  styleUrls: ['./preimage-table.component.scss']
})
export class PreimageTableComponent implements OnInit {

  @Input() preimage: DemocracyPreimage = null;
  @Input() extrinsicId: string = null;
  @Input() context: string = null;
  @Input() networkURLPrefix: string = null;
  @Input() networkTokenDecimals = 0;
  @Input() networkTokenSymbol: string ;

  constructor(private democracyPreimageService: DemocracyPreimageService) { }

  ngOnInit() {

  }

  download(callArg: string) {
    return this.democracyPreimageService.getPrePath() + '/' + this.democracyPreimageService.path + '/' +
      this.preimage.id + '/download/' + callArg;
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }
}
