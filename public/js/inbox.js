jQuery(function($){
  window.addEventListener('message', function(e) {
    var parts = e.data.split('|');
    var id = 'iframe.msg-' + parts[0];
    var height = parts[1];
    $(id).height(parseInt(height, 10) + 50);
  }, false);

  setTimeout(function() {
    $('.inbox article .actions').stickyfloat({
      duration: 0
    });
  }, 3e3);

  $('.inbox article iframe').each(function() {
    this.contentWindow.postMessage('height', location.origin);
  });

  $('button[data-archive]').click(function() {
    var id = $(this).data('archive');
    var elem = 'article.msg-'+ id;

    $.post('/api/messages/'+ id +'/archive').then(function() {
      $(elem).remove();
    });
    return false;
  });

  $('.timestamp').each(function() {
    var timestamp = $(this).text();
    $(this).text(moment(timestamp).fromNow());
  });

});
