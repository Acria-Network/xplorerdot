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
 * runtime-call.class.ts
 */

import {DocumentCollection, Resource} from 'ngx-jsonapi';
import {RuntimeCallParam} from './runtime-call-param.class';
import {Extrinsic} from './extrinsic.class';

export class RuntimeCall extends Resource {
  public attributes = {
    module_id: 'module_id',
    call_id: 'call_id',
    name: 'name',
  };

  public relationships = {
        params: new DocumentCollection<RuntimeCallParam>(),
        recent_extrinsics: new DocumentCollection<Extrinsic>()
  };
}
