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
import request from 'supertest';
import express from 'express';
import { MockGitHubController } from './mock.github.controller';
import { GitHubRouter } from '../src/api/routes/github.router';

const mockGitHubController = new MockGitHubController();
const app = express();
app.use(express.json());
app.use('/api/github', GitHubRouter.create(mockGitHubController));

describe('GitHub API Routes', () => {

  afterEach(() => {
    // Restore original methods after each test
    mockGitHubController.reset();
  });

  // Test for GET /api/github/
  it('should return API information on GET /api/github/', async () => {
    const response = await request(app).get('/api/github/');
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Github API');
  });

  // Test for GET /api/github/token
  it('should call authenticateUserWithOctokit on GET /api/github/token', async () => {
    const response = await request(app).get('/api/github/token').query({ code: '1234' });
    expect(response.status).to.equal(200);
    expect(mockGitHubController.countAuthenticateUserWithOctokit).to.equal(1);
  });

  // Test for GET /api/github/user
  it('should call getUserInformation on GET /api/github/user', async () => {
    const response = await request(app).get('/api/github/user').set('Authorization', 'Bearer token');
    expect(response.status).to.equal(200);
    expect(mockGitHubController.countGetUserInformation).to.equal(1);
  });

  // Test for POST /api/github/integration
  it('should call commitChangesAndCreatePR on POST /api/github/integration', async () => {
    const payload = {
      changes: "Some changes",
      repo: "repo-name",
      branch: "main",
    };

    const response = await request(app)
      .post('/api/github/integration')
      .set('Authorization', 'Bearer token')
      .send(payload);

    expect(response.status).to.equal(200);
    expect(mockGitHubController.countCommitChangesAndCreatePR).to.equal(1);
  });
});
