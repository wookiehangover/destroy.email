var beta = require('../lib/beta');

exports.beta = {
  method: 'GET',
  path: '/beta',
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

exports.redeem = {
  method: 'GET',
  path: '/beta/redeem',
  handler: function(request, reply) {
    reply.view('create', {
      title: 'destroy.email'
    });
  }
};

exports.createInvite = {
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

exports.createAccount = {
  method: 'POST',
  path: '/beta/redeem',
  handler: function(request, reply) {
    var token = request.payload.token;
    var username = request.payload.username


  }
};

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.redeem,
    exports.beta,
    exports.createInvite,
    exports.createAccount
  ]);

  next();
};

exports.register.attributes = {
  name: 'beta',
  version: '0.0.1'
};
