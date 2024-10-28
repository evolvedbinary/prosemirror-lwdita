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

import { createLocalization } from "@evolvedbinary/prosemirror-lwdita-localization";

const localization = createLocalization();
/**
 * Handle errors resulting from erronous URL parameters,
 * or error redirects from GitHub OAuth
 *
 * @param localization - localization
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
    if (errorType === 'missingReferer') {
      errorHeadline.innerText = localization.t("error.headline1");
      errorBody1.innerText = localization.t("error.body1");
      errorBody2.innerText = localization.t("error.body2");
    } else if (errorType === 'invalidParams') {
      errorHeadline.innerText = localization.t("error.headline1");
      errorBody1.innerText = localization.t("error.body3");
      if (referer) {
        errorBody2.innerText = localization.t("error.body4");
        if (errorLink) {
          errorLink.href = referer;
          errorLink.target = '_self';
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'missingAuthentication') {
      errorHeadline.innerText = localization.t("error.headline2");
      if (errorMsg) {
        const errorMsgPre = document.createElement('pre');
        errorMsgPre.innerText = errorMsg;
        errorBody1.parentNode?.insertBefore(errorMsgPre, errorBody1.nextSibling);
        errorBody1.innerText = localization.t("error.body6");
      }
      errorBody2.innerText = localization.t("error.body5");
      if (referer) {
        errorBody3.innerText = localization.t("error.body4");
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'unknownError') {
      errorHeadline.innerText = localization.t("error.headlineDefault");
      if (errorMsg) {
        const errorMsgPre = document.createElement('pre');
        errorMsgPre.innerText = errorMsg;
        errorBody1.parentNode?.insertBefore(errorMsgPre, errorBody1.nextSibling);
        errorBody1.innerText = localization.t("error.body6");
      }
      errorBody2.innerText = localization.t("error.bodyDefault");
      if (referer) {
        errorBody3.innerText = localization.t("error.body4");
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'fileNotFound') {
      errorHeadline.innerText = localization.t("error.headlineDefault");
      if (errorMsg) {
        const errorMsgPre = document.createElement('pre');
        errorMsgPre.innerText = errorMsg;
        errorBody1.parentNode?.insertBefore(errorMsgPre, errorBody1.nextSibling);
        errorBody1.innerText = localization.t("error.body6");
      }
      errorBody2.innerText = localization.t("error.bodyDefault");
      if (referer) {
        errorBody3.innerText = localization.t("error.body4");
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    } else if (errorType === 'fileUploadError') {
      errorHeadline.innerText = localization.t("error.headlineDefault");
      errorBody1.innerText = localization.t("error.body8");
      if (errorMsg) {
        const errorMsgPre = document.createElement('pre');
        errorMsgPre.innerText = errorMsg;
        errorBody2.parentNode?.insertBefore(errorMsgPre, errorBody2.nextSibling);
        errorBody2.innerText = localization.t("error.body6");
      }
      errorBody3.innerText = localization.t("error.body9");
      if (referer) {
        if (errorLink) {
          errorLink.href = referer;
          errorLink.target = '_self';
          errorLink.innerText = referer;
          const fileName = localStorage.getItem('fileName');
          const file = localStorage.getItem('file');
          if (fileName && file) {
            localStorage.removeItem('fileName');
            localStorage.removeItem('file');
          }
        }
      }
    } else {
      errorHeadline.innerText = localization.t("error.headlineDefault");
      errorBody1.innerText = localization.t("error.bodyDefault");
      if (referer) {
        errorBody2.innerText = localization.t("error.body4");
        if (errorLink) {
          errorLink.href = referer;
          errorLink.innerText = referer;
        }
      }
    }
  }
}