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
 * app-config.service.ts
 */

import {Inject, Injectable} from '@angular/core';
import {Network} from '../classes/network.class';
import {BlockService} from './block.service';
import {BalanceTransferService} from './balance-transfer.service';
import {EventService} from './event.service';
import {ExtrinsicService} from './extrinsic.service';
import {NetworkstatsService} from './networkstats.service';
import {RuntimeService} from './runtime.service';
import {RuntimeCallService} from './runtime-call.service';
import {RuntimeCallParamService} from './runtime-call-param.service';
import {RuntimeEventService} from './runtime-event.service';
import {RuntimeEventAttributeService} from './runtime-event-attribute.service';
import {RuntimeModuleService} from './runtime-module.service';
import {RuntimeTypeService} from './runtime-type.service';
import {BehaviorSubject, Subject} from 'rxjs';
import { filter } from 'rxjs/operators';
import {RuntimeStorageService} from './runtime-storage.service';
import {AccountService} from './account.service';
import {ContractService} from './contract.service';
import {DemocracyProposalService} from './democracy-proposal.service';
import {SessionService} from './session.service';
import {BlockTotalService} from './block-total.service';
import {LogService} from './log.service';
import {SessionValidatorService} from './session-validator.service';
import {DemocracyReferendumService} from './democracy-referendum.service';
import {AccountIndexService} from './account-index.service';
import {RuntimeConstantService} from './runtime-constant.service';
import {AnalyticsChartService} from './analytics-chart.service';
import {SessionNominatorService} from './session-nominator.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import {CouncilMotionService} from './council-motion.service';
import {TechCommProposalService} from './tech-comm-proposal.service';
import {TreasuryProposalService} from './treasury-proposal.service';
import {DemocracyPreimageService} from './democracy-preimage.service';
import {RuntimeErrorService} from './runtime-error.service';

const STORAGE_KEY = 'polkascan-config';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private currentNetwork = new BehaviorSubject<Network>(null);
  private networks = new BehaviorSubject<Network[]>([]);

  private networkURLPrefix: string;
  public networkName: string;

  private networkApiURLRoot: string;

  constructor(
    private blockService: BlockService,
    private blockTotalService: BlockTotalService,
    private balanceTransferService: BalanceTransferService,
    private eventService: EventService,
    private extrinsicService: ExtrinsicService,
    private logService: LogService,
    private accountService: AccountService,
    private accountIndexService: AccountIndexService,
    private contractService: ContractService,
    private democracyProposalService: DemocracyProposalService,
    private democracyPreimageService: DemocracyPreimageService,
    private democracyReferendumService: DemocracyReferendumService,
    private councilMotionService: CouncilMotionService,
    private techCommProposalService: TechCommProposalService,
    private treasuryProposalService: TreasuryProposalService,
    private sessionService: SessionService,
    private sessionValidatorService: SessionValidatorService,
    private sessionValidatorNominatorService: SessionNominatorService,
    private networkstatsService: NetworkstatsService,
    private runtimeService: RuntimeService,
    private runtimeCallService: RuntimeCallService,
    private runtimeCallParamService: RuntimeCallParamService,
    private runtimeEventService: RuntimeEventService,
    private runtimeEventAttributeService: RuntimeEventAttributeService,
    private runtimeModuleService: RuntimeModuleService,
    private runtimeTypeService: RuntimeTypeService,
    private runtimeStorageService: RuntimeStorageService,
    private runtimeConstantService: RuntimeConstantService,
    private runtimeErrorService: RuntimeErrorService,
    private analyticsChartService: AnalyticsChartService,
    @Inject(LOCAL_STORAGE) private storage: StorageService
  ) { }

  public getCurrentNetwork() {
    return this.currentNetwork.asObservable().pipe(filter(network => network !== null));
  }

  public getNetworks() {
    return this.networks.asObservable();
  }

  public setNetworks(networks: Network[]) {
    this.networks.next(networks);
  }

  public getAgreeWithTerms() {
    return this.storage.get('agreeWithTerms') === true;
  }

  public agreeWithTerms() {
    return this.storage.set('agreeWithTerms', true);
  }


  public setNetwork(network: Network) {

      this.blockService.jsonApiRootUrl = network.attributes.api_url_root;
      this.blockTotalService.jsonApiRootUrl = network.attributes.api_url_root;
      this.balanceTransferService.jsonApiRootUrl = network.attributes.api_url_root;
      this.eventService.jsonApiRootUrl = network.attributes.api_url_root;
      this.extrinsicService.jsonApiRootUrl = network.attributes.api_url_root;
      this.logService.jsonApiRootUrl = network.attributes.api_url_root;
      this.accountService.jsonApiRootUrl = network.attributes.api_url_root;
      this.accountIndexService.jsonApiRootUrl = network.attributes.api_url_root;
      this.contractService.jsonApiRootUrl = network.attributes.api_url_root;
      this.democracyProposalService.jsonApiRootUrl = network.attributes.api_url_root;
      this.democracyPreimageService.jsonApiRootUrl = network.attributes.api_url_root;
      this.democracyReferendumService.jsonApiRootUrl = network.attributes.api_url_root;
      this.councilMotionService.jsonApiRootUrl = network.attributes.api_url_root;
      this.techCommProposalService.jsonApiRootUrl = network.attributes.api_url_root;
      this.treasuryProposalService.jsonApiRootUrl = network.attributes.api_url_root;
      this.sessionService.jsonApiRootUrl = network.attributes.api_url_root;
      this.sessionValidatorNominatorService.jsonApiRootUrl = network.attributes.api_url_root;
      this.sessionValidatorService.jsonApiRootUrl = network.attributes.api_url_root;
      this.networkstatsService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeCallService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeStorageService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeCallParamService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeEventService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeEventAttributeService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeModuleService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeTypeService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeConstantService.jsonApiRootUrl = network.attributes.api_url_root;
      this.runtimeErrorService.jsonApiRootUrl = network.attributes.api_url_root;
      this.analyticsChartService.jsonApiRootUrl = network.attributes.api_url_root;

      this.networkURLPrefix = '/' + network.attributes.network_id;

      this.networkName = network.attributes.name;
      this.networkApiURLRoot = network.attributes.api_url_root;


      this.currentNetwork.next(network);
  }

  public getUrlPrefix() {
    return this.networkURLPrefix;
  }

  public getNetworkApiUrlRoot(): string {
    return this.networkApiURLRoot;
  }
}
