var User = require('../models/user');

exports.inbox = {
  method: 'GET',
  path: '/inbox',
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      User.get(request.auth.credentials.username).run()
        .then(function(user) {
          return user.inbox();
        })
        .then(function(inbox) {
          reply(inbox);
        })
        .catch(function(error) {
          console.log(error);
          reply(500);
        });
    } else {
      reply(403);
    }
  },
  config: {
    auth: 'session'
  }
};

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.inbox
  ]);

  next();
};

exports.register.attributes = {
  name: 'api',
  version: '0.0.1'
};
