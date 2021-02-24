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
 * runtime-module.class.ts
 */

import {DocumentCollection, Resource} from 'ngx-jsonapi';
import {RuntimeEvent} from './runtime-event.class';
import {RuntimeCall} from './runtime-call.class';
import {RuntimeStorage} from './runtime-storage.class';
import {RuntimeConstant} from './runtime-constant.class';
import {RuntimeError} from './runtime-error.class';

export class RuntimeModule extends Resource {
  public relationships = {
        events: new DocumentCollection<RuntimeEvent>(),
        calls: new DocumentCollection<RuntimeCall>(),
        storage: new DocumentCollection<RuntimeStorage>(),
        constants: new DocumentCollection<RuntimeConstant>(),
        errors: new DocumentCollection<RuntimeError>()
  };
}
