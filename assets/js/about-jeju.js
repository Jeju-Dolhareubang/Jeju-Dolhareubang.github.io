/* About — Jeju location journey: scoped projection, reverse scroll and motion fallback. */
(function () {
  'use strict';

  var root = document.querySelector('[data-about-jeju]');
  if (!root) return;

  var coasts = [
    [[-168,66],[-156,71],[-134,69],[-123,75],[-100,73],[-86,70],[-79,68],[-65,60],[-58,55],[-62,47],[-71,42],[-76,34],[-81,25],[-89,29],[-97,25],[-90,19],[-84,21],[-87,15],[-83,9],[-77,8],[-81,24],[-104,22],[-114,31],[-124,42],[-125,50],[-138,58],[-152,57],[-168,60],[-168,66]],
    [[-77,8],[-73,12],[-62,10],[-50,3],[-35,-6],[-40,-19],[-50,-28],[-55,-37],[-66,-55],[-74,-49],[-73,-36],[-70,-19],[-79,-7],[-77,8]],
    [[-55,60],[-63,70],[-69,76],[-40,83],[-22,79],[-17,71],[-38,65],[-45,60],[-55,60]],
    [[-10,36],[-9,44],[-2,48],[7,43],[13,44],[17,40],[24,40],[28,42],[36,41],[42,43],[48,46],[51,54],[44,61],[30,70],[21,71],[15,66],[8,58],[4,53],[-2,52],[-5,58],[-8,55],[-3,50],[4,53],[11,61],[20,70],[33,70],[47,67],[60,69],[68,73],[83,72],[99,77],[117,74],[135,72],[149,70],[163,70],[180,68],[172,62],[163,60],[158,53],[154,51],[155,57],[145,59],[136,53],[141,49],[135,43],[130.7,42.3]],
    [[130.7,42.3],[130.1,41.7],[129.7,41.2],[129.65,40.75],[129.15,40.65],[128.8,40.25],[128.25,40.0],[127.53,39.8],[127.41,39.27],[127.86,39.12],[128.39,38.57],[128.62,38.16],[129.1,37.65],[129.48,37.28],[129.43,36.58],[129.39,36.07],[129.57,35.88],[129.43,35.49],[129.32,35.14],[128.85,35.03],[128.7,34.84],[128.4,34.91],[128.23,34.78],[127.92,34.93],[127.76,34.72],[127.6,34.61],[127.45,34.76],[127.28,34.54],[127.08,34.44],[126.83,34.51],[126.54,34.32],[126.41,34.53],[126.29,34.79],[126.51,35.08],[126.36,35.35],[126.5,35.64],[126.69,35.92],[126.54,36.11],[126.46,36.39],[126.21,36.57],[126.14,36.76],[126.41,36.81],[126.57,36.91],[126.83,37.0],[126.74,37.28],[126.52,37.47],[126.55,37.74],[126.12,37.91],[125.7,37.81],[125.33,37.94],[125.2,38.24],[125.08,38.59],[125.23,38.76],[125.42,38.84],[125.36,39.13],[125.12,39.45],[124.65,39.58],[124.32,39.82]],
    [[124.32,39.82],[123.84,39.77],[122.37,39.02],[121.2,38.73],[121.81,39.09],[121.46,39.46],[121.58,40.01],[122.02,40.56],[121.26,40.86],[120.53,40.27],[119.7,39.85],[118.9,39.12],[117.88,38.93],[118.1,38.22],[119.22,37.13],[120.49,37.67],[122.68,37.37],[122.3,36.89],[120.86,36.47],[120.25,35.93],[119.23,35.08],[119.9,34.32],[120.78,32.96],[121.87,31.39],[121.94,30.89],[122.05,30.11],[121.9,29.3],[120.5,27.4],[119.8,25.6],[117.1,23.5],[113.5,22.2],[109.9,21.4],[108,21.4],[106,20.0],[107,17],[109,12],[106,9],[103,10],[100,13],[100,8],[103,1],[101,2],[98,8],[98,16],[94,17],[92,22],[88,21],[84,19],[80,15],[78,8],[75,12],[73,17],[68,23],[66,25],[58,25],[53,27],[48,30],[49,27],[56,25],[58,22],[53,16],[46,13],[43,12],[41,17],[38,20],[33,28],[34,31],[36,35],[29,36],[26,39],[22,36],[16,38],[11,37],[8,40],[3,43],[-2,43],[-6,36],[-10,36]],
    [[-6,36],[-10,32],[-17,21],[-17,14],[-11,5],[1,5],[9,3],[12,-6],[13,-13],[17,-22],[19,-34],[27,-34],[35,-25],[39,-16],[41,-5],[44,3],[52,11],[44,12],[38,18],[35,24],[32,30],[25,31],[18,31],[11,34],[2,36],[-6,36]],
    [[133,34],[134,34.1],[135,34.35],[136,34.55],[137.4,34.67],[139.8,35],[140.85,36.2],[141.1,37.3],[142,39.7],[141,41.3],[140.3,40.8],[139.7,39.1],[138.2,37.3],[137,37.2],[136,36],[135.2,35.55],[133,35.47],[131,34.4],[133,34]],
    [[130.88,33.95],[131.5,33.7],[132,33.24],[131.6,32.65],[131.13,31.35],[130.2,31.25],[130.1,32.1],[129.55,32.7],[130,33.26],[130.88,33.95]],
    [[140,41.5],[141.2,42],[142.9,42],[145.7,43.4],[144.5,44.1],[142.2,45.4],[141.6,44],[140.4,42.6],[140,41.5]],
    [[119.9,23.1],[120.4,22],[121.4,23],[122,25.1],[121.3,25.2],[120.1,24],[119.9,23.1]],
    [[113,-22],[115,-34],[124,-34],[132,-32],[139,-36],[147,-39],[153,-28],[153,-23],[146,-18],[142,-11],[138,-17],[130,-12],[122,-18],[113,-22]],
    [[95,5],[100,2],[105,-5],[102,-6],[98,-2],[95,5]],[[105,-6],[114,-8],[110,-8.5],[105,-6]],[[109,1],[116,7],[119,4],[117,-4],[112,-3],[109,1]],[[130,-3],[138,0],[147,-7],[152,-9],[142,-9],[134,-5],[130,-3]],
    [[126.15,33.29],[126.25,33.41],[126.48,33.54],[126.72,33.56],[126.96,33.5],[126.94,33.37],[126.65,33.24],[126.39,33.2],[126.15,33.29]],
    [[130.78,37.51],[130.84,37.54],[130.91,37.53],[130.94,37.48],[130.86,37.45],[130.78,37.51]],
    [[131.856,37.247],[131.875,37.249],[131.878,37.235],[131.861,37.234],[131.856,37.247]]
  ];
  var site = [126.477, 33.483];
  var home = [126.705, 37.456]; // Incheon (family home)
  var rad = Math.PI / 180;
  var range = function (start, end, step) { return Array.from({ length: Math.round((end - start) / step) + 1 }, function (_, i) { return start + i * step; }); };
  var grid = [].concat(
    range(-180, 165, 15).map(function (lon) { return range(-90, 90, 3).map(function (lat) { return [lon, lat]; }); }),
    range(-75, 75, 15).map(function (lat) { return range(-180, 180, 3).map(function (lon) { return [lon, lat]; }); })
  );
  var clamp = function (value, min, max) { return Math.max(min, Math.min(max, value)); };
  var mix = function (start, end, amount) { return start + (end - start) * amount; };
  var smooth = function (amount) { amount = clamp(amount, 0, 1); return amount * amount * (3 - 2 * amount); };
  var journey = root.querySelector('.about-jeju__journey');
  var stage = root.querySelector('.about-jeju__stage');
  var svg = root.querySelector('.about-jeju__art');
  var gridPath = root.querySelector('#about-jeju-grid');
  var coastPath = root.querySelector('#about-jeju-coast');
  var limb = root.querySelector('#about-jeju-limb');
  var target = root.querySelector('#about-jeju-target');
  var homeMark = root.querySelector('#about-jeju-home');
  var flight = root.querySelector('#about-jeju-flight');
  var route = root.querySelector('#about-jeju-route');
  var plane = root.querySelector('#about-jeju-plane');

  /* Incheon -> Jeju: a quadratic arc bowing west over the Yellow Sea, drawn up to t */
  function flightPath(a, b, t) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var len = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
    var c = [mx - len * 0.38, my];
    function at(u) {
      var v = 1 - u;
      return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
    }
    var d = '', steps = 40;
    for (var i = 0; i <= steps; i++) {
      var q = at(t * i / steps);
      d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    }
    var head = at(t), u2 = Math.max(0, t - 0.01), back = at(u2);
    var angle = Math.atan2(head[1] - back[1], head[0] - back[0]) * 180 / Math.PI;
    if (t < 0.01) { var ahead = at(0.01); angle = Math.atan2(ahead[1] - head[1], ahead[0] - head[0]) * 180 / Math.PI; }
    return { d: d, x: head[0], y: head[1], angle: angle };
  }
  var bound = root.querySelector('#about-jeju-bound');
  var bubble = root.querySelector('#about-jeju-bubble');
  var dolphinScene = root.querySelector('#about-jeju-dolphin-scene');
  var hint = root.querySelector('.about-jeju__hint');
  var place = root.querySelector('.about-jeju__place');
  var arrivalCopy = root.querySelector('.about-jeju__arrival-copy');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var compact = window.matchMedia('(max-width: 630px)');
  var bubbleRevealDistance = 140;

  function projection(progress) {
    var turn = smooth(progress / 0.62);
    var zoom = smooth((progress - 0.15) / 0.85);
    var lon0 = mix(106, 128.4, turn) * rad;
    var lat0 = mix(24, 37.3, turn) * rad;
    var radius = mix(170, 2250, zoom);
    var centerX = mix(690, 645, zoom);
    var centerY = 230;
    return function (point) {
      var longitude = point[0] * rad - lon0;
      var latitude = point[1] * rad;
      var z = Math.sin(lat0) * Math.sin(latitude) + Math.cos(lat0) * Math.cos(latitude) * Math.cos(longitude);
      return [
        centerX + radius * Math.cos(latitude) * Math.sin(longitude),
        centerY - radius * (Math.cos(lat0) * Math.sin(latitude) - Math.sin(lat0) * Math.cos(latitude) * Math.cos(longitude)),
        z
      ];
    };
  }

  function linePath(lines, project) {
    var path = '';
    lines.forEach(function (line) {
      var visible = false;
      for (var i = 0; i < line.length; i += 1) {
        var start = line[Math.max(0, i - 1)];
        var end = line[i];
        var steps = i ? Math.max(1, Math.ceil(Math.max(Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1])) / 2)) : 1;
        for (var j = 1; j <= steps; j += 1) {
          var point = project([mix(start[0], end[0], j / steps), mix(start[1], end[1], j / steps)]);
          if (point[2] < 0) { visible = false; continue; }
          path += (visible ? 'L' : 'M') + point[0].toFixed(1) + ',' + point[1].toFixed(1);
          visible = true;
        }
      }
    });
    return path;
  }

  function render(progress, finished) {
    var project = projection(progress);
    var arrival = smooth((progress - 0.83) / 0.14);
    var point = project(site);
    var zoom = smooth((progress - 0.15) / 0.85);
    var cropX = compact.matches ? mix(420, 355, smooth(progress)) : 0;

    svg.setAttribute('viewBox', compact.matches ? cropX + ' 0 510 460' : '0 0 968 460');
    bound.setAttribute('x', compact.matches ? cropX : 285 * arrival);
    gridPath.setAttribute('d', linePath(grid, project));
    coastPath.setAttribute('d', linePath(coasts, project));
    limb.setAttribute('cx', mix(690, 645, zoom));
    limb.setAttribute('r', mix(170, 2250, zoom));
    limb.style.opacity = 1 - smooth((progress - 0.46) / 0.12);
    target.setAttribute('opacity', arrival);
    if (homeMark) {
      var hp = project(home);
      homeMark.setAttribute('opacity', arrival);
      homeMark.setAttribute('transform', 'translate(' + hp[0] + ' ' + hp[1] + ')');
    }
    if (flight) {
      var fl = smooth((progress - 0.84) / 0.16);
      var fp = flightPath(project(home), point, fl);
      flight.setAttribute('opacity', arrival);
      route.setAttribute('d', fp.d);
      plane.setAttribute('transform', 'translate(' + fp.x.toFixed(1) + ' ' + fp.y.toFixed(1) + ') rotate(' + fp.angle.toFixed(1) + ')');
      plane.setAttribute('opacity', fl >= 1 ? 0 : 1 - smooth((fl - 0.9) / 0.1));
    }
    target.setAttribute('transform', 'translate(' + point[0] + ' ' + point[1] + ')');
    bubble.setAttribute('opacity', finished ? 1 : 0);
    dolphinScene.classList.toggle('is-visible', finished);
    hint.hidden = arrival > 0.5;
    place.hidden = arrival <= 0.5;
    arrivalCopy.hidden = !finished;
  }

  var pending = false;
  function update() {
    pending = false;
    var distance = journey.offsetHeight - stage.offsetHeight;
    var scrolled = -journey.getBoundingClientRect().top;
    var zoomDistance = Math.max(1, distance - bubbleRevealDistance);
    var progress = reduced.matches ? 1 : clamp(scrolled / zoomDistance, 0, 1);
    var finished = reduced.matches || scrolled >= distance - 1;
    render(progress, finished);
  }
  function requestUpdate() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  if (reduced.addEventListener) reduced.addEventListener('change', requestUpdate); else reduced.addListener(requestUpdate);
  if (compact.addEventListener) compact.addEventListener('change', requestUpdate); else compact.addListener(requestUpdate);
  requestUpdate();
})();
