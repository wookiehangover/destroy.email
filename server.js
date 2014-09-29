var config = require('config');
var Hapi = require('hapi');
var path = require('path');

var serverOptions = {
  views: {
    engines: {
      html: require('swig')
    },
    path: path.join(__dirname, 'templates')
  }
};

var server = new Hapi.Server(process.env.PORT || 3000, serverOptions);

// Session and Auth Decorators
require('./lib/session')(server);
require('./lib/auth')(server);

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
    plugin: require('./routes/home')
  },
  {
    plugin: require('./routes/webhook')
  },
  {
    plugin: require('./routes/gmail-api')
  }
], function(err) {
  if (err) throw err;
});

server.route([
  {
    method: 'POST',
    path: '/beta',
    handler: function(request, reply) {
      // TODO - wire up to mailchimp API
      reply();
    }
  },

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
