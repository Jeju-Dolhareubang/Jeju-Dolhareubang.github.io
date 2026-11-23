/* Progressive blur along the bottom edge of the viewport while the page scrolls.
   One fixed bar for every page; it fades out at the very top and once the footer is in view. */
(function () {
  'use strict';
  var bar = document.createElement('div');
  bar.className = 'scroll-blur is-off';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var foot = document.querySelector('footer');
  function update() {
    var atTop = window.scrollY < 40;
    var inFooter = foot && foot.getBoundingClientRect().top < window.innerHeight - 40;
    bar.classList.toggle('is-off', atTop || inFooter);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
