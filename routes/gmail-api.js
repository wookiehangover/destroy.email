var drafts = require('../lib/drafts');
var renewToken = require('../lib/renew-token');
var User = require('../models/user');

exports.readDrafts = {
  method: 'GET',
  path: '/api/drafts/{id?}',
  config: {
    auth: 'session'
  },
  handler: function(request, reply) {
    var id = request.params.id;
    var token = request.auth.credentials.token;
    var email = request.auth.credentials.profile.email;

    function apiResponse(err, resp, body) {
      // TODO handle errors
      if (resp.statusCode === 401) {
        reply.redirect('/renew-token?redirect='+ encodeURIComponent(request.path));
      }
      reply(body);
    }

    if (id) {
      drafts.get(token, email, id, apiResponse);
    } else {
      drafts.list(token, email, apiResponse);
    }

  }
};

exports.renewToken = {
  method: 'GET',
  path: '/renew-token',
  config: {
    auth: 'session'
  },
  handler: function(request, reply) {
    var id = request.auth.credentials.profile.id;
    // don't rely on session data
    User.get(id).run().nodeify(function(err, user) {
      if (err) {
        throw err;
      }

      var token = user.refreshToken;

      renewToken(token, function(err, json) {
        if (err) {
          return reply(403);
        }

        var creds = request.auth.credentials;
        creds = json.token;

        request.auth.artifacts.token = json.token;

        if (request.query.redirect) {
          reply.redirect(decodeURIComponent(request.query.redirect));
        } else {
          reply(200);
        }
      });
    });
  }
};

exports.register = function(plugin) {
  plugin.route([
    exports.readDrafts,
    exports.renewToken
  ]);
};

exports.register.attributes = {
  name: 'gmail-api',
  version: '0.0.1'
};
