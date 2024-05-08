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

import ChaiPromised from 'chai-as-promised';
import { use, expect, assert } from 'chai';
import { document, NODES, _test_private_document, unTravel } from '../document';
import {
  JDITA_OBJECT,
  TRANSFORMED_JDITA_OBJECT,
  JDITA_NODE,
  JDITA_TRANFORMED_RESULT1,
  JDITA_TRANFORMED_RESULT2,
  imageXdita,
  audioXdita,
  videoXdita,
  complexXdita,
  shortXdita
} from './test-utils';
import { JDita, xditaToJson } from 'jdita';

use(ChaiPromised);

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

    const result = _test_private_document.deleteUndefined(attrs);
    const expected = {
      value: 'movie.ogg',
      parent: 'video'
    };
    assert.deepEqual(result, expected);
  });
});

// Pass a JDita document node
// and test against the expected Prosemirror document output
describe('Function defaultTravel()', () => {
  describe('when passed a JDITA node "title" and its parent node "topic"', () => {
    it('returns the transformed ProseMirror objects', () => {
      const node = JSON.parse(JDITA_NODE),
            expected = _test_private_document.defaultTravel(node),
            result = (
              JSON.parse(JDITA_TRANFORMED_RESULT1),
              JSON.parse(JDITA_TRANFORMED_RESULT2)
            )
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita node
// and test against the expected Prosemirror output
describe('Function travel()', () => {
  describe('when passed a JDITA "text" node and its parent node "title"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}'),
            parent = JSON.parse('{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]}'),
            expected = _test_private_document.travel(node, parent),
            result = JSON.parse('{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}');
      assert.deepEqual(result, expected);
    });
  });

  describe('when passed a JDITA "topic" node and its parent node "doc"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}'),
            parent = JSON.parse('{"nodeName":"doc","children":[{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}]}'),
            expected = _test_private_document.travel(node, parent),
            result = JSON.parse('{"type":"topic","attrs":{"id":"program","parent":"doc"},"content":[{"type":"title","attrs":{"parent":"topic"},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}]},{"type":"body","attrs":{"parent":"topic"},"content":[{"type":"section","attrs":{"parent":"body"},"content":[{"type":"p","attrs":{"parent":"section"},"content":[{"type":"text","text":"You must assign a light bulb to at least one lighting group to operate that light bulb.","attrs":{"parent":"p"}}]}]}]}]}');
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita object
// and test against the expected JDita transformation output
describe('Function document()', () => {
  it('returns a transformed Prosemirror object', () => {
    const transformedJdita = document(JSON.parse(JDITA_OBJECT));
    expect(transformedJdita).to.deep.equal(JSON.parse(TRANSFORMED_JDITA_OBJECT));
  });
});

describe('Component unTravel(), document(), xditaToJson(): A round trip of transforming Xdita to Prosemirror and back to JDITA', () => {
const XDitaMediaFiles = [{ file: imageXdita, type: 'image' }, { file: audioXdita, type: 'audio' }, { file: videoXdita, type: 'video' }];

XDitaMediaFiles.forEach((XDitaMediaFile) => {
  describe('when passed an XDita document containing "' + XDitaMediaFile.type + '" elements', () => {
    it('returns a transformed JDita containing all "' + XDitaMediaFile.type + '" elements and their attributes', async () => {
      const originalJdita = await xditaToJson(XDitaMediaFile.file);
      originalJdita.attributes = {};
      const transformedJdita = document(originalJdita);
      const result = unTravel(transformedJdita);
      expect(result).to.deep.equal(originalJdita);
    });
  });
});

const XDitaFiles = [{ file: complexXdita, type: 'complex XDita' }, { file: shortXdita, type: 'short XDita' }];

XDitaFiles.forEach((XDitaFile) => {
  describe('when passed a  "' + XDitaFile.type + '" file', () => {
    it('returns a JDita document object containing all elements and their attributes', async () => {
      const originalJdita = await xditaToJson(XDitaFile.file);
      originalJdita.attributes = {};
      const transformedJdita = document(originalJdita);
      const result = unTravel(transformedJdita);
      expect(result).to.deep.equal(originalJdita);
    });
  });
});

});

describe('Const NODES handles', () => {
  let parent: JDita, value: JDita, result: any, expected: any;

  describe('function video()', () => {
    it('returns a video node', () => {
      value = JSON.parse('{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]}');
      parent = JSON.parse('{"nodeName":"body","attributes":{},"children":[{"nodeName":"p","attributes":{"parent":"body"},"children":[{"nodeName":"text","content":"Paragraph"}]},{"nodeName":"audio","attributes":{}},{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]},{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}]}');
      expected = JSON.parse('{"type":"video","attrs":{"width":"640","height":"360"},"content":[{"type":"desc","attrs":{"parent":"video"},"content":[{"type":"text","text":"Your browser does not support the video tag.","attrs":{"parent":"desc"}}]}]}');
      result = NODES.video(value, parent);
      assert.deepEqual(result, expected);
    });
  });

  describe('function audio()', () => {
    it('returns an audio node', () => {
      value = JSON.parse('{"nodeName":"audio","attributes":{}}');
      parent = JSON.parse('{"nodeName":"body","attributes":{},"children":[{"nodeName":"p","attributes":{"parent":"body"},"children":[{"nodeName":"text","content":"Paragraph"}]},{"nodeName":"audio","attributes":{}},{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]},{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}]}');
      expected = JSON.parse('{"type":"audio","attrs":{},"content":[]}');
      result = NODES.audio(value, parent);
      assert.deepEqual(result, expected);
    });
  });

  describe('function image()', () => {
    describe('for image nodes without an alt node', () => {
      it('returns a transformed image node', () => {
        value = JSON.parse('{"nodeName":"image","attributes":{}}');
        parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}');
        expected = JSON.parse('{"type":"image","attrs":{}}');
        result = NODES.image(value, parent);
        assert.deepEqual(result, expected);
      });
    });

    describe('for image nodes with an alt node and attributes', () => {
      it('returns a transformed image node', () => {
        value = JSON.parse('{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}');
        parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}]}');
        expected = JSON.parse('{"type":"image","attrs":{"width":"640","height":"360","alt":"Alt text"}}');
        result = NODES.image(value, parent);
        assert.deepEqual(result, expected);
      });
    });
  });
});