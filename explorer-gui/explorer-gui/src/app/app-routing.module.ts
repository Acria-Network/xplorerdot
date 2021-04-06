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
 * app-routing.module.ts
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlockListComponent } from './pages/block-list/block-list.component';
import { BlockDetailComponent } from './pages/block-detail/block-detail.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ExtrinsicDetailComponent} from './pages/extrinsic-detail/extrinsic-detail.component';
import {HarvesterAdminComponent} from './pages/harvester-admin/harvester-admin.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {EventDetailComponent} from './pages/event-detail/event-detail.component';
import {ExtrinsicListComponent} from './pages/extrinsic-list/extrinsic-list.component';
import {EventListComponent} from './pages/event-list/event-list.component';
import {RuntimeListComponent} from './pages/runtime-list/runtime-list.component';
import {RuntimeDetailComponent} from './pages/runtime-detail/runtime-detail.component';
import {RuntimeModuleDetailComponent} from './pages/runtime-module-detail/runtime-module-detail.component';
import {RuntimeCallDetailComponent} from './pages/runtime-call-detail/runtime-call-detail.component';
import {RuntimeEventDetailComponent} from './pages/runtime-event-detail/runtime-event-detail.component';
import {NetworkOverviewComponent} from './pages/network-overview/network-overview.component';
import {NetworkMainComponent} from './pages/network-main/network-main.component';
import {RuntimeStorageDetailComponent} from './pages/runtime-storage-detail/runtime-storage-detail.component';
import {AccountListComponent} from './pages/account-list/account-list.component';
import {AccountDetailComponent} from './pages/account-detail/account-detail.component';
import {ContractListComponent} from './pages/contract-list/contract-list.component';
import {ContractDetailComponent} from './pages/contract-detail/contract-detail.component';
import {SessionListComponent} from './pages/session-list/session-list.component';
import {SessionDetailComponent} from './pages/session-detail/session-detail.component';
import {DemocracyProposalDetailComponent} from './pages/democracy-proposal-detail/democracy-proposal-detail.component';
import {DemocracyProposalListComponent} from './pages/democracy-proposal-list/democracy-proposal-list.component';
import {BalancesTransferListComponent} from './pages/balances-transfer-list/balances-transfer-list.component';
import {BalancesTransferDetailComponent} from './pages/balances-transfer-detail/balances-transfer-detail.component';
import {LogListComponent} from './pages/log-list/log-list.component';
import {LogDetailComponent} from './pages/log-detail/log-detail.component';
import {DemocracyReferendumListComponent} from './pages/democracy-referendum-list/democracy-referendum-list.component';
import {DemocracyReferendumDetailComponent} from './pages/democracy-referendum-detail/democracy-referendum-detail.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {AccountIndexListComponent} from './pages/account-index-list/account-index-list.component';
import {AccountIndexDetailComponent} from './pages/account-index-detail/account-index-detail.component';
import {RuntimeConstantDetailComponent} from './pages/runtime-constant-detail/runtime-constant-detail.component';
import {AnalyticsChartsComponent} from './pages/analytics-charts/analytics-charts.component';
import {AnalyticsChartDetailComponent} from './pages/analytics-chart-detail/analytics-chart-detail.component';
import {SessionValidatorDetailComponent} from './pages/session-validator-detail/session-validator-detail.component';
import {RuntimeModuleListComponent} from './pages/runtime-module-list/runtime-module-list.component';
import {RuntimeTypeListComponent} from './pages/runtime-type-list/runtime-type-list.component';
import {SessionNominatorListComponent} from './pages/session-nominator-list/session-nominator-list.component';
import {SessionValidatorListComponent} from './pages/session-validator-list/session-validator-list.component';
import {TransactionListComponent} from './pages/transaction-list/transaction-list.component';
import {TransactionDetailComponent} from './pages/transaction-detail/transaction-detail.component';
import {InherentListComponent} from './pages/inherent-list/inherent-list.component';
import {InherentDetailComponent} from './pages/inherent-detail/inherent-detail.component';
import {AnalyticsSearchComponent} from './pages/analytics-search/analytics-search.component';
import {PrivacyPolicyComponent} from './pages/privacy-policy/privacy-policy.component';
import {TermsOfUseComponent} from './pages/terms-of-use/terms-of-use.component';
import {CouncilMotionListComponent} from './pages/council-motion-list/council-motion-list.component';
import {CouncilMotionDetailComponent} from './pages/council-motion-detail/council-motion-detail.component';
import {TechCommProposalListComponent} from './pages/tech-comm-proposal-list/tech-comm-proposal-list.component';
import {TechCommProposalDetailComponent} from './pages/tech-comm-proposal-detail/tech-comm-proposal-detail.component';
import {TreasuryProposalListComponent} from './pages/treasury-proposal-list/treasury-proposal-list.component';
import {TreasuryProposalDetailComponent} from './pages/treasury-proposal-detail/treasury-proposal-detail.component';
import {DemocracyPreimageListComponent} from './pages/democracy-preimage-list/democracy-preimage-list.component';
import {DemocracyPreimageDetailComponent} from './pages/democracy-preimage-detail/democracy-preimage-detail.component';
import {ExtrinsicParamDownloadComponent} from './pages/extrinsic-param-download/extrinsic-param-download.component';

const routes: Routes = [
  { path: '', redirectTo: '/polkadot', pathMatch: 'full'},
  { path: 'legal/privacy-policy', component: PrivacyPolicyComponent, },
  { path: 'legal/terms-of-use', component: TermsOfUseComponent, },
  // Redirect old URLs
  { path: ':type/:network/system/block/:id', redirectTo: ':type/:network/block/:id' },
  { path: ':type/:network/system/block', redirectTo: '/:type/:network/block' },
  { path: ':type/:network/system/extrinsic/:id', redirectTo: '/:type/:network/extrinsic/:id'},
  { path: ':type/:network/system/extrinsic', redirectTo: '/:type/:network/extrinsic'},
  { path: ':type/:network/system/event/:id', redirectTo: '/:type/:network/event/:id'},
  { path: ':type/:network/system/event', redirectTo: '/:type/:network/event'},
  { path: ':type/:network/system/runtime/:id', redirectTo: '/:type/:network/runtime/:id' },
  { path: ':type/:network/system/runtime', redirectTo: '/:type/:network/runtime' },
  { path: ':type/:network/system/runtime-module/:id', redirectTo: '/:type/:network/runtime-module/:id' },
  { path: ':type/:network/system/runtime-call/:id', redirectTo: '/:type/:network/runtime-call/:id' },
  { path: ':type/:network/system/runtime-event/:id', redirectTo: '/:type/:network/runtime-event/:id'},
  { path: ':type/:network/system/runtime-storage/:id', redirectTo: '/:type/:network/runtime-storage/:id'},
  { path: ':type/:network/system/account/:id', redirectTo: '/:type/:network/account/:id'},
  { path: ':type/:network/module/account/:id', redirectTo: '/:type/:network/account/:id', },
  { path: ':type/:network/system/account', redirectTo: '/:type/:network/account'},
  { path: 'pre/kusama-cc3/transaction/:hash', redirectTo: '/pre/kusama/transaction/:hash'},
  { path: 'pre/kusama-cc3/account/:id', redirectTo: '/pre/kusama/account/:id'},
  { path: 'pre/kusama-cc3', redirectTo: '/pre/kusama'},
  { path: 'polkadot-cc1/transaction/:hash', redirectTo: '/polkadot/transaction/:hash'},
  { path: 'polkadot-cc1/account/:id', redirectTo: '/polkadot/account/:id'},
  { path: 'polkadot-cc1', redirectTo: '/polkadot'},

  {
    path: ':network',
    component: NetworkMainComponent,
    children: [
      { path: '', component: DashboardComponent},
      { path: 'dashboard', component: DashboardComponent},
      { path: 'block', component: BlockListComponent },
      { path: 'block/:id', component: BlockDetailComponent },
      { path: 'transaction', component: TransactionListComponent},
      { path: 'transaction/:id', component: TransactionDetailComponent},
      { path: 'inherent', component: InherentListComponent},
      { path: 'inherent/:id', component: InherentDetailComponent},
      { path: 'extrinsic-param/download/:extrinsicId/:hash', component: ExtrinsicParamDownloadComponent},
      { path: 'extrinsic', component: ExtrinsicListComponent},
      { path: 'extrinsic/:id', component: ExtrinsicDetailComponent},
      { path: 'event', component: EventListComponent},
      { path: 'event/:id', component: EventDetailComponent},
      { path: 'log', component: LogListComponent},
      { path: 'log/:id', component: LogDetailComponent},
      { path: 'runtime', component: RuntimeListComponent },
      { path: 'runtime/:id', component: RuntimeDetailComponent },
      { path: 'runtime-module', component: RuntimeModuleListComponent },
      { path: 'runtime-module/:id', component: RuntimeModuleDetailComponent },
      { path: 'runtime-call/:id', component: RuntimeCallDetailComponent },
      { path: 'runtime-event/:id', component: RuntimeEventDetailComponent},
      { path: 'runtime-storage/:id', component: RuntimeStorageDetailComponent},
      { path: 'runtime-constant/:id', component: RuntimeConstantDetailComponent},
      { path: 'runtime-type', component: RuntimeTypeListComponent},
      { path: 'account', component: AccountListComponent},
      { path: 'account/validators', component: AccountListComponent, data: {filter: 'is_validator', title: 'Validators'}},
      { path: 'account/nominators', component: AccountListComponent, data: {filter: 'is_nominator', title: 'Nominators'}},
      { path: 'account/council', component: AccountListComponent, data: {filter: 'is_council_member', title: 'Council members'}},
      { path: 'account/tech-comm', component: AccountListComponent, data: {filter: 'is_tech_comm_member', title: 'Technical committee members'}},
      { path: 'account/registrars', component: AccountListComponent, data: {filter: 'is_registrar', title: 'Registrars'}},
      { path: 'account/treasury', component: AccountListComponent, data: {filter: 'is_treasury', title: 'Treasury accounts'}},
      { path: 'account/sudo', component: AccountListComponent, data: {filter: 'is_sudo', title: 'Sudo accounts'}},
      { path: 'account/identities', component: AccountListComponent, data: {filter: 'has_identity', title: 'Accounts with identity'}},
      { path: 'account/:id', component: AccountDetailComponent},
      { path: 'indices/account', component: AccountIndexListComponent},
      { path: 'indices/account/:id', component: AccountIndexDetailComponent},
      { path: 'contracts/contract', component: ContractListComponent},
      { path: 'contracts/contract/:id', component: ContractDetailComponent},
      { path: 'session/session', component: SessionListComponent},
      { path: 'session/session/:id', component: SessionDetailComponent},
      { path: 'session/validator/:id', component: SessionValidatorDetailComponent},
      { path: 'session/validator', component: SessionValidatorListComponent},
      { path: 'session/nominator', component: SessionNominatorListComponent},
      { path: 'democracy/proposal', component: DemocracyProposalListComponent},
      { path: 'democracy/proposal/:id', component: DemocracyProposalDetailComponent},
      { path: 'democracy/preimage', component: DemocracyPreimageListComponent},
      { path: 'democracy/preimage/:id', component: DemocracyPreimageDetailComponent},
      { path: 'democracy/referendum', component: DemocracyReferendumListComponent},
      { path: 'democracy/referendum/:id', component: DemocracyReferendumDetailComponent},
      { path: 'council/motion', component: CouncilMotionListComponent},
      { path: 'council/motion/:id', component: CouncilMotionDetailComponent},
      { path: 'techcomm/proposal', component: TechCommProposalListComponent},
      { path: 'techcomm/proposal/:id', component: TechCommProposalDetailComponent},
      { path: 'treasury/proposal', component: TreasuryProposalListComponent},
      { path: 'treasury/proposal/:id', component: TreasuryProposalDetailComponent},
      { path: 'balances/transfer', component: BalancesTransferListComponent},
      { path: 'balances/transfer/:id', component: BalancesTransferDetailComponent},
      { path: 'harvester/admin', component: HarvesterAdminComponent },
      { path: 'analytics/search', component: AnalyticsSearchComponent},
      { path: 'analytics/search/:query', component: AnalyticsSearchComponent},
      { path: 'analytics/charts', component: AnalyticsChartsComponent },
      { path: 'analytics/chart/:id', component: AnalyticsChartDetailComponent },
    ]},
  { path: 'settings', component: SettingsComponent},
  { path: '404', component: NotFoundComponent},
  { path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  })],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
