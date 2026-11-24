/* Office 길잡이 — retro help assistant (vanilla port of the React version).
   Search runs over GUIDE_TOPICS below: every page, section, project, tool and
   contact point on the site, each with Korean/English keywords. */
(function () {
  'use strict';
  var doc = document;
  var script = doc.currentScript;
  var root = (script && script.getAttribute('data-root')) || '';
  var KEY = 'office-guide-hidden';

  /* ---------------------------------------------------------------------------
     Search data. One entry per destination.
       title     shown in the result list
       keywords  matched against the query (lowercase; spaces are ignored)
       page      file to open (relative to the site root); omit = current page
       id        section id to scroll to
       modal     project modal on the home page (opens instead of scrolling)
       message   what the guide says before moving
  --------------------------------------------------------------------------- */
  var GUIDE_TOPICS = [
    /* ---- pages & home sections ---- */
    { title: '홈', page: 'index.html', message: '홈으로 이동할게요.',
      keywords: ['홈', '메인', '처음', '첫화면', 'home', 'main', 'top'] },
    { title: '소개 · About me', page: 'index.html', id: 'about', message: '소개 글을 보여드릴게요.',
      keywords: ['about me', '자기소개', '나는', '누구', '디자이너', '8년차', '경력 요약', 'designer', 'intro'] },
    { title: 'Selected work · 프로젝트', page: 'index.html', id: 'work', message: '대표 프로젝트를 보여드릴게요.',
      keywords: ['프로젝트', '작업물', '작업', '포트폴리오', '케이스', '케이스스터디', 'selected work', 'work', 'project', 'portfolio', 'case study', 'case', '화면 설계', '화면'] },
    { title: '사용 도구 · Tools', page: 'index.html', id: 'now', message: '사용하는 도구를 보여드릴게요.',
      keywords: ['툴', '도구', '스킬', '기술', '스택', '프로그램', 'tool', 'tools', 'skill', 'stack'] },
    { title: '진행 중인 프로젝트', page: 'index.html', id: 'now', message: '지금 진행 중인 프로젝트 카드를 보여드릴게요.',
      keywords: ['진행 중', '진행중', '현재', '요즘', '최근', 'in progress', 'now', 'current', 'wip'] },
    { title: '이전 작업 · 사이드 프로젝트', page: 'index.html', id: 'archive', message: '이전 작업과 사이드 프로젝트로 이동할게요.',
      keywords: ['이전', '이전 작업', '사이드', '사이드 프로젝트', '아카이브', '개인 작업', '토이', '화장실', '화장품', '워드프레스', 'archive', 'side project', 'side', 'wordpress', 'tailwind'] },
    { title: '일하는 방식 · How I work', page: 'index.html', id: 'now', message: '일하는 방식은 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['작업 방식', '일하는', '일하는 방식', '프로세스', '워크플로우', '흐름', '과정', '협업', '방법', 'how i work', 'how', 'process', 'workflow', 'collaboration', '설계', '디자인 과정', '작업 순서'] },
    { title: '소개 페이지 · About', page: 'about.html', message: '소개 페이지로 이동할게요.',
      keywords: ['소개', '소개 페이지', '프로필', 'about', 'profile', 'bio'] },
    { title: '경력 · Experience', page: 'about.html', id: 'experience-title', message: '경력 타임라인을 보여드릴게요.',
      keywords: ['경력', '이력', '회사', '이직', '커리어', '경험', '타임라인', '연차', 'experience', 'career', 'resume', 'cv', 'timeline'] },
    { title: '거주지 · Jeju, KR', page: 'about.html', id: 'about-jeju-title', message: '제주 위치를 보여드릴게요.',
      keywords: ['제주', '제주도', '위치', '사는 곳', '거주', '지역', '어디', 'jeju', 'location', 'korea', 'based'] },
    { title: '연락처 · Contact', id: 'contact', message: '연락처로 이동할게요.',
      keywords: ['연락', '연락처', '메일', '이메일', '문의', '채용', '제안', '컨택', 'contact', 'email', 'mail', 'hire', 'get in touch'] },

    /* ---- companies (About › Experience) ---- */
    { title: '네오플 (현재 회사)', page: 'about.html', id: 'experience-title', message: '네오플 경력을 보여드릴게요.',
      keywords: ['네오플', 'neople', '넥슨', 'nexon', '현재 회사', '지금 회사'] },
    { title: '온플루 (Onflou)', page: 'about.html', id: 'experience-title', message: '온플루 경력을 보여드릴게요.',
      keywords: ['온플루', 'onflou'] },
    { title: '애드업 (Addup)', page: 'about.html', id: 'experience-title', message: '애드업 경력을 보여드릴게요.',
      keywords: ['애드업', 'addup', '에이전시', '첫 회사'] },
    { title: '교육 · 강의 경력', page: 'about.html', id: 'experience-title', message: '교육 경력을 보여드릴게요.',
      keywords: ['교육', '강의', '강사', '인터렉티브', '인터랙티브', 'education', 'teaching'] },

    /* ---- case studies ---- */
    { title: 'TASK 업무 요청 시스템', page: 'work/task.html', message: '업무 요청 시스템 케이스로 이동할게요.',
      keywords: ['task', '태스크', '업무 요청', '업무요청', '요청 시스템', '사내 시스템', '사내 툴', '내부 툴', 'internal tool', '요청서', '티켓'] },
    { title: 'Neople Developers', page: 'work/neople-developers.html', message: 'Neople Developers 케이스로 이동할게요.',
      keywords: ['neople developers', 'developers', '디벨로퍼스', '개발자 포털', '개발자 센터', '오픈 api', 'open api', 'api', '포털', 'portal'] },
    { title: 'Neople Developers · API 문서 화면', page: 'work/neople-developers.html', id: 'docs', message: 'API 문서 화면 설계로 이동할게요.',
      keywords: ['api 문서', 'api docs', 'docs', '문서', '도큐먼트', 'documentation'] },
    { title: 'Neople Developers · 내 애플리케이션', page: 'work/neople-developers.html', id: 'app', message: '내 애플리케이션 화면으로 이동할게요.',
      keywords: ['애플리케이션', '내 애플리케이션', 'my application', 'api 키', 'api key', '앱 관리', '앱'] },
    { title: '던파 유니버스 CMS', page: 'work/dnf-cms.html', message: '던파 유니버스 CMS 케이스로 이동할게요.',
      keywords: ['던파', '던전앤파이터', '던전 앤 파이터', 'dnf', '유니버스', 'universe', 'cms', '콘텐츠 관리', '관리자', '어드민', 'admin', 'ip'] },
    { title: '던파 유니버스 CMS · 캐릭터 관리', page: 'work/dnf-cms.html', id: 'character', message: '캐릭터 목록 화면으로 이동할게요.',
      keywords: ['캐릭터', 'character', '직업', '클래스', 'class', '캐릭터 등록', '캐릭터 폼'] },
    { title: 'Media Insight', page: 'work/media-insight.html', message: 'Media Insight 케이스로 이동할게요.',
      keywords: ['media insight', '미디어 인사이트', '미디어', 'media', '인사이트', 'insight', '분석', '데이터', 'data', 'analytics'] },
    { title: 'Media Insight · 대시보드', page: 'work/media-insight.html', id: 'dashboard', message: '대시보드 설계로 이동할게요.',
      keywords: ['대시보드', 'dashboard', '차트', 'chart', '지표', '통계'] },
    { title: 'Media Insight · 영상 · 댓글 분석', page: 'work/media-insight.html', id: 'video', message: '영상 분석 화면으로 이동할게요.',
      keywords: ['영상', '영상 분석', '유튜브', 'youtube', 'video', '댓글', '댓글 분석', 'comment', '반응'] },
    { title: '사이퍼즈 프로모션 배너', page: 'work/cyphers.html', message: '사이퍼즈 프로모션 배너 케이스로 이동할게요.',
      keywords: ['사이퍼즈', 'cyphers', '배너', 'banner', '프로모션', 'promotion', '이벤트', 'event', '시즌', '생성형', '생성형 이미지', '그래픽'] },

    /* ---- projects shown in the home modal ---- */
    { title: 'GLDF 웹매니저툴', page: 'index.html', modal: 'gldf', message: 'GLDF 웹매니저툴을 열어드릴게요.',
      keywords: ['gldf', '웹매니저', '웹 매니저', '매니저툴', 'vue', 'vuetify', '뷰', '프론트엔드', 'frontend', '컴포넌트'] },
    { title: '시스템 공지문 이미지 생성기', page: 'index.html', modal: 'notice', message: '공지문 이미지 생성기를 열어드릴게요.',
      keywords: ['공지', '공지문', '공지사항', '이미지 생성기', '생성기', '템플릿', 'notice', 'generator', '바이브 코딩', '바이브코딩', 'vibe coding', '배포'] },

    /* ---- tools & methods ---- */
    { title: 'Figma · 디자인 시스템', page: 'index.html', id: 'now', message: 'Figma와 디자인 시스템 활용 방식은 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['figma', '피그마', '디자인 시스템', '디자인시스템', 'design system', '컴포넌트 시스템', '토큰', 'token', 'ui kit'] },
    { title: 'AI · Claude Code 활용', page: 'index.html', id: 'now', message: 'AI 도구 활용 방식은 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['ai', '인공지능', 'claude', '클로드', 'claude code', '클로드 코드', 'gpt', 'chatgpt', '프롬프트', 'prompt', '자동화', 'llm'] },
    { title: '구현 · 코드 (WebStorm · VS Code · GitHub)', page: 'index.html', id: 'now', message: '디자인을 코드로 구현하는 방식은 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['코드', '코딩', '개발', '구현', '퍼블리싱', 'html', 'css', 'javascript', 'js', 'webstorm', '웹스톰', 'vs code', 'vscode', '비주얼 스튜디오', 'github', '깃허브', 'git', 'code'] },
    { title: 'Adobe 툴 (Photoshop · Illustrator)', page: 'index.html', id: 'now', message: '비주얼 작업 도구를 보여드릴게요.',
      keywords: ['adobe', '어도비', 'photoshop', '포토샵', 'illustrator', '일러스트', '일러스트레이터', '애프터이펙트', 'after effects', 'powerpoint', '파워포인트', 'ppt'] },
    { title: 'Flutter', page: 'index.html', id: 'now', message: '사용 도구 목록을 보여드릴게요.',
      keywords: ['flutter', '플러터', '하이브리드', '앱 개발', 'mobile app', '모바일'] },
    { title: 'UX 리서치 · 정보 구조(IA)', page: 'index.html', id: 'now', message: '설계 단계의 작업 흐름은 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['ux', 'ui', 'ui/ux', '리서치', 'research', '정보 구조', '정보구조', 'ia', 'information architecture', '와이어프레임', 'wireframe', '사용성', 'usability', '기획'] },
    { title: 'QA · 운영', page: 'index.html', id: 'now', message: '마무리 · QA 단계는 도구 섹션의 "See how I work" 버튼에서 볼 수 있어요.',
      keywords: ['qa', '검수', '테스트', 'test', '운영', '유지보수', '마무리'] }
  ];

  /* ---------------------------------------------------------------------------
     Matching: lowercase, ignore spaces and light punctuation.
       exact keyword  → 100     query contains keyword → 60 + keyword length
       keyword starts with query → 40     keyword contains query → 25
     Title words count too, so e.g. "온플루" or "대시보드" match their entries.
  --------------------------------------------------------------------------- */
  function norm(s) { return String(s).toLowerCase().replace(/[\s·\-_.,!?'"()]/g, ''); }
  GUIDE_TOPICS.forEach(function (t) {
    t._keys = t.keywords.concat([t.title]).map(norm).filter(Boolean);
  });

  function scoreTopic(t, q) {
    var best = 0;
    t._keys.forEach(function (k) {
      var s = 0;
      if (k === q) s = 100;
      else if (q.indexOf(k) > -1 && k.length >= 2) s = 60 + k.length;
      else if (q.length >= 2 && k.indexOf(q) === 0) s = 40;
      else if (q.length >= 2 && k.indexOf(q) > -1) s = 25;
      if (s > best) best = s;
    });
    return best;
  }
  function find(raw) {
    var q = norm(raw);
    if (!q) return [];
    return GUIDE_TOPICS
      .map(function (t, i) { return { t: t, s: scoreTopic(t, q), i: i }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; });
  }

  function store(v) { try { v === null ? sessionStorage.removeItem(KEY) : sessionStorage.setItem(KEY, v); } catch (e) {} }
  function hiddenStored() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

  var wrap = doc.createElement('div');
  wrap.innerHTML =
    '<aside class="office-guide" aria-label="Office 길잡이">' +
      '<div class="office-guide__dialog" role="dialog" aria-label="Office 길잡이 도움말" hidden>' +
        '<button type="button" class="office-guide__close" aria-label="닫기">×</button>' +
        '<p class="office-guide__message" aria-live="polite">무엇을 도와 드릴까요?</p>' +
        '<ul class="office-guide__results" hidden></ul>' +
        '<label for="office-guide-search">궁금한 내용을 입력하세요.</label>' +
        '<div class="office-guide__row"><input id="office-guide-search" type="text" autocomplete="off" data-clarity-mask="true" placeholder="예: 던파, 대시보드, 피그마"><button type="button" class="office-guide__btn" data-act="search">찾기(S)</button></div>' +
        '<button type="button" class="office-guide__btn office-guide__options" data-act="options">옵션(O)</button>' +
        '<div class="office-guide__opts" hidden><label><input type="checkbox" data-act="auto" checked> 랜덤 동작 자동 재생</label><p>말풍선을 열면 쉬고, 닫으면 다시 움직여요.</p><button type="button" class="office-guide__btn" data-act="more">다른 동작 보기</button></div>' +
      '</div>' +
      '<button type="button" class="office-guide__mascot" aria-expanded="false" aria-label="Office 길잡이 열기 또는 닫기"><span class="office-guide__dog" role="img" aria-label="도움을 드리는 강아지 길잡이"><span class="office-guide__pose" aria-hidden="true"></span><span class="office-guide__house" aria-hidden="true"><i></i><i></i></span></span></button>' +
      '<button type="button" class="office-guide__hide">길잡이 숨기기</button>' +
    '</aside>' +
    '<button type="button" class="office-guide__menu" hidden>도움말(H) <span>▾</span><small>Office 길잡이 표시</small></button>';

  var guide = wrap.firstChild, menu = wrap.lastChild;
  doc.body.appendChild(guide);
  doc.body.appendChild(menu);

  var dialog = guide.querySelector('.office-guide__dialog');
  var mascot = guide.querySelector('.office-guide__mascot');
  var msg = guide.querySelector('.office-guide__message');
  var list = guide.querySelector('.office-guide__results');
  var input = guide.querySelector('input');

  function setOpen(on) {
    dialog.hidden = !on;
    mascot.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) input.focus();
  }
  var busy = false, autoPlay = true, openAfter = false;
  var HOUSE_OUT = 1650, HOUSE_IN = 1450;
  function enter(openIt) {
    guide.hidden = false; menu.hidden = true; store(null);
    if (reduce) { if (openIt) setOpen(true); idle(1200); return; }
    busy = true; clearTimeout(timer);
    dogEl.classList.remove('is-exiting'); dogEl.classList.add('is-entering');
    showPose('look');
    setTimeout(function () {
      dogEl.classList.remove('is-entering');
      showPose('look', 'arrival');
      setTimeout(function () {
        showPose('sit', 'settling');
        setTimeout(function () { busy = false; if (openIt) setOpen(true); idle(1200); }, 500);
      }, 620);
    }, HOUSE_OUT);
  }
  function leave() {
    setOpen(false);
    if (reduce) { setVisible(false); return; }
    busy = true; clearTimeout(timer);
    dogEl.classList.add('is-exiting');
    showPose('tilt');
    setTimeout(function () { dogEl.classList.remove('is-exiting'); busy = false; setVisible(false); }, HOUSE_IN);
  }
  function setVisible(on) {
    guide.hidden = !on;
    menu.hidden = on;
    store(on ? null : '1');
  }

  // Is the topic's page the page we're on? (no page = any page)
  function onPage(t) {
    if (!t.page) return true;
    var here = (location.pathname.split('/').pop() || 'index.html');
    return here === t.page.split('/').pop() && (t.page.indexOf('work/') === 0) === /\/work\//.test(location.pathname);
  }

  // Route through a real link so main.js handles smooth scroll / page transition.
  function go(t) {
    if (t.modal && onPage(t)) {
      var opener = doc.querySelector('[data-modal="' + t.modal + '"]');
      if (opener) { setOpen(false); opener.click(); return; }
    }
    var href;
    var target = t.id || (t.modal ? 'now' : '');
    if (onPage(t) && (!target || doc.getElementById(target))) href = target ? '#' + target : '#';
    else href = root + (t.page || 'index.html') + (target ? '#' + target : '');
    if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var a = doc.createElement('a');
    a.href = href;
    a.hidden = true;
    doc.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showList(results) {
    list.innerHTML = '';
    results.forEach(function (r) {
      var li = doc.createElement('li');
      var b = doc.createElement('button');
      b.type = 'button';
      b.textContent = r.t.title;
      b.addEventListener('click', function () { msg.textContent = r.t.message; setTimeout(function () { go(r.t); }, 250); });
      li.appendChild(b);
      list.appendChild(li);
    });
    list.hidden = !results.length;
  }

  function search() {
    var raw = input.value.trim();
    showList([]);
    if (!raw) { msg.textContent = '찾고 싶은 내용을 입력해주세요.'; return; }
    var results = find(raw);
    if (!results.length) { msg.textContent = "'" + raw + "'에 대한 도움말을 찾지 못했습니다. 다른 단어로 찾아보세요."; return; }
    var top = results[0], second = results[1];
    // a clear winner (nothing else is a close or prefix match): go straight there
    if (!second || (top.s - second.s >= 30 && second.s < 40)) {
      msg.textContent = top.t.message;
      setTimeout(function () { go(top.t); }, 350);
      return;
    }
    msg.textContent = "'" + raw + "' 관련 항목이에요. 어디로 갈까요?";
    showList(results.slice(0, 5));
  }

  mascot.addEventListener('click', function () { setOpen(dialog.hidden); });
  guide.querySelector('.office-guide__close').addEventListener('click', function () { setOpen(false); });
  guide.querySelector('[data-act="search"]').addEventListener('click', search);
  guide.querySelector('[data-act="options"]').addEventListener('click', function () {
    optsEl.hidden = !optsEl.hidden;
    msg.textContent = '이런 단어로 찾아보세요: 프로젝트, 던파, 대시보드, 배너, 피그마, AI, 경력, 제주, 연락처';
    showList([]);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
    if (e.key === 'Escape') setOpen(false);
  });
  guide.querySelector('.office-guide__hide').addEventListener('click', function () { leave(); });
  menu.addEventListener('click', function () { enter(true); });

    /* ---------- idle behaviours (sprite poses from the Office 길잡이 animation project) ---------- */
  var POSES = {
    sit:   { x: 1,   y: 0,  w: 47, h: 63 },
    look:  { x: 56,  y: 2,  w: 47, h: 65 },
    tilt:  { x: 103, y: 5,  w: 46, h: 64 },
    read:  { x: 149, y: 3,  w: 63, h: 64 },
    phone: { x: 2,   y: 76, w: 56, h: 72 },
    sleep: { x: 56,  y: 70, w: 85, h: 28 },
    work:  { x: 111, y: 79, w: 88, h: 68, clip: 'polygon(30px 0,100% 0,100% 100%,0 100%,0 19px,30px 19px)' }
  };
  function fr(pose, ms, motion) { return { pose: pose, ms: ms, motion: motion || '' }; }
  var ACTIONS = [
    { id: 'look',    frames: [fr('look', 800), fr('sit', 400), fr('look', 1000), fr('sit', 500)] },
    { id: 'curious', frames: [fr('look', 450), fr('tilt', 1400, 'curious'), fr('look', 450), fr('sit', 500)] },
    { id: 'read',    frames: [fr('look', 400), fr('read', 4200, 'reading'), fr('look', 400), fr('sit', 500)] },
    { id: 'phone',   frames: [fr('tilt', 450), fr('phone', 3600, 'talking'), fr('look', 400), fr('sit', 500)] },
    { id: 'sleep',   frames: [fr('tilt', 420), fr('sleep', 3600, 'sleeping'), fr('sleep', 420, 'waking'), fr('look', 520, 'rising'), fr('look', 900, 'proud'), fr('sit', 550, 'settling')] },
    { id: 'work',    frames: [fr('look', 450), fr('work', 4200, 'relaxing'), fr('look', 450), fr('sit', 500)] }
  ];
  var dogEl = guide.querySelector('.office-guide__dog');
  var poseEl = guide.querySelector('.office-guide__pose');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bag = [], lastId = '', timer = 0;

  function showPose(name, motion) {
    var p = POSES[name];
    poseEl.style.setProperty('--pw', p.w + 'px');
    poseEl.style.setProperty('--ph', p.h + 'px');
    poseEl.style.setProperty('--px', -p.x + 'px');
    poseEl.style.setProperty('--py', -p.y + 'px');
    poseEl.style.clipPath = p.clip || '';
    poseEl.className = 'office-guide__pose' + (motion ? ' og-motion-' + motion : '');
    dogEl.setAttribute('data-sleeping', motion === 'sleeping' ? '1' : '');
  }
  function nextBag() {
    var b = ACTIONS.slice();
    for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    if (b[0].id === lastId) { var t2 = b[0]; b[0] = b[1]; b[1] = t2; }
    return b;
  }
  function canMove() { return !reduce && !busy && autoPlay && !document.hidden && dialog.hidden && !guide.hidden; }
  function schedule(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }
  function rest() { showPose('sit'); }
  function idle(delay) { rest(); schedule(function () { if (canMove()) play(); else idle(2000); }, delay); }
  function play() {
    if (!bag.length) bag = nextBag();
    var a = bag.shift(); lastId = a.id;
    var i = 0;
    (function step() {
      if (!canMove()) return idle(2500);
      var f = a.frames[i++];
      if (!f) return idle(1500 + Math.random() * 1500);
      showPose(f.pose, f.motion);
      schedule(step, f.ms);
    })();
  }
  function playNow() { clearTimeout(timer); if (!reduce && !busy) play(); }
  var optsEl = guide.querySelector('.office-guide__opts');
  guide.querySelector('[data-act="auto"]').addEventListener('change', function (e) { autoPlay = e.target.checked; if (autoPlay) idle(1200); else { clearTimeout(timer); rest(); } });
  guide.querySelector('[data-act="more"]').addEventListener('click', function () { optsEl.hidden = true; setOpen(false); setTimeout(playNow, 250); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(timer); rest(); } else idle(1200); });
  // keep still while the help dialog is open, resume when it closes
  new MutationObserver(function () { if (!dialog.hidden) { clearTimeout(timer); rest(); } else idle(1500); }).observe(dialog, { attributes: true, attributeFilter: ['hidden'] });
  showPose('sit');
  if (!reduce) idle(1200 + Math.random() * 800);

  setVisible(!hiddenStored());
  try { if (!hiddenStored() && !sessionStorage.getItem('office-guide-intro')) { sessionStorage.setItem('office-guide-intro', '1'); enter(false); } } catch (e) {}
})();
