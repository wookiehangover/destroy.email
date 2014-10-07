var _ = require('lodash');
var config = require('config');
var thinky = require('thinky')(config.rethinkdb);
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var compare = Promise.promisify(bcrypt.compare);

var User = thinky.createModel('User', {
  id: String,
  password: String
});

User.pre('save', true, function(next) {
  var self = this;
  if (this.password.length > 0) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(self.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }

        self.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

User.defineStatic('authenticate', function(username, password) {
  return User.filter({ username: username }).run().then(function(result){
    var user = result[0];
    return compare(password, user.password);
  });
});

User.defineStatic('createOrUpdate', function(json) {
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