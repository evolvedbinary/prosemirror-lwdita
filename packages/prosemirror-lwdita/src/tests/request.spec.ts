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

import { hasParameters } from '../request';
import ChaiPromised from 'chai-as-promised';
import { use, expect } from 'chai';

use(ChaiPromised);

let urlWithoutParameters: string, urlWithParameters : string;

// check if the URL has parameters
describe('Function hasParameters()', () => {
  urlWithoutParameters = 'https://example.com/';
  urlWithParameters = 'https://example.com/?ghrepo=repo1&source=source1&referer=referer1';

  it('returns false if the URL has no parameters', () => {
    expect(hasParameters(urlWithoutParameters)).to.equal(false);
  });

  it('returns true if the URL has parameters', () => {
    expect(hasParameters(urlWithParameters)).to.equal(true);
  });
})

