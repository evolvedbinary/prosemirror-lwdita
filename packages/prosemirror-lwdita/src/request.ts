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