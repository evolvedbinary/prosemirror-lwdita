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

import { expect } from 'chai';
import { fetchRawDocumentFromGitHub, transformGitHubDocumentToProsemirrorJson } from '../github.plugin';
import fetchMock from 'fetch-mock';
import { shortXdita, shortXditaProsemirroJson } from './test-utils';

describe('fetchRawDocumentFromGitHub', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch the raw content of a document from a GitHub repository', async () => {
    const ghrepo = 'evolvedbinary/prosemirror-lwdita';
    const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
    const mockResponse = '<xml>Mock Content</xml>';
    // this will mock the next fetch request
    fetchMock.getOnce(`https://raw.githubusercontent.com/${ghrepo}/main/${source}`, {
      body: mockResponse,
      headers: { 'Content-Type': 'text/plain' },
    });

    const result = await fetchRawDocumentFromGitHub(ghrepo, source);
    expect(result).to.equal(mockResponse);
  });

  it('should handle errors when fetching the document', async () => {
    const ghrepo = 'evolvedbinary/prosemirror-lwdita';
    const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
    // this will mock the next fetch request
    fetchMock.getOnce(`https://raw.githubusercontent.com/${ghrepo}/main/${source}`, 404);

    try {
      await fetchRawDocumentFromGitHub(ghrepo, source);
      throw new Error('Expected fetchRawDocumentFromGitHub to throw an error');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
  });
});

describe('transformGitHubDocumentToProsemirrorJson', () => {
  it('should transform a raw GitHub document into a ProseMirror state save', async () => {
    const mockXdita = shortXdita;
    
    const prosemirrorJson = await transformGitHubDocumentToProsemirrorJson(mockXdita)

    const mockJson = shortXditaProsemirroJson;
    expect(prosemirrorJson).to.deep.equal(mockJson)
  });
});