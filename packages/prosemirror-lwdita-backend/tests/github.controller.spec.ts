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
import sinon from 'sinon';
import { Request, Response } from 'express';
import { authenticateUserWithOctokit, commitChangesAndCreatePR, getUserInformation } from '../src/api/controller/github.controller';

describe('authenticateUserWithOctokit', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;

  beforeEach(async () => {
    // Mocking req and res objects
    req = {
      query: {}
    };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      status: statusStub,
      json: jsonStub
    };
  });

  afterEach(() => {
    sinon.restore(); // Restore original functionality
  });

  after(() => {
  });

  it('should return 400 if code is missing', async () => {
    // Arrange: Leave req.query.code undefined

    // Act: Call the controller
    await authenticateUserWithOctokit(req as Request, res as Response);

    // Assert: Check response status and message
    expect(statusStub.calledWith(400)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Missing code' })).to.be.true;
  });

  it.skip('should return the token when code is provided', async () => {
    // Arrange: Set req.query.code
    if (!req.query) {
      req.query = {};
    }
    req.query.code = 'test_code';
    // const mockToken = { token: 'fake_token' };
    // Mock the authenticateWithOAuth function
    //FIXME(YB): Unable to mock authenticateWithOAuth function

    // Act: Call the controller
    await authenticateUserWithOctokit(req as Request, res as Response);

    // Assert: Ensure the OAuth function was called and the correct response was returned
    // expect(authenticateWithOAuthStub.calledWith('test_code')).to.be.true;
    // expect(jsonStub.calledWith(mockToken)).to.be.true;
  });
});

describe('getUserInformation', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;

  beforeEach(async () => {
    // Mocking req and res objects
    req = {
      query: {},
      headers: {}
    };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      status: statusStub,
      json: jsonStub
    };
  });

  afterEach(() => {
    sinon.restore(); // Restore original functionality
  });

  it('should return 403 if authentication header is missing', async () => {
    // Arrange: Leave req.headers.authorization undefined

    // Act: Call the controller
    await getUserInformation(req as Request, res as Response);

    // Assert: Check response status and message
    expect(statusStub.calledWith(403)).to.be.true;
    expect(jsonStub.calledWith({ error: 'No credentials sent!' })).to.be.true;
  });

  it.skip('should return user information when token is provided', async () => {
    // Arrange: Set req.headers.authorization
    if (!req.headers) {
      req.headers = {};
    }
    req.headers.authorization = 'Bearer test_token';

    // Act: Call the controller
    await getUserInformation(req as Request, res as Response);
    //FIXME(YB): Unable to mock getUserInfo function

    // Assert: Check response status and message
    expect(statusStub.calledWith(200)).to.be.true;
    expect(jsonStub.calledWith({ user: 'user' })).to.be.true;
  });

});

describe('commitChangesAndCreatePR', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;


  beforeEach(async () => {
    // Mocking req and res objects
    req = {
      query: {},
      headers: {},
      body: {}
    };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      status: statusStub,
      json: jsonStub
    };
  });

  afterEach(() => {
    sinon.restore(); // Restore original functionality
  });

  it('should return 403 if authentication header is missing', async () => {
    // Arrange: Leave req.headers.authorization undefined

    // Act: Call the controller
    await commitChangesAndCreatePR(req as Request, res as Response);

    // Assert: Check response status and message
    expect(statusStub.calledWith(403)).to.be.true;
    expect(jsonStub.calledWith({ error: 'No credentials sent!' })).to.be.true;
  });

  it('should return 400 if bad request was made', async () => {
    // Arrange: set req.headers.authorization
    if (!req.headers) {
      req.headers = {};
    }
    req.headers.authorization = 'Bearer test_token';
    // Set req.body with invalid arguments
    req.body = {
      owner: 'test_owner',
      repo: 'test_repo',
      newOwner: 'test_newOwner'
    }

    // Act: Call the controller
    await commitChangesAndCreatePR(req as Request, res as Response);

    // Assert: Check response status and message
    expect(statusStub.calledWith(400)).to.be.true;
    expect(jsonStub.calledWith({ error: 'Bad Request : Invalid argument' })).to.be.true;
  });

});