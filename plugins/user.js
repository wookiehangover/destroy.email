exports.root = {
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      return reply.redirect('/inbox');
    }

    reply.view('home', {
      title: 'Destroy.EMAIL | Eliminate your inbox'
    });
  },
  config: {
    auth: {
      mode: 'try',
      strategy: 'session',
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    }
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


exports.register = function(plugin, options, next) {
  plugin.route([
    exports.root,
    exports.home
  ]);

  next();
};

exports.register.attributes = {
  name: 'user',
  version: '0.0.1'
};
