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

server.route({
  method: 'POST',
  path: '/',
  handler: function(request, reply) {
    if (request.payload.mailinMsg) {
      var message = new Message(request.payload.mailinMsg);

      message.saveAll()
        .then(function() {
          console.log('Message saved');
        });
    }

    reply();
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
