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

import { Config, ConfigApi, ConfigEndpoint, ConfigFrontend, ConfigGit, ConfigGitHub, ConfigServer } from "../src/config";

export class MockConfig implements Config {
    server: MockConfigServer = new MockConfigServer();
    git: MockConfigGit = new MockConfigGit();
    gitHub: MockConfigGitHub = new MockConfigGitHub();
}

class MockConfigServer implements ConfigServer {
    frontend: MockConfigFrontend = new MockConfigFrontend();
    api: MockConfigApi = new MockConfigApi();
}

class MockConfigFrontend implements ConfigFrontend {
    url: string = "http://localhost:1234";
}

class MockConfigApi implements ConfigApi {
    baseUrl: string = "http://localhost:3000";
    endpoint: MockConfigEndpoint = new MockConfigEndpoint();
}

class MockConfigEndpoint implements ConfigEndpoint {
    token: string = "/api/github/token";
    user: string = "/api/github/user";
    integration: string = "/api/github/integration";
}

class MockConfigGit implements ConfigGit {
    branchPrefix: string = "doc/petal-";
    commitMessageSuffix: string = " \n ------------------\n This is an automated PR made by the prosemirror-lwdita demo Editor";
}

class MockConfigGitHub implements ConfigGitHub {
    clientId: string = "mock-client-id";
}