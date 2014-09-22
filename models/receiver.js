var thinky = require('thinky')();

var Receiver = thinky.createModel('Receiver', {
  address: String,
  name: String,
});

Receiver.ensureIndex('address');

module.exports = Receiver;
