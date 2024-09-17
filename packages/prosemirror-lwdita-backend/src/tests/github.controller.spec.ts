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
import * as githubController from '../api/controller/github.controller';

describe('GitHub Controller', () => {
  describe('authenticateUserWithOctokit', () => {
    it('should return 400 if code is missing', async () => {
      const req = {
        query: {}
      } as Request;
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      } as unknown as Response;

      await githubController.authenticateUserWithOctokit(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: "Missing code" })).to.be.true;
    });

    it('should return token if code is provided', async () => {
      const req = {
        query: { code: 'test-code' }
      } as Request;
      const res = {
        json: sinon.stub()
      } as unknown as Response;

      const authenticateWithOAuthStub = sinon.stub().resolves('test-token');
      sinon.stub(await import('../modules/octokit.module.mjs')).authenticateWithOAuth = authenticateWithOAuthStub;

      await githubController.authenticateUserWithOctokit(req, res);

      expect(authenticateWithOAuthStub.calledWith('test-code')).to.be.true;
      expect(res.json.calledWith('test-token')).to.be.true;
    });
  });

  describe('getUserInformation', () => {
    it('should return 403 if authorization header is missing', async () => {
      const req = {
        headers: {}
      } as Request;
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      } as unknown as Response;

      await githubController.getUserInformation(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'No credentials sent!' })).to.be.true;
    });

    it('should return user information if token is provided', async () => {
      const req = {
        headers: { authorization: 'Bearer test-token' }
      } as Request;
      const res = {
        json: sinon.stub()
      } as unknown as Response;

      const getUserInfoStub = sinon.stub().resolves('test-user-info');
      sinon.stub(await import('../modules/octokit.module.mjs')).getUserInfo = getUserInfoStub;

      await githubController.getUserInformation(req, res);

      expect(getUserInfoStub.calledWith('test-token')).to.be.true;
      expect(res.json.calledWith('test-user-info')).to.be.true;
    });
  });

  describe('commitChangesAndCreatePR', () => {
    it('should return 403 if authorization header is missing', async () => {
      const req = {
        headers: {},
        body: {}
      } as Request;
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      } as unknown as Response;

      await githubController.commitChangesAndCreatePR(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ error: 'No credentials sent!' })).to.be.true;
    });

    it('should return PR details if all required data is provided', async () => {
      const req = {
        headers: { authorization: 'Bearer test-token' },
        body: {
          owner: 'test-owner',
          repo: 'test-repo',
          newOwner: 'test-new-owner',
          newBranch: 'test-new-branch',
          commitMessage: 'test-commit-message',
          change: { path: 'test-path', content: 'test-content' },
          title: 'test-title',
          body: 'test-body'
        }
      } as Request;
      const res = {
        json: sinon.stub()
      } as unknown as Response;

      const pushChangesAndCreatePullRequestStub = sinon.stub().resolves('test-pr-details');
      sinon.stub(await import('../modules/octokit.module.mjs')).pushChangesAndCreatePullRequest = pushChangesAndCreatePullRequestStub;

      const OctokitStub = sinon.stub().returns({ auth: 'test-token' });
      sinon.stub(await import('@octokit/rest')).Octokit = OctokitStub;

      await githubController.commitChangesAndCreatePR(req, res);

      expect(pushChangesAndCreatePullRequestStub.calledWith(
        sinon.match.any,
        'test-owner',
        'test-repo',
        'test-new-owner',
        'test-new-branch',
        'test-commit-message',
        { path: 'test-path', content: 'test-content' },
        'test-title',
        'test-body'
      )).to.be.true;
      expect(res.json.calledWith('test-pr-details')).to.be.true;
    });
  });
});