var thinky = require('thinky')();
var Receiver = require('./receiver');

var Message = thinky.createModel('Message', {
  id: String
});

Message.hasAndBelongsToMany(Receiver, 'to', 'id', 'address');

module.exports = Message;
