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

import {GitHubController} from '../controller/github.controller';
import {Router} from 'express';

export class GitHubRouter {

  static create(gitHubController: GitHubController) : Router {
    const router = Router();

    // GET /api/github/
    router.get('/', (_req, res) => {
      res.send('Github API');
    });

    // GET /api/github/token exchange user code for token
    router.get('/token', (req, res) => gitHubController.authenticateUserWithOctokit(req, res));

    // GET /api/github/user get user information
    router.get('/user', (req, res) => gitHubController.getUserInformation(req, res));

    // POST /api/github/integration commit changes and create PR
    router.post('/integration', (req, res) => gitHubController.commitChangesAndCreatePR(req, res))
  
    return router;
  }
}
