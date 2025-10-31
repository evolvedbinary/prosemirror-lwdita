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
/**
 * This file attempts to fix a problem where the cursor
 * doesn't change position after adding a new line
 */
const fs = require('fs');
const path = require('path');

const filenames = [
  'prosemirror-view/dist/index.cjs',
  'prosemirror-view/dist/index.js',
];
let dir = path.join(__dirname, '../..');
if (path.basename(dir) !== 'node_modules') {
  dir = path.join(dir, 'node_modules');
}

let view = path.join(dir, 'prosemirror-view/dist');

if(!fs.existsSync(view)) {
  dir = path.join(dir, '../../node_modules');
  view = path.join(dir, 'prosemirror-view/dist');
}
if(fs.existsSync(view)) {
  const line = '!prev.selection.empty && !state.selection.empty && ';
  process.stdout.write('This file attempts to fix a problem where the cursor\n');
  process.stdout.write('doesn\'t change position after adding a new line\n\n');
  process.stdout.write('Patching "prosemirror-view"...\n');
  filenames.forEach(filename => {
    filename = path.join(dir, filename);
    const content = fs.readFileSync(filename, { encoding: 'utf-8' });
    fs.writeFileSync(filename, content.replace(line, ''), { encoding: 'utf-8' });
  });
  process.stdout.write('done.\n');
} else {
  process.stdout.write('something went wrong, couldn\'t locate the file.\n');
}
