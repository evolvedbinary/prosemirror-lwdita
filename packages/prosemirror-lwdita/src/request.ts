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
import { clientID } from './config';
import { exchangeOAuthCodeForAccessToken } from './github.plugin';

/**
 * List of valid URL key names in parameters
 * ghrepo = GitHub repository,
 * source = GitHub resource,
 * referer = Referer of the request
 */
export const validKeys = ['ghrepo', 'source', 'referer'];

/**
 * Retrieves the values of the valid URL parameters `ghrepo`, `source`, and `referer`
 * and returns a status string for handling the notifications
 * in case the URL has missing values or invalid parameters
 *
 * @param url - URL string
 * @returns An array with key-value objects of the URL parameter values or a status string for handling the notifications
 */
export function getAndValidateParameterValues(url: string): 'invalidParams' | 'noParams' | { key: string, value: string }[] {
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

  const hasMissingValues = parameters.some(({ value }) => value === null || value === '');
  const hasInvalidParams = validKeys.some(key => !params.has(key));

  // Return the status string for the notifications
  if (hasMissingValues || hasInvalidParams) {
    return 'invalidParams';
  }

  if (!hasMissingValues && !hasInvalidParams) {
    return parameters;
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
  return key === 'code';
}

/**
 * Shows a toast notification based on the given parameters
 *
 * @param parameters - The URL parameters
 */
export function showNotification(parameters: 'authenticated' | 'invalidParams' | 'noParams' | { key: string, value: string }[]): void {
  if (typeof parameters === 'object') {
    showToast('Success! You will be redirected to GitHub OAuth', 'success');
  } else if (parameters === 'invalidParams') {
    showToast('Your request is invalid.', 'error');
  } else if (parameters === 'noParams') {
    showToast('Welcome to the Petal Demo Website.', 'info');
  } else if(parameters === 'authenticated') {
    showToast('You are authenticated.', 'success');
  }
}


/**
 * Redirects the user to GitHub OAuth
 */
export function redirectToGitHubOAuth(): void {
  const { id, value } = clientID;
  window.location.href = 'https://github.com/login/oauth/authorize?' + id + '=' + value;
}

/**
 * Process the URL parameters and handle the notifications
 */
export function processRequest(): undefined | { key: string, value: string }[] {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;

    try {
      const parameters = getAndValidateParameterValues(currentUrl);
      
      if (typeof parameters === 'string') {
        if(parameters === 'invalidParams') {
          //TODO(YB): Redirect to referer if it exists
          //TODO(YB): Redirect to Petal error page if referer doesn't exist
        }
        showNotification(parameters);

        return undefined;
      } else if (typeof parameters === 'object' && !parameters.some(param => isOAuthCodeParam(param.key))) {
        // Store the parameters in localStorage for reading the values after the OAuth flow
        // TODO: After a successful GitHub Authentication, read the user parameters from localStorage and clear it afterwards
        localStorage.setItem('userParams', JSON.stringify(parameters));

        // Redirect to GitHub OAuth page
        redirectToGitHubOAuth();
      } else if (typeof parameters === 'object' && parameters.some(param => isOAuthCodeParam(param.key))) {
        //TODO(YB): These Params should passed with the OAuth redirect URL
        // get the stored parameters from localStorage
        const storedParams = localStorage.getItem('userParams');
        if(!storedParams) {
          // TODO: Redirect to Petal error page
          // we should never reach here
          return undefined;
        }

        // exchange the code for an access token
        const codeParam = parameters.find(param => param.key === 'code');
        if (!codeParam) return undefined; // I don't understand why this is necessary as the previous if statement should have caught this
        const code = codeParam.value;
        

        exchangeOAuthCodeForAccessToken(code).then(token => {
          localStorage.setItem('token', token);
        }).catch(e => {
          console.error(e);
        });

        // Show a success notification
        showNotification("authenticated");

        // return the stored parameters and the new parameters from the URL
        return JSON.parse(storedParams);
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
