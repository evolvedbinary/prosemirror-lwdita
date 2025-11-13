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


// This file is used to declare global variables that are used in the application.
// This is a workaround to allow the use of global variables in TypeScript.
// See https://javascript.plainenglish.io/typescript-and-global-variables-in-node-js-59c4bf40cb31
export interface Global {
  token: string;
}

// The use of `var` is intentional here, as it is the only way to declare a global variable in TypeScript.
declare global {
  var token: string;
}
export { };