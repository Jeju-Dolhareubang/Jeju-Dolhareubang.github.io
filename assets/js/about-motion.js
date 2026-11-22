/* About — card, word, timeline and footer motion (mescubook.com/about pattern),
   rendered in the site's own dark/green tone. Vanilla, one rAF loop. */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var vw = window.innerWidth, vh = window.innerHeight;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smootherstep = function (x) { return x * x * x * (x * (x * 6 - 15) + 10); };

  var card = doc.querySelector('[data-about-card]');
  var exp = doc.querySelector('[data-exp]');
  var expLine = exp && exp.querySelector('.about-experience__line');
  var expFill = exp && exp.querySelector('.about-experience__line-fill');
  var expItems = exp ? Array.prototype.slice.call(exp.querySelectorAll('[data-exp-item]')) : [];
  var cta = doc.querySelector('[data-cta-text]');

  doc.documentElement.classList.add('about-motion');
  if (reduce) {
    if (card) card.classList.add('is-visible');
    expItems.forEach(function (i) { i.classList.add('is-visible'); });
    if (expFill) expFill.style.height = '100%';
    return;
  }

  /* ---------- words: split while keeping <strong> etc. ---------- */
  var words = [];
  function splitWords(node, delayBase) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
          var span = doc.createElement('span');
          span.className = 'w3d';
          span.textContent = part;
          frag.appendChild(span);
          words.push({ el: span, z0: -80 - Math.random() * 60, rx0: 25 + Math.random() * 20 });
        });
        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitWords(child);
      }
    });
  }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-scroll-text]'), function (p) { splitWords(p); });

  /* ---------- footer sentence: letters assemble in 3D ---------- */
  var letters = [];
  if (cta) {
    var li = 0;
    var splitLetters = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          // keep each word together so Korean lines still wrap at spaces
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var word = doc.createElement('span');
            word.className = 'l3d-word';
            Array.prototype.forEach.call(part, function (ch) {
              var s = doc.createElement('span');
              s.className = 'l3d';
              s.textContent = ch;
              word.appendChild(s);
              letters.push({ el: s, z: -300 - Math.random() * 200, ry: (Math.random() - .5) * 90, rz: (Math.random() - .5) * 30, i: li++ });
            });
            frag.appendChild(word);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          splitLetters(child);
        }
      });
    };
    splitLetters(cta);
  }

  /* ---------- profile card: tilt, drag/throw, holographic light ---------- */
  var tilt = { rx: 0, ry: 0, trx: 0, try_: 0 };
  var drag = {
    active: false, hovering: false, released: false, settled: false, settledAt: 0,
    x: 0, y: 0, vx: 0, vy: 0, startMX: 0, startMY: 0, startX: 0, startY: 0, prevMX: 0, prevMY: 0,
    spin: 0, spinV: 0, lift: 1, springK: .04, damping: .88, frozenRX: 0, frozenRY: 0, frozenSpin: 0
  };
  var shownAt = 0;
  var lightCanvas, lightCtx, LW = 200, LH = 150, lastLightKey = '';

  if (card) {
    lightCanvas = doc.createElement('canvas');
    lightCanvas.className = 'about-card-light';
    lightCanvas.width = LW;
    lightCanvas.height = LH;
    lightCanvas.setAttribute('aria-hidden', 'true');
    card.insertBefore(lightCanvas, card.firstChild);
    lightCtx = lightCanvas.getContext('2d');

    if (!isTouch) {
      card.addEventListener('mouseenter', function () { drag.hovering = true; card.classList.add('is-lit'); });
      card.addEventListener('mousemove', function (e) {
        if (drag.active) return;
        var r = card.getBoundingClientRect();
        tilt.try_ = ((e.clientX - r.left) / r.width - .5) * 4;
        tilt.trx = (.5 - (e.clientY - r.top) / r.height) * 2.5;
      });
      card.addEventListener('mouseleave', function () {
        drag.hovering = false;
        if (!drag.active) { tilt.trx = 0; tilt.try_ = 0; card.classList.remove('is-lit'); }
      });
      card.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        drag.active = true; drag.released = false; drag.settled = false;
        drag.startMX = drag.prevMX = e.clientX;
        drag.startMY = drag.prevMY = e.clientY;
        drag.startX = drag.x; drag.startY = drag.y;
        drag.vx = drag.vy = drag.spinV = 0;
        card.setPointerCapture(e.pointerId);
        card.classList.add('is-grabbing', 'is-lit');
      });
      card.addEventListener('pointermove', function (e) {
        if (!drag.active) return;
        drag.x = drag.startX + e.clientX - drag.startMX;
        drag.y = drag.startY + e.clientY - drag.startMY;
        drag.vx = e.clientX - drag.prevMX;
        drag.vy = e.clientY - drag.prevMY;
        drag.prevMX = e.clientX; drag.prevMY = e.clientY;
        tilt.try_ = clamp(drag.vx * 2, -30, 30);
        tilt.trx = clamp(-drag.vy * 1.5, -20, 20);
      });
      var release = function () {
        if (!drag.active) return;
        drag.active = false; drag.released = true;
        card.classList.remove('is-grabbing');
        if (!drag.hovering) card.classList.remove('is-lit');
        var speed = Math.sqrt(drag.vx * drag.vx + drag.vy * drag.vy);
        drag.spinV = (drag.vx > 0 ? 1 : -1) * Math.min(speed * 1.2, 25);
      };
      card.addEventListener('pointerup', release);
      card.addEventListener('pointercancel', release);
    }
  }

  // Holographic band + specular sweep, tinted toward the site's green.
  function renderLight(ry, rx) {
    var key = Math.round(ry * 10) + ',' + Math.round(rx * 10);
    if (key === lastLightKey) return;
    lastLightKey = key;
    var img = lightCtx.createImageData(LW, LH), d = img.data;
    var ang = (145 + ry * 3) * Math.PI / 180, cosA = Math.cos(ang), sinA = Math.sin(ang);
    var off = ry * .06 + rx * .04, spec = .5 + ry * .04 - rx * .03;
    for (var y = 0; y < LH; y++) {
      for (var x = 0; x < LW; x++) {
        var proj = (x / LW) * cosA + (y / LH) * sinA + off;
        var band = Math.sin(proj * Math.PI * 5) * .5 + .5;
        var hue = ((proj * 140 + ry * 6) % 140 + 140) % 140 + 60; // 60–200°: yellow-green → cyan
        var h6 = hue / 60, sec = Math.floor(h6) % 6, f = h6 - Math.floor(h6);
        var r = 0, g = 0, b = 0;
        if (sec === 0) { r = 1; g = f; } else if (sec === 1) { r = 1 - f; g = 1; } else if (sec === 2) { g = 1; b = f; }
        else if (sec === 3) { g = 1 - f; b = 1; } else if (sec === 4) { r = f; b = 1; } else { r = 1; b = 1 - f; }
        var irid = band * .1;
        var dist = Math.abs(proj - spec), sp = Math.exp(-dist * dist * 80) * .18;
        var rv = sp + r * irid, gv = sp + g * irid, bv = sp + b * irid;
        var n = (Math.random() - .5) * .006, i = (y * LW + x) * 4, m = Math.max(rv, gv, bv);
        d[i] = clamp(Math.round((rv + n) * 255), 0, 255);
        d[i + 1] = clamp(Math.round((gv + n) * 255), 0, 255);
        d[i + 2] = clamp(Math.round((bv + n) * 255), 0, 255);
        d[i + 3] = clamp(Math.round((m + n * .5) * 1.8 * 255), 0, 255);
      }
    }
    lightCtx.putImageData(img, 0, 0);
  }

  /* ---------- experience cards: tilt + elastic horizontal drag with a wall ---------- */
  var expCards = [];
  function lineBump(state) {
    if (!expLine) return;
    var host = expLine.parentNode;
    var hostRect = host.getBoundingClientRect(), lineRect = expLine.getBoundingClientRect();
    var cr = state.el.getBoundingClientRect();
    var impactY = cr.top + cr.height / 2 - hostRect.top;
    var fillPct = parseFloat(expFill && expFill.style.height) || 0;
    var rel = (cr.top + cr.height / 2 - lineRect.top) / lineRect.height;
    var lit = rel * 100 < fillPct;
    var stroke = lit ? 'rgba(168,248,106,.7)' : 'rgba(255,255,255,.12)';
    var glow = lit ? 'rgba(168,248,106,.45)' : 'rgba(255,255,255,.14)';
    var dir = -state.wall, H = 160, maxOff = 18, W = maxOff * 2 + 6, cx = W / 2;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('class', 'about-experience__bump');
    svg.style.top = (impactY - H / 2) + 'px';
    svg.style.left = (lineRect.left + lineRect.width / 2 - hostRect.left) + 'px';
    var cover = doc.createElementNS(NS, 'rect');
    cover.setAttribute('x', cx - 2); cover.setAttribute('y', 0); cover.setAttribute('width', 4); cover.setAttribute('height', H);
    cover.setAttribute('fill', '#0a0a0a');
    var g = doc.createElementNS(NS, 'path');
    g.setAttribute('stroke', glow); g.setAttribute('stroke-width', '3'); g.setAttribute('fill', 'none'); g.setAttribute('filter', 'blur(3px)');
    var p = doc.createElementNS(NS, 'path');
    p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', '1'); p.setAttribute('fill', 'none');
    svg.appendChild(cover); svg.appendChild(g); svg.appendChild(p);
    host.appendChild(svg);
    var build = function (o) {
      return 'M ' + cx + ' 0 C ' + cx + ' ' + H * .2 + ', ' + (cx + o) + ' ' + H * .35 + ', ' + (cx + o) + ' ' + H * .5 +
        ' C ' + (cx + o) + ' ' + H * .65 + ', ' + cx + ' ' + H * .8 + ', ' + cx + ' ' + H;
    };
    var t0 = performance.now();
    (function anim(now) {
      var t = Math.min(1, (now - t0) / 800), decay = Math.exp(-t * 5), osc = Math.cos(t * Math.PI * 4);
      var o = maxOff * decay * osc * dir, path = build(o);
      p.setAttribute('d', path); g.setAttribute('d', path);
      g.setAttribute('stroke-opacity', (.35 * decay).toFixed(3));
      state.yearBump = 8 * decay * osc * dir;
      if (t < 1 && Math.abs(o) > .2) requestAnimationFrame(anim);
      else { svg.remove(); state.yearBump = 0; }
    })(t0);
  }

  expItems.forEach(function (item) {
    var el = item.querySelector('.about-experience__card');
    var year = item.querySelector('.about-experience__year');
    var s = { item: item, el: el, year: year, rx: 0, ry: 0, trx: 0, try_: 0, active: false, yearBump: 0,
      dragActive: false, released: false, dragX: 0, dragVX: 0, startMX: 0, startDragX: 0, prevMX: 0,
      springK: .06, damping: .82, maxStretch: 1200,
      // card on the left of the line may only move left, and vice versa
      wall: item.classList.contains('about-experience__row--left') ? -1 : 1 };
    expCards.push(s);
    if (!el || isTouch || vw <= 1024) return;
    el.classList.add('is-draggable');
    el.addEventListener('mousemove', function (e) {
      if (s.dragActive) return;
      s.active = true;
      var r = el.getBoundingClientRect();
      s.try_ = ((e.clientX - r.left) / r.width - .5) * 18;
      s.trx = (.5 - (e.clientY - r.top) / r.height) * 12;
    });
    el.addEventListener('mouseleave', function () { if (!s.dragActive) { s.trx = 0; s.try_ = 0; s.active = false; } });
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      s.dragActive = true; s.released = false;
      s.startMX = s.prevMX = e.clientX; s.startDragX = s.dragX; s.dragVX = 0;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-grabbing');
    });
    el.addEventListener('pointermove', function (e) {
      if (!s.dragActive) return;
      var raw = e.clientX - s.startMX + s.startDragX;
      raw = s.wall === 1 ? Math.max(0, raw) : Math.min(0, raw);
      var sign = raw >= 0 ? 1 : -1;
      s.dragX = sign * s.maxStretch * Math.tanh(Math.abs(raw) / s.maxStretch);
      s.dragVX = (e.clientX - s.prevMX) * .8;
      s.prevMX = e.clientX;
      s.try_ = clamp(s.dragVX * .08, -1, 1);
      s.trx = 0;
    });
    var up = function () {
      if (!s.dragActive) return;
      s.dragActive = false; s.released = true;
      el.classList.remove('is-grabbing');
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });

  /* ---------- loop ---------- */
  var smoothY = window.scrollY, prevY = smoothY, velocity = 0, t0 = performance.now();

  function tick(now) {
    var elapsed = now - t0;
    prevY = smoothY;
    smoothY += (window.scrollY - smoothY) * .1;
    velocity += ((smoothY - prevY) - velocity) * .12;

    // words
    for (var wi = 0; wi < words.length; wi++) {
      var w = words[wi], rt = w.el.getBoundingClientRect().top;
      var tw = clamp(1 - (rt - vh * .7) / (vh * .2), 0, 1), ew = 1 - Math.pow(1 - tw, 3);
      w.el.style.opacity = (.08 + ew * .92).toFixed(2);
      w.el.style.transform = 'perspective(600px) translateZ(' + (w.z0 * (1 - ew)).toFixed(0) + 'px) rotateX(' + (w.rx0 * (1 - ew)).toFixed(1) + 'deg)';
    }

    // profile card
    if (card) {
      var cr = card.getBoundingClientRect();
      if (cr.top < vh * .85 && !card.classList.contains('is-visible')) { card.classList.add('is-visible'); shownAt = now; }

      if (!isTouch && !drag.hovering && !drag.active && !drag.released && Math.abs(drag.x) < 1 && Math.abs(drag.y) < 1) {
        var ts = elapsed * .001; // idle float
        tilt.try_ = Math.sin(ts * .7) * .6 + Math.sin(ts * 1.3) * .3;
        tilt.trx = Math.cos(ts * .5) * .3 + Math.cos(ts * 1.1) * .2;
      }

      if (drag.released) {
        drag.x += drag.vx; drag.y += drag.vy;
        drag.vx = (drag.vx - drag.springK * drag.x) * drag.damping;
        drag.vy = (drag.vy - drag.springK * drag.y) * drag.damping;
        tilt.try_ = clamp(drag.vx * 3, -30, 30);
        tilt.trx = clamp(-drag.vy * 2, -20, 20);
        drag.spin += drag.spinV;
        drag.spinV *= .94;
        if (Math.abs(drag.vx) + Math.abs(drag.vy) < .3 && Math.abs(drag.x) + Math.abs(drag.y) < 1) {
          drag.x = drag.y = drag.vx = drag.vy = 0;
          if (!drag.settled) {
            drag.settled = true; drag.settledAt = now;
            drag.frozenRX = tilt.rx; drag.frozenRY = tilt.ry;
            var vis = ((drag.spin * .15) % 360 + 360) % 360;
            drag.frozenSpin = (vis > 180 ? vis - 360 : vis) / .15;
            drag.spin = drag.frozenSpin;
          }
          var since = now - drag.settledAt;
          if (since > 3000) { // lift → straighten → set down
            var k = since - 3000;
            if (k < 500) {
              drag.lift = 1 + smootherstep(k / 500) * .06;
              tilt.trx = drag.frozenRX; tilt.try_ = drag.frozenRY;
            } else if (k < 1900) {
              drag.lift = 1.06;
              var q = smootherstep((k - 500) / 1400);
              tilt.rx = tilt.trx = drag.frozenRX * (1 - q);
              tilt.ry = tilt.try_ = drag.frozenRY * (1 - q);
              drag.spin = drag.frozenSpin * (1 - q);
            } else if (k < 2400) {
              drag.lift = 1 + (1 - smootherstep((k - 1900) / 500)) * .06;
              tilt.rx = tilt.ry = tilt.trx = tilt.try_ = 0; drag.spin = 0;
            } else {
              drag.released = drag.settled = false; drag.spin = drag.spinV = 0; drag.lift = 1;
              tilt.rx = tilt.ry = tilt.trx = tilt.try_ = 0;
            }
          } else {
            tilt.trx = drag.frozenRX; tilt.try_ = drag.frozenRY; drag.lift = 1;
          }
        }
      }

      tilt.rx += (tilt.trx - tilt.rx) * .06;
      tilt.ry += (tilt.try_ - tilt.ry) * .06;

      if (card.classList.contains('is-visible')) {
        // entrance: scale .92 + rotateX 8° settle over 1.2s
        var en = smootherstep(clamp((now - shownAt) / 1200, 0, 1));
        var sc = 1;
        if (drag.active) sc = 1.03;
        else if (drag.lift !== 1) sc = drag.lift;
        else if (drag.released) sc = 1 + Math.min(.04, (Math.abs(drag.vx) + Math.abs(drag.vy)) * .003);
        sc *= .92 + .08 * en;
        var rxAll = isTouch ? 0 : tilt.rx;
        var ryAll = isTouch ? 0 : tilt.ry;
        card.style.transform = 'translate(' + drag.x.toFixed(1) + 'px,' + drag.y.toFixed(1) + 'px) rotateX(' + rxAll.toFixed(2) +
          'deg) rotateY(' + ryAll.toFixed(2) + 'deg) rotateZ(' + (drag.spin * .15).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        if (!isTouch) {
          renderLight(tilt.ry, tilt.rx);
          var shX = (-tilt.ry * 2 - drag.x * .1).toFixed(1), shY = (22 + tilt.rx * 1.5 - drag.y * .1).toFixed(1);
          var shB = (55 + (Math.abs(tilt.rx) + Math.abs(tilt.ry)) * 2).toFixed(0);
          card.style.boxShadow = shX + 'px ' + shY + 'px ' + shB + 'px rgba(0,0,0,.5),0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.05)';
        }
      }
    }

    // timeline
    if (exp) {
      var sr = exp.getBoundingClientRect();
      if (expFill && expLine) {
        var lr = expLine.getBoundingClientRect();
        var start = lr.top - vh * .5, total = lr.height;
        expFill.style.height = clamp((-start / total) * 100, 0, 100).toFixed(2) + '%';
      }
      expCards.forEach(function (s) {
        var r = s.item.getBoundingClientRect();
        if (r.top < vh * .82 && !s.item.classList.contains('is-visible')) s.item.classList.add('is-visible');
        if (s.year && s.item.classList.contains('is-visible')) {
          var prox = Math.max(0, 1 - Math.abs(r.top + r.height / 2 - vh * .5) / vh * 1.8);
          s.year.style.opacity = (.25 + prox * .75).toFixed(2);
          s.year.style.transform = 'scale(' + (1 + prox * .08).toFixed(3) + ') translateY(' + (velocity * .3).toFixed(1) +
            'px) translateX(' + (s.yearBump || 0).toFixed(1) + 'px)';
        }
        if (!s.el) return;
        if (s.released) {
          s.dragVX = (s.dragVX - s.springK * s.dragX) * s.damping;
          s.dragX += s.dragVX;
          if (s.wall === 1 && s.dragX < 0) {
            s.dragX = 0; s.dragVX = Math.abs(s.dragVX) * .3;
            if (Math.abs(s.dragVX) > .5) lineBump(s);
          }
          if (s.wall === -1 && s.dragX > 0) {
            s.dragX = 0; s.dragVX = -Math.abs(s.dragVX) * .3;
            if (Math.abs(s.dragVX) > .5) lineBump(s);
          }
          s.try_ = clamp(s.dragVX * .08, -1, 1);
          if (Math.abs(s.dragX) < .3 && Math.abs(s.dragVX) < .08) { s.dragX = s.dragVX = 0; s.released = false; s.try_ = 0; }
        }
        s.rx += (s.trx - s.rx) * .07;
        s.ry += (s.try_ - s.ry) * .07;
        if (Math.abs(s.rx) > .15 || Math.abs(s.ry) > .15 || s.active || Math.abs(s.dragX) > .3) {
          s.el.style.transform = 'perspective(600px) translateX(' + s.dragX.toFixed(1) + 'px) rotateX(' + s.rx.toFixed(1) +
            'deg) rotateY(' + s.ry.toFixed(1) + 'deg) translateZ(12px)';
        } else {
          s.el.style.transform = '';
        }
      });
    }

    // footer letters
    if (letters.length) {
      var ct = cta.getBoundingClientRect().top;
      var cp = 1 - clamp((ct - vh * .75) / (vh * .25), 0, 1);
      for (var i = 0; i < letters.length; i++) {
        // stagger across the whole sentence, and still finish when the block is in place
        var L = letters[i], tl = clamp(cp * 1.6 - (L.i / letters.length) * .6, 0, 1), el4 = 1 - Math.pow(1 - tl, 4);
        L.el.style.opacity = el4.toFixed(2);
        L.el.style.transform = 'translateZ(' + (L.z * (1 - el4)).toFixed(0) + 'px) rotateY(' + (L.ry * (1 - el4)).toFixed(1) +
          'deg) rotateZ(' + (L.rz * (1 - el4)).toFixed(1) + 'deg)';
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () { vw = window.innerWidth; vh = window.innerHeight; });
  requestAnimationFrame(tick);
})();
