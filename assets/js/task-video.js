/* Play the dashboard recording only while it is on screen. */
(function () {
  'use strict';
  var v = document.querySelector('.task-feature__video');
  if (!v || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!('IntersectionObserver' in window)) { v.preload = 'auto'; v.play(); return; }
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.25 }).observe(v);
})();
