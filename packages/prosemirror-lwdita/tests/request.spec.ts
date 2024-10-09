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

import { getAndValidateParameterValues, isOAuthCodeParam, isValidParam } from '../src/github-integration/request';
import ChaiPromised from 'chai-as-promised';
import { use, expect } from 'chai';

use(ChaiPromised);

let validUrl: string, invalidUrl: string;
const url: string = 'https://example.com/';

// Function getParameterValues()
describe('When function getParameterValues() is passed a URL with', () => {
  it('valid parameters, it returns an object containing key-value pairs', () => {
    validUrl = url + '?ghrepo=repo1&source=source1&branch=main&referer=referer1';
    expect(getAndValidateParameterValues(validUrl)).to.deep.equal([
      { key: 'ghrepo', value: 'repo1' },
      { key: 'source', value: 'source1' },
      { key: 'branch', value: 'main' },
      { key: 'referer', value: 'referer1' },
    ]);
  });

  it('a missing value of any of the keys, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer=';
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('one missing parameter, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer';
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('invalidParams');
  });

  it('one valid parameter, but the rest is missing, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo=xyz';
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('missingReferer');
  });

  it('two missing parameters, it returns string "invalidParams"', () => {
    invalidUrl = url + '?ghrepo';
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('missingReferer');
  });

  it('any parameter that is not matching any of the expected keys, it returns string "invalidParams"', () => {
    invalidUrl = url + '?xyz';
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('missingReferer');
  });

  it('no parameters at all, it returns string "noParams"', () => {
    invalidUrl = url;
    expect(getAndValidateParameterValues(invalidUrl)).to.equal('noParams');
  });

  it('OAuth code parameter, it returns an object containing key-value pairs', () => {
    validUrl = url + '?code=xyz';
    expect(getAndValidateParameterValues(validUrl)).to.deep.equal([{ key: 'code', value: 'xyz' }]);
  });

  it('OAuth code parameter, it returns an object containing key-value pairs', () => {
    invalidUrl = url + '?error=xyz';
    expect(getAndValidateParameterValues(invalidUrl)).to.deep.equal([{ key: 'error', value: 'xyz' }]);
  });

  it('State parameter with the oauth code, it returns an object containing key-value pairs', () => {
    validUrl = url + '?code=xyz&state=xyz';
    expect(getAndValidateParameterValues(validUrl)).to.deep.equal([{ key: 'code', value: 'xyz' }, { key: 'state', value: 'xyz' }]);
  });
})

// Function isValidParam()
describe('When function isValidParam() is passed a key', () => {
  it('that is a valid key, it returns true', () => {
    expect(isValidParam('ghrepo')).to.equal(true);
    expect(isValidParam('source')).to.equal(true);
    expect(isValidParam('branch')).to.equal(true);
    expect(isValidParam('referer')).to.equal(true);
  });
  it('that is a invalid key, it returns true', () => {
    expect(isValidParam('xyz')).to.equal(false);
  });
})

describe('When function isOAuthCodeParam() is passed a key', () => {
  it('that is an OAuth code key, it returns true', () => {
    expect(isOAuthCodeParam('code')).to.equal(true);
  });

  it('that is an OAuth code key, it returns true', () => {
    expect(isOAuthCodeParam('error')).to.equal(true);
  });

  it('that is not an OAuth code key, it returns false', () => {
    expect(isOAuthCodeParam('xyz')).to.equal(false);
  });
});

// Function showNotification()
// TODO: This needs to be tested in Cypress as it requires browser testing.
