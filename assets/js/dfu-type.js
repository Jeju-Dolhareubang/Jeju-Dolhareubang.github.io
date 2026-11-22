(function () {
  'use strict';
  var box = document.querySelector('.dfu-type__ctrl');
  var sample = document.querySelector('.dfu-type__left p');
  if (!box || !sample) return;
  var range = box.querySelector('input');
  var out = box.querySelector('output');
  range.value = parseInt(getComputedStyle(sample).fontWeight, 10) || 300;
  function paint() {
    var v = +range.value;
    out.textContent = 'Weight ' + v;
    range.style.setProperty('--fill', ((v - range.min) / (range.max - range.min) * 100) + '%');
  }
  range.addEventListener('input', function () { sample.style.fontWeight = range.value; paint(); });
  paint();
})();
