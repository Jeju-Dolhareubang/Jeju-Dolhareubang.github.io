(function () {
  'use strict';
  var items = [].slice.call(document.querySelectorAll('.cy-item'));
  if (!items.length) return;
  var secs = items.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;

  function update() {
    var line = window.innerHeight * 0.42, idx = 0;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) idx = i; });
    items.forEach(function (a, i) {
      a.classList.toggle('is-active', i === idx);
      if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
