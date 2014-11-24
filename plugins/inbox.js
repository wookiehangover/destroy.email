var User = require('../models/user');
var Joi = require('joi');
var prepareInbox = require('../lib/prepare-inbox');

function fetchUser(request, reply) {
  User.get(request.auth.credentials.username).run(function(err, user) {
    if (err) {
      throw err;
    }
    reply(user);
  });
}

function fetchMessage(request, reply) {
  request.pre.user.getMessage(request.params.id)
    .then(prepareInbox)
    .then(reply)
    .catch(function() {
      if (err) {
        throw err;
      }
    });
}

function fetchInboxPage(request, reply) {
  request.pre.user.inbox(request.query.page)
    .then(prepareInbox)
    .then(reply)
    .catch(function(err) {
      throw err;
    });
}

exports.inbox = {
  method: 'GET',
  path: '/inbox',
  config: {
    auth: 'session',
    pre: [
      { method: fetchUser, assign: 'user' },
      { method: fetchInboxPage, assign: 'inbox' }
    ],
    validate: {
      query: {
        page: Joi.number().default(1)
      }
    }
  },
  handler: function(request, reply) {
    var page = request.query.page;
    var params = {
      page: page,
      inbox: request.pre.inbox,
      title: 'Inbox',
      username: request.auth.credentials.username,
      nextPage: '?page=' + (page + 1),
      prevPage: '?page=' + (page - 1)
    };
    reply.view('inbox', params);
  }
};

exports.showMessage = {
  method: 'GET',
  path: '/inbox/{id}',
  config: {
    auth: 'session',
    pre: [
      { method: fetchUser, assign: 'user' },
      { method: fetchMessage, assign: 'message' }
    ]
  },
  handler: function(request, reply) {
    var msg = request.pre.message.page[0];
    var params = {
      msg: msg,
      title: msg.subject,
      iframeHelper: request.pre.message.iframeHelper
    };
    reply.view('message', params);
  }
};

exports.proxy = {
  method: 'GET',
  path: '/inbox/proxy',
  config: {
    validate: {
      query: {
        url: Joi.string().required()
      }
    }
  },
  handler: {
    proxy: {
      rejectUnauthorized: false,
      timeout: 30e3,
      // ttl: 'upstream',
      mapUri: function(request, callback) {
        var uri = new Buffer(request.query.uri, 'base64').toString('utf8');
        callback(null, uri);
      }
    }
  }
};

exports.register = function(plugin, options, next) {
  plugin.route([
    exports.showMessage,
    exports.inbox,
    exports.proxy
  ]);

  next();
};

exports.register.attributes = {
  name: 'inbox',
  version: '0.0.1'
};
