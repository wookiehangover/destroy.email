var beta = require('../lib/beta');

exports.home = {
  method: 'GET',
  path: '/home',
  handler: function(request, reply) {
    reply(request.auth.credentials.profile);
  },
  config: {
    auth: 'session'
  }
};

exports.create = {
  method: 'GET',
  path: '/create',
  handler: function(request, reply) {
    reply.view('create', {
      title: 'destroy.email'
    });
  }
};

exports.root = {
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply({
      name: 'destroy.email',
      description: 'An API for your inbox',
      beta: {
        status: 'coming soon',
        signup: 'curl -d email=you@example.com https://destroy.email/beta'
      }
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
    exports.home,
    exports.create,
    exports.beta
  ]);

  next();
};

exports.register.attributes = {
  name: 'home',
  version: '0.0.1'
};
