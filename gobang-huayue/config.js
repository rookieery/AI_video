// config.js —— 后续视频换开局仅改此处（prompt.md §9）
// set: 'direct' 直指 / 'indirect' 斜指；index: 0–12（表内第 n 局 → index = n-1）
// S4 保留卡、S5 定格卡、S6 三子坐标将自动查 openings.js 切换。
export const SELECTED = { set: 'direct', index: 3 }; // 直指第4局：花月

// 视觉风格：'gold' 暗金原版 | 'a' 霓虹棋谱 | 'b' 夜城全息 | 'c' 全息终端
export const STYLE = 'a';

// 书封风格（v1.2 书封重制）：'seal' 能量封印 | 'holo' 全息投影 | 'circuit' 玻璃刻印
export const BOOK_STYLE = 'seal';

// 书→26卡 转场机制（v1.3 重构）：'helix' 双螺旋星门（现行） | 'fountain' 星屑喷泉 | 'ripple' 涟漪点将 | 'pillar' 白金光柱（v1.2 基线）
export const TRANSITION = 'helix';

// S4 淘汰机制（v1.5 重构，待确认）：'hole' 粉盘黑洞（现行基线） | 'taiji' 太极归一 | 'singularity' 全息坍缩 | 'ring' 星环收束
export const ELIM_MODE = 'taiji';

// S6.5 尾声棋盒（v1.7 定稿 'holo'）：'capsule' 悬浮能量舱 | 'jar' 霓虹棋罐 | 'holo' 全息取子台 | 'none' 无棋盒
export const BOWL_MODE = 'holo';

// v2.0 开场字幕（待确认）——书名「五子棋开局大全」位置：
// 'inner' 封面扉页（翻开在内侧揭示，微调 S1–S3 节拍：翻开提前+书多停留）| 'top' 封面顶部小字（零时序改动）| 'none'
export const TITLE_MODE = 'inner';

// 书名/太极开局名 字体效果：'solid' 实心霓虹 | 'hollow' 空心描边 | 'scan' 扫描线
export const TITLE_FX = 'scan';
export const TAIJI_NAME_FX = 'solid';

// 太极开局名（如「花月」）排布：'arc' 沿内圈上方弧排（环形铭文）| 'flat' 水平并排于带区下部
export const TAIJI_NAME_LAYOUT = 'arc';
