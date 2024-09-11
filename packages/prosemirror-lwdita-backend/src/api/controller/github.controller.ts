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
  // dynamically import the module
  const { authenticateWithOAuth } = await import('../modules/octokit.module.mjs');

  const token = await authenticateWithOAuth(code as string);

  res.json(token);
};

/**
 * Retrieves authenticated user information using the provided token.
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