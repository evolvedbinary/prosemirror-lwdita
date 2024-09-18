"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../request");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_1 = require("chai");
(0, chai_1.use)(chai_as_promised_1.default);
let validUrl, invalidUrl;
const url = 'https://example.com/';
// Function getParameterValues()
describe('When function getParameterValues() is passed a URL with', () => {
    it('valid parameters, it returns an object containing key-value pairs', () => {
        validUrl = url + '?ghrepo=repo1&source=source1&referer=referer1';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(validUrl)).to.deep.equal([
            { key: 'ghrepo', value: 'repo1' },
            { key: 'source', value: 'source1' },
            { key: 'referer', value: 'referer1' },
        ]);
    });
    it('a missing value of any of the keys, it returns string "invalidParams"', () => {
        invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer=';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('invalidParams');
    });
    it('one missing parameter, it returns string "invalidParams"', () => {
        invalidUrl = url + '?ghrepo=ghrepo1&source=source1&referer';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('invalidParams');
    });
    it('one valid parameter, but the rest is missing, it returns string "invalidParams"', () => {
        invalidUrl = url + '?ghrepo=xyz';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('invalidParams');
    });
    it('two missing parameters, it returns string "invalidParams"', () => {
        invalidUrl = url + '?ghrepo';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('invalidParams');
    });
    it('any parameter that is not matching any of the expected keys, it returns string "invalidParams"', () => {
        invalidUrl = url + '?xyz';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('invalidParams');
    });
    it('no parameters at all, it returns string "noParams"', () => {
        invalidUrl = url;
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.equal('noParams');
    });
    it('OAuth code parameter, it returns an object containing key-value pairs', () => {
        validUrl = url + '?code=xyz';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(validUrl)).to.deep.equal([{ key: 'code', value: 'xyz' }]);
    });
    it('OAuth code parameter, it returns an object containing key-value pairs', () => {
        invalidUrl = url + '?error=xyz';
        (0, chai_1.expect)((0, request_1.getAndValidateParameterValues)(invalidUrl)).to.deep.equal([{ key: 'error', value: 'xyz' }]);
    });
});
// Function isValidParam()
describe('When function isValidParam() is passed a key', () => {
    it('that is a valid key, it returns true', () => {
        (0, chai_1.expect)((0, request_1.isValidParam)('ghrepo')).to.equal(true);
        (0, chai_1.expect)((0, request_1.isValidParam)('source')).to.equal(true);
        (0, chai_1.expect)((0, request_1.isValidParam)('referer')).to.equal(true);
    });
    it('that is a invalid key, it returns true', () => {
        (0, chai_1.expect)((0, request_1.isValidParam)('xyz')).to.equal(false);
    });
});
describe('When function isOAuthCodeParam() is passed a key', () => {
    it('that is an OAuth code key, it returns true', () => {
        (0, chai_1.expect)((0, request_1.isOAuthCodeParam)('code')).to.equal(true);
    });
    it('that is an OAuth code key, it returns true', () => {
        (0, chai_1.expect)((0, request_1.isOAuthCodeParam)('error')).to.equal(true);
    });
    it('that is not an OAuth code key, it returns false', () => {
        (0, chai_1.expect)((0, request_1.isOAuthCodeParam)('xyz')).to.equal(false);
    });
});
// Function showNotification()
// TODO: This needs to be tested in Cypress as it requires browser testing.
//# sourceMappingURL=request.spec.js.map