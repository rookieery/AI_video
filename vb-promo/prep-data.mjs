// prep-data.mjs —— 从 MaterialSorting 真实求解产物提取动画数据源 vb-data.js
// 数据源：config_runs/5336_coded_really（110 片 / 7 码 / 5s 求解 / 86.29%）
// 变换口径与 materialSorting-web/src/lib/geometry.ts pointsStr 一致：
//   x' = x·cos(r) − y·sin(r) + tx；y' = x·sin(r) + y·cos(r) + ty（世界坐标 Y 向上）
import { readFileSync, writeFileSync } from 'node:fs';

const RUN = 'D:/code/MaterialSorting/materialSorting-server/out/config_runs/5336_coded_really_20260923-131705';
const piecesDoc = JSON.parse(readFileSync(`${RUN}/pieces_intermediate.json`, 'utf8'));
const best = JSON.parse(readFileSync(`${RUN}/best_frame_s0.json`, 'utf8'));
const curve = JSON.parse(readFileSync(`${RUN}/curve_s0.json`, 'utf8'));
const result = JSON.parse(readFileSync(`${RUN}/result.json`, 'utf8'));

const GATE = result.config.gate_mm; // 1980

// 尺码 → 颜色：SIZE_PALETTE 锚点码 28 起 16 色循环（同码同色跨片型）
const SIZE_PALETTE = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf','#aec7e8','#ffbb78','#98df8a','#ff9896','#c5b0d5','#c49c94'];
const ANCHOR = 28;
const sizeColor = s => SIZE_PALETTE[((s - ANCHOR) % 16 + 16) % 16];

// Ramer–Douglas–Peucker 折线简化（闭合多边形按开折线处理，首尾点保留）
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const sqD = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const x = a[0] + t * dx - p[0], y = a[1] + t * dy - p[1];
    return x * x + y * y;
  };
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    let dmax = 0, idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = sqD(pts[k], pts[i], pts[j]);
      if (d > dmax) { dmax = d; idx = k; }
    }
    if (dmax > eps * eps) {
      keep[idx] = true;
      stack.push([i, idx], [idx, j]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const q = v => Math.round(v * 10) / 10; // 0.1mm 量化

// 基础裁片：简化轮廓 + bbox + 尺码色（S1 散落轮廓 / S3 矩阵缩略图用）
const pieceMap = new Map();
for (const p of piecesDoc.pieces) {
  const pts = rdp(p.polygon, 0.5).map(([x, y]) => [q(x), q(y)]);
  const xs = pts.map(p2 => p2[0]), ys = pts.map(p2 => p2[1]);
  pieceMap.set(p.pid, {
    label: p.label,
    size: p.size,
    color: sizeColor(p.size),
    pts: pts.map(p2 => p2.join(',')).join(' '),
    x0: q(Math.min(...xs)), y0: q(Math.min(...ys)),
    x1: q(Math.max(...xs)), y1: q(Math.max(...ys)),
  });
}

// 最终布局：119 片 placement，预算世界坐标 points 串（页面零运行时变换）
const placed = best.placed_items.map((it, i) => {
  const base = pieceMap.get(it.id);
  if (!base) throw new Error(`placed id 无对应裁片: ${it.id}`);
  const r = (it.rotation * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  const [tx, ty] = it.translation;
  const src = base.pts.split(' ').map(pr => pr.split(',').map(Number));
  const out = src.map(([x, y]) => `${q(x * c - y * s + tx)},${q(x * s + y * c + ty)}`).join(' ');
  return { i, pid: it.id, label: base.label, color: base.color, pts: out };
});

// 优化曲线：elapsed / phase / density / width（HUD 计数器逐帧重放）
const curveOut = curve.map(pt => ({
  t: +pt.elapsed.toFixed(3),
  d: +(pt.density * 100).toFixed(2),
  w: pt.width_mm,
  p: pt.phase,
}));

const stats = {
  nPieces: piecesDoc.n_pieces,
  nPlaced: best.n_placed,
  density: +(best.density * 100).toFixed(2),
  width: best.width_mm,
  elapsed: +best.elapsed.toFixed(1),
  gate: GATE,
  sizes: result.config.sizes,
  labels: [...new Set(piecesDoc.pieces.map(p => p.label))],
  docName: '5336#老六订单',
};

const js = `// vb-data.js —— 由 prep-data.mjs 生成（真实求解数据，勿手改）
export const GATE = ${GATE};
export const PIECES = ${JSON.stringify([...pieceMap.values()])};
export const PLACED = ${JSON.stringify(placed)};
export const CURVE = ${JSON.stringify(curveOut)};
export const STATS = ${JSON.stringify(stats)};
`;
writeFileSync(new URL('./vb-data.js', import.meta.url), js);
console.log(`pieces=${pieceMap.size} placed=${placed.length} curve=${curveOut.length} pts total=${placed.reduce((a, p) => a + p.pts.length, 0)}`);
console.log(`vb-data.js ${(js.length / 1024).toFixed(0)} KB`);
