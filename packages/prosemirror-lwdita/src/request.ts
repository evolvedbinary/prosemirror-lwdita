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

import { showToast } from './toast';

/**
 * List of valid URL parameters
 * ghrepo = GitHub repository,
 * source = GitHub resource,
 * referer = Referer of the request
 */
const validParameters = ['ghrepo', 'source', 'referer'];

/**
 * Parses the URL and checks if the URL has all the expected parameters
 * `ghrepo`, `source`, and `referer`
 * Will return a string with the parsing result
 *
 * @param url - URL string
 * @returns String with parsing result
 */
export function hasValidParameters(url: string): string {
  const parsedUrl = new URL(url);
  if (parsedUrl.search !== '') {
    for (const parameter of validParameters) {
      // Some of the expected parameters are missing
      if (!parsedUrl.searchParams.has(parameter)) {
        return 'invalidParams';
      }
    }
    // Every expected parameter has been found
    return 'validParams';
  }
  // Will be the case when requsting the the Petal website link
  return 'noParams';
}

/**
 * Retrieves the values of the valid URL parameters
 * `ghrepo`, `source`, and `referer`.
 * Will throw an error if the URL has missing values or invalid parameters
 *
 * @param url - URL string
 * @returns Array with the URL parameter values
 */
export function getParameterValues(url: string): { key: string, value: string }[] {
  if (hasValidParameters(url) === 'validParams') {
    const parsedUrl = new URL(url);
    const parameters = validParameters.map((key) => ({
      key,
      value: parsedUrl.searchParams.get(key)!,
    }));
    if (parameters.some(({ value }) => value === null)) {
      throw new Error('Missing values for parameters');
    }
    return parameters;
  } else {
    throw new Error('Invalid parameters');
  }
}

/**
 * Process the URL and redirect to GitHub OAuth
 * or show notifications if the URL is invalid
 */
export function processRequest(): void {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;
    //console.log('currentUrl', currentUrl);

    try {
      const parameters = getParameterValues(currentUrl);
      // TODO: Process the parameters for redirecting to GitHub OAuth
      console.log('parameters', parameters);
      showToast('Success! You will be redirected to GitHub OAuth', 'success');
    } catch (error) {

      if (error instanceof Error) {
        if (error.message === 'Missing values for parameters') {
          showToast('Your request is invalid. Please check if you have missing values for parameters', 'warning');
        } else if (error.message === 'Invalid parameters') {
          // Redirect to Petal website
          // window.location.href = 'http://localhost:1234/';
          showToast('Your request is invalid. You are being redirected to http://localhost:1234/', 'error');
        }
      } else {
        console.error(error);
      }
    }
  } else {
    console.log('Window is not defined');
  }
}

processRequest();