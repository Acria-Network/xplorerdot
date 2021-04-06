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
 * network-overview.component.ts
 */

import { Component, OnInit } from '@angular/core';
import {NetworkService} from '../../services/network.service';
import {Network} from '../../classes/network.class';
import {DocumentCollection} from 'ngx-jsonapi';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-network-overview',
  templateUrl: './network-overview.component.html',
  styleUrls: ['./network-overview.component.scss']
})
export class NetworkOverviewComponent implements OnInit {

  public networks: DocumentCollection<Network>;

  constructor(private networkService: NetworkService, private router: Router, ) { }

  ngOnInit() {

    if (environment.jsonApiDiscoveryRootUrl) {

      this.networkService.all({remotefilter: {visible: true}}).subscribe(networks => {
        this.networks = networks;
      });
    } else {
      this.router.navigate([environment.network.networkId]);
    }
  }

}
