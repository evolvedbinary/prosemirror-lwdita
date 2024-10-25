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

import * as fs from 'fs';

/**
 * Config class for prosemirror-lwdita-backend.
 */
export class Config {
    server: ConfigServer
    git: ConfigGit
    gitHub: ConfigGitHub

    constructor(server: ConfigServer, git: ConfigGit, gitHub: ConfigGitHub) {
        this.server = server;
        this.git = git;
        this.gitHub = gitHub;
    }

    /**
     * Load the configuration from a JSON file.
     * 
     * @param file - the path to a JSON file containing the config.
     * 
     * @returns a Config object.
     */
    public static fromJsonFile(file: string) : Config {
        const jsonConfig = JSON.parse(fs.readFileSync(file, 'utf8'));

        return new Config(
            new ConfigServer(jsonConfig.server.enableCors, jsonConfig.server.apiUrl),
            new ConfigGit(jsonConfig.git.committerName, jsonConfig.git.committerEmail),
            new ConfigGitHub(jsonConfig.gitHub.clientId, jsonConfig.gitHub.clientSecret)
        );
    }
}

/**
 * Server config class for prosemirror-lwdita-backend.
 */
export class ConfigServer {
    enableCors: boolean
    apiUrl: string

    constructor(enableCors: boolean, apiUrl: string) {
        this.enableCors = enableCors;
        this.apiUrl = apiUrl;
    }
}

/**
 * Git config class for prosemirror-lwdita-backend.
 */
export class ConfigGit {
    committerName: string
    committerEmail: string

    constructor(committerName: string, committerEmail: string) {
        this.committerName = committerName
        this.committerEmail = committerEmail
    }
}

/**
 * GitHub config class for prosemirror-lwdita-backend.
 */
export class ConfigGitHub {
    clientId: string
    clientSecret: string

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId
        this.clientSecret = clientSecret
    }
}
