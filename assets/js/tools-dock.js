/* Tools section (midu.design services pattern):
   - headings with [data-rise] lift in with a slight tilt when they scroll in;
   - the icon row magnifies like a dock around the pointer, and the hovered
     icon shows its name tag. */
(function () {
  var section = document.querySelector('.home .tools');
  if (!section) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* heading rise */
  var heads = section.querySelectorAll('[data-rise]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    heads.forEach(function (h) { io.observe(h); });
  } else {
    heads.forEach(function (h) { h.classList.add('is-in'); });
  }

  /* dock magnification (fine pointers only) */
  var row = section.querySelector('.tools__icons');
  if (!row || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var icons = Array.prototype.slice.call(row.querySelectorAll('.ticon'));
  var MAX = 0.32, RANGE = 150, raf = 0, px = null;

  function render() {
    raf = 0;
    icons.forEach(function (el) {
      var s = 1;
      if (px !== null) {
        var r = el.getBoundingClientRect();
        var d = Math.abs(px - (r.left + r.width / 2));
        s = 1 + MAX * Math.max(0, 1 - d / RANGE);
      }
      el.style.setProperty('--dock', s.toFixed(3));
    });
  }
  row.addEventListener('pointermove', function (e) {
    px = e.clientX;
    if (!raf) raf = requestAnimationFrame(render);
  });
  row.addEventListener('pointerleave', function () {
    px = null;
    if (!raf) raf = requestAnimationFrame(render);
  });
  row.classList.add('has-dock');
})();
