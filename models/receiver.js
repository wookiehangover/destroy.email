var config = require('config');
var thinky = require('thinky')(config.rethinkdb);

var Receiver = thinky.createModel('Receiver', {
  address: String,
  name: String,
});

Receiver.ensureIndex('address');

module.exports = Receiver;
