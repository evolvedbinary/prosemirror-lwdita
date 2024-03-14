import ChaiPromised from 'chai-as-promised';
import { use } from 'chai';
import { expect, assert } from 'chai';
import { xditaToJson } from 'jdita';
import { document, deleteUndefined, defaultTravel } from '../document';
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
// defaultTravel()
// case IS_MARK
// case other
// case content
describe('defaultTravel()', () => {
  describe('when passed a JDITA node and its JDITA parent node', () => {
    it('returns athe transformed ProseMirror objects', () => {
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

/*
// Pass a JDita node
// and test against expected Prosemirror output
travel()

*/
// Pass a JDita object
// and test against expected JDita transformation output
describe('document()', () => {
  it('returns a transformed Prosemirror object', () => {
    let transformedJdita = document(JSON.parse(JDITA_OBJECT));
    expect(transformedJdita).to.deep.equal(JSON.parse(TRANSFORMED_JDITA_OBJECT));
  });
});

