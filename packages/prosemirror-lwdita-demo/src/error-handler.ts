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

import { Localization } from "@evolvedbinary/prosemirror-lwdita-localization";

/**
 * Handle errors resulting from erronous URL parameters,
 * or error redirects from GitHub OAuth
 *
 * @param localization - localization
 */
export function handleError(localization: Localization) {
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get('error-type');
  const referrer = urlParams.get('referrer');
  if(!errorType) return;

  const errorHeadline = document.getElementById('errorHeadline') as HTMLHeadingElement;
  const errorBody = document.getElementById('errorBody') as HTMLParagraphElement;
  const referrerLink = document.getElementById('referrerLink') as HTMLAnchorElement;


  errorHeadline.innerText = localization.t("error." + errorType + ".headline");
  errorBody.innerText = localization.t("error." + errorType + ".body");

  if(referrer) {
    referrerLink.innerText = "Please click here to head back to the referrer page.";
    referrerLink.href = referrer;
    referrerLink.target = "_self";
  } else {
    referrerLink.innerText = "Please contact the documentation team, and relay the above error message.";
  }

}