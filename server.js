var Hapi = require('hapi');
var good = require('good');
var server = new Hapi.Server(process.env.PORT || 3000);

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('Hello World');
  }
});


server.route({
  method: 'POST',
  path: '/',
  handler: function(request, reply) {
    console.log(request.payload);
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
