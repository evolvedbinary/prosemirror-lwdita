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

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const buildTimeStamp = new Date().toISOString();
const buildVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
const buildCommitAbbrev = require('child_process').execSync('git rev-parse HEAD').toString().slice(0, 7).toUpperCase();
const content = `FROM nginx:alpine
COPY dist /usr/share/nginx/html

LABEL org.label-schema.build-date="${buildTimeStamp}" \\
      org.label-schema.description="ProseMirror LwDITA Example" \\
      org.label-schema.name="prosemirror-lwdita-example" \\
      org.label-schema.version="${buildVersion}" \\
      org.label-schema.schema-version="1.0" \\
      org.label-schema.url="https://github.com/evolvedbinary/prosemirror-lwdita" \\
      org.label-schema.vcs-ref="${buildCommitAbbrev}" \\
      org.label-schema.vcs-url="https://github.com/evolvedbinary/prosemirror-lwdita" \\
      org.label-schema.vendor="Evolved Binary"

COPY LICENSE /usr/share/nginx/html/LICENSE`;

fs.writeFileSync(path.join(__dirname, 'Dockerfile'), content);
