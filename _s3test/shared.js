(function () {
  var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var seg = function (t, a, b) { return clamp01((t - a) / (b - a)); };
  var lerp = function (a, b, u) { return a + (b - a) * u; };
  var eoc = function (u) { return 1 - Math.pow(1 - u, 3); };
  var eic = function (u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  var eob = function (u) { var c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  var eoq = function (u) { return 1 - Math.pow(1 - u, 4); };
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var fmt = function (n, d) { return n.toFixed(d === undefined ? 0 : d); };
  /* sequential symbol reveal inside root; returns count */
  function reveal(root, t, start, step, dur) {
    dur = dur || .3;
    var s = root.querySelectorAll('.sym');
    for (var i = 0; i < s.length; i++) {
      var u = seg(t, start + i * step, start + i * step + dur);
      s[i].style.opacity = u;
      s[i].style.transform = 'translateY(' + ((1 - eoc(u)) * 16) + 'px)';
    }
    return s.length;
  }
  /* radial burst of dots; update(t, t0, dur) */
  function makeBurst(host, x, y, n, seed, color, rMax) {
    var r = rng(seed), els = [];
    for (var i = 0; i < n; i++) {
      var e = document.createElement('div');
      e.className = 'p'; e.style.background = color; host.appendChild(e);
      els.push({ e: e, a: r() * Math.PI * 2, f: .35 + r() * .65, s: 3 + r() * 5 });
    }
    return {
      update: function (t, t0, dur) {
        var u = seg(t, t0, t0 + dur);
        for (var i = 0; i < els.length; i++) {
          var p = els[i], d = eoc(u) * rMax * p.f;
          p.e.style.opacity = u > 0 && u < 1 ? (1 - u) : 0;
          p.e.style.width = p.e.style.height = p.s + 'px';
          p.e.style.left = (x + Math.cos(p.a) * d) + 'px';
          p.e.style.top = (y + Math.sin(p.a) * d) + 'px';
        }
      }
    };
  }
  /* continuously rising motes inside a column; update(t) */
  function makeRise(host, x, y0, h, n, seed, color) {
    var r = rng(seed), els = [];
    for (var i = 0; i < n; i++) {
      var e = document.createElement('div');
      e.className = 'p'; e.style.background = color; host.appendChild(e);
      els.push({ e: e, dx: (r() - .5) * 150, v: 55 + r() * 120, s: 2 + r() * 4, w: r() * 1000 });
    }
    return {
      update: function (t) {
        for (var i = 0; i < els.length; i++) {
          var p = els[i], cy = (t * p.v + p.w) % h;
          p.e.style.opacity = .5 * (1 - cy / h);
          p.e.style.width = p.e.style.height = p.s + 'px';
          p.e.style.left = (x + p.dx) + 'px';
          p.e.style.top = (y0 + h - cy) + 'px';
        }
      }
    };
  }
  window.F = {
    clamp01: clamp01, seg: seg, lerp: lerp, eoc: eoc, eic: eic, eob: eob, eoq: eoq,
    rng: rng, fmt: fmt, reveal: reveal, makeBurst: makeBurst, makeRise: makeRise
  };
})();
