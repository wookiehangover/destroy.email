var _ = require('lodash');
var config = require('config');
var thinky = require('thinky')(config.rethinkdb);

var User = thinky.createModel('User', {
  id: String
});

User.defineStatic('authenticate', function(json) {
  return this.run()
    .then(function(user) {
      _.each(json, function(val, key) {
        user[key] = val;
      });
      return user.save();
    }, function(err) {
      if (err.name === 'Document not found') {
        var user = new User(json);
        return user.save()
          .catch(function(err) {
            console.log('ruh roh, failed to save that user');
            console.log(err);
          });
      }
    });
});

module.exports = User;
