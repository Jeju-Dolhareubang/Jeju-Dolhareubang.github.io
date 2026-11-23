/* About profile card: holographic foil that follows the pointer on hover. */
(function () {
  var card = document.querySelector('.about-profile-card');
  if (!card || window.matchMedia('(hover: none)').matches) return;
  var holo = document.createElement('span');
  holo.className = 'about-holo';
  holo.setAttribute('aria-hidden', 'true');
  card.appendChild(holo);
  var raf = 0, px = 50, py = 50;
  function paint() {
    raf = 0;
    card.style.setProperty('--hx', px.toFixed(1) + '%');
    card.style.setProperty('--hy', py.toFixed(1) + '%');
  }
  card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width * 100;
    py = (e.clientY - r.top) / r.height * 100;
    if (!raf) raf = requestAnimationFrame(paint);
  });
  card.addEventListener('pointerleave', function () { px = 50; py = 50; if (!raf) raf = requestAnimationFrame(paint); });
})();
