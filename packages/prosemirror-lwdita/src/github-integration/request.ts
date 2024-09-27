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
import { clientID, serverURL } from '../config';
import { exchangeOAuthCodeForAccessToken } from './github.plugin';

/**
 * Interface for the URL parameters
 */
export interface URLParams {
  [key: string]: string;
}

/**
 * List of valid URL key names in parameters
 * ghrepo = GitHub repository,
 * source = GitHub resource,
 * branch = Branch of the repository to fetch the document from, and use as base branch for PRs 
 * referer = Referer of the request
 */
export const validKeys = ['ghrepo', 'source', 'branch', 'referer'];

/**
 * Retrieves the values of the valid URL parameters `ghrepo`, `source`, and `referer`
 * and returns a status string for handling the notifications
 * in case the URL has missing values or invalid parameters
 *
 * @param url - URL string
 * @returns An array with key-value objects of the URL parameter values or a status string for handling the notifications
 */
export function getAndValidateParameterValues(url: string): 'invalidParams' | 'refererMissing' | 'noParams' | { key: string, value: string }[] {
  const parameters: { key: string, value: string }[] = [];

  const urlParts = url.split('?');
  if (urlParts.length === 1) {
    return 'noParams';
  }

  const queryString = urlParts[1];
  const params = new URLSearchParams(queryString);

  // Loop through the parameters and add them to the array
  for (const [key, value] of params.entries()) {
    parameters.push({ key, value });
  }

  // check if the URL parameters are from oauth redirect
  for (const param of parameters) {
    if (isOAuthCodeParam(param.key)) {
      return parameters;
    }
  }

  // Check if referer parameter is missing
  const hasMissingReferer = !params.has('referer');
  const hasMissingValues = parameters.some(({ value }) => value === null || value === '');
  const hasInvalidParams = validKeys.some(key => !params.has(key));

  // Return the status string for the notifications
  if (hasMissingReferer) {
    return 'refererMissing';
  }

  if (hasMissingValues || hasInvalidParams) {
    return 'invalidParams';
  }
  return parameters;
}

/**
 * Helper function to check if the URL parameter key is valid
 * Returns true if the key is valid, false otherwise
 *
 * @param key - URL parameter key
 * @returns Boolean
 */
export function isValidParam(key: string): boolean {
  return validKeys.includes(key);
}

export function isOAuthCodeParam(key: string): boolean {
  return key === 'code' || key === 'error';
}

/**
 * Shows a toast notification based on the given parameters
 *
 * @param parameters - The URL parameters
 */
export function showNotification(parameters: 'authenticated' | 'invalidParams' | 'noParams' | 'refererMissing' |{ key: string, value: string }[]): void {
  if (typeof parameters === 'object') {
    showToast('Success! You will be redirected to GitHub OAuth', 'success');
  } else if (parameters === 'invalidParams') {
    showToast('Your request is invalid.', 'error');
  } else if (parameters === 'refererMissing') {
    showToast('Missing referer parameter.', 'error');
  } else if(parameters === 'authenticated') {
    showToast('You are authenticated.', 'success');
  }
}

/**
 * Redirects the user to GitHub OAuth
 */
export function redirectToGitHubOAuth(parameters: URLParams): void {
  const { id, value } = clientID;
  // Store the parameters in state to pass them to the redirect URL
  const state = btoa(`${JSON.stringify({ ...parameters })}`);
  const redirectURL = serverURL.value;
  window.location.href = `https://github.com/login/oauth/authorize?${id}=${value}&state=${state}&redirect_uri=${redirectURL}`;
}

/**
 * Redirects the user to the error page
 */
export function showErrorPage(): void {
  window.location.href = serverURL.value + 'auth-error.html';
}

/**
 * Redirects the user to the referer parameter from URL params
 */
export function handleInvalidRequest(referer: string | null): void {
    if (referer) {
      window.location.href = referer;
    } else {
      // If the 'referer' key is not found in userParams, show error page
      showErrorPage();
    }
}

/**
 * Process the URL parameters and handle the notifications
 */
export function processRequest(): undefined | URLParams {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;

    try {
      const parameters = getAndValidateParameterValues(currentUrl);

      if (typeof parameters === 'string') {
        if (parameters === 'invalidParams') {
          const referer = new URLSearchParams(window.location.search).get('referer');
          handleInvalidRequest(referer);
        }
        if (parameters === 'refererMissing') {
          showErrorPage();
        }
      } else if (typeof parameters === 'object') {
        const returnParams: URLParams = {};
        for (const param of parameters) {
          returnParams[param.key] = param.value;
        }
        if (!parameters.some(param => isOAuthCodeParam(param.key))) {

          // Redirect to GitHub OAuth page
          redirectToGitHubOAuth(returnParams);
        } else if (parameters.some(param => isOAuthCodeParam(param.key))) {
          // in case of an error, the user did not authenticate the app
          const errorParam = parameters.find(param => param.key === 'error');
          if(errorParam) {
            showErrorPage();
          }

          exchangeOAuthCodeForAccessToken(returnParams.code).then(token => {
            localStorage.setItem('token', token);
          }).catch(e => {
            console.error(e);
          });
          // return the parameters from the URL
          const state = JSON.parse(atob(returnParams.state));
          return state;
        }
      }

    } catch (error) {
      if (error instanceof Error) {
        showToast('An unknown error has occurred. Please check the console.', 'error');
        console.error(error.message);
      } else {
        showToast('An unknown error has occurred. Please check the console.', 'error');
        console.error('Unknown error:', error);
      }
    }
  }
  return undefined;
}
