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
 * render-type.component.ts
 */

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-render-type',
  templateUrl: './render-type.component.html',
  styleUrls: ['./render-type.component.scss']
})
export class RenderTypeComponent implements OnInit {

  @Input() item = null;
  @Input() networkURLPrefix = null;
  @Input() networkTokenDecimals = 0;
  @Input() networkTokenSymbol: string;

  constructor() { }

  ngOnInit() {
  }

  public formatBalance(balance: number) {
    return balance / Math.pow(10, this.networkTokenDecimals);
  }

}
