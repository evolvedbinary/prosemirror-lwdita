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

import { parseParameters, getParameterValues } from '../request';
import ChaiPromised from 'chai-as-promised';
import { use, expect } from 'chai';

use(ChaiPromised);

let validUrl: string, invalidUrl: string;

// Parse the URL and check for expected parameters


// check all the URL parameter values
describe('Function parseParameters()', () => {
  it('returns String "validParams" if the URL has all the expected parameters', () => {
    validUrl = 'https://example.com/?ghrepo=repo1&source=source1&referer=referer1';
    expect(parseParameters(validUrl)).to.equal('validParams');
  });

  it('returns string "invalidParams" if the URL has not all the expected parameters', () => {
    invalidUrl = 'https://example.com/?ghrepo=repo1&source=source1';
    expect(parseParameters(invalidUrl)).to.equal('invalidParams');
  });

  it('returns string "noParams" if the URL has no parameters at all', () => {
    invalidUrl = 'https://example.com/';
    expect(parseParameters(invalidUrl)).to.equal('noParams');
  });
})

// Get the values of the valid URL parameters
describe('Function getParameterValues()', () => {
  it('returns the correct amount of valid URL parameter values', () => {
    validUrl = 'https://example.com/?ghrepo=repo1&source=source1&referer=referer1';
    expect(getParameterValues(validUrl)).to.have.lengthOf(3);
  });

it('returns the URL parameter values', () => {
  validUrl = 'https://example.com/?ghrepo=repo1&source=source1&referer=referer1';
  expect(getParameterValues(validUrl)).to.deep.equal([
    { key: 'ghrepo', value: 'repo1' },
    { key: 'source', value: 'source1' },
    { key: 'referer', value: 'referer1' },
  ]);
});

  it('throws an error if the URL has missing parameter values', () => {
    invalidUrl = 'https://example.com/?ghrepo=&source=source1';
    expect(() => getParameterValues(invalidUrl)).to.throw();
  });

  it('throws an error if the URL has invalid parameters', () => {
    invalidUrl = 'https://example.com/?ghrepo=repo1&source=source1';
    expect(() => getParameterValues(invalidUrl)).to.throw();
  });
})

// Process the request


// TODO: check if the request was successful
