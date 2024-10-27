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

import { expect } from 'chai';
import { PolyglotLocalizationImpl } from '../src/polyglot-localization-impl';

describe('t()', () => {
  it('welcomeNote.title', async () => {
    const localization = new PolyglotLocalizationImpl();
    expect(localization.t("welcomeNote.title")).to.equal("Welcome to the Petal Editor.");
  });
});
