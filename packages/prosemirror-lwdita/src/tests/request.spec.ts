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

import { getParameterValues, isValidParam } from '../request';
import ChaiPromised from 'chai-as-promised';
import { use, expect } from 'chai';

use(ChaiPromised);

let validUrl: string, invalidUrl: string;
const url: string = 'https://example.com/';

// Function getParameterValues()
describe('When function getParameterValues() is passed a URL with', () => {
  it('valid parameters, it returns an object containing key-value pairs', () => {
    validUrl = url + '?ghrepo=repo1&source=source1&referer=referer1';
      expect(getParameterValues(validUrl)).to.deep.equal([
      { key: 'ghrepo', value: 'repo1' },
      { key: 'source', value: 'source1' },
      { key: 'referer', value: 'referer1' },
    ]);
  });

  it('a missing value of any of the keys, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer=';
    expect(getParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('one missing parameter, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer';
    expect(getParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('one valid parameter, but the rest is missing, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=xyz';
    expect(getParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('two missing parameters, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo';
    expect(getParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('any parameter that is not matching any of the expected keys, it returns string "invalidParams"', () => {
    invalidUrl = url + '?xyz';
    expect(getParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('no parameters at all, it returns string "noParams"', () => {
    invalidUrl = url;
    expect(getParameterValues(invalidUrl)).to.equal('noParams');
  });
})

// Function isValidParam()
describe('When function isValidParam() is passed a key', () => {
  it('that is a valid key, it returns true', () => {
    expect(isValidParam('ghrepo')).to.equal(true);
    expect(isValidParam('source')).to.equal(true);
    expect(isValidParam('referer')).to.equal(true);
  });
  it('that is a invalid key, it returns true', () => {
    expect(isValidParam('xyz')).to.equal(false);
  });
})

// Function showNotification()
// TODO: This needs to be tested in Cypress as it requires browser testing.
