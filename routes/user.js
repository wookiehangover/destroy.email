var _ = require('lodash');
var beta = require('../lib/beta');

exports.root = {
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      reply.redirect('/home');
    } else {
      reply({
        name: 'destroy.email',
        description: 'An API for your inbox',
        beta: {
          status: 'coming soon',
          signup: 'curl -d email=you@example.com https://destroy.email/beta'
        }
      });
    }
  },
  config: {
    auth: 'session'
  }
};

exports.home = {
  method: 'GET',
  path: '/home',
  handler: function(request, reply) {
    reply({
      name: request.auth.credentials.username + '@destroy.email',
      inbox: 'https://destroy.email/inbox',
      redirects: []
    });
  },
  config: {
    auth: 'session'
  }
};

exports.redeem = {
  method: 'GET',
  path: '/beta/redeem',
  handler: function(request, reply) {
    reply.view('create', {
      title: 'destroy.email'
    });
  }
};

exports.beta = {
  method: 'POST',
  path: '/beta',
  handler: function(request, reply) {
    var email = request.payload.email;
    beta.create(email, function(err, token) {
      if (err) {
        throw err;
      }
      reply({
        token: token,
        instructions: "Claim your account by visiting https://destroy.email/beta/redeem in a browser. Formal invitations will be emailed soon."
      });
    });
  }
};

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.root,
    exports.redeem,
    exports.beta,
  ]);

  plugin.route(_.values(exports.user));

  next();
};

exports.register.attributes = {
  name: 'user',
  version: '0.0.1'
};
