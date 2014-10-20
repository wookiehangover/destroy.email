var _ = require('lodash');
var beta = require('../lib/beta');
var User = require('../models/user');
var path = require('path');

var cheerio = require('cheerio');

var tmpl = require('fs').readFileSync(path.resolve(__dirname + '/../templates/iframeHelper.ejs'));
var iframeHelper = _.template(tmpl);

exports.user = {
  home: {
    method: 'GET',
    path: '/home',
    handler: function(request, reply) {
      reply({
        name: request.auth.credentials.username + '@destroy.email',
        inbox: 'curl https://destroy.email/api/inbox',
        redirects: []
      });
    },
    config: {
      auth: 'session'
    }
  },
  inbox: {
    method: 'GET',
    path: '/inbox',
    handler: function(request, reply) {
      if (request.auth.isAuthenticated) {
        User.get(request.auth.credentials.username).run()
          .then(function(user) {
            return user.inbox();
          })
          .then(function(inbox) {
            var parsedInbox = _.map(inbox.reverse(), function(msg) {
              var $ = cheerio.load(msg.html);
              $('script').remove();
              msg.html = $.html();
              return msg;
            });
            reply.view('inbox', {
              title: 'Inbox',
              inbox: parsedInbox,
              iframeHelper: iframeHelper
            });
          })
          .catch(function(error) {
            console.log(error)
            reply(500);
          });
      } else {
        reply(403);
      }
    },
    config: {
      auth: 'session'
    }
  }
};


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
  name: 'home',
  version: '0.0.1'
};
