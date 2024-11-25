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
import { fetchRawDocumentFromGitHub, transformGitHubDocumentToProsemirrorJson, createPrFromContribution, getUserInfo } from '../src/github-integration/github.plugin';
import fetchMock from 'fetch-mock';
import { shortXdita, shortXditaProsemirroJson } from './test-utils';
import { MockConfig } from './mock.config';
import { createLocalization } from '@marmoure/prosemirror-lwdita-localization';

const config = new MockConfig();
const localization = createLocalization();

describe('fetchRawDocumentFromGitHub', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch the raw content of a document from a GitHub repository', async () => {
    const ghrepo = 'evolvedbinary/prosemirror-lwdita';
    const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
    const branch = 'main';
    const mockResponse = '<xml>Mock Content</xml>';
    // this will mock the next fetch request
    fetchMock.getOnce(`https://raw.githubusercontent.com/${ghrepo}/refs/heads/main/${source}`, {
      body: mockResponse,
      headers: { 'Content-Type': 'text/plain' },
    });

    const result = await fetchRawDocumentFromGitHub(config, ghrepo, source, branch);
    expect(result).to.equal(mockResponse);
  });

  it('should handle errors when fetching the document', async () => {
    const ghrepo = 'evolvedbinary/prosemirror-lwdita';
    const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
    const branch = 'main';
    // this will mock the next fetch request
    fetchMock.getOnce(`https://raw.githubusercontent.com/${ghrepo}/refs/heads/main/${source}`, 404);

    try {
      await fetchRawDocumentFromGitHub(config, ghrepo, source, branch);
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

describe('getUserInfo', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch user info from the API and return a JSON object', async () => {
    const token = 'mock-token';
    const mockResponse = { login: 'marmoure', id: '12345' };

    // Mock the API response
    fetchMock.getOnce(config.server.api.baseUrl + config.server.api.endpoint.user, {
      body: mockResponse,
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await getUserInfo(config, localization, token);

    expect(result).to.deep.equal(mockResponse);
    const lastCall = fetchMock.lastCall(config.server.api.baseUrl + config.server.api.endpoint.user) as fetchMock.MockCall;
    if (!lastCall) {
      throw new Error('No fetch call found for /api/github/user');
    }
    const [url, options] = lastCall;
    expect(url).to.equal(config.server.api.baseUrl + config.server.api.endpoint.user);
    // @ts-expect-error TS7053 happens because the headers are not typed
    expect(options?.headers?.authorization).to.equal(`Bearer ${token}`);
  });

  it('should throw an error if the API response is not ok', async () => {
    const token = 'mock-token';

    // Mock a failed API response
    fetchMock.getOnce(config.server.api.baseUrl + config.server.api.endpoint.user, 401);

    try {
      await getUserInfo(config, localization, token);
      throw new Error('Expected getUserInfo to throw an error');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
    }
  });
});

describe('createPrFromContribution', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const window = global as any;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => 'mock-token',
      },
    });
  });
  afterEach(() => {
    fetchMock.restore();
  });
  it('should create a pull request from a contribution', async () => {
    const ghrepo = 'evolvedbinary/prosemirror-lwdita';
    const source = 'packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml';
    const branch = 'main';
    const title = 'Update the document';
    const description = 'Update the document';
    const changedDocument = '<xml>Changed Content</xml>';
    const token = 'mock-token';
    const petalBotUser = 'petal-bot';
    // Mock fetch request
    fetchMock.postOnce(config.server.api.baseUrl + config.server.api.endpoint.integration, {
      status: 200,
      body: {
        url: "mockUrl"
      }
    });

    fetchMock.getOnce(config.server.api.baseUrl + config.server.api.endpoint.user, {
      status: 200,
      body: {
        login: petalBotUser,
      },
    });
    await createPrFromContribution(config, localization, ghrepo, source, branch, changedDocument, title, description);
    const lastCall = fetchMock.lastCall(config.server.api.baseUrl + config.server.api.endpoint.integration) as fetchMock.MockCall;
    if (!lastCall) {
      throw new Error('No fetch call found for /api/github/integration');
    }
    const [url, options] = lastCall;
    if (options) {
      if (!options.headers) return;
      if (!options.body) return;
      expect(url).to.equal(config.server.api.baseUrl + config.server.api.endpoint.integration);
      expect(options.method).to.equal('POST');
      // @ts-expect-error TS7053 happens because the headers are not typed
      expect(options.headers['Content-Type']).to.equal('application/json');
      // @ts-expect-error TS7053 happens because the headers are not typed
      expect(options.headers['Authorization']).to.equal(`Bearer ${token}`);
      const body = JSON.parse(options.body as string);
      expect(body.owner).to.equal('evolvedbinary');
      expect(body.repo).to.equal('prosemirror-lwdita');
      expect(body.newOwner).to.equal(petalBotUser);
      const date = new Date();
      expect(body.newBranch).to.equal(config.git.branchPrefix + `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`);
      expect(body.commitMessage).to.equal('Update the document');
      expect(body.change.path).to.equal(source);
      expect(body.change.content).to.equal(changedDocument);
      expect(body.title).to.equal('Update the document');
      expect(body.body).to.equal('Update the document' + config.git.commitMessageSuffix);
    }
  });
});