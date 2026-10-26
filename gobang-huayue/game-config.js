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

export const PERIOD = 2.1;   // 每手时长（秒，v3 再加快）；game/film.html 的 iframe hash #t=0,N 需同步为 MOVES.length*PERIOD+END_DUR（12 手 + dust 退场 = 29.2）

/* —— v2.0 五连特效 + 退场（2026-10-26 用户选定：beam 光轨贯珠 + dust 星尘回流）—— */
export const WIN_AT = null;        // 取胜手（MOVES 下标，从 0 起）；null=自动检测五连珠（黑15 → 检出 y=0 横五连）
export const WIN_FX = 'beam';      // 五连特效：'beam' 光轨贯珠（选定）| 'const' 星座连线 | 'pulse' 脉冲悬浮（黑白异色：黑=冰青 / 白=暖金）
export const EXIT_MODE = 'dust';   // 退场：'dust' 星尘回流（选定）| 'arc' 逆序归位 | 'train' 连珠队形先行（盘面归空，棋子回取子台）
export const END_SEC = 0;          // 退场段时长（秒，0=按 EXIT_MODE 取默认 dust 4.0 / arc 4.6 / train 5.4）；film.html hash 需同步 25.2+END_DUR

/* —— v2.1 活三光轨（2026-10-26 新增）：连/跳活三被堵时在「堵点那一手」的 PERIOD 窗口内播光轨封光 ——
   跳三被堵缺口=双束两头汇聚、被堵端点=单束朝被堵方向；无逐子点火，0.26 起扫与飞子同拍、1.36 恰好被落子封光、
   2.02 前收净（总时长不变）。检测不分色，配色随三子方：黑=冰青 / 白=暖金（同五连语义）。 */
export const LIVE3_FX = 'beam';    // 活三特效：'beam' 光轨封光（选定）| null 关闭

/* —— v2.2 四三特效（2026-10-26 新增）：某手同时成「冲四 + 活三」（异轴）时，在成着手自己的窗口内播
   落子点三道小光波 + 双光轨自落子点分别向四/三方向迸发；配色随子方（黑=冰青 / 白=暖金，同活三）。
   成四三那手的活三光轨自动跳过（其三由本特效接管），v2.1 的 LIVE3_SKIP 手动机制已被自动抑制取代。 */
export const L43_FX = 'beam';      // 四三特效：'beam' 落子点光波+双束迸发（选定）| null 关闭
