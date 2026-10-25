// openings.js —— 26 开局真实坐标总表（唯一权威数据源：prompt.md §4）
// 坐标系：天元=(0,0)；+x 向右，+y 向上（屏幕方向）。黑1 恒为 (0,0)。
// 直指 白2=(0,1)；斜指 白2=(1,1)。每行黑3 = (dx,dy)。

export const DIRECT = [
  { n: 1,  name: '寒星', type: '间', dx: 0, dy: 2 },
  { n: 2,  name: '溪月', type: '桂', dx: 1, dy: 2 },
  { n: 3,  name: '疏星', type: '间', dx: 2, dy: 2 },
  { n: 4,  name: '花月', type: '连', dx: 1, dy: 1 },
  { n: 5,  name: '残月', type: '桂', dx: 2, dy: 1 },
  { n: 6,  name: '雨月', type: '连', dx: 1, dy: 0 },
  { n: 7,  name: '金星', type: '间', dx: 2, dy: 0 },
  { n: 8,  name: '松月', type: '连', dx: 0, dy: -1 },
  { n: 9,  name: '新月', type: '桂', dx: 2, dy: -1 },
  { n: 10, name: '丘月', type: '连', dx: 1, dy: -1 },
  { n: 11, name: '山月', type: '桂', dx: 1, dy: -2 },
  { n: 12, name: '游星', type: '间', dx: 2, dy: -2 },
  { n: 13, name: '瑞星', type: '间', dx: 0, dy: -2 },
];

export const INDIRECT = [
  { n: 1,  name: '长星', type: '间', dx: 2, dy: 2 },
  { n: 2,  name: '峡月', type: '桂', dx: 2, dy: 1 },
  { n: 3,  name: '恒星', type: '间', dx: 2, dy: 0 },
  { n: 4,  name: '水月', type: '桂', dx: 2, dy: -1 },
  { n: 5,  name: '流星', type: '间', dx: 2, dy: -2 },
  { n: 6,  name: '云月', type: '连', dx: 1, dy: 0 },
  { n: 7,  name: '浦月', type: '连', dx: 1, dy: -1 },
  { n: 8,  name: '岚月', type: '桂', dx: 1, dy: -2 },
  { n: 9,  name: '银月', type: '连', dx: 0, dy: -1 },
  { n: 10, name: '明星', type: '间', dx: 0, dy: -2 },
  { n: 11, name: '斜月', type: '连', dx: -1, dy: -1 },
  { n: 12, name: '名月', type: '桂', dx: -1, dy: -2 },
  { n: 13, name: '彗星', type: '间', dx: -2, dy: -2 },
];
