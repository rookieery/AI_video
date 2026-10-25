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
