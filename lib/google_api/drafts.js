var _ = require('lodash');
var request = require('request');

// https://www.googleapis.com/gmail/v1/users/userId/drafts/id
exports.get = function(token, email, id, cb) {
  var params = {
    url: 'https://www.googleapis.com/gmail/v1/users/'+ email +'/drafts/'+ id,
    headers: formatAuthHeader(token)
  };

  request.get(params, function(err, resp, body) {
    if (err) {
      return cb(err);
    }

    if (resp.statusCode !== 401) {
      body = JSON.parse(body);

      console.log(body)

      _.each(body.message.payload.parts, function(part) {
        if (part.body && /text/.test(part.mimeType)) {
          var buffer = new Buffer(part.body.data, 'base64');
          body[part.mimeType.replace('text/')] = buffer.toString();
        }
      });
    }


    cb(err, resp, body);

  });
};

// https://www.googleapis.com/gmail/v1/users/[userId]/drafts
exports.list = function(token, email, cb) {
  var params = {
    url: 'https://www.googleapis.com/gmail/v1/users/'+ email +'/drafts',
    headers: formatAuthHeader(token)
  };

  request.get(params, cb);
};


// Returns a headers object with the user's oauth token
function formatAuthHeader(token){
  return {
    Authorization: 'Bearer '+ token
  };
}
