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
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_1 = require("chai");
const chai_2 = require("chai");
const lwdita_xdita_1 = require("@evolvedbinary/lwdita-xdita");
const document_1 = require("../document");
const test_utils_1 = require("./test-utils");
(0, chai_1.use)(chai_as_promised_1.default);
const attrs = {
    id: 'topic-id',
    'xmlns:ditaarch': 'http://dita.oasis-open.org/architecture/2005/',
    'ditaarch:DITAArchVersion': '1.3',
    outputclass: 'topic-outputclass',
    dir: 'topic-dir',
    'xml:lang': 'topic-lang',
    translate: 'topic-translate',
    class: '- topic/topic ',
    parent: 'doc',
};
const pmjson = {
    type: 'doc',
    attrs: {},
    content: [{
            type: 'topic',
            attrs,
        }]
};
describe('document()', () => {
    it('transforms the JDita "topic" node into a Prosemirror node', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, chai_2.expect)((0, lwdita_xdita_1.xditaToJdita)((0, test_utils_1.topic)(attrs))
            .then(jdita => (0, document_1.document)(jdita))
            .catch(e => console.log('error:', e))).to.eventually.become(pmjson);
    }));
});
//# sourceMappingURL=topic.spec.js.map