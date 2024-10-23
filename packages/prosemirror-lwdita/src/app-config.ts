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
  value: 'http://pineapple.evolvedbinary.com/',
};

/**
 * Store all message strings for the application
 */
export const messageKeys = {
  welcomeNote : {
    title: "Welcome to the Petal Editor.",
    paragraph1: "You can edit the file and publish your changes by clicking the 'Publish File' button.",
    paragraph2: "Your changes will be published to GitHub in your GitHub repository. After successful publication you will notified with a link to the PR. Happy editing!",
    buttonLabel: "Don't show again",
  },
  resultNote: {
    titleSuccess: "Your changes have been successfully published.",
    titleError: "Your changes could not be published.",
    paragraphSuccess: "You can check your published changes here: ",
    paragraphError: "Something went wrong with publishing your changes because of following error:",
  },
  error: {
    headlineDefault: "Sorry, something went wrong",
    headline1: "Sorry, something went wrong",
    headline2: "Sorry, something went wrong with your GitHub Authentication",
    bodyDefault: "No worries, you can simply close this page and reach out to the maintainers of the page if you need any assistance.",
    body1: "The file you are trying to edit could not be found and we don't know where to send you.",
    body2: "No worries, you can simply close this page and reach out to the maintainers of the page if you need any assistance.",
    body3: "The file you are trying to edit could not be found, because something is wrong with the parameters you provided. Please reach out to the maintainers of the page if you need any assistance.",
    body4: "You can click on the link below that will take you back to the file you were trying to edit.",
    body5: "It seems you have not been authenticated by GitHub.",
    body6: "Following error occurred: ",
    body7: "The file you are trying to edit could not be found.",
    body8: "Failed to load your file.",
    body9: "You could check your file and try again, or you can click on the link below to go back to the start page.",
    link1: "TODO: Content for 'messageKeys.error.link1'",
  },
}
