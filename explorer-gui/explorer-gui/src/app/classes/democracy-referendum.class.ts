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
 * democracy-referendum.class.ts
 */

import {DocumentCollection, Resource} from 'ngx-jsonapi';
import {DemocracyVote} from './democracy-vote.class';
import {DemocracyPreimage} from './democracy-preimage.class';

export class DemocracyReferendum extends Resource {
  public attributes = {

  };
  public relationships = {
        votes: new DocumentCollection<DemocracyVote>(),
        preimages: new DocumentCollection<DemocracyPreimage>()
  };
}
