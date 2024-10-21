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

import {Request, Response} from 'express';

/**
 * Authenticates a user with Octokit using OAuth.
 * Controller for GET /api/github/token
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the authentication token.
 */
export const authenticateUserWithOctokit = async (req: Request, res: Response) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ message: "Missing code" });
  }
  // dynamically import the module to avoid EMS and CJS incompatibility
  const { authenticateWithOAuth } = await import('../modules/octokit.module.mjs');

  const authentication = await authenticateWithOAuth(code as string);

  res.json(authentication);
};

/**
 * Retrieves authenticated user information using the provided token.
 * Controller for GET /api/github/user
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the user information.
 */
export const getUserInformation = async (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }
  // the token is sent as a Bearer token in the Authorization header
  const token = req.headers.authorization.split(' ')[1];
  
  // dynamically import the module to avoid EMS and CJS incompatibility
  const { getUserInfo } = await import('../modules/octokit.module.mjs');

  const userInfo = await getUserInfo(token as string);
  res.json(userInfo);
};

/**
 * Commits changes to a specified GitHub repository and creates a pull request (PR).
 *
 * This controller handles the `POST /api/github/integration` endpoint.
 *
 * @remarks
 * The request body must include the following fields:
 * 
 * - `owner: string` - The GitHub username or organization that owns the repository.
 * - `repo: string` - The name of the repository where the changes are made.
 * - `newOwner: string` - The owner of the fork where the new branch is created (can be the same as the original owner).
 * - `newBranch: string` - The name of the new branch where the commit will be applied.
 * - `branch: string` - The name of the base branch.
 * - `commitMessage: string` - A message describing the changes in the commit.
 * - `change: { path: string, content: string }` - An object describing the file change:
 *   - `path: string` - The file path in the repository to be modified.
 *   - `content: string` - The new content for the specified file.
 * - `title: string` - The title of the pull request.
 * - `body: string` - The description of the pull request.
 * 
 * The request must also include the following headers:
 * 
 * - `Authorization: Bearer <token>` - A valid GitHub access token for authentication.
 *
 * @param req - The incoming HTTP request object, containing the request body and headers.
 * @param res - The outgoing HTTP response object, used to send the result back to the client.
 * 
 * @returns A JSON response with the result of the operation. If successful, it contains 
 *          the details of the created pull request. If there's an error, an appropriate 
 *          error message will be returned.
 */
export const commitChangesAndCreatePR = async (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  //TODO(YB): Add validation
  const { owner, repo, newOwner, branch, newBranch, commitMessage, change, title, body } = req.body;
  if(!owner || !repo || !newOwner || !branch || !newBranch || !commitMessage || !change || !title || !body) {
    return res.status(400).json({ error: 'Bad Request : Invalid argument' });
  }

  // the token is sent as a Bearer token in the Authorization header
  const token = req.headers.authorization.split(' ')[1];

  // dynamically import the module to avoid EMS and CJS incompatibility
  const { pushChangesAndCreatePullRequest } = await import('../modules/octokit.module.mjs');
  const { Octokit } = await import('@octokit/rest');
  const { retry } = await import("@octokit/plugin-retry");

  const OctokitWithRetry = Octokit.plugin(retry);

  const octokit = new OctokitWithRetry({
    auth: token,
    request: {
      retries: 3,
      retryAfter: 1, // retry after 1 second
    },
  });

  const response = await pushChangesAndCreatePullRequest(octokit, owner, repo, newOwner, branch, newBranch, commitMessage, change, title, body);

  res.json({
    url: response,
  });
};