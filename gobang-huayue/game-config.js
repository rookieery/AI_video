// game-config.js —— 对弈动画配置（game.html 专用）：开场风格沿用 config.js，落子序列在此维护
// 坐标系同 prompt.md §4：天元(0,0)，+x 右，+y 上；c:'B' 黑棋 / 'W' 白棋
// 每手固定占 PERIOD 秒：0.09–0.26 蓄势 → 0.26–1.36 单段抛物线飞行（inCubic 先慢后快，蓄势悬停后加速落子）→ 1.36 落子定格+最新子高亮 → 1.62–1.88 补子 → 收静
export * from './config.js';

export const MOVES = [
  { c: 'W', x: -1, y: 2 },   // 白4
  { c: 'B', x: 1, y: 0 },    // 黑5
  { c: 'W', x: 2, y: 2 },    // 白6
  { c: 'B', x: 2, y: 0 },    // 黑7
  { c: 'W', x: 3, y: 0 },    // 白8
  { c: 'B', x: 0, y: 2 },    // 黑9
  { c: 'W', x: -1, y: 3 },    // 白10
  { c: 'B', x: 1, y: 3 },    // 黑11
  { c: 'W', x: 1, y: 2 },    // 白12
  { c: 'B', x: -2, y: 0 },    // 黑13
  { c: 'W', x: -1, y: 1 },    // 白14
  { c: 'B', x: -1, y: 0 },    // 黑15
];

export const PERIOD = 2.1;   // 每手时长（秒，v3 再加快）；game/film.html 的 iframe hash #t=0,N 需同步为 MOVES.length*PERIOD（12 手 = 25.2）
