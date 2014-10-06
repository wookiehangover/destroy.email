var Invite = require('../models/invite');
var isEmail = require('validator').isEmail;

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

exports.redeem = function(id, cb) {
  id = decode(id);
  Invite.get(id).nodeify(function(err, invite) {
    if (err) {
      return cb(err);
    }

    // check if there's a user with that email, token is only good for new accounts

    cb(null, invite);
  });
};
