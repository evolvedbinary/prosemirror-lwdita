import ChaiPromised from 'chai-as-promised';
import { use } from 'chai';
import { expect, assert } from 'chai';
import { xditaToJson } from 'jdita';
import { document, deleteUndefined, defaultTravel, travel } from '../document';
import {
  XML,
  PMJSON,
  JDITA_OBJECT,
  TRANSFORMED_JDITA_OBJECT,
  JDITA_NODE,
  JDITA_PARENT_NODE,
  JDITA_TRANFORMED_RESULT1,
  JDITA_TRANFORMED_RESULT2
} from './test-utils';

use(ChaiPromised);

/**
 * Unit tests for document.ts
 */

// xditaToJson()
describe('Prosemirror objects', () => {
  it('Document', async () => {
    await expect(
      xditaToJson(XML)
        .then(jdita => document(jdita))
        .catch(e => console.log('error:', e))
    ).to.eventually.become(JSON.parse(PMJSON));
  });
});

// Pass an object with undefined attributes
// and test against expected object
describe('deleteUndefined()', () => {
  it('removes undefined attributes from a passed object', () => {
    const attrs = {
      'dir': undefined,
      'xml:lang': undefined,
      'translate': undefined,
      'name': undefined,
      'value': 'movie.ogg',
      'parent': 'video'
    };

    const result = deleteUndefined(attrs);
    const expected = {
      value: 'movie.ogg',
      parent: 'video'
    };
    assert.deepEqual(result, expected);
  });
});

// Pass a JDita document node
// and test against expected Prosemirror document output
describe('defaultTravel()', () => {
  describe('when passed a JDITA node "title" and its parent node "topic"', () => {
    it('returns the transformed ProseMirror objects', () => {
      const node = JSON.parse(JDITA_NODE),
            parent = JSON.parse(JDITA_PARENT_NODE),
            expected = defaultTravel(node, parent),
            result = (
              JSON.parse(JDITA_TRANFORMED_RESULT1),
              JSON.parse(JDITA_TRANFORMED_RESULT2)
            )
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita node
// and test against expected Prosemirror output
describe('travel()', () => {
  describe('when passed a JDITA "text" node and its parent node "title"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}'),
        parent = JSON.parse('{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]}'),
        expected = travel(node, parent),
        result = JSON.parse('{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}');
      assert.deepEqual(result, expected);
    });
  });

  describe('when passed a JDITA "topic" node and its parent node "doc"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}'),
        parent = JSON.parse('{"nodeName":"doc","children":[{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}]}'),
        expected = travel(node, parent),
        result = JSON.parse('{"type":"topic","attrs":{"id":"program","parent":"doc"},"content":[{"type":"title","attrs":{"parent":"topic"},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}]},{"type":"body","attrs":{"parent":"topic"},"content":[{"type":"section","attrs":{"parent":"body"},"content":[{"type":"p","attrs":{"parent":"section"},"content":[{"type":"text","text":"You must assign a light bulb to at least one lighting group to operate that light bulb.","attrs":{"parent":"p"}}]}]}]}]}');
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita object
// and test against expected JDita transformation output
describe('document()', () => {
  it('returns a transformed Prosemirror object', () => {
    let transformedJdita = document(JSON.parse(JDITA_OBJECT));
    expect(transformedJdita).to.deep.equal(JSON.parse(TRANSFORMED_JDITA_OBJECT));
  });
});

