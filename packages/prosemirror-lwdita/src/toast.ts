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

import Toastify from 'toastify-js';

/**
 * Displays a toast message with 'Toastify' library
 *
 * @param message - Message to display
 * @param type - Type of toast
 */
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  const toast = Toastify({
    text: message,
    duration: 10000,
    gravity: 'bottom',
    position: 'right',
    style: {
      background: type === 'success' ? 'linear-gradient(to right, #00b09b, #96c93d)' : 'linear-gradient(to right, #ff5f5f, #ffc390)',
    },
  }).showToast();
}
