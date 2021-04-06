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
 * identicon.component.ts
 */

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {blake2b} from 'blakejs';


@Component({
  selector: 'app-identicon',
  templateUrl: './identicon.component.html',
  styleUrls: ['./identicon.component.scss']
})
export class IdenticonComponent implements OnInit, OnChanges {

  @Input() accountId: string;
  @Input() sixPoint = false;
  @Input() size = 32;

  public s;
  public c;
  public r;
  public colors;
  public schema = {
    target: {freq: 1, colors: [0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 1]},
    cube: {freq: 20, colors: [0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 5]},
    quazar: {freq: 16, colors: [1, 2, 3, 1, 2, 4, 5, 5, 4, 1, 2, 3, 1, 2, 4, 5, 5, 4, 0]},
    flower: {freq: 32, colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3]},
    cyclic: {freq: 32, colors: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6]},
    vmirror: {freq: 128, colors: [0, 1, 2, 3, 4, 5, 3, 4, 2, 0, 1, 6, 7, 8, 9, 7, 8, 6, 10]},
    hmirror: {freq: 128, colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 7, 5, 3, 4, 2, 11]}
  };
  public rroot3o2;
  public ro2;
  public rroot3o4;
  public ro4;
  public r3o4;
  public z;

  constructor() {
  }

  ngOnInit() {
    this.s = this.size;
    this.c = this.s / 2;
    this.r = this.sixPoint ? this.s / 2 / 8 * 5 : (this.s / 2 / 4 * 3);

    const s = this.s;
    const c = this.c;
    const r = this.r;
    this.rroot3o2 = r * Math.sqrt(3) / 2;
    this.ro2 = r / 2;
    this.rroot3o4 = r * Math.sqrt(3) / 4;
    this.ro4 = r / 4;
    this.r3o4 = r * 3 / 4;

    this.z = s / 64 * 5;
  }

  public updateIcon(accountId: string) {

    const schema = {
      target: {freq: 1, colors: [0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 1]},
      cube: {freq: 20, colors: [0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 5]},
      quazar: {freq: 16, colors: [1, 2, 3, 1, 2, 4, 5, 5, 4, 1, 2, 3, 1, 2, 4, 5, 5, 4, 0]},
      flower: {freq: 32, colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3]},
      cyclic: {freq: 32, colors: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6]},
      vmirror: {freq: 128, colors: [0, 1, 2, 3, 4, 5, 3, 4, 2, 0, 1, 6, 7, 8, 9, 7, 8, 6, 10]},
      hmirror: {freq: 128, colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 7, 5, 3, 4, 2, 11]}
    };

    const zero = blake2b(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    const total = Object.keys(schema).map(k => schema[k].freq).reduce((a, b) => a + b);

    const address = new Uint8Array(accountId.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const hashArray: Uint8Array = blake2b(address);

    const id: number[] = Array.from(hashArray).map((x, i) => ((x + 256 - zero[i]) % 256));

    const sat = (Math.floor(id[29] * 70 / 256 + 26) % 80) + 30;
    const d = Math.floor((id[30] + id[31] * 256) % total);
    const scheme = this.findScheme(d);
    const palette = Array.from(id).map((x, i) => {
      const b = (x + i % 28 * 58) % 256;

      if (b === 0) {
        return '#444';
      }
      if (b === 255) {
        return 'transparent';
      }
      const h = Math.floor(b % 64 * 360 / 64);
      const l = [53, 15, 35, 75][Math.floor(b / 64)];
      return `hsl(${h}, ${sat}%, ${l}%)`;
    });

    const rot = (id[28] % 6) * 3;

    this.colors = scheme.colors.map((_, i) => palette[scheme.colors[i < 18 ? (i + rot) % 18 : 18]]);
  }

  public findScheme(d) {
    let cum = 0;
    const ks = Object.keys(this.schema);
    // tslint:disable-next-line:forin
    for (const i in ks) {
      const n = this.schema[ks[i]].freq;
      cum += n;
      if (d < cum) {
        return this.schema[ks[i]];
      }
    }
    throw new Error('Impossible');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.accountId.currentValue) {
      this.updateIcon(changes.accountId.currentValue);
    } else {
      this.colors = null;
    }
  }

}
