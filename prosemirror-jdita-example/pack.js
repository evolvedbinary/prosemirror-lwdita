const fs = require('fs');
const path = require('path');
const package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), { encoding: 'utf-8' }));
package.devDependencies = {
  'static-server': package.devDependencies['static-server'],
}
package.scripts = {
  'start': package.scripts['start'],
}
fs.writeFileSync(path.join(__dirname, 'docker-package.json'), JSON.stringify(package), { encoding: 'utf-8' });