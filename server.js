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
      var json = request.payload.mailinMsg;
      console.log(typeof json);
      console.log(json.to);
      var message = new Message(json);

      message.saveAll()
        .then(function() {
          console.log('Message saved');
        })
        .catch(function(err) {
          console.error(err);
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
