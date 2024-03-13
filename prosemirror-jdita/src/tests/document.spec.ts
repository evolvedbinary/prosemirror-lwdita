import ChaiPromised from 'chai-as-promised';
import { use } from 'chai';
import { expect, assert } from 'chai';
import { xditaToJson } from 'jdita';
import { document } from '../document';
import { XML, PMJSON, JDITA_OBJECT, TRANSFORMED_JDITA_OBJECT } from './xml';

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

/*
// Pass an object with "undefined" attributes
// and test against expected object
deleteUndefined()

// Pass a JDita document node
// and test against expected Prosemirror document output
defaultTravel()

// Pass a JDita node
// and test against expected Prosemirror output
travel()

*/
// Pass a JDita object
// and test against expected JDita transformation output
describe.skip('document()', () => {
  it('returns a transformed Prosemirror object', () => {
    let jdita = document(JSON.parse(JDITA_OBJECT));
    assert.equal(jdita, JSON.parse(TRANSFORMED_JDITA_OBJECT));
  });
});

