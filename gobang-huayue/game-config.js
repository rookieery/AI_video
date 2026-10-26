// game-config.js —— 对弈动画配置（game.html 专用）：开场风格沿用 config.js，落子序列在此维护
// 坐标系同 prompt.md §4：天元(0,0)，+x 右，+y 上；c:'B' 黑棋 / 'W' 白棋
// 每手固定占 PERIOD 秒：0.1–0.3 蓄势 → 0.3–1.55 单段抛物线飞行 → 1.55 落子定格+最新子高亮 → 1.85–2.15 补子 → 收静
export * from './config.js';

export const MOVES = [
  { c: 'W', x: -1, y: 2 },   // 白4
  { c: 'B', x: 1, y: 0 },    // 黑5
];

export const PERIOD = 2.4;   // 每手时长（秒，v2 加快节奏）；game/film.html 的 iframe hash #t=0,N 需同步为 MOVES.length*PERIOD
