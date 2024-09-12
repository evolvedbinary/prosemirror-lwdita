import { Octokit } from "@octokit/rest";
import { App } from 'octokit';
import { Endpoints } from "@octokit/types";
import dotenv from 'dotenv'; 
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

/**
 * Gets information about the authenticated user.
 * @param token - The authentication token.
 * @returns A promise that resolves to the user information.
 */
export const getUserInfo = async (token: string): Promise<UserData | undefined> => {
  try {
    const octokit = new Octokit({
      auth: token
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
      default_branch_only: true, // fork only the default branch
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
 * @param newBranch - The name of the new branch to be created.
 * @returns A Promise that resolves to a BranchInfo object representing the newly created branch, or undefined if an error occurs.
 */
const createBranch = async (octokit: Octokit, owner: string, repo: string, newBranch: string): Promise<BranchInfo | undefined> => {
  try {
    // get the repo data
    const { data: repoData } = await octokit.repos.get({
      owner, // this should be the authenticated user name
      repo,
    });

    // get the default branch
    // there's an existing issue with the github API where the default branch is returned as 'master' instead of 'main'
    //TODO(YB): Ask the GitHub API team to fix this issue
    const defaultBranch = repoData.default_branch === 'master'? 'main' : repoData.default_branch; 

    // get the default branch ref
    const { data: branchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch,
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
      defaultBranch: defaultBranch,
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
 * @param commitMessage - The commit message.
 * @param change - The change object containing the path and content of the changes.
 * @param title - The title of the pull request.
 * @param body - The body of the pull request.
 * @returns The URL of the created pull request, or undefined if an error occurred.
 */
export const pushChangesAndCreatePullRequest = async (octokit: Octokit, owner: string, repo: string, newOwner:string, newBranch: string, commitMessage: string, change: { path: string, content: string }, title: string, body: string): Promise<string | undefined> => {
  try {
    // create a fork
    const forkUrl = await createFork(octokit, owner, repo);
    if(!forkUrl) {
      throw new Error("Error during fork creation");
    }
    // create a new branch
    const branch = await createBranch(octokit, newOwner, repo, newBranch);
    if(!branch) {
      throw new Error("Error during branch creation");
    }
    const defaultBranch = branch.defaultBranch;
    // commit the changes
    const commit = await commitChanges(octokit, newOwner, repo, newBranch, branch.commit, commitMessage, change);
    if(!commit) {
      throw new Error("Error during commit");
    }

    // the PR will be opened from the new branch to the default branch
    const head = `${newOwner}:${newBranch}`;
    // create a pull request
    const pullRequestUrl = await createPullRequest(octokit, newOwner, repo, defaultBranch, head, title, body);
    if(!pullRequestUrl) {
      throw new Error("Error during pull request creation");
    }
    return pullRequestUrl;
  } catch (error) {
    console.error("Error during push changes and create pull request", error);
  }
};