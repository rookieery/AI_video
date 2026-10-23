// shared.js —— 时间轴动画工具（纯函数，同一 t 恒定同一画面）
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const seg = (t, a, l) => clamp01((t - a) / l);        // [a, a+l] → 0..1
export const lerp = (a, b, x) => a + (b - a) * x;
export const outCubic = x => 1 - Math.pow(1 - x, 3);
export const inOutCubic = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const outQuint = x => 1 - Math.pow(1 - x, 5);
export const outBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// 确定性伪随机（同一 index 恒定同值 —— frame(t) 纯函数约束）
export const hash01 = i => {
  let h = (i * 2654435761) % 4294967296;
  h = (h ^ (h >>> 13)) * 3266489917 % 4294967296;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// 元素一次性绑定 + 帧驱动的便捷写法
export function el(tag, attrs, parent) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export const show = (node, on) => { node.style.display = on ? '' : 'none'; };
export const opacity = (node, v) => { node.style.opacity = v; };
