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
 * event-table.component.ts
 */

import {Component, Input, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Event} from '../../classes/event.class';
import {EventService} from '../../services/event.service';

@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.scss']
})
export class EventTableComponent implements OnInit {

  @Input() event: Event = null;
  @Input() eventId: string = null;
  @Input() context: string = null;
  @Input() networkURLPrefix: string = null;
  @Input() networkTokenDecimals: number = 0;
  @Input() networkTokenSymbol: string = '';

  constructor(
    private location: Location,
    private eventService: EventService
  ) { }

  ngOnInit() {
    if (this.eventId) {
       this.eventService.get(this.eventId).subscribe(event => this.event = event);
    }
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
