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

/**
 * Fetches the raw content of a document from a GitHub repository.
 *
 * @param ghrepo - The GitHub repository in the format "owner/repo".
 * @param source - The path to the file within the repository.
 * @returns A promise that resolves to the raw content of the document as a string.
 *
 * @remarks
 * This function currently fetches the document from the 'main' branch of the repository.
 * should use the GitHub API to dynamically determine the default branch of the repository.
 */
export const fetchRawDocumentFromGitHub = async (ghrepo: string, source: string): Promise<string> => {
  //TODO(YB): the branch should be passed as a parameter
  const url = `https://raw.githubusercontent.com/${ghrepo}/main/${source}`;
  const response = await fetch(url);

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
 * Exchanges an OAuth code for an access token.
 *
 * @param code - The OAuth code to exchange for an access token.
 * @returns A promise that resolves to the access token as a string.
 * @throws Will throw an error if the fetch request fails or if the response is not in the expected format.
 */
export const exchangeOAuthCodeForAccessToken = async (code: string): Promise<string> => {
  // build the URL to exchange the code for an access token
  const url = `http://localhost:3000/api/github/token?code=${code}`;
  // fetch the access token
  const response = await fetch(url);
  const json = await response.json();
  //TODO: Handle errors
  return json;
};
