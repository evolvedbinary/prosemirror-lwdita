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
