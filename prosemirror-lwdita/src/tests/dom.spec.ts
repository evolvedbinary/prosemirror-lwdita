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

import { assert } from 'chai';
import { getDomNode } from '../dom';

/**
 * Unit tests for dom.ts
 *
 * getDomNode()
 * Pass a JDita node name and test against expected HTML node name
 */
describe('Function getDomNode()', () => {
  let domNode: string;

  describe('when passed a JDita node name "topic"', () => {
    it('returns the HTML node name "article"', () => {
      domNode = getDomNode('topic', 'doc');
      assert.deepEqual(domNode, 'article');
    });
  });

  describe('when passed a JDita node name "title"', () => {
    it('returns the HTML node name "h1"', () => {
      domNode = getDomNode('title', 'topic');
      assert.deepEqual(domNode, 'h1');
    });
  });

  describe('when passed a JDita node name "media-source"', () => {
    it('returns the HTML node name "source"', () => {
      domNode = getDomNode('media-source', 'video');
      assert.deepEqual(domNode, 'source');
    });
  });
});
