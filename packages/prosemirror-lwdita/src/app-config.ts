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
 * The URL of the Petal frontend and API
 */
export const serverConfig = {
  frontendUrl: process.env.PARCEL_FRONTEND_URL || 'http://localhost:1234/',
  apiUrl: process.env.PARCEL_API_URL || 'http://localhost:3000/',
}

export const clientID: { id: string, value: string } = {
  id: 'client_id',
  value: process.env.GITHUB_CLIENT_ID || 'Iv23li0Pvl3E4crXIBQ0',
};

/**
 * Whether or not to enable CORS
 */
export const enableCors = process.env.ENABLE_CORS === 'true';

/**
 * The branch name prefix that Petal will generate in the user's repository
 */
export const PETAL_BRANCH_PREFIX = 'doc/petal-';

/**
 * The commit message subline that Petal will generate in the user's commit message
 */
export const PETAL_COMMIT_MESSAGE_SUFFIX = ' \n ------------------\n This is an automated PR made by the prosemirror-lwdita demo Editor';


export const PETAL_BOT_USER = 'marmoure';
export const PETAL_COMMITTER_NAME = 'Petal GitHub App';
export const PETAL_COMMITTER_EMAIL = 'petal@evolvedbinary.com';

export const GITHUB_API_ENPOINT_USER = 'api/github/user';
export const GITHUB_API_ENPOINT_INTEGRATION = 'api/github/integration';
export const GITHUB_API_ENPOINT_TOKEN = 'api/github/token';

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
    toastImageUpload: "Sorry, there was an error with uploading the image. Please check the image and try again.",
    toastImageInsert: 'Sorry, something went wrong with inserting and saving the image.',
    toastFileUploadInvalid: 'Sorry, there was an error with reading the file. Please check if the file you tried to upload contains valid xml and try again',
    toastFileUpload: 'Sorry, something went wrong with opening the file',
    toastFileUploadNoInput: 'Sorry, the editor has problems with opening the file',
    toastFileDownload: 'Apologies, something went wrong in the editor to provide you the download.',
    toastGitHubPublishNoEditorState: 'Sorry, it seems there is nothing in the editor to save and publish. Please try again.'

  },
}
