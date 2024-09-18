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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const github_plugin_1 = require("../github.plugin");
const fetch_mock_1 = __importDefault(require("fetch-mock"));
const test_utils_1 = require("./test-utils");
describe('fetchRawDocumentFromGitHub', () => {
    afterEach(() => {
        fetch_mock_1.default.restore();
    });
    it('should fetch the raw content of a document from a GitHub repository', () => __awaiter(void 0, void 0, void 0, function* () {
        const ghrepo = 'evolvedbinary/prosemirror-lwdita';
        const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
        const mockResponse = '<xml>Mock Content</xml>';
        // this will mock the next fetch request
        fetch_mock_1.default.getOnce(`https://raw.githubusercontent.com/${ghrepo}/main/${source}`, {
            body: mockResponse,
            headers: { 'Content-Type': 'text/plain' },
        });
        const result = yield (0, github_plugin_1.fetchRawDocumentFromGitHub)(ghrepo, source);
        (0, chai_1.expect)(result).to.equal(mockResponse);
    }));
    it('should handle errors when fetching the document', () => __awaiter(void 0, void 0, void 0, function* () {
        const ghrepo = 'evolvedbinary/prosemirror-lwdita';
        const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
        // this will mock the next fetch request
        fetch_mock_1.default.getOnce(`https://raw.githubusercontent.com/${ghrepo}/main/${source}`, 404);
        try {
            yield (0, github_plugin_1.fetchRawDocumentFromGitHub)(ghrepo, source);
            throw new Error('Expected fetchRawDocumentFromGitHub to throw an error');
        }
        catch (error) {
            (0, chai_1.expect)(error).to.be.instanceOf(Error);
        }
    }));
});
describe('transformGitHubDocumentToProsemirrorJson', () => {
    it('should transform a raw GitHub document into a ProseMirror state save', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockXdita = test_utils_1.shortXdita;
        const prosemirrorJson = yield (0, github_plugin_1.transformGitHubDocumentToProsemirrorJson)(mockXdita);
        const mockJson = test_utils_1.shortXditaProsemirroJson;
        (0, chai_1.expect)(prosemirrorJson).to.deep.equal(mockJson);
    }));
});
//# sourceMappingURL=github.plugin.spec.js.map