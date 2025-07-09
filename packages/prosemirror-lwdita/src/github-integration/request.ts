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

import { exchangeOAuthCodeForAccessToken } from './github.plugin';
import { Config } from '../config';
import { Localization } from '@evolvedbinary/prosemirror-lwdita-localization';

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
 * referrer = Referrer of the request
 */
export const validKeys = ['ghrepo', 'source', 'branch', 'referrer'];

/**
 * Retrieves the values of the valid URL parameters `ghrepo`, `source`, and `referrer`
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

  // Check if referrer parameter is missing
  const hasMissingValues = parameters.some(({ value }) => value === null || value === '');
  const hasInvalidParams = validKeys.some(key => !params.has(key));

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

export function isInstallationParam(key: string): boolean {
  return key === 'installation_id' || key === 'setup_action';
}

/**
 * Redirects the user to GitHub OAuth
 */
export function redirectToGitHubOAuth(config: Config, parameters: URLParams): void {
  // Store the parameters in state to pass them to the redirect URL
  const state = btoa(`${JSON.stringify({ ...parameters })}`);
  const redirectURL = config.server.frontend.url;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${config.gitHub.clientId}&state=${state}&redirect_uri=${redirectURL}`;
}

export function redirectToGitHubAppInstall(config: Config, parameters: URLParams): void {
  const redirectURL = config.server.frontend.url;
  window.location.href = `https://github.com/apps/petal-bot/installations/new?state=${parameters.state}&redirect_uri=${redirectURL}`;
}

/**
 * Redirects the user to the error page
 * If a referrer, error type, or error message parameter are provided,
 * they will be passed to the error page
 *
 * @param config - configuration
 * @param errorType - Error type
 * @param referrer - Referrer of the request
 */
export function showErrorPage(config: Config, errorType: string, referrer: string): void {
  const errorPageUrl = `${config.server.frontend.url}/error.html?error-type=${encodeURIComponent(errorType)}&referrer=${encodeURIComponent(referrer)}`;
  window.location.href = errorPageUrl;
}

/**
 * Process the URL parameters and handle the notifications
 * and redirects to the GitHub OAuth page or the error page
 * 
 * @param config - config
 * @param localization - localization
 */
export function processRequest(config: Config, localization: Localization): undefined | URLParams {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;

    try {
      const parameters = getAndValidateParameterValues(currentUrl);
      // Requests with string parameters from e.g. 'Petal Edit Button'
      if (typeof parameters === 'string') {
        if (parameters === 'invalidParams') {

          const ref = new URL(currentUrl).searchParams.get('referrer');
          showErrorPage(config, 'invalidParameters', ref || '');
        }
        // Requests with object parameters from e.g. Git
      } else if (typeof parameters === 'object') {
        const returnParams: URLParams = {};
        for (const param of parameters) {
          returnParams[param.key] = param.value;
        }
        if (!parameters.some(param => isOAuthCodeParam(param.key))) {
          // Petal was called with github parameters but not with the OAuth code
          // Redirect to GitHub OAuth page
          redirectToGitHubOAuth(config, returnParams);
        } else if (parameters.some(param => isInstallationParam(param.key))) {
          // The user has authenticated and installed the app
          // return the parameters from the URL
          return JSON.parse(atob(returnParams.state));
        } else {
          // in case of an error, the user did not authenticate the app
          const errorParam = parameters.find(param => param.key === 'error');
          if (errorParam) {
            const state = JSON.parse(atob(returnParams.state))
            // redirect the user to the error page and show the error message so he can try again
            showErrorPage(config, 'authenticationError', state.referrer);
          }

          exchangeOAuthCodeForAccessToken(config, localization, returnParams.code).then(({token, installation}) => {
            localStorage.setItem('token', token); 
            if(!installation) {
              // redirect to the OAuth error page and show the error message with instructions to install the app
              redirectToGitHubAppInstall(config, returnParams);
            }
          }).catch(e => {
            console.error(e);
            // redirect the user to the error page and show the error message so he can try again
            showErrorPage(config, 'authenticationError', returnParams.referrer);
          });

          return JSON.parse(atob(returnParams.state));
        }
      }

    } catch (error) {
        console.error(error);
    }
  }
  return undefined;
}
