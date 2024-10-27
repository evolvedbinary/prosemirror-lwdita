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

const configJsonSchema: JTDSchemaType<Config> = {
    properties: {
        server: {
            properties: {
                frontend: {
                    properties: {
                        url: {
                            type: "string"
                        }
                    }
                },
                api: {
                    properties: {
                        baseUrl: {
                            type: "string"
                        },
                        endpoint: {
                            properties: {
                                token: {
                                    type: "string"
                                },
                                user: {
                                    type: "string"
                                },
                                integration: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        git: {
            properties: {
                branchPrefix: {
                    type: "string"
                },
                commitMessageSuffix: {
                    type: "string"
                }
            }
        },
        gitHub: {
            properties: {
                clientId: {
                    type: "string"
                }
            }
        }
    },
    additionalProperties: false
};

/**
 * Config class for prosemirror-lwdita.
 */
export interface Config {
    server: ConfigServer
    git: ConfigGit
    gitHub: ConfigGitHub
}

/**
 * Server config class for prosemirror-lwdita.
 */
export interface ConfigServer {
    frontend: ConfigFrontend
    api: ConfigApi
}

/**
 * Frontend config class for prosemirror-lwdita.
 */
export interface ConfigFrontend {
    url: string
}

/**
 * API config class for prosemirror-lwdita.
 */
export interface ConfigApi {
    baseUrl: string
    endpoint: ConfigEndpoint
}

/**
 * Endpoint config class for prosemirror-lwdita.
 */
export interface ConfigEndpoint {
    token: string
    user: string
    integration: string
}

/**
 * Git config class for prosemirror-lwdita.
 */
export interface ConfigGit {
    branchPrefix: string
    commitMessageSuffix: string
}

/**
 * GitHub config class for prosemirror-lwdita.
 */
export interface ConfigGitHub {
    clientId: string
}

/**
 * Parse the configuration from JSON.
 *
 * @param jsonConfig - the JSON containing the config.
 *
 * @returns a Config object.
 */
export function parseConfig(jsonConfig: string) : Config {
    // create a validating parser
    const ajv = new Ajv();
    const parse = ajv.compileParser(configJsonSchema);

    // parse the json
    const data = parse(jsonConfig);
    if (data === undefined) {
        throw new Error("Unable to parse JSON: [" + parse.position + "] " + parse.message);
    } else {
        return data;
    }
}
