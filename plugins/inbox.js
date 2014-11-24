var User = require('../models/user');
var Joi = require('joi');
var prepareInbox = require('../lib/prepare-inbox');

function authenticate(request) {
  var page = request.query.page || 1;
  return User.get(request.auth.credentials.username).run()
    .then(function(user) {
      return user.inbox(page);
    });
}

exports.inbox = {
  method: 'GET',
  path: '/inbox',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply(403);
    }

    authenticate(request)
      .then(prepareInbox)
      .then(function(inbox) {
        inbox.username = request.auth.credentials.username;
        reply.view('inbox', inbox);
      })
      .catch(function(error) {
        console.log(error.stack);
        reply(error);
      });
  },
  config: {
    auth: 'session'
  }
};

exports.proxy = {
  method: 'GET',
  path: '/inbox/proxy',
  config: {
    validate: {
      query: {
        url: Joi.string().required()
      }
    }
  },
  handler: {
    proxy: {
      rejectUnauthorized: false,
      timeout: 30e3,
      // ttl: 'upstream',
      mapUri: function(request, callback) {
        var uri = new Buffer(request.query.uri, 'base64').toString('utf8');
        callback(null, uri);
      }
    }
  }
}

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.inbox,
    exports.proxy
  ]);

  next();
};

exports.register.attributes = {
  name: 'inbox',
  version: '0.0.1'
};
