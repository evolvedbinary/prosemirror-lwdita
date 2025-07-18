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

/* eslint-disable @typescript-eslint/no-unused-vars */

import Toastify, { Options } from 'toastify-js';
import { Localization } from "@evolvedbinary/prosemirror-lwdita-localization";

/**
 * Displays a simple and basic toast message with 'Toastify' library.
 * Requires a message string
 * and a type string ('success', 'error', 'warning', 'info')
 * for setting the appropriate background color.
 * Will stick at the bottom right of the screen,
 * disappears after 5 seconds, and is not dismissible.
 *
 * @see {@link https://github.com/apvarun/toastify-js/blob/master/README.md#api}
 *
 * @param message - Message to display
 * @param type - Type of toast
 */
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' | 'status') {
  let className = 'toast';
  if(type !== 'status') {
    className += ` toast--${type}`;
  }
  const toast = Toastify({
    text: message,
    duration: 5000,
    gravity: 'top',
    position: 'right',
    style: {
      background: type === 'status' ? '#FFBF00' : "",
      color: 'white'
    }
  }).showToast();
}

/**
 * Displays a customized Tostify message
 * with customized markup
 * that users can confirm to never show again
 * by storing it in the localStorage
 * 
 * @param localization - localization
 */
export const showWelcomeNote = (localization: Localization) => {
  const customNote = document.createElement('section');
  customNote.innerHTML = `
  <h2>${localization.t("welcomeNote.title")}</h2>
  <p>${localization.t("welcomeNote.paragraph1")}</p>
  <p>${localization.t("welcomeNote.paragraph2")}</p>
  <button type="button" class="toast--dismiss">${localization.t("welcomeNote.buttonLabel")}</button>
  `;

  const parentNode = document.body;
  parentNode.appendChild(customNote);

  Toastify({
    text: '',
    duration: -1,
    gravity: 'top',
    position: 'right',
    className: 'toast toast__panel toast--welcome',
    close: true,
    node: customNote,
    onClick: function () {
      const toastElement = document.querySelector('.toast--welcome');
      if (toastElement) {
        toastElement.remove();
        localStorage.setItem('welcomeNoteConfirmed', 'true');
      }
    }
  }).showToast();
};

/**
 * Checks if the welcome note has been confirmed
 * @returns True if the welcome note has been confirmed
 */
export function hasConfirmedNotification(): boolean {
  return localStorage.getItem('welcomeNoteConfirmed') === 'true';
}

/**
 * Shows a user notification containing a custom,
 * static message and a dynamic link
 * 
 * @param localization - localization
 * @param destination - URL to which the browser should be navigated on click of the toast
 */
export function showPublicationResultSuccess(localization: Localization, destination: string) {
  const customNote = document.createElement('section');
  customNote.innerHTML = `
  <h2>${localization.t("resultNote.titleSuccess")}</h2>
  <p>${localization.t("resultNote.paragraphSuccess")}</p>
  <a target="_blank" href="${destination}"></span>${destination}</a>
  `;

  const parentNode = document.body;
  parentNode.appendChild(customNote);


  // Remove the submit notification
  const existingToast = document.querySelector(".toastify");
  existingToast?.remove();

  Toastify({
    text: '',
    duration: -1,
    gravity: 'top',
    position: 'right',
    className: `toast__panel toast--success`,
    close: true,
    destination: destination,
    newWindow: true,
    node: customNote,
  }).showToast();
}

/**
 * Shows a user notification containing a dynamic message
 *
 * @param localization - localization
 * @param message - Error message
 */
export function showPublicationResultError(localization: Localization, message: string) {
  const customNote = document.createElement('section');
  customNote.innerHTML = `
  <h2>${localization.t("resultNote.titleError")}</h2>
  <p>${localization.t("resultNote.paragraphError")}</p>
  <p>${message}</p>`;

  const parentNode = document.body;
  parentNode.appendChild(customNote);

  Toastify({
    text: message,
    duration: -1,
    gravity: 'top',
    position: 'right',
    className: `toast__panel toast--error`,
    close: true,
    node: customNote,
  }).showToast();
}