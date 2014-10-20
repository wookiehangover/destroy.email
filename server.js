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
    plugin: require('./routes/user')
  },
  {
    plugin: require('./routes/webhook')
  },
  {
    plugin: require('./routes/gmail')
  }
], function(err) {
  if (err) throw err;
});

server.pack.register(require('./routes/api'), {
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

