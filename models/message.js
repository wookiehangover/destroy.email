var _ = require('lodash');
var config = require('config');
var thinky = require('thinky')(config.rethinkdb);
var Receiver = require('./receiver');
var r = thinky.r;

var Message = thinky.createModel('Message', {
  id: String,
  createdAt: { _type: Date, default: r.now() },
  archived: { _type: Boolean, default: false }
});

Message.ensureIndex('archived');

Message.pre('save', function(next) {
  var addresses = _.pluck(this.to, 'address');

  if (addresses.length === 0) {
    return next();
  }

  addresses.push({ index: 'address' });

  Receiver.getAll.apply(Receiver, addresses).run()
    .then(function(docs) {
      var merged = _.merge(this.to, docs);
      this.to = merged;
    }.bind(this))
    .finally(function() {
      next();
    });
});

Message.hasAndBelongsToMany(Receiver, 'to', 'id', 'id');

module.exports = Message;
