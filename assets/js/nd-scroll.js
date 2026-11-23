/* Neople Developers: the page is light, so the fixed logo flips to white while a dark section is under it. */
(function () {
  'use strict';
  var dark = [].slice.call(document.querySelectorAll('.nd-wip, .nd-take, .foot, .dfu-band--black, .mi-band--black, .mi-band--dark, .task-project-nav'));
  if (!dark.length) return;
  var ticking = false;
  function update() {
    var y = 40, on = dark.some(function (el) {
      var r = el.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    document.body.classList.toggle('nd-on-dark', on);
  }
  /* once past the middle, paint the page canvas dark so the bottom
     overscroll (rubber-band) under the dark footer never flashes white */
  var root = document.documentElement;
  function canvas() {
    root.classList.toggle('nd-end', window.scrollY > (root.scrollHeight - window.innerHeight) / 2);
  }
  canvas();
  window.addEventListener('scroll', canvas, { passive: true });
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* count the "04" up when the Done card scrolls into view */
  var num = document.querySelector('.nd-pcard--done .nd-pcard__big b');
  if (num && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var target = parseInt(num.textContent, 10) || 0;
    num.textContent = '00';
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - k, 3)));
        num.textContent = (v < 10 ? '0' : '') + v;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 }).observe(num);
  }
})();
