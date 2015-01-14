var config = require('config');
var Hapi = require('hapi');
var path = require('path');
var server = new Hapi.Server();

server.connection({ port: process.env.PORT || 3000 });

server.views({
  engines: {
    html: require('swig')
  },
  path: path.join(__dirname, 'templates'),
  isCached: process.env === 'production',
  compileOptions: {
    isPretty: true
  }
});

// Plugins
var plugins = [
  // require('tv'),
  {
    register: require('good'),
    options: {
      opsInterval: 1000,
      reporters: [{
        reporter: require('good-console'),
        args:[{ log: '*', request: '*' }]
      }]
    }
  },
  {
    register: require('hapi-assets'),
    options: config.assets
  },
  require('./lib/session'),
  require('./lib/auth'),
  require('./plugins/user'),
  require('./plugins/beta'),
  require('./plugins/inbox'),
  require('./plugins/webhook'),
  require('./plugins/gmail'),
  require('./plugins/api')
];

server.register(plugins, function(err) {
  if (err) throw err;

  server.route([
    // Static assets
    {
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: 'public'
        }
      }
    }
  ]);

  server.start(function() {
    console.log('Server started at:', server.info.uri);
  });
});


