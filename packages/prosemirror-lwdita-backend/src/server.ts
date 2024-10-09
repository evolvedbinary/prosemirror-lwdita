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

import express from 'express';
import githubRouter from './api/routes/github.router';
import { serverConfig, enableCors } from '@evolvedbinary/prosemirror-lwdita';
import cors from 'cors';

const app = express();
app.use(express.json());

if (enableCors) {
  app.use(cors());
}

// add the github module to the http server
// this will forward all requests starting with /api/github to the githubRouter
app.use('/api/github', githubRouter);

app.get('/', (req, res) => {
  res.send('the server is running');
});

app.listen(3000, () => {
  console.log('Server is running on' + serverConfig.apiUrl);
});