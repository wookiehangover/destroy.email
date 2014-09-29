exports.home = {
  method: 'GET',
  path: '/home',
  handler: function(request, reply) {
    // console.log(request.auth.credentials.profile);
    reply(request.auth.credentials.profile);
  },
  config: {
    auth: 'session'
  }
};

exports.signup = {
  method: 'GET',
  path: '/signup',
  handler: function(request, reply) {
    reply.view('signup', {
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
        signup: 'curl -d you@example.com https://destroy.email/beta'
      }
    });
  }
};

exports.register = function(plugin) {
  plugin.route([
    exports.root,
    exports.home,
    exports.signup
  ]);
};

exports.register.attributes = {
  name: 'home',
  version: '0.0.1'
};
