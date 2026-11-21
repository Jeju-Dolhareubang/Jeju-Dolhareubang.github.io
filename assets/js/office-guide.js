/* Office 길잡이 — retro help assistant (vanilla port of the React version) */
(function () {
  'use strict';
  var doc = document;
  var script = doc.currentScript;
  var root = (script && script.getAttribute('data-root')) || '';
  var KEY = 'office-guide-hidden';

  var topics = [
    { keywords: ['프로젝트', '작업물', '포트폴리오', '케이스', 'work', 'project'], page: 'index.html', id: 'work', message: '프로젝트를 보여드릴게요.' },
    { keywords: ['작업 방식', '일하는', '프로세스', 'how'], page: 'how-i-work.html', message: '일하는 방식을 보여드릴게요.' },
    { keywords: ['소개', '경력', '회사', '이력', 'about', '제주'], page: 'about.html', message: '소개 페이지로 이동할게요.' },
    { keywords: ['툴', '도구', '스킬', '기술', 'tool'], page: 'index.html', id: 'now', message: '사용 툴을 보여드릴게요.' },
    { keywords: ['이전', '사이드', '아카이브', 'archive'], page: 'index.html', id: 'archive', message: '이전 작업 목록으로 이동할게요.' },
    { keywords: ['연락', '연락처', '메일', '이메일', 'contact'], id: 'contact', message: '연락처로 이동할게요.' }
  ];

  function store(v) { try { v === null ? sessionStorage.removeItem(KEY) : sessionStorage.setItem(KEY, v); } catch (e) {} }
  function hiddenStored() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

  var wrap = doc.createElement('div');
  wrap.innerHTML =
    '<aside class="office-guide" aria-label="Office 길잡이">' +
      '<div class="office-guide__dialog" role="dialog" aria-label="Office 길잡이 도움말" hidden>' +
        '<button type="button" class="office-guide__close" aria-label="닫기">×</button>' +
        '<p class="office-guide__message">무엇을 도와 드릴까요?</p>' +
        '<label for="office-guide-search">궁금한 내용을 입력하세요.</label>' +
        '<div class="office-guide__row"><input id="office-guide-search" type="text" autocomplete="off" placeholder="예: 프로젝트, 툴"><button type="button" class="office-guide__btn" data-act="search">찾기(S)</button></div>' +
        '<button type="button" class="office-guide__btn office-guide__options" data-act="options">옵션(O)</button>' +
      '</div>' +
      '<button type="button" class="office-guide__mascot" aria-expanded="false" aria-label="Office 길잡이 열기 또는 닫기"><span class="office-guide__dog" role="img" aria-label="도움을 드리는 강아지 길잡이"></span></button>' +
      '<button type="button" class="office-guide__hide">길잡이 숨기기</button>' +
    '</aside>' +
    '<button type="button" class="office-guide__menu" hidden>도움말(H) <span>▾</span><small>Office 길잡이 표시</small></button>';

  var guide = wrap.firstChild, menu = wrap.lastChild;
  doc.body.appendChild(guide);
  doc.body.appendChild(menu);

  var dialog = guide.querySelector('.office-guide__dialog');
  var mascot = guide.querySelector('.office-guide__mascot');
  var msg = guide.querySelector('.office-guide__message');
  var input = guide.querySelector('input');

  function setOpen(on) {
    dialog.hidden = !on;
    mascot.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) input.focus();
  }
  function setVisible(on) {
    guide.hidden = !on;
    menu.hidden = on;
    store(on ? null : '1');
  }

  // Route through a real link so main.js handles smooth scroll / page transition.
  function go(topic) {
    var href;
    if (topic.id && doc.getElementById(topic.id)) href = '#' + topic.id;
    else href = root + (topic.page || 'index.html') + (topic.id ? '#' + topic.id : '');
    var a = doc.createElement('a');
    a.href = href;
    a.hidden = true;
    doc.body.appendChild(a);
    a.click();
    a.remove();
  }

  function search() {
    var raw = input.value.trim();
    var text = raw.toLowerCase();
    if (!text) { msg.textContent = '찾고 싶은 내용을 입력해주세요.'; return; }
    var topic = null;
    for (var i = 0; i < topics.length && !topic; i++) {
      if (topics[i].keywords.some(function (k) { return text.indexOf(k) > -1; })) topic = topics[i];
    }
    if (!topic) { msg.textContent = "'" + raw + "'에 대한 도움말을 찾지 못했습니다."; return; }
    msg.textContent = topic.message;
    setTimeout(function () { go(topic); }, 350);
  }

  mascot.addEventListener('click', function () { setOpen(dialog.hidden); });
  guide.querySelector('.office-guide__close').addEventListener('click', function () { setOpen(false); });
  guide.querySelector('[data-act="search"]').addEventListener('click', search);
  guide.querySelector('[data-act="options"]').addEventListener('click', function () {
    msg.textContent = '키워드: 프로젝트, 작업 방식, 소개, 툴, 이전 작업, 연락처';
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
    if (e.key === 'Escape') setOpen(false);
  });
  guide.querySelector('.office-guide__hide').addEventListener('click', function () { setOpen(false); setVisible(false); });
  menu.addEventListener('click', function () { setVisible(true); setOpen(true); });

  setVisible(!hiddenStored());
})();
