var cheerio = require('cheerio');

module.exports = function(message) {
  var $ = cheerio.load(message.html);
  var links = [];
  var unsubscribe = [];

  $('a').each(function() {
    var href = $(this).attr('href');
    var text = $(this).text();
    if (/http/.test(href)) {
      if (/unsubscribe/.test(text)) {
        unsubscribe.push(href);
      } else {
        links.push(href);
      }
    }
  });

  if (links.length > 0) {
    message.links = _.unique(links);
  }

  if (unsubscribe.length > 0) {
    message.unsubscribe = _.unique(unsubscribe);
  }

  return message;
};
