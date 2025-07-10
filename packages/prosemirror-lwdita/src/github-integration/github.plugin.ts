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

import { xditaToJdita } from "@evolvedbinary/lwdita-xdita";
import { document as jditaToProsemirrorJson } from "../document";
import { showErrorPage, URLParams } from "./request";
import { Config } from "../config";
import { Localization } from "@evolvedbinary/prosemirror-lwdita-localization";
import urijs from "urijs";

/**
 * Fetches the raw content of a document from a GitHub repository.
 *
 * @param config - configuration
 * @param urlParams - Object containing ghrepo, source, branch.
 * @returns A promise that resolves to the raw content of the document as a string.
 *
 * @remarks
 * This function currently fetches the document from the 'main' branch of the repository.
 * should use the GitHub API to dynamically determine the default branch of the repository.
 */
export const fetchRawDocumentFromGitHub = async (config: Config, urlParams: URLParams): Promise<string> => {
  const { ghrepo, source, branch } = urlParams;
  // GitHub changes the raw api URL from `main` to `refs/heads/main` 
  // https://raw.githubusercontent.com/evolvedbinary/prosemirror-lwdita/main/packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml
  // https://raw.githubusercontent.com/evolvedbinary/prosemirror-lwdita/refs/heads/main/packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml
  const url = `https://raw.githubusercontent.com/${ghrepo}/refs/heads/${branch}/${source}`;
  const response = await fetch(url);

  if (!response.ok) {
    showErrorPage(config, 'fileNotFoundError', urlParams.referrer);
  }

  return response.text();
};

/**
 * Transforms a raw GitHub document into a ProseMirror state save.
 *
 * @param rawDocument - The raw xdita document as a string.
 * @returns A promise that resolves to a record containing the ProseMirror state save.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformGitHubDocumentToProsemirrorJson = async (rawDocument: string): Promise<Record<string, any>> => {
  // convert the raw xdita document to jdita
  const jdita = await xditaToJdita(rawDocument);

  // convert the jdita document to prosemirror state save
  const prosemirrorJson = await jditaToProsemirrorJson(jdita);

  return prosemirrorJson;
};

/**
 * Fetches a raw document from a GitHub repository and transforms it into a ProseMirror JSON document.
 *
 * @param config - configuration
 * @param urlParams - Object containing ghrepo, source, branch.
 * @returns A promise that resolves to the transformed ProseMirror JSON document.
 */
export const fetchAndTransform = async (config: Config, urlParams: URLParams) => {

  const rawDoc = await fetchRawDocumentFromGitHub(config, urlParams);
  
  // update the document with the relative path
  const updatedDoc = rawDoc.replace(/href="([^"]+)"/g, (_match, url) => {
    // https://www.npmjs.com/package/urijs
    return `href="${urijs(url).absoluteTo(urlParams.referrer).href()}"`;
  });

  try {
    const jsonDoc = await transformGitHubDocumentToProsemirrorJson(updatedDoc);
    return jsonDoc;
  } catch (_error) {
    showErrorPage(config, 'incompatibleXditaFile', urlParams.referrer);
  }
};

/**
 * Exchanges an OAuth code for an access token.
 *
 * @param config - configuration
 * @param _localization - localization
 * @param code - The OAuth code to exchange for an access token.
 * @returns A promise that resolves to the access token as a string.
 * @throws Will throw an error if the fetch request fails or if the response is not in the expected format.
 */
export const exchangeOAuthCodeForAccessToken = async (config: Config, _localization: Localization, code: string): Promise<{token: string, installation: boolean}> => {
  // build the URL to exchange the code for an access token
  const url = config.server.api.baseUrl + config.server.api.endpoint.token + `?code=${code}`;
  // fetch the access token
  const response = await fetch(url);
  const json = await response.json();

  return {
    token: json.token,
    installation: json.installation
  };
};

/**
 * Fetches user information from the backend API.
 *
 * @param config - configuration
 * @param _localization - localization
 * @param token - The authorization token to access the GitHub API.
 * @returns A promise that resolves to a record containing user information.
 */
export const getUserInfo = async (config: Config, _localization: Localization, token: string): Promise<Record<string, string>> => {
  const url = config.server.api.baseUrl + config.server.api.endpoint.user;
  const response = await fetch(url, {
    headers: {
      'authorization': `Bearer ${token}`
    }
  });

  const json = await response.json();
  return json;
};

/**
 * Publishes a document to a specified GitHub repository.
 * Makes a POST request to the `/api/github/integration` endpoint with the necessary details to create a pull request.
 *
 * @param config - configuration
 * @param localization - localization
 * @param ghrepo - The GitHub repository in the format "owner/repo".
 * @param source - The path to the source document.
 * @param branch - The branch used as base for the PR.
 * @param title - The title of the pull request and the commit message.
 * @param desc - The description of the pull request.
 * @param changedDocument - The content of the changed document.
 * @returns A promise that resolves when the document has been published.
 */
export const createPrFromContribution = async (config: Config, localization: Localization, ghrepo: string, source: string, branch: string, changedDocument: string, title: string, desc: string): Promise<string> => {
  const authenticatedUserInfo = await getUserInfo(config, localization, localStorage.getItem('token') as string);

  const owner = ghrepo.split('/')[0];
  const repo = ghrepo.split('/')[1];
  const newOwner = authenticatedUserInfo.login;
  const date = new Date();
  const newBranch = config.git.branchPrefix + `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
  const commitMessage = title;
  const path = source;
  const content = changedDocument;
  const change = {
    path,
    content
  };
  const body = `${desc}` + config.git.commitMessageSuffix;
  // get the token from the local storage
  const token = localStorage.getItem('token');
  // make a post request to  /api/github/integration
  const response = await fetch(config.server.api.baseUrl + config.server.api.endpoint.integration, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      owner,
      repo,
      newOwner,
      branch,
      newBranch,
      commitMessage,
      change,
      title,
      body
    })
  });

  const json = await response.json();
  if(!json.url) {
    throw new Error(localization.t("error.toastGitHubPR") + json.error);
  }
  return json.url;
};
