var Invite = require('../models/invite');
var isEmail = require('validator').isEmail;
var User = require('../models/user');

function encode(id) {
  var token = new Buffer(id);
  return token.toString('base64');
}

function decode(token) {
  var id = new Buffer(token, 'base64');
  return id.toString('utf8');
}

exports.create = function(email, cb) {
  if (isEmail(email) === false) {
    return cb(new Error('Invalid email address'));
  }

  var invite = new Invite({ email: email });
  invite.save().nodeify(function(err, invite) {
    if (err) {
      return cb(err);
    }

    var token = encode(invite.id);
    cb(null, token);
  });
};

exports.redeem = function(token, username, cb) {
  var id = decode(token);
  Invite.get(id).nodeify(function(err, invite) {
    if (err) {
      return cb(err);
    }

    // check if there's a user with that email, token is only good for new accounts
    User.get(id).nodeify(function(err, user) {
      if (user) {
        return cb(new Error('Username already exists'));
      }

      var account = new User({
        username: username
      });
      account.save(function(err) {
        if (err) {
          return cb(err);
        }

        invite.delete();
      });
    });

    cb(null, invite);
  });
};
