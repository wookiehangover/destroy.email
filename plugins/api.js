var _ = require('lodash');
var Joi = require('joi');
var User = require('../models/user');
var Message = require('../models/message');
var prepareMessage = require('../lib/prepare-message');

function fetchInbox(request) {
  return User.get(request.auth.credentials.username).run()
    .then(function(user) {
      return user.inbox();
    });
}

function fetchMessage(request) {
  return Message.get(request.params.id).getJoin().run()
    .then(prepareMessage);
}

exports.inbox = {
  method: 'GET',
  path: '/api/inbox',
  config: {
    auth: 'session',
    pre: [
      { method: fetchInbox, assign: 'inbox' }
    ]
  },
  handler: function(request, reply) {
    reply(request.pre.inbox);
  },
};

exports.message = {
  archive: {
    method: 'POST',
    path: '/api/messages/{id}/archive',
    config: {
      auth: 'session',
      pre: [
        { method: fetchMessage, assign: 'message' }
      ],
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      var message = request.pre.message;
      message.archived = true;
      message.save(function(err) {
        if(err) {
          throw err;
        }
        return reply(200);
      });
    }
  },

  show: {
    method: 'GET',
    path: '/api/messages/{id}',
    config: {
      auth: 'session',
      pre: [
        { method: fetchMessage, assign: 'message' }
      ],
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      reply(request.pre.message);
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
