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
 * referendum-info.component.ts
 */

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-referendum-info',
  templateUrl: './referendum-info.component.html',
  styleUrls: ['./referendum-info.component.scss']
})
export class ReferendumInfoComponent implements OnInit {

  @Input() referendum = null;
  @Input() networkURLPrefix = null;
  @Input() networkTokenDecimals = 0;
  @Input() networkTokenSymbol: string;

  constructor() { }

  ngOnInit() {
  }

}
