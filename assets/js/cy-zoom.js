/* Hover magnifier: a round lens follows the pointer over a banner and shows
   the part under it enlarged (like a shop product zoom). */
(function () {
  'use strict';
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var ZOOM = 2, R = 100, SEL = '.cy-shot img';
  var lens = document.createElement('div');
  lens.className = 'cy-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.innerHTML = '<span class="cy-lens__icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.6" stroke="currentColor" stroke-width="1.7"/><path d="M10 10l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6.5 4.7v3.6M4.7 6.5h3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></span>';
  document.body.appendChild(lens);

  var cur = null, mx = 0, my = 0, tracking = false, queued = false;

  function hide() {
    if (!cur && !lens.classList.contains('is-on')) return;
    cur = null;
    lens.classList.remove('is-on');
    document.body.classList.remove('cy-zooming');
  }

  function update() {
    queued = false;
    if (!tracking) return hide();
    var el = document.elementFromPoint(mx, my);
    if (!el || !el.matches || !el.matches(SEL) || !el.naturalWidth) return hide();
    if (el !== cur) {
      cur = el;
      lens.style.backgroundImage = 'url("' + (el.currentSrc || el.src) + '")';
    }
    var r = el.getBoundingClientRect();
    var nw = el.naturalWidth, nh = el.naturalHeight;
    var fit = getComputedStyle(el).objectFit;
    var sx = r.width / nw, sy = r.height / nh;
    var s = fit === 'contain' ? Math.min(sx, sy) : fit === 'cover' ? Math.max(sx, sy) : null;
    var rw = s ? nw * s : r.width, rh = s ? nh * s : r.height;
    var x = mx - r.left - (r.width - rw) / 2;
    var y = my - r.top - (r.height - rh) / 2;
    lens.style.transform = 'translate3d(' + (mx - R) + 'px,' + (my - R) + 'px,0)';
    lens.style.backgroundSize = (rw * ZOOM) + 'px ' + (rh * ZOOM) + 'px';
    lens.style.backgroundPosition = (R - x * ZOOM) + 'px ' + (R - y * ZOOM) + 'px';
    lens.classList.add('is-on');
    document.body.classList.add('cy-zooming');
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; tracking = true; queue(); }, { passive: true });
  window.addEventListener('scroll', queue, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { tracking = false; queue(); });
  window.addEventListener('blur', function () { tracking = false; queue(); });
})();
