/**
 * This file attempts to fix a problem where the cursor
 * doesn't change position after adding a new line
 */

// const fs = require('fs');
// const path = require('path');

// const filenames = [
//   'prosemirror-view/dist/index.es.js',
//   'prosemirror-view/dist/index.js',
// ];
// let dir = path.join(__dirname, '../..');
// if (path.basename(dir) !== 'node_modules') {
//   dir = path.join(dir, 'node_modules');
// }

// let view = path.join(dir, 'prosemirror-view/dist');

// if(!fs.existsSync(view)) {
//   dir = path.join(dir, '../../node_modules');
//   view = path.join(dir, 'prosemirror-view/dist');
// }
// if(fs.existsSync(view)) {
//   const line = '!prev.selection.empty && !state.selection.empty && ';
//   process.stdout.write('This file attempts to fix a problem where the cursor\n');
//   process.stdout.write('doesn\'t change position after adding a new line\n\n');
//   process.stdout.write('Patching "prosemirror-view"...\n');
//   filenames.forEach(filename => {
//     filename = path.join(dir, filename);
//     const content = fs.readFileSync(filename, { encoding: 'utf-8' });
//     fs.writeFileSync(filename, content.replace(line, ''), { encoding: 'utf-8' });
//   });
//   process.stdout.write('done.\n');
// } else {
//   process.stdout.write('something went wrong, couldn\'t locate the file.\n');
// }


// The file Charaf tried to modify no longer exists