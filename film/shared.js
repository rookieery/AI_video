/* 共享动画库：缓动 / 字幕系统 / 年份卡 / 硬币 —— 全部纯 f(t)，无自循环 */
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const span = (t, a, b) => clamp01((t - a) / (b - a));
const eOutCubic = p => 1 - Math.pow(1 - p, 3);
const eInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eOutExpo = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
const eInQuad = p => p * p;
const eOutBack = (p, s = 1.55) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
const eOutBounce = p => { const n = 7.5625, d = 2.75;
  if (p < 1 / d) return n * p * p;
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + .75;
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + .9375;
  return n * (p -= 2.625 / d) * p + .984375; };
const mulberry32 = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0;
  let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ── 字幕系统：LINES = [[t0, t1, 文本, 金色词数组], ...] ── */
const CHAR_GAP = .085, CHAR_DUR = .16, OUT_FADE = .38;
function makeSubs(root, LINES) {
  const nodes = LINES.map(([a, b, txt, golds = []]) => {
    const div = document.createElement('div'); div.className = 'sub';
    const spans = []; let inQuote = false;
    for (const ch of txt) {
      if (ch === '「') inQuote = true;
      const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
      if (golds.some(g => txt.includes(g) && txt.indexOf(g) <= (spans.map(x => x.textContent).join('')).length)) s.classList.add('gold');
      if (inQuote) s.classList.add('q');
      div.appendChild(s); spans.push(s);
      if (ch === '」') inQuote = false;
    }
    root.appendChild(div);
    // 修正高亮判定（基于最终全文索引，避免构建顺序误差）
    const full = txt;
    golds.forEach(g => { let i = full.indexOf(g);
      while (i >= 0) { for (let k = 0; k < g.length; k++) { spans[i + k].classList.add('gold'); spans[i + k].classList.remove('q'); } i = full.indexOf(g, i + 1); } });
    return { a, b, div, spans };
  });
  return t => {
    for (const { a, b, div, spans } of nodes) {
      if (t < a - .05 || t > b + OUT_FADE) { div.style.opacity = 0; continue; }
      const lineOut = t > b ? 1 - span(t, b, b + OUT_FADE) : 1;
      let anyVisible = false;
      spans.forEach((s, i) => {
        const p = span(t, a + i * CHAR_GAP, a + i * CHAR_GAP + CHAR_DUR);
        if (p <= 0) { s.style.opacity = 0; return; }
        anyVisible = true;
        const e = eOutCubic(p);
        s.style.opacity = e;
        s.style.transform = `translateY(${(1 - e) * 22}px)`;
        s.style.filter = p < 1 ? `blur(${(1 - e) * 7}px)` : '';
      });
      div.style.opacity = anyVisible ? lineOut : 0;
      div.style.filter = lineOut < 1 ? `blur(${(1 - lineOut) * 6}px)` : '';
    }
  };
}

/* ── 年份章节卡：大卡 t0 起 bigDur 秒，之后角落标签 ── */
function makeYear(root, year, subtitle, t0, bigDur, tEnd) {
  const card = document.createElement('div'); card.className = 'yearcard';
  card.innerHTML = `<div class="num">${year}</div><div class="sub-t">${subtitle}</div><div class="rule"></div>`;
  const corner = document.createElement('div'); corner.className = 'corner';
  corner.innerHTML = `<div class="y">${year}</div><div class="s">${subtitle}</div><div class="l"></div>`;
  root.appendChild(card); root.appendChild(corner);
  const num = card.querySelector('.num'), subT = card.querySelector('.sub-t'), rule = card.querySelector('.rule');
  return t => {
    if (t < t0 + bigDur) {                                          // 大卡
      const aIn = eOutExpo(span(t, t0, t0 + .9));
      const aOut = 1 - span(t, t0 + bigDur - .5, t0 + bigDur);
      const a = aIn * aOut; card.style.opacity = a; corner.style.opacity = 0;
      const sc = .92 + .08 * aIn;
      num.style.transform = `scale(${sc})`;
      num.style.letterSpacing = `${(.30 - .18 * aIn).toFixed(3)}em`;
      subT.style.opacity = span(t, t0 + .45, t0 + 1.25) * aOut;
      subT.style.transform = `translateY(${(1 - eOutCubic(span(t, t0 + .45, t0 + 1.25))) * 24}px)`;
      rule.style.transform = `scaleX(${eOutCubic(span(t, t0 + .6, t0 + 1.6)) * aOut})`;
      // 金属扫光：高光带随时间掠过渐变
      const sweep = 12 + (t - t0) * 26;
      num.style.background = `linear-gradient(178deg, #f6e6b0 0%, #e8c96a ${Math.max(0, sweep - 22)}%, #fff3c4 ${sweep}%, #b0863f ${Math.min(100, sweep + 6)}%, #8a6430 100%)`;
      num.style.webkitBackgroundClip = 'text';
    } else {                                                         // 角落标签
      card.style.opacity = 0;
      corner.style.opacity = span(t, t0 + bigDur, t0 + bigDur + .5) * (1 - span(t, tEnd - .4, tEnd));
    }
  };
}

/* ── CSS 3D 硬币 ── */
function makeCoin(root, cx, cy, dia) {
  const wrap = document.createElement('div'); wrap.className = 'coin';
  wrap.style.cssText = `left:${cx - dia / 2}px; top:${cy - dia / 2}px; width:${dia}px; height:${dia}px;`;
  const THICK = Math.max(6, dia * .07), N = 9;
  for (let i = 0; i < N; i++) { const s = document.createElement('div'); s.className = 'slice';
    s.style.transform = `translateZ(${(i / (N - 1) - .5) * THICK}px)`; wrap.appendChild(s); }
  const front = document.createElement('div'); front.className = 'face';
  front.style.fontSize = `${dia * .52}px`; front.textContent = '¥'; front.style.transform = `translateZ(${THICK / 2}px)`;
  const back = document.createElement('div'); back.className = 'face back';
  back.style.fontSize = `${dia * .52}px`; back.textContent = '¥'; back.style.transform = `rotateY(180deg) translateZ(${THICK / 2}px)`;
  wrap.appendChild(front); wrap.appendChild(back);
  root.appendChild(wrap);
  return { el: wrap, set(rotY, rotX = 12, scale = 1, opacity = 1) {
    wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    wrap.style.opacity = opacity; } };
}

/* 通用淡入淡出窗口 */
const win = (t, a, b, fi = .6, fo = .6) => t < a || t > b ? 0 : Math.min(1, span(t, a, a + fi), 1 - span(t, b - fo, b));
