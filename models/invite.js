var config = require('config');
var thinky = require('thinky')(config.rethinkdb);

var Invite = thinky.createModel('Invite', {
  id: String,
  email: String
});

module.exports = Invite;

