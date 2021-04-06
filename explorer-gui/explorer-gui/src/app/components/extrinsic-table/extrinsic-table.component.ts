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
 * extrinsic-table.component.ts
 */

import {Component, Input, OnInit} from '@angular/core';
import {Extrinsic} from '../../classes/extrinsic.class';
import {Location} from '@angular/common';
import {ExtrinsicService} from '../../services/extrinsic.service';

@Component({
  selector: 'app-extrinsic-table',
  templateUrl: './extrinsic-table.component.html',
  styleUrls: ['./extrinsic-table.component.scss']
})
export class ExtrinsicTableComponent implements OnInit {

  @Input() extrinsic: Extrinsic = null;
  @Input() extrinsicId: string = null;
  @Input() context: string = null;
  @Input() networkURLPrefix: string = null;
  @Input() networkTokenDecimals = 0;
  @Input() networkTokenSymbol: string ;
  @Input() title: string;

  constructor(
    private location: Location,
    private extrinsicService: ExtrinsicService
  ) { }

  ngOnInit() {
    if (this.extrinsicId) {
       this.extrinsicService.get(this.extrinsicId).subscribe(extrinsic => this.extrinsic = extrinsic);
    }
  }

  goBack(): void {
    this.location.back();
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

  paramName(name: string) {

    if (name === 'dest') {
      name = 'Destination';
    }

    return name;
  }

}
