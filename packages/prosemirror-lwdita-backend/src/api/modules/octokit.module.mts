import { Octokit } from "@octokit/rest";
import { App } from 'octokit';
import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 


/**
 * Authenticates with OAuth using the provided code.
 * @param code - The OAuth code to authenticate with.
 * @returns A promise that resolves to the authentication token, or undefined if authentication fails.
 */
export const authenticateWithOAuth = async (code: string): Promise<string | undefined> => {
  try {

    const appId = process.env.GITHUB_APP_ID as string;
    
    // the private key is base64 encoded, so we need to decode it
    const privateKey = Buffer.from(process.env.PRIVATE_KEY_64Encoded as string, 'base64').toString('ascii');
    
    //TODO(YB): Check if env variables are set and valid
    const app = new App({
      appId,
      privateKey,
      oauth: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      }
    });

    const { authentication } = await app.oauth.createToken({
      code: code
    });

    //TODO(YB): make sure the token is valid and has the right permissions

    return authentication.token;
  } catch (error) {
    console.error("Error during OAuth authentication", error);
  }
}