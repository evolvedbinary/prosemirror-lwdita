var path = require('path');
var StaticServer = require('static-server');
const rootPath = path.join(__dirname, 'dist');
process.stdout.write('Running server on [' + rootPath + '] ...\n');
var server = new StaticServer({
  rootPath,
  port: 3000,
  name: 'evolved-binary',
  host: '0.0.0.0',
  cors: '*',
  followSymlink: true,
  templates: {
    index: 'index.html',
    // notFound: '404.html'
  }
});
 
server.start(function () {
  console.log('Server listening to', server.port);
});
