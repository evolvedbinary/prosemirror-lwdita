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

export const clientID: { id: string, value: string } = {
  id: 'client_id',
  value: 'Iv23li0Pvl3E4crXIBQ0',
};

export const serverURL: { id: string, value: string } = {
  id: 'server_url',
  value: 'http://pineapple.evolvedbinary.com:1234/',
};

/**
 * Store all messages strings for the application
 */
export const messageKeys = {
  welcomeNote : {
    title: "Welcome to the Petal Editor.",
    paragraph1: "You can edit the file and publish your changes by clicking the 'Publish File' button.",
    paragraph2: "Your changes will be published to GitHub in your GitHub repository. After successful publication you will notified with a link to the PR. Happy editing!",
    buttonLabel: "Don't show again",
  },
}
