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
import { use } from 'chai';
import { expect } from 'chai';
import { xditaToJdita } from "@evolvedbinary/lwdita-xdita";
import { document } from '../document';
import { topic } from './test-utils';

use(ChaiPromised);

const attrs = {
  id: 'topic-id',
  'xmlns:ditaarch': 'http://dita.oasis-open.org/architecture/2005/',
  'ditaarch:DITAArchVersion': '1.3',
  domains: '(topic xdita-c)',
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
  it('transforms the JDita "topic" node into a Prosemirror node', async () => {
    await expect(
      xditaToJdita(topic(attrs))
        .then(jdita => document(jdita))
        .catch(e => console.log('error:', e))
    ).to.eventually.become(pmjson);
  });
});
