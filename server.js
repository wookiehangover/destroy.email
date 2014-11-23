var config = require('config');
var Hapi = require('hapi');
var path = require('path');
var server = new Hapi.Server(process.env.PORT || 3000);

server.views({
  engines: {
    html: require('swig')
  },
  path: path.join(__dirname, 'templates')
});

// Session and Auth Decorators
require('./lib/session')(server);

// Plugins
server.pack.register([
  {
    plugin: require('good'),
  },
  {
    plugin: require('hapi-assets'),
    options: config.assets
  },
  {
    plugin: require('./plugins/user')
  },
  {
    plugin: require('./plugins/beta')
  },
  {
    plugin: require('./plugins/inbox')
  },
  {
    plugin: require('./plugins/webhook')
  },
  {
    plugin: require('./plugins/gmail')
  }
], function(err) {
  if (err) throw err;
});

server.pack.register(require('./plugins/api'), {
  route: {
    prefix: '/api'
  }
}, function() {});

server.route([
  // Static assets
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public',
        listing: true
      }
    }
  }
]);


server.start(function() {
  console.log('Server started at:', server.info.uri);
});

