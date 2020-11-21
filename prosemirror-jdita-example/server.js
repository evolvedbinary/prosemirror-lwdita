var StaticServer = require('static-server');
var server = new StaticServer({
  rootPath: '/opt/petal/www',
  port: 3000,
  name: 'evolved-binary',
  host: '127.0.0.1',
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
