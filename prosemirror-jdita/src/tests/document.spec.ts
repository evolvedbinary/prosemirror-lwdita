import ChaiPromised from 'chai-as-promised';
import { use } from 'chai';
import { expect, assert } from 'chai';
import { xditaToJson } from 'jdita';
import { document, deleteUndefined } from '../document';
import { XML, PMJSON, JDITA_OBJECT, TRANSFORMED_JDITA_OBJECT } from './test-utils';

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

/*
// Pass a JDita document node
// and test against expected Prosemirror document output
defaultTravel()

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

