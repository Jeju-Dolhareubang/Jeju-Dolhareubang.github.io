/* Desk mockup: warps the project screenshots onto the monitor in
   assets/img/desk-mockup.jpg with a perspective (homography) matrix3d. */
(function () {
  var desk = document.querySelector('[data-desk-mock]');
  if (!desk) return;
  var screen = desk.querySelector('[data-screen]');
  if (!screen) return;

  var IMG_W = 2000;           // mockup image width the corners are measured in
  var SW = 1600, SH = 900;    // logical screen size the screenshots are laid out in
  // screen corners in the 2000x1500 mockup: TL, TR, BR, BL
  var Q = [[353, 166], [1583, 352], [1567, 1153], [368, 908]];

  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var max = i;
      for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[max][i])) max = k;
      var t = A[i]; A[i] = A[max]; A[max] = t; t = b[i]; b[i] = b[max]; b[max] = t;
      for (k = i + 1; k < n; k++) {
        var f = A[k][i] / A[i][i];
        b[k] -= f * b[i];
        for (j = i; j < n; j++) A[k][j] -= f * A[i][j];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      var s = b[i];
      for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
      x[i] = s / A[i][i];
    }
    return x;
  }

  function apply() {
    var k = desk.clientWidth / IMG_W;
    if (!k) return;
    var src = [[0, 0], [SW, 0], [SW, SH], [0, SH]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], u = Q[i][0] * k, v = Q[i][1] * k;
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    var h = solve(A, b);
    screen.style.transform = 'matrix3d(' + [
      h[0], h[3], 0, h[6],
      h[1], h[4], 0, h[7],
      0, 0, 1, 0,
      h[2], h[5], 0, 1
    ].join(',') + ')';
  }

  apply();
  if ('ResizeObserver' in window) new ResizeObserver(apply).observe(desk);
  else window.addEventListener('resize', apply);
})();
