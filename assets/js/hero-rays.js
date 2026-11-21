/* Case-study hero light: soft rays falling from a source just above the top
   centre, drifting slowly and leaning a little toward the pointer.
   Usage: <canvas data-rays data-rays-color="#51a2ff" data-rays-base="#0a132f">
   Falls back to the section's CSS background when WebGL is unavailable. */
(function () {
  'use strict';

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform float uLean;uniform float uFade;',
    'uniform vec3 uRay;uniform vec3 uBase;',
    'float band(float a,float f,float s,float ph,float sharp){',
    '  return pow(.5+.5*sin(a*f+uTime*s+ph+sin(a*f*.37-uTime*s*.6)*1.4),sharp);',
    '}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/uRes;',
    '  float asp=uRes.x/uRes.y;',
    '  vec2 o=vec2(.5+uLean*.08,1.18);',            // source above the top edge
    '  vec2 d=vec2((uv.x-o.x)*asp,o.y-uv.y);',
    '  float dist=length(d);',
    '  float a=atan(d.x,d.y);',                    // 0 = straight down
    '  a-=uLean*.06;',
    '  float cone=exp(-a*a*1.1);',
    '  float r=band(a,9.,.38,0.,1.6)*.5+band(a,16.,-.27,1.7,2.4)*.3+band(a,5.,.16,4.2,1.3)*.5;',
    '  r+=.08*sin(uTime*.7+a*3.);',
    '  float fall=smoothstep(1.7,.2,dist);',
    '  float core=exp(-dist*dist*2.2);',
    '  float lit=(r*cone*fall*.6+core*.5)*uFade;',
    '  float bottom=smoothstep(0.,.75,uv.y);',      // let the floor go dark
    '  vec3 col=uBase*mix(.05,1.,bottom*bottom);',
    '  col+=uRay*lit*mix(.15,1.,bottom);',
    '  col+=vec3(.75,.88,1.)*pow(core,4.)*.12*uFade;',
    '  float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);',
    '  col+=(n-.5)/255.*2.;',                       // dither against banding
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function hex(c) {
    c = (c || '').replace('#', '');
    if (c.length === 3) c = c.replace(/./g, '$&$&');
    var n = parseInt(c, 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function init(canvas) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uRes', 'uTime', 'uLean', 'uFade', 'uRay', 'uBase'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
    gl.uniform3fv(U.uRay, hex(canvas.getAttribute('data-rays-color') || '#51a2ff'));
    gl.uniform3fv(U.uBase, hex(canvas.getAttribute('data-rays-base') || '#0a132f'));

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var host = canvas.parentElement;
    var lean = 0, leanTo = 0, fade = reduce ? 1 : 0, start = performance.now();
    var visible = true, raf = 0;

    function size() {
      // rays are soft, so a reduced buffer looks the same and costs far less
      var s = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      var w = Math.max(1, Math.round(canvas.clientWidth * s));
      var h = Math.max(1, Math.round(canvas.clientHeight * s));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(U.uRes, w, h);
    }

    function draw(now) {
      lean += (leanTo - lean) * 0.04;
      if (fade < 1) fade = Math.min(1, fade + 0.012);
      gl.uniform1f(U.uTime, reduce ? 8 : (now - start) / 1000);
      gl.uniform1f(U.uLean, lean);
      gl.uniform1f(U.uFade, fade * fade * (3 - 2 * fade));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

    size();
    draw(performance.now());
    canvas.classList.add('is-ready');
    kick();

    window.addEventListener('resize', function () { size(); if (reduce) draw(performance.now()); });
    document.addEventListener('visibilitychange', kick);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(canvas);
    }
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        leanTo = ((e.clientX - r.left) / r.width - 0.5) * 2;
      });
      host.addEventListener('pointerleave', function () { leanTo = 0; });
    }

    // Hero copy drifts up and fades as the page scrolls past it.
    var copy = host.querySelector('[data-rays-copy]');
    if (copy && !reduce) {
      var tick = false;
      window.addEventListener('scroll', function () {
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () {
          tick = false;
          var h = host.offsetHeight || 1;
          var p = Math.min(1, Math.max(0, window.scrollY / h));
          copy.style.transform = 'translate3d(0,' + (p * h * 0.28).toFixed(1) + 'px,0)';
          copy.style.opacity = (1 - p * 1.15).toFixed(3);
        });
      }, { passive: true });
    }
  }

  function boot() { document.querySelectorAll('canvas[data-rays]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
