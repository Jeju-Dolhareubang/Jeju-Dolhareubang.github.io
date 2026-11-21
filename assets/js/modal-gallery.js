/* Project modal gallery (midu.design pattern): each pane's thumbnail strip
   swaps the large image; the arrows step through that pane's images. */
(function () {
  var panes = document.querySelectorAll('.modal .mpane');
  Array.prototype.forEach.call(panes, function (pane) {
    var main = pane.querySelector('.mpane__img');
    var media = pane.querySelector('.mpane__media');
    var thumbs = Array.prototype.slice.call(pane.querySelectorAll('.mpane__thumb'));
    if (!main || thumbs.length < 2) return;
    var cur = 0;

    function go(i) {
      cur = (i + thumbs.length) % thumbs.length;
      var t = thumbs[cur];
      thumbs.forEach(function (n, k) { n.classList.toggle('is-on', k === cur); });
      if (media) media.classList.remove('is-empty');
      main.classList.add('is-swap');
      setTimeout(function () {
        main.src = t.dataset.src;
        main.alt = t.getAttribute('aria-label') || '';
        main.classList.remove('is-swap');
      }, 160);
      if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-thumb-step]'), function (b) {
      b.addEventListener('click', function () { go(cur + parseInt(b.dataset.thumbStep, 10)); });
    });
  });
})();
