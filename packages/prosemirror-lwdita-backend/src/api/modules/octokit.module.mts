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

import { Octokit } from "@octokit/rest";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { Endpoints } from "@octokit/types";
import dotenv from 'dotenv'; 
import { retry } from "@octokit/plugin-retry";
dotenv.config();  // Load environment variables from .env file 

// user data type
export type UserData = Endpoints["GET /user"]["response"]["data"];

// Commit info type
export type CommitInfo = {
  sha: string;
  treeSha: string;
};

// Branch info type
export type BranchInfo = {
  defaultBranch: string;
  commit: CommitInfo;
};

/**
 * Authenticates with OAuth using the provided code.
 * @param code - The OAuth code to authenticate with.
 * @returns A promise that resolves to the authentication token, or undefined if authentication fails.
 */
export const authenticateWithOAuth = async (code: string): Promise<{token: string, installation: boolean} | undefined> => {
  try {

    //TODO(YB): Check if env variables are set and valid
    const appId = process.env.GITHUB_APP_ID as string;
    // the private key is base64 encoded, so we need to decode it
    const privateKey = Buffer.from(process.env.PRIVATE_KEY_64Encoded as string, 'base64').toString('ascii');
    
    // create an Octokit instance with the retry plugin
    const OctokitWithRetry = Octokit.plugin(retry);

    let octokit = new OctokitWithRetry({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        privateKey: privateKey,
        appId: parseInt(appId),
        clientType: 'github-app',
        code: code,
      }
    });

    const authResponse = await octokit.auth({
      type: 'token',
      code: code,
    });
    const token = (authResponse as { token: string }).token;    

    octokit = new OctokitWithRetry({
      auth: token,
      request: {
        retries: 3,
        retryAfter: 1,   
      }
    });

    const installations = await octokit.apps.listInstallationsForAuthenticatedUser();

    return {
      token,
      installation: installations.data.installations.length > 0 && installations.data.installations[0].repository_selection === "all"
    };
  } catch (error) {
    console.error("Error during OAuth authentication", error);
  }
}

/**
 * Gets information about the authenticated user.
 * @param token - The authentication token.
 * @returns A promise that resolves to the user information.
 */
export const getUserInfo = async (token: string): Promise<UserData | undefined> => {
  try {
    const OctokitWithRetry = Octokit.plugin(retry);
    const octokit = new OctokitWithRetry({
      auth: token,
      request: {
        retries: 3,
        retryAfter: 1,   
      }
    });

    const { data } = await octokit.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error("Error getting user information", error);
  }
};

/**
 * Creates a fork of a repository using the provided Octokit instance.
 * 
 * @param octokit - The Octokit instance used to make API requests.
 * @param owner - The owner of the repository to fork.
 * @param repo - The name of the repository to fork.
 * @returns A Promise that resolves to the URL of the forked repository, or undefined if an error occurs.
 */
const createFork = async (octokit: Octokit, owner: string, repo: string): Promise<string | undefined> => {
  try {
    //TODO(YB): Check if the fork already exists
    //TODO(YB): Check if the fork is up to date
    // create a fork
    const response = await octokit.repos.createFork({
      owner,
      repo,
    });

    return response.data.html_url;
  } catch (error) {
    console.error("Error during fork creation", error);
  }
};

/**
 * Creates a new branch in a GitHub repository.
 * 
 * @param octokit - The Octokit instance used for making API requests.
 * @param owner - The authenticated user name.
 * @param repo - The name of the repository.
 * @param branch - The name of the base branch.
 * @param newBranch - The name of the new branch to be created.
 * @returns A Promise that resolves to a BranchInfo object representing the newly created branch, or undefined if an error occurs.
 */
const createBranch = async (octokit: Octokit, owner: string, repo: string, branch: string, newBranch: string): Promise<BranchInfo | undefined> => {
  try {
    // get the repo data
    const { data: repoData } = await octokit.repos.get({
      owner, // this should be the authenticated user name
      repo,
    });

    // get the default branch ref
    const { data: branchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: branch,
    });

    // get the last commit sha
    const lastCommitSha = branchData.commit.sha;

    //TODO(YB): Check if the branch already exists
    // create the new branch
    const { data: refData } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: lastCommitSha,
    });

    return {
      defaultBranch: branch,
      commit: {
        sha: lastCommitSha,
        treeSha: branchData.commit.commit.tree.sha,
      }
    };

  } catch (error) {
    console.error("Error during branch creation", error);
  }
};

/**
 * Commits changes to a GitHub repository.
 *
 * @param octokit - The Octokit instance.
 * @param owner - The authenticated user name.
 * @param repo - The name of the repository.
 * @param branch - The branch to commit the changes to.
 * @param lastCommit - The information about the last commit.
 * @param commitMessage - The message for the new commit.
 * @param change - The change to be committed, including the path and content.
 * @returns A Promise that resolves to the commit information if successful, or undefined if an error occurs.
 */
const commitChanges = async (octokit: Octokit, owner: string, repo: string, branch: string, lastCommit: CommitInfo, commitMessage: string, change: { path: string, content: string }): Promise<CommitInfo | undefined> => {
  try {
    // get the tree sha of the last commit
    const treeSha = lastCommit.treeSha;

    // create a new file blob
    const { data: blobData } = await octokit.git.createBlob({
      owner,
      repo,
      content: change.content,
      encoding: "utf-8",
    });

    // create a new tree

    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      tree: [
        {
          path: change.path,
          mode: "100644", // file mode
          type: "blob",
          sha: blobData.sha,
        },
      ],
      base_tree: treeSha,
    });

    // create a new commit
    const { data: commitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: treeData.sha,
      parents: [lastCommit.sha],
      committer: {
        name: "Petal GitHub App",
        email: "petal@evolvedbianry.com"
      }
    });

    // update the reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commitData.sha,
    });

    return {
      sha: commitData.sha,
      treeSha: treeData.sha,
    }
  } catch (error) {
    console.error("Error during commit", error);
  }
};

/**
 * Creates a pull request using the provided Octokit instance.
 * 
 * @param octokit - The Octokit instance used to make API requests.
 * @param owner - The authenticated user name.
 * @param repo - The name of the repository.
 * @param targetBranch - The targetBranch of the repository you will open a PR against.
 * @param head - the current user name and the branch.
 * @param title - The title of the pull request.
 * @param body - The body of the pull request.
 * @returns A Promise that resolves to the URL of the created pull request, or undefined if an error occurred.
 */
const createPullRequest = async (octokit: Octokit, owner: string, repo: string, targetBranch :string, head: string, title: string, body: string): Promise<string | undefined> => {
  try {
    const response = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head: head,
      base: targetBranch,
    });

    return response.data.html_url;
  } catch (error) {
    console.error("Error during pull request creation", error);
  }
}

/**
 * Pushes changes to a repository and creates a pull request.
 * 
 * @param octokit - The Octokit instance.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param newOwner - The owner of the new branch.
 * @param newBranch - The name of the new branch.
 * @param branch - The name of the base branch for the PR.
 * @param commitMessage - The commit message.
 * @param change - The change object containing the path and content of the changes.
 * @param title - The title of the pull request.
 * @param body - The body of the pull request.
 * @returns The URL of the created pull request, or undefined if an error occurred.
 */
export const pushChangesAndCreatePullRequest = async (octokit: Octokit, owner: string, repo: string, newOwner:string, branch: string, newBranch: string, commitMessage: string, change: { path: string, content: string }, title: string, body: string): Promise<string | undefined> => {
  try {
    // create a fork
    const forkUrl = await createFork(octokit, owner, repo);
    if(!forkUrl) {
      throw new Error("Error during fork creation");
    }
    // create a new branch
    const createdBranch = await createBranch(octokit, newOwner, repo, branch, newBranch);
    if(!createdBranch) {
      throw new Error("Error during branch creation");
    }
    // commit the changes
    const commit = await commitChanges(octokit, newOwner, repo, newBranch, createdBranch.commit, commitMessage, change);
    if(!commit) {
      throw new Error("Error during commit");
    }

    // the PR will be opened from the new branch to the default branch
    const head = `${newOwner}:${newBranch}`;
    // create a pull request
    const pullRequestUrl = await createPullRequest(octokit, newOwner, repo, branch, head, title, body);
    if(!pullRequestUrl) {
      throw new Error("Error during pull request creation");
    }
    return pullRequestUrl;
  } catch (error) {
    console.error("Error during push changes and create pull request", error);
  }
};