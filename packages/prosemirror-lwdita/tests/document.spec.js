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
const document_1 = require("../src/document");
const untravel_document_1 = require("../src/untravel-document");
const test_utils_1 = require("./test-utils");
const lwdita_xdita_1 = require("@evolvedbinary/lwdita-xdita");
(0, chai_1.use)(chai_as_promised_1.default);
/**
 * Unit tests for document.ts
 */
// Pass an object with undefined attributes
// and test against the expected object
describe('Function deleteUndefined()', () => {
    it('removes undefined attributes from a passed object', () => {
        const attrs = {
            'dir': undefined,
            'xml:lang': undefined,
            'translate': undefined,
            'name': undefined,
            'value': 'movie.ogg',
            'parent': 'video'
        };
        const result = document_1._test_private_document.deleteUndefined(attrs);
        const expected = {
            value: 'movie.ogg',
            parent: 'video'
        };
        chai_1.assert.deepEqual(result, expected);
    });
});
// Pass a JDita document node
// and test against the expected Prosemirror document output
describe('Function defaultTravel()', () => {
    describe('when passed a JDITA node "title" and its parent node "topic"', () => {
        it('returns the transformed ProseMirror objects', () => {
            const node = JSON.parse(test_utils_1.JDITA_NODE), expected = document_1._test_private_document.defaultTravel(node), result = (JSON.parse(test_utils_1.JDITA_TRANFORMED_RESULT1),
                JSON.parse(test_utils_1.JDITA_TRANFORMED_RESULT2));
            chai_1.assert.deepEqual(result, expected);
        });
    });
});
// Pass a JDita node
// and test against the expected Prosemirror output
describe('Function travel()', () => {
    describe('when passed a JDITA "text" node and its parent node "title"', () => {
        it('returns a transformed ProseMirror object', () => {
            const node = JSON.parse('{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}'), parent = JSON.parse('{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]}'), expected = document_1._test_private_document.travel(node, parent), result = JSON.parse('{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}');
            chai_1.assert.deepEqual(result, expected);
        });
    });
    describe('when passed a JDITA "topic" node and its parent node "doc"', () => {
        it('returns a transformed ProseMirror object', () => {
            const node = JSON.parse('{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}'), parent = JSON.parse('{"nodeName":"doc","children":[{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}]}'), expected = document_1._test_private_document.travel(node, parent), result = JSON.parse('{"type":"topic","attrs":{"id":"program","parent":"doc"},"content":[{"type":"title","attrs":{"parent":"topic"},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}]},{"type":"body","attrs":{"parent":"topic"},"content":[{"type":"section","attrs":{"parent":"body"},"content":[{"type":"p","attrs":{"parent":"section"},"content":[{"type":"text","text":"You must assign a light bulb to at least one lighting group to operate that light bulb.","attrs":{"parent":"p"}}]}]}]}]}');
            chai_1.assert.deepEqual(result, expected);
        });
    });
});
// Pass a JDita object
// and test against the expected JDita transformation output
describe('Function document()', () => {
    it('returns a transformed Prosemirror object', () => {
        const transformedJdita = (0, document_1.document)(JSON.parse(test_utils_1.JDITA_OBJECT));
        (0, chai_1.expect)(transformedJdita).to.deep.equal(JSON.parse(test_utils_1.TRANSFORMED_JDITA_OBJECT));
    });
});
// Pass a Prosemirror document
// and test against the expected JDita object
describe('Function unTravel()', () => {
    describe('when passed a Prosemirror document', () => {
        it('handles a simple JDita document', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.shortXdita);
            // process the JDita document and do the round trip
            //clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(JSON.stringify(result)).to.deep.equal(JSON.stringify(originalJdita));
        }));
        it('handles a fully-featured JDita document', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.complexXdita);
            // process the JDita document and do the round trip
            //clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(JSON.stringify(result)).to.deep.equal(JSON.stringify(originalJdita));
        }));
        it('handles a JDita document containing an b mark', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.bXdita);
            // process the JDita document and do the round trip
            //clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(result).to.deep.equal(originalJdita);
        }));
        it('handles a JDita document containing a video element', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.videoXdita);
            // process the JDita document and do the round trip
            // clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(JSON.stringify(result)).to.deep.equal(JSON.stringify(originalJdita));
        }));
        it('handles a JDita document containing an audio element', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.audioXdita);
            // process the JDita document and do the round trip
            //clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(JSON.stringify(result)).to.deep.equal(JSON.stringify(originalJdita));
        }));
        it('handles a JDita document containing an image', () => __awaiter(void 0, void 0, void 0, function* () {
            // original JDita to compare against
            const originalJdita = yield (0, lwdita_xdita_1.xditaToJdita)(test_utils_1.imageXdita);
            // process the JDita document and do the round trip
            //clean the attributes from the top node to compare
            originalJdita.attributes = {};
            // transform the JDita document
            const transformedJdita = (0, document_1.document)(originalJdita);
            // untransform the transformed JDita document
            const result = (0, untravel_document_1.unTravel)(transformedJdita);
            //compare the original JDita with the result
            (0, chai_1.expect)(JSON.stringify(result)).to.deep.equal(JSON.stringify(originalJdita));
        }));
    });
});
describe('Const NODES handles', () => {
    let parent, value, result, expected;
    describe('function video()', () => {
        it('returns a video node', () => {
            value = JSON.parse(test_utils_1.originalVideoObject);
            parent = JSON.parse(test_utils_1.parentVideoObject);
            expected = JSON.parse(test_utils_1.expectedVideoObject);
            result = document_1.NODES.video(value, parent);
            chai_1.assert.deepEqual(result, expected);
        });
    });
    describe('function audio()', () => {
        it('returns an audio node', () => {
            value = JSON.parse('{"nodeName":"audio","attributes":{}}');
            parent = JSON.parse('{"nodeName":"body","attributes":{},"children":[{"nodeName":"p","attributes":{"parent":"body"},"children":[{"nodeName":"text","content":"Paragraph"}]},{"nodeName":"audio","attributes":{}},{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]},{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}]}');
            expected = JSON.parse('{"type":"audio","attrs":{},"content":[]}');
            result = document_1.NODES.audio(value, parent);
            chai_1.assert.deepEqual(result, expected);
        });
    });
    describe('function image()', () => {
        describe('for image nodes without an alt node', () => {
            it('returns a transformed image node', () => {
                value = JSON.parse('{"nodeName":"image","attributes":{}}');
                parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}');
                expected = JSON.parse('{"type":"image","attrs":{}}');
                result = document_1.NODES.image(value, parent);
                chai_1.assert.deepEqual(result, expected);
            });
        });
        describe('for image nodes with an alt node and attributes', () => {
            it('returns a transformed image node', () => {
                value = JSON.parse('{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}');
                parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}]}');
                expected = JSON.parse('{"type":"image","attrs":{"width":"640","height":"360","alt":"Alt text"}}');
                result = document_1.NODES.image(value, parent);
                chai_1.assert.deepEqual(result, expected);
            });
        });
    });
});
//# sourceMappingURL=document.spec.js.map