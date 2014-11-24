var _ = require('lodash');
var config = require('config');
var thinky = require('thinky')(config.rethinkdb);
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var compare = Promise.promisify(bcrypt.compare);
var r = thinky.r;

var User = thinky.createModel('User', {
  id: String,
  password: String,
  username: String,
  createdAt: {_type: Date, default: r.now()}
}, {
  pk: 'username'
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
    return compare(password, user.password)
      .then(function() {
        return _.pick(user, 'username', 'id');
      });
  });
});

User.define('inbox', function(page) {
  var email = this.username + '@destroy.email';
  var perPage = 20;
  var start = (page * perPage) - perPage;
  return r.table('Message_Receiver').eqJoin('Receiver_id', r.table('Receiver')).zip()
    .filter({ address: email })
    .eqJoin('Message_id', r.table('Message')).zip()
    .filter({ archived: false })
    .orderBy(r.desc('createdAt'))
    .skip(start)
    .limit(perPage)
    .run();
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
