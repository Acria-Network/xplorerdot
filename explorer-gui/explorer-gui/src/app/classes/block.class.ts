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
 * block.class.ts
 */

import { Resource, DocumentCollection } from 'ngx-jsonapi';
import {Extrinsic} from './extrinsic.class';
import {Event} from './event.class';
import {Log} from './log.class';

export class Block extends Resource {

    public attributes = {
        id: 'id',
        hash: 'hash',
        parent_hash: 'parent_hash',
        state_root: 'state_root',
        extrinsics_root: 'extrinsics_root',
        count_extrinsics: 'count_extrinsics',
        count_events: 'count_events',
        runtime_id: 'runtime_id'
    };

    public relationships = {
        extrinsics: new DocumentCollection<Extrinsic>(),
        transactions: new DocumentCollection<Extrinsic>(),
        inherents: new DocumentCollection<Extrinsic>(),
        events: new DocumentCollection<Event>(),
        logs: new DocumentCollection<Log>(),
    };

}
