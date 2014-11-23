var Message = require('../models/message');

var parse = function(data) {
  var json = {};
  try {
    json = JSON.parse(data);
  } catch(parseError) {
    console.error(parseError);
    console.error(parseError.stack);
  }
  return json;
};

exports.register = function(plugin, options, next) {
  plugin.route({
    method: 'POST',
    path: '/webhook',
    handler: function(request, reply) {
      var json = request.payload;
      if (typeof json === 'string') {
        json = parse(json);
      }
      var message = new Message(json);

      return message.saveAll()
        .then(function() {
          console.log('Message saved');
        })
        .catch(function(err) {
          console.error(err);
        })
        .finally(function() {
          reply('Message saved');
        });
    }
  });

  next();
};

exports.register.attributes = {
  name: 'webhook',
  version: '0.0.1'
};
