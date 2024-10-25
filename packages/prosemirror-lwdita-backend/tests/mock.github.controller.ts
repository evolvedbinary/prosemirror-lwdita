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

import { GitHubController } from "../src/api/controller/github.controller";
import { Request, Response } from 'express';

export class MockGitHubController implements GitHubController {
    countAuthenticateUserWithOctokit: number = 0; 
    countGetUserInformation: number = 0;
    countCommitChangesAndCreatePR: number = 0;
  
    async authenticateUserWithOctokit(_req: Request, res: Response) {
      this.countAuthenticateUserWithOctokit = this.countAuthenticateUserWithOctokit + 1;
      return res.status(200).json({ token: 'token'});
    }
  
    async getUserInformation(_req: Request, res: Response) {
      this.countGetUserInformation = this.countGetUserInformation + 1;
      return res.status(200).json({ user: 'user'});
    }
  
    async commitChangesAndCreatePR(_req: Request, res: Response) {
      this.countCommitChangesAndCreatePR = this.countCommitChangesAndCreatePR + 1;
      return res.status(200).json({ link: 'link'});
    }
  
    reset() {
      this.countAuthenticateUserWithOctokit = 0;
      this.countGetUserInformation = 0;
      this.countCommitChangesAndCreatePR = 0;
    }
}
