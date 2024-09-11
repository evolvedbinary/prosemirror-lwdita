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

  const token = await authenticateWithOAuth(code as string);

  res.json(token);
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
 * Commits changes and creates a pull request.
 * Controller for POST /api/github/integration
 * expects the following body:
 * {
 *  owner: string,
 *  repo: string,
 *  newOwner: string,
 *  newBranch: string,
 *  commitMessage: string,
 *  change: { path: string, content: string },
 *  title: string,
 *  body: string
 * }
 * and the following headers:
 * Authorization: Bearer <token>
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response containing the result of the operation.
 */
export const commitChangesAndCreatePR = async (req: Request, res: Response) => {
  //TODO(YB): Add validation
  const { owner, repo, newOwner, newBranch, commitMessage, change, title, body } = req.body;

  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }
  // the token is sent as a Bearer token in the Authorization header
  const token = req.headers.authorization.split(' ')[1];

  // dynamically import the module to avoid EMS and CJS incompatibility
  const { pushChangesAndCreatePullRequest } = await import('../modules/octokit.module.mjs');
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({
    auth: token,
  });

  const response = await pushChangesAndCreatePullRequest(octokit, owner, repo, newOwner, newBranch, commitMessage, change, title, body);

  res.json(response);
};