var _ = require('lodash');
var User = require('../models/user');

exports.inbox = {
  method: 'GET',
  path: '/inbox',
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      User.get(request.auth.credentials.username).run()
        .then(function(user) {
          return user.inbox();
        })
        .then(function(inbox) {
          reply(inbox);
        })
        .catch(function(error) {
          console.log(error);
          reply(500);
        });
    } else {
      reply(403);
    }
  },
  config: {
    auth: 'session'
  }
};


var Message = require('../models/message');
var async = require('async');
var opengrapher = require('opengrapher');
var cheerio = require('cheerio');

exports.message = {
  show: {
    method: 'GET',
    path: '/messages/{id}',
    handler: function(request, reply) {
      if (!request.params.id) {
        return reply(412);
      }

      Message.get(request.params.id).getJoin().run(function(err, message) {
        if (err) throw err;

        var $ = cheerio.load(message.html);
        var links = [];
        var unsubscribe = [];
        
        $('a').each(function() {
          var href = $(this).attr('href');
          var text = $(this).text();
          if (/http/.test(href)) {
            if (/unsubscribe/.test(text)) {
              unsubscribe.push(href);
            } else {
              links.push(href);
            }
          }
        });

        if (links.length > 0) {
          message.links = _.unique(links);
        }

        if (unsubscribe.length > 0) {
          message.unsubscribe = _.unique(unsubscribe);
        }

        if (request.query.opengraph) {
          async.map(links, opengrapher.parse, function(err, opengraph) {
            if (opengraph) {
              message.opengraph = opengraph;
            }
            reply(message);
          });
        
        } else {
          reply(message);
        }

      });
      
    },
    config: {
      auth: 'session'
    }
  }
};

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.inbox
  ]);

  plugin.route(_.values(exports.message));

  next();
};

exports.register.attributes = {
  name: 'api',
  version: '0.0.1'
};
