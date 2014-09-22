var config = require('config');
var thinky = require('thinky')(config.rethinkdb);
var Receiver = require('./receiver');

var Message = thinky.createModel('Message', {
  id: String
});

Message.hasAndBelongsToMany(Receiver, 'to', 'id', 'address');

module.exports = Message;
