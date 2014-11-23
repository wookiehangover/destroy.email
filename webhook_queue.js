// webhook_queue

// documentation via: haraka -c /Users/sam/dev/workspace/destroy.email -h plugins/webhook_queue

// Put your plugin code here
// type: `haraka -h Plugins` for documentation on how to create a plugin
var logger  = require('./logger');
var Address = require('./address');
var request = require('request');
var mimelib = require('mimelib');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var Promise = require('bluebird');

var tmpDir = os.tmpdir();

exports.hook_data = function(next, connection) {
  connection.transaction.parse_body = 1;
  next();
};

exports.hook_queue = function(next, connection) {
  var hash = crypto.createHash('md5');
  var body = connection.transaction.body;
  var headers = body.header.headers_decoded;

  hash.update(JSON.stringify(headers));
  var id = hash.digest('hex');

  var fileStream = fs.createWriteStream(tmpDir + '/' + id + '.eml');
  var onClose = new Promise(function(resolve, reject) {
    fileStream.once('close', function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

  connection.transaction.message_stream.pipe(fileStream);

  var parsedBody = {
    headers: headers,
    subject: headers.subject[0],
    to: mimelib.parseAddresses(headers.to),
    from: mimelib.parseAddresses(headers.from)
  };

  if (body.children) {
    body.children.forEach(function(msg) {
      if (msg.bodytext) {
        parsedBody[msg.is_html ? 'html' : 'text'] = msg.bodytext;
      }
    });
  } else {
    parsedBody[body.is_html ? 'html' : 'text'] = body.bodytext;
  }

  //logger.logdebug(body)

  request.post({
    url: 'https://destroy.email/webhook',
    json: parsedBody
  }, function(err, resp) {
    onClose.then(function() {
      next(OK);
    }, function() {
      next(OK);
    });
  });

};

