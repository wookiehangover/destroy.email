var config = require('config');
var bell = require('bell');
var User = require('../../models/user');

exports.authenticate = function(request, reply) {
  if (!request.auth.isAuthenticated) {
    return reply('Authentication failed due to: ' + request.auth.error.message);
  }

  var creds = request.auth.credentials;
  var user = creds.profile.raw;

  user.refreshToken = creds.refreshToken;
  request.auth.session.set(request.auth.credentials);

  User.get(user.id).createOrUpdate(user).nodeify(function(err) {
    if (err) {
      console.log('error saving user');
    } else {
      console.log('hoooray!');
    }
    reply.redirect('/home');
  });
};

exports.register = function(plugin, options, next) {

  plugin.register(bell, function(err){
    if (err) {
      throw err;
    }

    plugin.auth.strategy('google', 'bell', {
      provider: 'google',
      password: config.secret,
      clientId: config.google.id,
      clientSecret: config.google.secret,
      isSecure: false,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      providerParams: {
        access_type: 'offline',
        approval_prompt: 'force' // and thus, we are granted access to the refreshToken
      }
    });

    plugin.route({
      method: ['GET', 'POST'],
      path: '/auth/google',
      config: {
        auth: {
          strategy: 'google',
          mode: 'try'
        },
        handler: exports.authenticate
      }
    });

    next();
  });

};

exports.register.attributes = {
  name: 'google-auth',
  version: '0.0.0'
};

