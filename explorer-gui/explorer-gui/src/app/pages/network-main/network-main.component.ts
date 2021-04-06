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
 * network-main.component.ts
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {NetworkService} from '../../services/network.service';
import {AppConfigService} from '../../services/app-config.service';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Network} from '../../classes/network.class';

@Component({
  selector: 'app-network-main',
  templateUrl: './network-main.component.html',
  styleUrls: ['./network-main.component.scss']
})
export class NetworkMainComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;

  public networkType: string;
  public networkId: string;
  public networkName: string;

  public showNavigation = false;
  public showSubmenus = true;
  public singleNetworkVersion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private networkService: NetworkService,
    private appConfigService: AppConfigService
  ) {

    router.events.subscribe((val) => {
        this.showNavigation = false;
    });

  }

  ngOnInit() {

    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.networkName = network.attributes.name;
    });

    // Check if environment is multi- or single network
    if (environment.jsonApiDiscoveryRootUrl) {

      this.networkService.all().subscribe(networks => {

        if (networks.is_loading === false) {

          let networkFound = false;

          for (let network of networks.data) {

            if (this.route.snapshot.paramMap.get('network') === network.attributes.network_id) {
              network.attributes.api_url_root = 'http://192.248.177.240:8080/api/v1/' + network.attributes.network_id;
              console.log(network.attributes);
              this.appConfigService.setNetwork(network);
              networkFound = true;
            }
          }

          if (!networkFound) {
            // Redirect to overview
            this.router.navigate(['/']);
          }
        }
      });
    } else {

      this.singleNetworkVersion = true;

      const network = new Network();
      network.attributes.api_url_root = environment.jsonApiRootUrl;
      network.attributes.name = environment.network.name;
      network.attributes.network_id = environment.network.networkId;
      network.attributes.token_decimals = environment.network.tokenDecimals;
      network.attributes.token_symbol = environment.network.tokenSymbol;
      network.attributes.network_type = environment.network.networkType;
      network.attributes.chain_type = environment.network.chainType;
      network.attributes.color_code = environment.network.colorCode;

      this.appConfigService.setNetwork(network);
    }

    this.route.paramMap.subscribe(
        (params: ParamMap) => {
          if (params.get('network')) {
            this.networkId = params.get('network');
          }
      });
  }

  toggleNavigation() {
    this.showNavigation = !this.showNavigation;
  }

  toggleSubmenus() {
    this.showSubmenus = false;
    setTimeout(() => { this.showSubmenus = true; }, 300);
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
  }

}
