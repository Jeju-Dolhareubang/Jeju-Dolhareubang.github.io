/* Cover-on-scroll: a [data-pin] section stays pinned (its bottom edge visible) while the next section slides over it. */
(function () {
  'use strict';
  var pins = [].slice.call(document.querySelectorAll('[data-pin]'));
  if (!pins.length) return;
  function set() {
    var wide = window.innerWidth > 820;
    pins.forEach(function (el) {
      // no pin on small screens; otherwise stop once the section's bottom reaches the viewport bottom
      el.style.top = wide ? Math.min(0, window.innerHeight - el.offsetHeight) + 'px' : '';
    });
  }
  set();
  window.addEventListener('resize', set);
  window.addEventListener('load', set);
})();
