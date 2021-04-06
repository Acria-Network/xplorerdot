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
 * account.class.ts
 */

import {DocumentCollection, Resource} from 'ngx-jsonapi';
import {AccountIndex} from './account-index.class';

export class Account extends Resource {
  public attributes = {
    id: 'id',
    address: 'address',
    identity_display: 'identity_display',
    index_address: 'index_address',
    identity_judgement_good: 'identity_judgement_good',
    identity_judgement_bad: 'identity_judgement_bad',
    subidentity_display: 'subidentity_display',
    parent_identity: 'parent_identity',
    was_validator: 'is_validator',
    is_validator: 'was_validator',
    was_nominator: 'was_nominator',
    is_nominator: 'is_nominator',
    was_council_member: 'was_council_member',
    is_council_member: 'is_council_member',
    was_treasury: 'was_treasury',
    is_treasury: 'is_treasury',
    was_sudo: 'was_sudo',
    is_sudo: 'is_sudo',
    was_tech_comm_member: 'was_tech_comm_member',
    is_tech_comm_member: 'is_tech_comm_member',
    was_registrar: 'was_registrar',
    is_registrar: 'is_registrar',
    balance_total: 'balance_total',
    balance_history: 'balance_history'
  };

  public relationships = {
        indices: new DocumentCollection<AccountIndex>(),
    };

  public getDisplayName() {
    return this.attributes.identity_display || this.attributes.index_address || this.attributes.address;
  }

  public getIndex() {
    return this.attributes.index_address || this.attributes.address;
  }

  public getCurrentRoles() {
    const roles = [];
    if (this.attributes.is_validator) {
      roles.push('Validator');
    }

    if (this.attributes.is_nominator) {
      roles.push('Nominator');
    }

    if (this.attributes.is_council_member) {
      roles.push('Council member');
    }

    if (this.attributes.is_registrar) {
      roles.push('Registrar');
    }

    if (this.attributes.is_treasury) {
      roles.push('Treasury');
    }

    if (this.attributes.is_sudo) {
      roles.push('Sudo');
    }

    if (this.attributes.is_tech_comm_member) {
      roles.push('Technical Committee member');
    }

    return roles;
  }

  public getPastRoles() {
    const roles = [];
    if (this.attributes.was_validator && !this.attributes.is_validator) {
      roles.push('Validator');
    }

    if (this.attributes.was_nominator && !this.attributes.is_nominator) {
      roles.push('Nominator');
    }

    if (this.attributes.was_council_member && !this.attributes.is_council_member) {
      roles.push('Council member');
    }

    if (this.attributes.was_registrar && !this.attributes.is_registrar) {
      roles.push('Registrar');
    }

    if (this.attributes.was_treasury && !this.attributes.is_treasury) {
      roles.push('Treasury');
    }

    if (this.attributes.was_sudo && !this.attributes.is_sudo) {
      roles.push('Sudo');
    }

    if (this.attributes.was_tech_comm_member && !this.attributes.is_tech_comm_member) {
      roles.push('Technical Committee member');
    }

    return roles;
  }

}
