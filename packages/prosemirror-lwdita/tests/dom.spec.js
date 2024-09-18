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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const dom_1 = require("../dom");
/**
 * Unit tests for dom.ts
 *
 * getDomNode()
 * Pass a JDita node name and test against expected HTML node name
 */
describe('Function getDomNode()', () => {
    let domNode;
    describe('when passed a JDita node name "topic"', () => {
        it('returns the HTML node name "article"', () => {
            domNode = (0, dom_1.getDomNode)('topic', 'doc');
            chai_1.assert.deepEqual(domNode, 'article');
        });
    });
    describe('when passed a JDita node name "title"', () => {
        it('returns the HTML node name "h1"', () => {
            domNode = (0, dom_1.getDomNode)('title', 'topic');
            chai_1.assert.deepEqual(domNode, 'h1');
        });
    });
    describe('when passed a JDita node name "media-source"', () => {
        it('returns the HTML node name "source"', () => {
            domNode = (0, dom_1.getDomNode)('media-source', 'video');
            chai_1.assert.deepEqual(domNode, 'source');
        });
    });
});
//# sourceMappingURL=dom.spec.js.map