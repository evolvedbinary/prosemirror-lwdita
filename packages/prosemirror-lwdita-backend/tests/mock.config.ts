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

import { Config, ConfigGit, ConfigGitHub, ConfigServer } from "../src/config";

export class MockConfig implements Config {
    server: MockConfigServer = new MockConfigServer();
    git: MockConfigGit = new MockConfigGit();
    gitHub: MockConfigGitHub = new MockConfigGitHub();
}

class MockConfigServer implements ConfigServer {
    enableCors: boolean = false;
    apiUrl: string = "http://mock-server";
}

class MockConfigGit implements ConfigGit {
    committerName: string = "Mock Name"; 
    committerEmail: string = "mock@email.dom";
}

class MockConfigGitHub implements ConfigGitHub {
    clientId: string = "mock-client-id";
    clientSecret: string = "mock-client-secret";
}