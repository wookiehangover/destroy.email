var Hapi = require('hapi');
var good = require('good');
var server = new Hapi.Server(process.env.PORT || 3000);

var Message = require('./models/message');

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply({
      name: 'destroy.email',
      description: 'An API for your inbox',
      beta: {
        status: 'coming soon',
        signup: 'curl -d you@example.com https://destroy.email/beta'
      }
    });
  }
});

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

server.route({
  method: 'POST',
  path: '/',
  handler: function(request, reply) {
    if (request.payload.mailinMsg) {
      var json = request.payload.mailinMsg;
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

    reply();
  },
  config: {
    payload: {
      parse: true
    }
  }
});

server.route({
  method: 'POST',
  path: '/beta',
  handler: function(request, reply) {
    // TODO - wire up to mailchimp API
    reply();
  }
});

server.pack.register({
  plugin: good
}, function(err) {
  if (err) {
    throw err;
  }
});

server.start(function() {
  console.log('Server started at:', server.info.uri);
});
