var _ = require('lodash');
var User = require('../models/user');
var path = require('path');
var url = require('url');
var cheerio = require('cheerio');

var tmpl = require('fs').readFileSync(path.resolve(__dirname + '/../templates/iframeHelper.ejs'));
var iframeHelper = _.template(tmpl);

function authenticate(request) {
  return User.get(request.auth.credentials.username).run()
    .then(function(user) {
      return user.inbox();
    });
}

exports.inbox = {
  method: 'GET',
  path: '/inbox',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply(403);
    }

    authenticate(request).then(function(inbox) {
      var parsedInbox = _.map(inbox, function(msg) {
        var $;
        try {
          $ = cheerio.load(msg.html);
        } catch (e) {
          return;
        }

        $('script').remove();

        $('a').attr({
          target: '_BLANK'
        });

        $('[background]').each(function() {
          var src = $(this).attr('background');
          var safe = new Buffer(src);
          var attrs = {};

          var uri = url.parse(src);
          var protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
          if (uri.protocol !== protocol) {
            attrs.background = '/inbox/proxy?uri=' + safe.toString('base64');
          }

          $(this).attr(attrs);
        });

        $('img').each(function() {
          var src = $(this).attr('src');
          var safe = new Buffer(src);
          var attrs = {
            onerror: 'this.parentNode.removeChild(this)',
          };

          var uri = url.parse(src);
          var protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
          if (uri.protocol !== protocol) {
            attrs.src = '/inbox/proxy?uri=' + safe.toString('base64');
          }

          $(this).attr(attrs);
        });

        msg.html = $.html();
        return msg;
      });

      reply.view('inbox', {
        title: 'Inbox',
        inbox: parsedInbox,
        iframeHelper: iframeHelper,
        username: request.auth.credentials.username
      });
    })
    .catch(function(error) {
      console.log(error.stack)
      reply(error);
    });

  },
  config: {
    auth: 'session'
  }
};

exports.proxy = {
  method: 'GET',
  path: '/inbox/proxy',
  handler: {
    proxy: {
      rejectUnauthorized: false,
      timeout: 30e3,
      // ttl: 'upstream',
      mapUri: function(request, callback) {
        var uri = request.query.uri;
        if (!uri) {
          return callback(new Error('URI missing'));
        }

        uri = new Buffer(uri, 'base64').toString('utf8');
        callback(null, uri);
      }
    }
  }
}

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.inbox,
    exports.proxy
  ]);

  next();
};

exports.register.attributes = {
  name: 'inbox',
  version: '0.0.1'
};
