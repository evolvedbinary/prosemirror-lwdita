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
export function getParameterValues(url: string): 'validParams' | 'invalidParams' | 'noParams' | { key: string, value: string }[] {
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

  const hasMissingValues = parameters.some(({ value }) => value === null || value === '');
  const hasInvalidParams = parameters.some(({ key }) => !isValidParam(key));

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

/**
 * Shows a toast notification based on the given parameters
 *
 * @param parameters - The URL parameters
 */
export function showNotification(parameters: 'validParams' | 'invalidParams' | 'noParams' | { key: string, value: string }[]): void {
  if (typeof parameters === 'object') {
    showToast('Success! You will be redirected to GitHub OAuth', 'success');
  } else if (parameters === 'invalidParams') {
    showToast('Your request is invalid.', 'error');
  } else if (parameters === 'noParams') {
    showToast('Welcome to the Petal Demo Website.', 'info');
  }
}

/**
 * Process the URL parameters and handle the notifications
 */
export function processRequest(): void {
  // Check if the window object is defined (i.e. it is not in Mocha tests!)
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;

    try {
      const parameters = getParameterValues(currentUrl);
      showNotification(parameters);
      console.log('Parameters =', JSON.stringify(parameters));
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
}

 /**
  * Start the process of processing the URL parameters
  */
export const initialRequest = processRequest();
