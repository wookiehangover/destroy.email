var _ = require('lodash');
var cheerio = require('cheerio');
var url = require('url');
var path = require('path');

var tmpl = require('fs').readFileSync(path.resolve(__dirname + '/../templates/iframeHelper.ejs'));
var iframeHelper = _.template(tmpl);

function replaceBackgrounds($) {
  var src = $(this).attr('background');
  var safe = new Buffer(src);
  var attrs = {};

  var uri = url.parse(src);
  var protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
  if (uri.protocol !== protocol) {
    attrs.background = '/inbox/proxy?uri=' + safe.toString('base64');
  }

  $(this).attr(attrs);
}

function replaceImages($) {
  var src = $(this).attr('src');
  var safe = new Buffer(src);
  var attrs = {
    onerror: 'this.parentNode.removeChild(this)',
  };

  var uri = url.parse(src);
  var protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
  if (uri.protocol !== protocol) {
    attrs.src = '/inbox/proxy?uri=' + safe.toString('base64');
  }

  $(this).attr(attrs);
}

function presentMessage(msg) {
  var $;
  try {
    $ = cheerio.load(msg.html);
  } catch (e) {
    delete msg.html;
    return msg;
  }

  $('script').remove();
  $('a').attr({ target: '_blank' });
  $('[background]').each(_.partial(replaceBackgrounds, $));
  $('img').each(_.partial(replaceImages, $));

  msg.html = $.html();
  return msg;
}

module.exports = function(inbox) {
  var parsedInbox = _.map(inbox, presentMessage);

  return {
    title: 'Inbox',
    inbox: parsedInbox,
    iframeHelper: iframeHelper
  };
};
