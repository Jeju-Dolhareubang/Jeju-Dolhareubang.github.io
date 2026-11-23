/* Hero wave: a WebGL gradient that rises from the bottom of the hero in slow,
   overlapping waves with a grainy edge (mint rgb(141,248,171)). Falls back to
   the CSS ::before gradient when WebGL is unavailable. */
(function () {
  var hero = document.querySelector('.home .hero');
  if (!hero) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'hero__wave';
  canvas.setAttribute('aria-hidden', 'true');
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return;

  var vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var frag = [
    'precision highp float;',
    'uniform vec2 res;uniform float t;uniform float band;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
    'void main(){',
    // work in units of "band" (the wave zone height, about the giant wordmark)
    ' vec2 q=gl_FragCoord.xy/band;',
    ' float x=q.x*.55;',
    // the crest line: layered sines drifting at different speeds
    ' float w=.8+.28*sin(x*1.35+t*.32)+.15*sin(x*2.7-t*.46+1.7)+.07*sin(x*4.9+t*.61+.4)+.12*(noise(vec2(x*1.2,t*.12))-.5);',
    ' float d=w-q.y;',
    // grain that breaks up the edge like a dithered blur (fixed per pixel, so it does not flicker)
    ' float g=hash(gl_FragCoord.xy)-.5;',
    ' float edge=smoothstep(-.04,.34,d+g*.16);',
    ' vec3 black=vec3(.02);',
    ' vec3 deep=vec3(.02,.22,.12);',
    ' vec3 vivid=vec3(.1,.72,.38);',
    ' vec3 mint=vec3(.553,.973,.671);',
    ' vec3 pale=vec3(.88,1.,.92);',
    ' float n=noise(vec2(x*1.8-t*.2,q.y*1.4+t*.12));',
    ' float n2=noise(vec2(x*.9+t*.15,q.y*.8-t*.08)+7.);',
    ' vec3 c=mix(deep,vivid,smoothstep(.0,.3,d));',
    ' c=mix(c,mint,smoothstep(.25,.75,d)*(.4+.6*n));',
    ' c=mix(c,pale,smoothstep(.55,1.,d)*smoothstep(.5,.9,n2)*.7);',
    ' c=mix(black,c,edge);',
    ' c+=g*.03*(1.-smoothstep(.0,.6,abs(d-.1)));',
    ' gl_FragColor=vec4(c,1.);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, 'res'), uT = gl.getUniformLocation(prog, 't'), uBand = gl.getUniformLocation(prog, 'band');
  var giant = hero.querySelector('.hero__giant');

  hero.insertBefore(canvas, hero.firstChild);
  hero.classList.add('has-wave');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    var w = Math.round(hero.clientWidth * dpr), h = Math.round(hero.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  var SPEED = 1.2; // overall flow speed of the wave
  var visible = true, raf = 0, start = performance.now();
  function draw(now) {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    var gh = giant ? giant.getBoundingClientRect().height : hero.clientHeight * 0.3;
    gl.uniform1f(uBand, Math.max(160, gh) * dpr);
    gl.uniform1f(uT, reduce ? 4 : (now - start) / 1000 * SPEED);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = (!reduce && visible) ? requestAnimationFrame(draw) : 0;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    }).observe(hero);
  }
  window.addEventListener('resize', function () { if (!raf) draw(performance.now()); });
  raf = requestAnimationFrame(draw);
})();
