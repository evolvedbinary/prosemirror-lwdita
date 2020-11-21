/**
 * This file attempts to fix a problem where the cursor
 * doesn't change position after adding a new line
 */

const fs = require('fs');
const path = require('path');

const filenames = [
  'node_modules/prosemirror-view/dist/index.es.js',
  'node_modules/prosemirror-view/dist/index.js',
];
const line = '!prev.selection.empty && !state.selection.empty && ';
process.stdout.write('This file attempts to fix a problem where the cursor\n');
process.stdout.write('doesn\'t change position after adding a new line\n\n');
process.stdout.write('Patching "prosemirror-view"...\n');
filenames.forEach(filename => {
  filename = path.join(__dirname, '..', filename);
  const content = fs.readFileSync(filename, { encoding: 'utf-8' });
  fs.writeFileSync(filename, content.replace(line, ''), { encoding: 'utf-8' });
});
process.stdout.write('done.\n');