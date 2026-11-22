/* PARK DANBI — interactions (vanilla, works from file://) */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function lock(on) { if (lenis) { on ? lenis.stop() : lenis.start(); } doc.documentElement.style.overflow = on ? 'hidden' : ''; }

  /* ---------- page transition ---------- */
  var pt = $('.pt');
  function ready() { requestAnimationFrame(function () { body.classList.add('is-ready'); }); }
  if (doc.readyState === 'complete') ready(); else window.addEventListener('load', ready);
  setTimeout(ready, 1200);
  window.addEventListener('pageshow', function (e) { if (e.persisted && pt) { pt.classList.remove('is-leaving', 'go'); body.classList.add('is-ready'); body.classList.remove('is-closing'); $$('.px-dim,.px-sheet').forEach(function (n) { n.remove(); }); } });

  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || /^(mailto:|tel:|https?:)/.test(href)) return;
    if (href.charAt(0) === '#') {
      var t = doc.getElementById(href.slice(1));
      if (t) { e.preventDefault(); closeMenu(); scrollToEl(t); }
      return;
    }
    // same page + hash
    var path = href.split('#')[0];
    var here = location.pathname.split('/').pop() || 'index.html';
    if (path && path === here && href.indexOf('#') > -1) {
      var tt = doc.getElementById(href.split('#')[1]);
      if (tt) { e.preventDefault(); closeMenu(); scrollToEl(tt); return; }
    }
    // case-study close (plus-ex.com pattern): the page slides down over a grey dim, then the list shows through
    if (a.classList.contains('task-case__close') && !reduce) {
      e.preventDefault();
      try { sessionStorage.setItem('pd-skip-intro', 'close'); } catch (err) {}
      body.classList.add('is-closing');
      setTimeout(function () { location.href = href; }, 800);
      return;
    }
    // opening a case study: grey dim fades in, then a sheet slides up from the bottom
    if (/(^|\/)work\/[^/]+\.html(#.*)?$/.test(href) && !reduce) {
      e.preventDefault();
      closeMenu();
      try { sessionStorage.setItem('pd-skip-intro', 'open'); } catch (err) {}
      var dim = doc.createElement('div'), sheet = doc.createElement('div');
      dim.className = 'px-dim'; sheet.className = 'px-sheet';
      body.appendChild(dim); body.appendChild(sheet);
      void sheet.offsetWidth;
      dim.classList.add('on'); sheet.classList.add('on');
      setTimeout(function () { location.href = href; }, 1200);
      return;
    }
    if (!/\.html(#.*)?$/.test(href) || !pt || reduce) return;
    e.preventDefault();
    closeMenu();
    pt.classList.add('is-leaving');
    void pt.offsetWidth;
    pt.classList.add('go');
    setTimeout(function () { location.href = href; }, 620);
  });
  // arriving from a case-study close button: no curtain, land on the hash at once
  var skipIntro = false;
  try { skipIntro = sessionStorage.getItem('pd-skip-intro'); sessionStorage.removeItem('pd-skip-intro'); } catch (err) {}
  if (skipIntro && pt) pt.style.display = 'none';
  if (skipIntro === 'close') { // back on the list: the grey dim lifts off
    var lift = doc.createElement('div');
    lift.className = 'px-dim on';
    body.appendChild(lift);
    requestAnimationFrame(function () { requestAnimationFrame(function () { lift.classList.remove('on'); }); });
    setTimeout(function () { lift.remove(); }, 700);
  }
  // land on hash after transition
  if (location.hash) {
    var target = doc.getElementById(location.hash.slice(1));
    if (target && skipIntro) window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 80);
    else if (target) setTimeout(function () { scrollToEl(target); }, 700);
  }

  /* ---------- GNB: menu ---------- */
  var menu = $('.menu'), dim = $('.menu-dim'), bar = menu && $('.menu__bar', menu);
  var menuFoot = menu && $('.menu__foot', menu);
  if (menuFoot && !$('.menu__cta', menuFoot)) {
    var menuCta = doc.createElement('a');
    menuCta.className = 'menu__cta';
    menuCta.href = 'mailto:danbi960214@gmail.com';
    menuCta.innerHTML = '<i aria-hidden="true">✦</i>Get in touch';
    menuFoot.appendChild(menuCta);
  }
  function openMenu() {
    if (!menu) return;
    gnb && gnb.classList.remove('is-hidden');
    menu.classList.add('is-open');
    bar.setAttribute('aria-expanded', 'true');
    bar.setAttribute('aria-label', 'Close menu');
    dim && dim.classList.add('is-on');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    bar && bar.setAttribute('aria-expanded', 'false');
    bar && bar.setAttribute('aria-label', 'Open menu');
    dim && dim.classList.remove('is-on');
  }
  if (bar) bar.setAttribute('aria-label', 'Open menu');
  if (bar) bar.addEventListener('click', function () { menu.classList.contains('is-open') ? closeMenu() : openMenu(); });
  if (dim) dim.addEventListener('click', closeMenu);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu(); });

  // The header stays fixed while scrolling; it is never hidden.
  var gnb = $('.gnb');
  function onScrollHeader() {
    if (gnb) gnb.classList.remove('is-hidden');
  }

  /* ---------- clock (Seoul) ---------- */
  var clocks = $$('[data-clock]');
  function tick() {
    var s;
    try { s = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' }); }
    catch (err) { s = new Date().toLocaleTimeString(); }
    clocks.forEach(function (c) { c.textContent = s; });
  }
  if (clocks.length) { tick(); setInterval(tick, 15000); }

  /* ---------- split text (mask slide-up) ---------- */
  $$('[data-split]').forEach(function (el) {
    var html = el.innerHTML.split(/<br\s*\/?>/i);
    var i = 0;
    el.innerHTML = html.map(function (line) {
      var tmp = doc.createElement('div'); tmp.innerHTML = line;
      var words = tmp.textContent.trim().split(/\s+/);
      return words.map(function (w) { return '<span class="w"><span style="transition-delay:' + (0.06 * i++ + (parseFloat(el.dataset.delay) || 0)) + 's">' + w + '</span></span>'; }).join(' ');
    }).join('<br>');
    el.classList.add('split');
  });

  /* ---------- scroll-highlight words ---------- */
  var wordBlocks = $$('[data-words]');
  wordBlocks.forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(doc.createTextNode(p));
            else { var s = doc.createElement('span'); s.className = 'wd'; s.textContent = p; frag.appendChild(s); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.classList.add('words');
    el._wd = $$('.wd', el);
  });
  function updateWords() {
    var vh = window.innerHeight;
    wordBlocks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      var n = Math.round(p * el._wd.length);
      el._wd.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
  }

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-reveal],[data-split],.tools__icons').forEach(function (el) { io.observe(el); });
  } else {
    $$('[data-reveal],[data-split],.tools__icons').forEach(function (el) { el.classList.add('in'); });
  }
  // hero title shows on load
  $$('.hero [data-split], .chero [data-split]').forEach(function (el) { setTimeout(function () { el.classList.add('in'); }, 450); });

  /* ---------- parallax / scale ---------- */
  var para = $$('[data-speed]'), scalers = $$('[data-scale]'), coverPanels = $$('[data-cover]'), stack = $$('.scard');
  var footBox = $('.foot > .wrap');
  function updateFX() {
    var vh = window.innerHeight;
    para.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (c * parseFloat(el.dataset.speed)).toFixed(1) + 'px,0)';
    });
    scalers.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9)));
      var s = 0.88 + 0.12 * p;
      el.style.transform = 'scale(' + s.toFixed(4) + ')';
      el.style.borderRadius = (48 - 22 * p).toFixed(1) + 'px';
    });
    coverPanels.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9)));
      var lift = window.innerWidth <= 820 ? 120 : 260;
      var radius = 48 - 24 * p;
      el.style.transform = 'translate3d(0,' + (lift * (1 - p)).toFixed(1) + 'px,0)';
      el.style.borderRadius = radius.toFixed(1) + 'px';
    });
    // footer box (fixaplan.com pattern): starts lifted and slightly smaller,
    // settles into place as the page reaches its end
    if (footBox) {
      // measure the (untransformed) footer section, not the moving box
      var fr = footBox.parentNode.getBoundingClientRect();
      var fp = Math.max(0, Math.min(1, 1 - (fr.bottom - vh) / Math.max(1, footBox.offsetHeight)));
      footBox.style.transform = fp > 0.995 ? '' : 'translate3d(0,' + (-210 * (1 - fp)).toFixed(1) + 'px,0) scale(' + (0.95 + 0.05 * fp).toFixed(4) + ')';
    }
    stack.forEach(function (el, i) {
      var next = stack[i + 1];
      if (!next) { el.style.transform = ''; el.style.filter = ''; return; }
      var r = el.getBoundingClientRect(), rn = next.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, 1 - (rn.top - r.top) / r.height));
      el.style.transform = 'scale(' + (1 - p * 0.06).toFixed(4) + ')';
      el.style.filter = 'brightness(' + (1 - p * 0.45).toFixed(3) + ')';
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      onScrollHeader(y); updateWords(); if (!reduce) updateFX(); updateChapters(); updateRail();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- work rail ---------- */
  var track = $('.rail__track'), barFill = $('.rail__bar span'), railPages = $$('[data-rail-page]');
  function railCards() { return track ? $$('.wcard', track) : []; }
  function goToRailPage(index) {
    var card = railCards()[index];
    if (!card || !track) return;
    var trackLeft = track.getBoundingClientRect().left;
    var left = card.getBoundingClientRect().left - trackLeft + track.scrollLeft;
    track.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }
  function updateRail() {
    if (!track) return;
    var max = track.scrollWidth - track.clientWidth;
    var vis = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
    if (barFill) {
      barFill.style.width = (vis * 100) + '%';
      barFill.style.transform = 'translateX(' + ((max ? track.scrollLeft / max : 0) * (1 / vis - 1) * 100) + '%)';
    }
    if (railPages.length) {
      var cards = railCards(), trackLeft = track.getBoundingClientRect().left, active = 0, nearest = Infinity;
      cards.forEach(function (card, index) {
        var distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (distance < nearest) { nearest = distance; active = index; }
      });
      railPages.forEach(function (page, index) { page.setAttribute('aria-pressed', index === active ? 'true' : 'false'); });
    }
  }
  if (track) {
    track.addEventListener('scroll', updateRail, { passive: true });
    $$('[data-rail]').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = track.querySelector('.wcard'); var step = card ? card.offsetWidth + 20 : 400;
        track.scrollBy({ left: b.dataset.rail === 'next' ? step : -step, behavior: 'smooth' });
      });
    });
    railPages.forEach(function (page) {
      page.addEventListener('click', function () { goToRailPage(Number(page.dataset.railPage)); });
    });
    // drag to scroll
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { track.classList.remove('is-drag'); }, 0); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    // vertical wheel → horizontal when hovering rail (shift-free)
    updateRail();
  }

  /* ---------- cursor bubble ---------- */
  var cur = $('.cursor');
  if (cur && window.matchMedia('(hover:hover)').matches) {
    var cx = -100, cy = -100, tx = -100, ty = -100, scale = 0, tscale = 0;
    window.addEventListener('mousemove', function (e) { tx = e.clientX + 14; ty = e.clientY + 14; });
    $$('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cur.textContent = el.dataset.cursor; tscale = 1; cur.classList.add('is-on');
        cur.classList.toggle('is-soon', el.hasAttribute('data-soon'));
      });
      el.addEventListener('mouseleave', function () { tscale = 0; cur.classList.remove('is-on'); });
    });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; scale += (tscale - scale) * 0.2;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
      requestAnimationFrame(loop);
    })();
  }
  // touch: coming soon toast
  var toast = $('.toast'), tt;
  $$('[data-soon]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (!toast) return;
      toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
    });
  });

  /* ---------- modal ---------- */
  var modal = $('.modal');
  if (modal) {
    var tabs = $$('.modal__tabs button', modal), panes = $$('.mpane', modal), lastFocus;
    var show = function (id) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.tab === id)); });
      panes.forEach(function (p) { p.classList.toggle('is-on', p.dataset.pane === id); });
      var on = tabs.filter(function (t) { return t.dataset.tab === id; })[0];
      if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    var order = tabs.map(function (t) { return t.dataset.tab; });
    var cur2 = order[0];
    var open = function (id) { lastFocus = doc.activeElement; cur2 = id; show(id); modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); lock(true); setTimeout(function () { $('.modal__close', modal).focus(); }, 50); };
    var close = function () { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); lock(false); if (lastFocus) lastFocus.focus(); };
    $$('[data-modal]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(b.dataset.modal); }); });
    tabs.forEach(function (t) { t.addEventListener('click', function () { cur2 = t.dataset.tab; show(cur2); }); });
    $$('[data-step]', modal).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = order.indexOf(cur2) + (b.dataset.step === 'next' ? 1 : -1);
        cur2 = order[(i + order.length) % order.length]; show(cur2);
      });
    });
    $('.modal__close', modal).addEventListener('click', close);
    $('.modal__dim', modal).addEventListener('click', close);
    doc.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var i = order.indexOf(cur2) + (e.key === 'ArrowRight' ? 1 : -1); cur2 = order[(i + order.length) % order.length]; show(cur2); }
    });
  }
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- case chapters ---------- */
  var chapLinks = $$('.chap a');
  var chapSecs = chapLinks.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
  function updateChapters() {
    if (!chapLinks.length) return;
    var mid = window.innerHeight * 0.35, idx = 0;
    chapSecs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < mid) idx = i; });
    chapLinks.forEach(function (a, i) { a.classList.toggle('is-on', i === idx); });
    var on = chapLinks[idx], chap = on && on.parentNode;
    if (chap && chap.scrollWidth > chap.clientWidth) chap.scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
  }

  /* ---------- missing image → placeholder ---------- */
  $$('img[data-fallback]').forEach(function (img) {
    var mark = function () { var p = img.closest('.scard__img, .mpane__media'); if (p) p.classList.add('is-empty'); };
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark);
  });

  /* about-page card motion lives in about-motion.js */

  /* ---------- work showcase: scroll/hover picks the project on the display ---------- */
  var showcase = $('[data-showcase]');
  if (showcase) {
    var scItems = $$('[data-showcase-item]', showcase);
    var scShots = $$('.desk__screen img', showcase);
    var scPill = $('.showcase__pill', showcase);
    var scIntro = $('.showcase__intro', showcase);
    var scStage = $('.showcase__stage', showcase);
    var scMore = $('.showcase__more', showcase);
    var scBio = $('.showcase__bio', showcase);
    var scHover = null, scCurrent = -1;
    var narrow = window.matchMedia('(max-width:1023px)');

    var setActive = function (i) {
      if (i === scCurrent) return;
      scCurrent = i;
      scItems.forEach(function (n, k) { n.classList.toggle('is-active', k === i); });
      scShots.forEach(function (n, k) { n.classList.toggle('is-active', k === i); });
      if (scPill) scPill.style.transform = 'translateY(' + (scItems[i].offsetTop + 4) + 'px)';
    };
    var scInner = $('.showcase__inner', showcase);
    // desktop: the list is pinned, so scroll progress through the section picks the item;
    // mobile: the item crossing the line just under the sticky display
    var fromScroll = function () {
      if (!narrow.matches && scInner) {
        var r = scInner.getBoundingClientRect();
        var range = Math.max(1, r.height - window.innerHeight);
        var p = Math.max(0, Math.min(0.9999, -r.top / range));
        return Math.floor(p * scItems.length);
      }
      var edge = scStage.getBoundingClientRect().bottom;
      var line = edge + 26, pick = 0;
      scItems.forEach(function (n, k) { if (n.getBoundingClientRect().top <= line) pick = k; });
      return pick;
    };
    // Keep the intro and display pinned exactly until the last item reaches the line.
    var scList = $('.showcase__list', showcase);
    var fitList = function () {
      if (!scList || !scItems.length) return;
      var h = scItems[0].offsetHeight;
      var pb;
      if (!narrow.matches) { scList.style.paddingBottom = '0px'; return; } // pinned list on desktop
      pb = window.innerHeight - scStage.offsetHeight - h - 26;
      scList.style.paddingBottom = Math.max(h, pb) + 'px';
    };
    var scTick = false;
    var update = function () {
      scTick = false;
      setActive(scHover !== null ? scHover : fromScroll());
      // the whole side column is pinned now, so the intro never needs its own offset
      if (scIntro.style.transform) scIntro.style.transform = '';
    };
    var queue = function () { if (!scTick) { scTick = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { scCurrent = -1; fitList(); queue(); });
    scItems.forEach(function (item, k) {
      item.addEventListener('pointerenter', function () { scHover = k; queue(); });
      item.addEventListener('focus', function () { scHover = k; queue(); });
      item.addEventListener('blur', function () { scHover = null; queue(); });
    });
    if (scList) scList.addEventListener('pointerleave', function () { scHover = null; queue(); });
    if (scMore && scBio) scMore.addEventListener('click', function () {
      var open = scMore.getAttribute('aria-expanded') !== 'true';
      scMore.setAttribute('aria-expanded', open ? 'true' : 'false');
      scBio.classList.toggle('is-open', open);
      setTimeout(function () { scCurrent = -1; fitList(); queue(); }, 420);
    });
    fitList();
    window.addEventListener('load', fitList);
    update();
  }

  onScroll();
})();
