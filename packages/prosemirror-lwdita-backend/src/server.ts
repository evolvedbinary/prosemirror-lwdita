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

import { GitHubControllerImpl } from './api/controller/github.controller';
import { GitHubRouter } from './api/routes/github.router';
import express from 'express';
import cors from 'cors';
import { Config, loadConfig } from './config';

const app = express();
app.use(express.json());

/**
 * Load the configuration
 */
const config: Config = loadConfig("./config.json");

if (config.server.enableCors) {
  app.use(cors());
}

// add the github module to the http server
// this will forward all requests starting with /api/github to the githubRouter
const gitHubController = new GitHubControllerImpl(config);
const router = GitHubRouter.create(gitHubController);

app.use('/api/github', router);

app.get('/', (_req, res) => {
  res.send('the server is running');
});

app.listen(3000, () => {
  const serverPort = app.settings.port;
  const serverUrl = app.settings.hostname + ":" + (serverPort == 80 || serverPort == 443) ? "" : ":" + serverPort;
  console.log('Server is running on ' + serverUrl);
});