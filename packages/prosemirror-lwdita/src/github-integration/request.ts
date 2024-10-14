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

import { showToast } from '../toast';
import { clientID, serverURL } from '../app-config';
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

  // TODO (AvC): Define all expected and allowed parameters in endpoints
  // and handle everything else as a redirect to the error page with e.g. error-type `unknownError`.
  // Currently all parameters that are not explicitly handled
  // are treated as a `refererMissing` error, because we are simply
  // checking if the referer is missing as a catch-all case.

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

export function isInstallationParam(key: string): boolean {
  return key === 'installation_id' || key === 'setup_action';
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

export function redirectToGitHubAppInstall(parameters: URLParams): void {
  const redirectURL = serverURL.value;
  window.location.href = `https://github.com/apps/petal-demo/installations/new?state=${parameters.state}&redirect_uri=${redirectURL}`;
}

/**
 * Redirects the user to the error page
 * If a referer, error type, or error message parameter are provided,
 * they will be passed to the error page
 *
 * @param errorType - Error type
 * @param referer - Referer of the request
 * @param errorMsg - Error message
 */
export function showErrorPage(errorType: string, referer?: string, errorMsg?: string): void {
  const errorPageUrl = `${serverURL.value}error.html?error-type=${encodeURIComponent(errorType)}&referer=${encodeURIComponent(referer || '')}&error-msg=${encodeURIComponent(errorMsg || '')}`;
  window.location.href = errorPageUrl;
}

/**
 * Redirects the user to the referer parameter from URL params
 * If a referer parameter is not provided, it will be passed to the error page
 */
export function handleInvalidRequest(referer: string | null): void {
  if (referer) {
    showErrorPage('invalidParams', referer, '');
  } else {
    showErrorPage('missingReferer');
  }
}

/**
 * Process the URL parameters and handle the notifications
 * and redirects to the GitHub OAuth page or the error page
 */
export function processRequest(): undefined | URLParams {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;

    try {
      const parameters = getAndValidateParameterValues(currentUrl);
      // Requests with string parameters from e.g. 'Petal Edit Button'
      if (typeof parameters === 'string') {
        if (parameters === 'invalidParams') {
          const referer = new URLSearchParams(window.location.search).get('referer');
          handleInvalidRequest(referer);
        }
        if (parameters === 'refererMissing') {
          showErrorPage('refererMissing');
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
          redirectToGitHubOAuth(returnParams);
        } else if (parameters.some(param => isInstallationParam(param.key))) {
          // The user has authenticated and installed the app
          // return the parameters from the URL
          return JSON.parse(atob(returnParams.state));
        } else {
          // in case of an error, the user did not authenticate the app
          const errorParam = parameters.find(param => param.key === 'error');
          if (errorParam) {
            // TODO (AvC): Parse the referer from the state object if available and pass it to the error page
            // TODO (AvC): Provide the authentication redirect URL and pass it to the error page (or extend redirectToGitHubOAuth()?)
            // FIXME (AvC): The error page should prompt the user to authenticate again,
            // this is currently not implemeted, thus a simple toast notification for now
            // showErrorPage('missingAuthentication', '', errorParam.value);
            showToast('Please authenticate with GitHub', 'error');
            console.log('processRequest(): error', errorParam.value);
          }

          exchangeOAuthCodeForAccessToken(returnParams.code).then(({token, installation}) => {
            localStorage.setItem('token', token); 
            if(!installation) {
              // redirect to the OAuth error page and show the error message with instructions to install the app
              redirectToGitHubAppInstall(returnParams);
            }
          }).catch(e => {
            console.error(e);
            //TODO(YB): make sure the error page can redirect back to the referer
            //TODO(YB): the error page should prompt the user to authenticate again
            // TODO (AvC): Parse the referer from the state object if available and pass it to the error page
            showErrorPage('missingAuthentication', '', e);
          });

          return JSON.parse(atob(returnParams.state));
        }
      }

    } catch (error) {
      if (error instanceof Error) {
        //showErrorPage('unknownError', '', error.message);
        showToast('processRequest(): ' + error.message, 'error');
        console.error(error.message);
      } else {
        //showErrorPage('unknownError');
        showToast('processRequest(): ' + 'Unknown error', 'error');
        console.error('Unknown error:', '', error);
      }
    }
  }
  return undefined;
}
