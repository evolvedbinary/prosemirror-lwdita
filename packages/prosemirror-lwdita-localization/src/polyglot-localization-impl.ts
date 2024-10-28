/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Polyglot from "node-polyglot";
import { Localization } from "./localization";
import * as messages from './messages.en.json';

/**
 * Implementation of Localization using node-polyglot.
 *
 * @see https://airbnb.io/polyglot.js/.
 */
export class PolyglotLocalizationImpl implements Localization {
    private polyglot: Polyglot;

    constructor() {
        this.polyglot = new Polyglot({locale: "en", phrases: messages});
    }

    t(key: string): string {
        return this.polyglot.t(key);
    }
}
