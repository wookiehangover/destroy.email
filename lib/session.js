var config = require('config');
var cookie = require('hapi-auth-cookie');

function login(request, reply) {
  // if (request.auth.isAuthenticated) {
  //   return reply.redirect('/home');
  // }

  reply.view('login');
}

module.exports = function(server) {

  server.pack.register(cookie, function(err) {
    server.auth.strategy('session', 'cookie', {
      password: config.secret,
      redirectTo: '/login',
      isSecure: false
    });
  });

  server.route([
    {
      method: ['GET'],
      path: '/login',
      config: {
        handler: login,
        auth: {
          mode: 'try',
          strategy: 'session'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    },
    {
      method: ['GET'],
      path: '/logout',
      handler: function(request, reply) {
        request.auth.session.clear();
        reply.redirect('/');
      },
      config: {
        auth: 'session'
      }
    }
  ]);

};

