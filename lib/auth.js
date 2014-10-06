var _ = require('lodash');
var config = require('config');
var google = require('./google_api/auth');
var User = require('../models/user');


exports.userAuth = function(server, options) {
  function authenticate(request, reply) {
    var username = request.payload.username;
    var pass = request.payload.password;

    User.authenticate(username, pass)
      .then(function(hasAuth) {
        if (!hasAuth) {
          return reply(false);
        }

        User.filter({ username: username }).then(function(result){
          var user = result[0];
          var profile = _.omit(user, 'password');

          reply(null, {
            credentials: {
              id: user.id,
              profile: profile
            }
          });
        });
      })
      .catch(reply);
  }

  return {
    authenticate: authenticate
  };

};

exports.register = function(plugin, options, next) {
  plugin.auth.scheme('user', exports.userAuth);
  plugin.auth.strategy('password', 'user');

  plugin.register([
    google
  ], next);
};

exports.register.attributes = {
  name: 'auth',
  version: '0.0.1'
};
