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
import { showErrorPage } from "./request";
import { showToast } from "../toast";

/**
 * Fetches the raw content of a document from a GitHub repository.
 *
 * @param ghrepo - The GitHub repository in the format "owner/repo".
 * @param source - The path to the file within the repository.
 * @param branch - The branch from which to fetch the document.
 * @returns A promise that resolves to the raw content of the document as a string.
 *
 * @remarks
 * This function currently fetches the document from the 'main' branch of the repository.
 * should use the GitHub API to dynamically determine the default branch of the repository.
 */
export const fetchRawDocumentFromGitHub = async (ghrepo: string, source: string, branch: string): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${ghrepo}/${branch}/${source}`;
  const response = await fetch(url);

  if (!response.ok) {
    showErrorPage('fileNotFound', '', response.statusText);
  }
  //TODO: Handle errors
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
 * @param ghrepo - The GitHub repository from which to fetch the document.
 * @param source - The source path of the document within the repository.
 * @param branch - The branch from which to fetch the document.
 * @returns A promise that resolves to the transformed ProseMirror JSON document.
 */
export const fetchAndTransform = async (ghrepo: string, source: string, branch: string) => {
  const rawDoc = await fetchRawDocumentFromGitHub(ghrepo, source, branch);
  const jsonDoc = await transformGitHubDocumentToProsemirrorJson(rawDoc);
  return jsonDoc;
};

/**
 * Exchanges an OAuth code for an access token.
 *
 * @param code - The OAuth code to exchange for an access token.
 * @returns A promise that resolves to the access token as a string.
 * @throws Will throw an error if the fetch request fails or if the response is not in the expected format.
 */
export const exchangeOAuthCodeForAccessToken = async (code: string): Promise<{token: string, installation: boolean}> => {
  // build the URL to exchange the code for an access token
  const url = `http://localhost:3000/api/github/token?code=${code}`;
  // fetch the access token
  const response = await fetch(url);

  // TODO (AvC): Depending on further error handling, this eror might be redirected to the error page
  if (!response.ok) {
    showToast('Sorry, an error occured while publishing the document. Please try again. The error: ' + response.statusText, 'error');
  }

  const json = await response.json();
  //TODO: Handle errors
  return {
    token: json.token,
    installation: json.installation
  };
};

/**
 * Fetches user information from the backend API.
 *
 * @param token - The authorization token to access the GitHub API.
 * @returns A promise that resolves to a record containing user information.
 */
export const getUserInfo = async (token: string): Promise<Record<string, string>> => {
  const url = `http://localhost:3000/api/github/user`;
  const response = await fetch(url, {
    headers: {
      'authorization': `Bearer ${token}`
    }
  });

  // TODO (AvC): Depending on further error handling, this eror might be redirected to the error page
  if (!response.ok) {
    showToast('Sorry, an error occured while publishing the document. Please try again. The error: ' + response.statusText, 'error');
  }
  const json = await response.json();
  return json;
};

/**
 * Publishes a document to a specified GitHub repository.
 * Makes a POST request to the `/api/github/integration` endpoint with the necessary details to create a pull request.
 *
 * @param ghrepo - The GitHub repository in the format "owner/repo".
 * @param source - The path to the source document.
 * @param branch - The branch used as base for the PR.
 * @param title - The title of the pull request and the commit message.
 * @param desc - The description of the pull request.
 * @param changedDocument - The content of the changed document.
 * @returns A promise that resolves when the document has been published.
 */
export const createPrFromContribution = async (ghrepo: string, source: string, branch: string, changedDocument: string, title: string, desc: string): Promise<string> => {
  const authenticatedUserInfo = await getUserInfo(localStorage.getItem('token') as string);

  const owner = ghrepo.split('/')[0];
  const repo = ghrepo.split('/')[1];
  const newOwner = authenticatedUserInfo.login;
  const date = new Date();
  const newBranch = `doc/petal-${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
  const commitMessage = title;
  const path = source;
  const content = changedDocument;
  const change = {
    path,
    content
  };
  const body = `${desc} \n ------------------\n This is an automated PR made by the prosemirror-lwdita demo`;
  // get the token from the local storage
  const token = localStorage.getItem('token');
  // make a post request to  /api/github/integration
  const response = await fetch('http://localhost:3000/api/github/integration', {
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

  // TODO (AvC): Depending on further error handling, this eror might be redirected to the error page
  if (!response.ok) {
    showToast('Sorry, an error occured while publishing the document. Please try again. The error: ' + response.statusText , 'error');
  }

  const json = await response.json();
  return json.url;
};