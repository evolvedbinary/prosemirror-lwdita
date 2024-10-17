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

import defaultConfig from './defaultConfig.json';

/**
 * Application configuration
 */
export interface AppConfig {
  serverConfig: {
    frontendUrl: string;
    apiUrl: string;
  };
  clientID: {
    id: string;
    value: string;
  };
  PETAL_BRANCH_PREFIX: string;
  PETAL_COMMIT_MESSAGE_SUFFIX: string;
  PETAL_BOT_USER: string;
  PETAL_COMMITTER_NAME: string;
  PETAL_COMMITTER_EMAIL: string;
  GITHUB_API_ENPOINT_USER: string;
  GITHUB_API_ENPOINT_INTEGRATION: string;
  GITHUB_API_ENPOINT_TOKEN: string;
  messageKeys: {
    welcomeNote: {
      title: string;
      paragraph1: string;
      paragraph2: string;
      buttonLabel: string;
    };
    resultNote: {
      titleSuccess: string;
      titleError: string;
      paragraphSuccess: string;
      paragraphError: string;
    };
    error: {
      headlineDefault: string;
      headline1: string;
      headline2: string;
      bodyDefault: string;
      body1: string;
      body2: string;
      body3: string;
      body4: string;
      body5: string;
      body6: string;
      body7: string;
      body8: string;
      body9: string;
      link1: string;
      toastImageUpload: string;
      toastImageInsert: string;
      toastFileUploadInvalid: string;
      toastFileUpload: string;
      toastFileUploadNoInput: string;
      toastFileDownload: string;
      toastGitHubPublishNoEditorState: string;
      toastGitHubUserEndpoint: string;
      toastGitHubToken: string;
      toastGitHubPR: string;
    };
  };
  [key: string]: unknown; // Index signature for additional fields
}

/**
 * Load the application configuration
 *
 * @param customConfig - Custom configuration
 * @returns The application configuration
 */
export function loadConfig(customConfig?: Partial<AppConfig>): AppConfig {
  return {
    ...defaultConfig,
    ...customConfig,
    serverConfig: {
      ...defaultConfig.serverConfig,
      ...customConfig?.serverConfig,
    },
    clientID: {
      ...defaultConfig.clientID,
      ...customConfig?.clientID,
    },
    messageKeys: {
      ...defaultConfig.messageKeys,
      ...customConfig?.messageKeys,
      welcomeNote: {
        ...defaultConfig.messageKeys.welcomeNote,
        ...customConfig?.messageKeys?.welcomeNote,
      },
      resultNote: {
        ...defaultConfig.messageKeys.resultNote,
        ...customConfig?.messageKeys?.resultNote,
      },
      error: {
        ...defaultConfig.messageKeys.error,
        ...customConfig?.messageKeys?.error,
      },
    },
  };
}

/**
 * Fetch the application configuration
 *
 * @param url - The URL to fetch the configuration from
 * @returns The application configuration
 */
export async function fetchConfig(path: string): Promise<Partial<AppConfig>> {
  const url =  `http://localhost:3000${path}`;
  console.log(`Fetching config from ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch config from ${url}`);
  }
  return response.json();
}

export const config = loadConfig();
export * from './configService';