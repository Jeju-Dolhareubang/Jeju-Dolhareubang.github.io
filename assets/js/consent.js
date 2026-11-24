/* Cookie consent for Microsoft Clarity (the only tool here that sets cookies;
   GoatCounter and Vercel Analytics are cookieless). The choice is kept in
   localStorage and sent to Clarity with its consent API. */
(function () {
  var KEY = 'pd-cookie-consent';
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function tellClarity(granted) {
    if (typeof window.clarity !== 'function') return;
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: granted ? 'granted' : 'denied' });
    if (!granted) window.clarity('consent', false);
  }

  var choice = read();
  if (choice) { tellClarity(choice === 'granted'); return; }

  function show() {
    var bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', '쿠키 사용 동의');
    bar.innerHTML =
      '<p class="consent__text">방문 흐름을 살펴보기 위해 <b>Microsoft Clarity</b> 분석 쿠키를 사용해요. ' +
      '입력 내용은 수집하지 않아요. <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener">개인정보 처리방침</a></p>' +
      '<div class="consent__actions"><button type="button" class="consent__btn" data-consent="denied">거부</button>' +
      '<button type="button" class="consent__btn consent__btn--ok" data-consent="granted">허용</button></div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('is-on'); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      var v = b.getAttribute('data-consent');
      save(v);
      tellClarity(v === 'granted');
      bar.classList.remove('is-on');
      setTimeout(function () { bar.remove(); }, 400);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(show, 1200); });
  else setTimeout(show, 1200);
})();
