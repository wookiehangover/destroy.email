var config = require('config');
var cookie = require('hapi-auth-cookie');
var User = require('../models/user');

function login(request, reply) {
  if (request.auth.isAuthenticated) {
    return reply.redirect('/');
  }

  if (request.method === 'post') {
    if (!request.payload.username || !request.payload.password) {
      reply.view('login', { errors: 'Missing username or password' });
    } else {
      User.authenticate(request.payload.username, request.payload.password)
        .then(function(account) {
          request.auth.session.set(account);
          reply.redirect('/');
        })
        .catch(function(err) {
          reply.view('login', { error: err.message });
        });
    }
    return;
  }

  if (request.method === 'get' ) {
    return reply.view('login');
  }

  return reply.redirect('/');
}

module.exports = function(server) {

  server.pack.register(cookie, function(err) {
    server.auth.strategy('session', 'cookie', {
      password: config.secret,
      redirectTo: '/login',
      isSecure: false,
      cookie: 'sid',
      ttl: 960000000,
      clearInvalid: true
    });

    server.route([
      {
        method: ['GET', 'POST'],
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
  });


};

