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

import { messageKeys } from '@evolvedbinary/prosemirror-lwdita';

/**
 * Handle errors resulting from erronous URL parameters,
 * or error redirects from GitHub OAuth
 */
export function handleError() {
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get('error-type');
  const referer = urlParams.get('referer');
  const errorMsg = urlParams.get('error-msg');

  const errorHeadline = document.getElementById('errorHeadline');
  const errorBody1 = document.getElementById('errorBody1');
  const errorBody2 = document.getElementById('errorBody2');
  const errorBody3 = document.getElementById('errorBody3');
  const errorLink = document.getElementById('errorLink') as HTMLAnchorElement | null;

  if (errorHeadline && errorBody1 && errorBody2 && errorBody3 && errorLink) {
    if (errorType === 'refererMissing') {
      errorHeadline.innerText = messageKeys.error.headline1;
      errorBody1.innerText = messageKeys.error.body1;
      errorBody2.innerText = messageKeys.error.body2;
    } else if (errorType === 'invalidParams') {
      errorHeadline.innerText = messageKeys.error.headline1;
      errorBody1.innerText = messageKeys.error.body3;
      if (referer) {
        errorBody2.innerText = messageKeys.error.body4;
        if (errorLink) {
          errorLink.href = referer;
          errorLink.target = '_self';
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'missingAuthentication') {
      errorHeadline.innerText = messageKeys.error.headline2;
      if (errorMsg) {
        errorBody1.innerText = messageKeys.error.body6 + errorMsg;
      }
      errorBody2.innerText = messageKeys.error.body5;
      if (referer) {
        errorBody3.innerText = messageKeys.error.body4;
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'unknownError') {
      errorHeadline.innerText = messageKeys.error.headlineDefault;
      if (errorMsg) {
        errorBody1.innerText = messageKeys.error.body6 + errorMsg;
      }
      errorBody2.innerText = messageKeys.error.bodyDefault;
      if (referer) {
        errorBody3.innerText = messageKeys.error.body4;
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    } else {
      errorHeadline.innerText = messageKeys.error.headlineDefault;
      errorBody1.innerText = messageKeys.error.bodyDefault;
      if (referer) {
        errorBody2.innerText = messageKeys.error.body4;
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    }
  }
}