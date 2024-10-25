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

import Ajv, {JTDSchemaType} from "ajv/dist/jtd"
import * as fs from 'fs';

const configJsonSchema: JTDSchemaType<Config> = {
    properties: {
        server: {
            properties: {
                enableCors: {
                    type: "boolean"
                },
                apiUrl: {
                    type: "string"
                }
            }
        },
        git: {
            properties: {
                committerName: {
                    type: "string"
                },
                committerEmail: {
                    type: "string"
                }
            }
        },
        gitHub: {
            properties: {
                clientId: {
                    type: "string"
                },
                clientSecret: {
                    type: "string"
                }
            }
        }
    },
    additionalProperties: false
};

/**
 * Config class for prosemirror-lwdita-backend.
 */
export interface Config {
    server: ConfigServer
    git: ConfigGit
    gitHub: ConfigGitHub
}

/**
 * Server config class for prosemirror-lwdita-backend.
 */
export interface ConfigServer {
    enableCors: boolean
    apiUrl: string
}

/**
 * Git config class for prosemirror-lwdita-backend.
 */
export interface ConfigGit {
    committerName: string
    committerEmail: string
}

/**
 * GitHub config class for prosemirror-lwdita-backend.
 */
export interface ConfigGitHub {
    clientId: string
    clientSecret: string
}

/**
 * Load the configuration from a JSON file.
 *
 * @param file - the path to a JSON file containing the config.
 *
 * @returns a Config object.
 */
export function loadConfig(file: string) : Config {
    const jsonConfig = fs.readFileSync(file, 'utf8');

    // create a validating parser
    const ajv = new Ajv();
    const parse = ajv.compileParser(configJsonSchema);

    // parse the json
    const data = parse(jsonConfig);
    if (data === undefined) {
        throw new Error("Unable to parse JSON config.json: [" + parse.position + "] " + parse.message);
    } else {
        return data;
    }
}
