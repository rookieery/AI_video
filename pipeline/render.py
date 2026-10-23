# -*- coding: utf-8 -*-
"""逐帧渲染器：暗调电影感科普动画《拼命，是最好的投资吗？》
用法:
  python render.py preview 3 36 56 116 131.5   # 渲染样张到 output/preview/
  python render.py video                        # 全片渲染 → output/draft.mp4
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import timeline as TL

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")

# ── 调色板 ─────────────────────────────────────────────
GOLD      = (216, 179, 106)   # 主金
GOLD_HI   = (232, 201, 106)   # 高亮金
GOLD_DEEP = (154, 120, 62)    # 暗金
IVORY     = (233, 226, 211)   # 象牙白字幕
QUOTE_C   = (200, 192, 176)   # 引用灰白
GRAY_C    = (138, 133, 120)   # 图表灰
RED_DARK  = (158, 59, 52)     # 断崖红
BG_C      = (22, 18, 14)      # 背景中心
BG_EDGE   = (5, 4, 3)         # 背景边缘

_font_path_cache = {}
def _font_path(weight):
    """返回可成功加载的字体路径；按字重就近回退。"""
    if weight in _font_path_cache:
        return _font_path_cache[weight]
    order = {"Heavy": ["Heavy", "Bold", "Regular"],
             "Bold":  ["Bold", "Heavy", "Regular"],
             "Regular": ["Regular", "Bold", "Heavy"]}[weight]
    for w in order:
        p = os.path.join(FONT_DIR, f"SourceHanSerifCN-{w}.otf")
        if os.path.exists(p) and os.path.getsize(p) > 5_000_000:
            try:
                ImageFont.truetype(p, 24).getbbox("测")  # 试加载
                _font_path_cache[weight] = p
                return p
            except Exception:
                continue
    raise RuntimeError(f"无可用字体: {FONT_DIR}")

_fonts = {}
def font(weight, size, S):
    key = (weight, size, S)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(_font_path(weight), int(size * S))
    return _fonts[key]

# ── 缓存背景（径向渐变 + 暗角） ─────────────────────────
_bg_cache = {}
def background(S):
    if S in _bg_cache:
        return _bg_cache[S]
    W, H = TL.W * S, TL.H * S
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = 0.52 * W, 0.46 * H
    d = np.sqrt(((xx - cx) / W) ** 2 + ((yy - cy) / H) ** 2)
    d = np.clip(d / d.max(), 0, 1) ** 1.6
    c0, c1 = np.array(BG_C, float), np.array(BG_EDGE, float)
    img = (c0[None, None] * (1 - d[..., None]) + c1[None, None] * d[..., None]).astype(np.uint8)
    # 暗角
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    vig = 1 - 0.42 * np.clip(r - 0.55, 0, 1) ** 1.8
    img = (img * vig[..., None]).astype(np.uint8)
    _bg_cache[S] = Image.fromarray(img, "RGB")
    return _bg_cache[S]

# ── 星尘粒子（确定性） ─────────────────────────────────
_stars = None
def stars(S):
    global _stars
    if _stars is None:
        rng = np.random.default_rng(7)
        n = 120
        _stars = [(rng.uniform(0.02, 0.98), rng.uniform(0.03, 0.92),
                   rng.uniform(0.6, 2.0) * S, rng.uniform(0, 2 * math.pi),
                   rng.uniform(0.15, 0.55)) for _ in range(n)]
    return _stars

def draw_particles(layer, t, S):
    d = ImageDraw.Draw(layer, "RGBA")
    for fx, fy, r, ph, sp in stars(S):
        x = fx * TL.W * S + math.sin(t * 0.13 + ph) * 6 * S
        y = fy * TL.H * S + math.cos(t * 0.09 + ph) * 4 * S
        a = int(70 + 60 * math.sin(t * sp + ph))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(232, 201, 106, max(20, a)))

# ── 硬币 ───────────────────────────────────────────────
_coin_face = {}
def coin_face(S):
    """预渲染硬币正面（含 ¥），尺寸 ~300 逻辑像素。"""
    if S in _coin_face:
        return _coin_face[S]
    size = int(300 * S)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    cx = size / 2
    # 币体：同心椭圆营造金属感
    for i, frac in enumerate(np.linspace(1.0, 0.62, 14)):
        t = i / 13
        col = (int(154 + 60 * (1 - t)), int(120 + 66 * (1 - t)), int(62 + 44 * (1 - t)), 255)
        r = size * 0.48 * frac
        d.ellipse([cx - r, cx - r, cx + r, cx + r], fill=col)
    # 内圈压线
    r = size * 0.40
    d.ellipse([cx - r, cx - r, cx + r, cx + r], outline=(120, 92, 48, 255), width=max(1, int(2 * S)))
    # ¥ 符号
    f = font("Bold", 118, S)
    bbox = d.textbbox((0, 0), "¥", font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], cx - th / 2 - bbox[1] - 2 * S), "¥", font=f,
           fill=(240, 212, 136, 255))
    _coin_face[S] = img
    return img

def draw_coin(layer, cx, cy, dia, squash, angle, S, glow=False):
    """squash∈(0,1] 水平压缩模拟旋转; dia=直径(逻辑px)。"""
    face = coin_face(S)
    if glow:
        halo = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        hd = ImageDraw.Draw(halo)
        r = dia / 2 * S
        hd.ellipse([cx - r * 1.25, cy - r * 1.25, cx + r * 1.25, cy + r * 1.25],
                   fill=(216, 179, 106, 46))
        halo = halo.filter(ImageFilter.GaussianBlur(18 * S))
        layer.alpha_composite(halo)
    d = ImageDraw.Draw(layer, "RGBA")
    w = int(300 * S * (dia / 300) * max(squash, 0.06))
    h = int(300 * S * (dia / 300))
    # 侧棱（薄侧面）
    if squash < 0.55:
        d.ellipse([cx - w / 2, cy - h / 2 - 5 * S, cx + w / 2, cy + h / 2 + 5 * S],
                  fill=(108, 82, 44, 255))
    rotated = face.resize((max(w, 2), h), Image.LANCZOS)
    if angle:
        rotated = rotated.rotate(angle, expand=True,
                                 resample=Image.BICUBIC)
    layer.alpha_composite(rotated, (int(cx - rotated.width / 2), int(cy - rotated.height / 2)))

def draw_dashed_ring(layer, cx, cy, rx, ry, t, S, color=GOLD, width=2):
    d = ImageDraw.Draw(layer, "RGBA")
    seg = 40
    for i in range(seg):
        a0 = 2 * math.pi * i / seg + t * 0.2
        a1 = a0 + 2 * math.pi / seg * 0.55
        d.arc([cx - rx, cy - ry, cx + rx, cy + ry], math.degrees(a0), math.degrees(a1),
              fill=color + (150,), width=max(1, int(width * S)))

# ── 字幕系统：逐字浮现 + 金色高亮 ───────────────────────
CHAR_GAP, CHAR_FADE, OUT_FADE, RISE = 0.085, 0.13, 0.38, 10

def _style_chars(text):
    """返回 [(ch, style)] style∈ivory|gold|quote"""
    gold_spans = [(text.find(g), text.find(g) + len(g)) for g in TL.GOLD.get(text, []) if text.find(g) >= 0]
    out = []
    q_open = False
    for i, ch in enumerate(text):
        if ch in "「『":
            q_open = True
        style = "ivory"
        if any(s <= i < e for s, e in gold_spans):
            style = "gold"
        elif q_open:
            style = "quote"
        out.append((ch, style))
        if ch in "」』":
            q_open = False
    return out

def draw_subtitle(layer, t, S):
    for (t0, t1, text) in TL.SUBS:
        if not (t0 <= t < t1 + OUT_FADE):
            continue
        chars = _style_chars(text)
        size = 46 * (0.94 if text.startswith("「") and text.endswith("」") else 1.0)
        f = font("Bold", size, S)
        # 排版（自动换行，逻辑宽 1120）
        maxw = 1120 * S
        lines, cur, curw = [], [], 0
        for ch, st in chars:
            w = f.getlength(ch)
            if cur and curw + w > maxw:
                lines.append(cur); cur, curw = [], 0
            cur.append((ch, st)); curw += w
        lines.append(cur)
        # 整体淡出
        alpha = 1.0 if t < t1 else 1 - (t - t1) / OUT_FADE
        base_y = (TL.H - 96 - (len(lines) - 1) * 64) * S
        glow_layer = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_layer)
        y = base_y
        n_before = 0
        for line in lines:
            total = sum(f.getlength(c) for c, _ in line)
            x = TL.W * S / 2 - total / 2
            for idx, (ch, st) in enumerate(line):
                gi = n_before + idx
                prog = (t - t0 - gi * CHAR_GAP) / CHAR_FADE
                if prog > 0:
                    prog = min(1.0, prog)
                    ease = 1 - (1 - prog) ** 2
                    dy = (1 - ease) * RISE * S
                    a = int(255 * ease * alpha)
                    col = {"ivory": IVORY, "gold": GOLD_HI, "quote": QUOTE_C}[st]
                    if st == "gold":
                        gd.text((x, y + dy), ch, font=f, fill=col + (a,))
                        sh = Image.new("RGBA", layer.size, (0, 0, 0, 0))
                        ImageDraw.Draw(sh).text((x, y + dy), ch, font=f, fill=col + (a,))
                        glow_layer.alpha_composite(sh)
                    else:
                        d = ImageDraw.Draw(layer, "RGBA")
                        d.text((x, y + dy), ch, font=f, fill=col + (a,))
                x += f.getlength(ch)
            y += 64 * S
            n_before += len(line)
        blur = glow_layer.filter(ImageFilter.GaussianBlur(7 * S))
        layer.alpha_composite(blur)
        layer.alpha_composite(glow_layer)
        break  # 同一时刻只显示一句

# ── 年份章节卡 ─────────────────────────────────────────
def _gradient_text(img_size, mask, top, bottom):
    g = np.linspace(0, 1, img_size[1])[:, None, None]
    arr = (np.array(top, float) * (1 - g) + np.array(bottom, float) * g).astype(np.uint8)
    grad = Image.fromarray(np.repeat(arr, img_size[0], axis=1), "RGB").convert("RGBA")
    grad.putalpha(mask.split()[3])
    return grad

def draw_year_card(layer, t, S):
    for (year, sub, t0, t1) in TL.CHAPTERS:
        if not (t0 <= t < t1):
            continue
        BIG_DUR = 5.2
        if t < t0 + BIG_DUR:
            a = min(1.0, (t - t0) / 0.8) * min(1.0, max(0.0, (t0 + BIG_DUR - t) / 0.5))
            # 大年份：金属渐变
            f = font("Heavy", 210, S)
            tmp = Image.new("RGBA", layer.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(tmp)
            bbox = d.textbbox((0, 0), year, font=f)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            x, y = TL.W * S / 2 - tw / 2, 168 * S - th / 2
            mask = Image.new("RGBA", layer.size, (0, 0, 0, 0))
            md = ImageDraw.Draw(mask)
            md.text((x, y), year, font=f, fill=(255, 255, 255, int(255 * a)))
            grad = _gradient_text(layer.size, mask, (242, 223, 160), (158, 120, 60))
            layer.alpha_composite(grad)
            # 副标题 + 展开金线
            fs = font("Regular", 40, S)
            sw = fs.getlength(sub)
            d2 = ImageDraw.Draw(layer, "RGBA")
            ya = min(1.0, (t - t0 - 0.4) / 0.8)
            if ya > 0:
                d2.text((TL.W * S / 2 - sw / 2, 330 * S), sub, font=fs,
                        fill=IVORY + (int(200 * a * ya),))
                lw = int(560 * S * ya)
                d2.line([(TL.W * S / 2 - lw / 2, 392 * S), (TL.W * S / 2 + lw / 2, 392 * S)],
                        fill=GOLD + (int(160 * a * ya),), width=max(1, int(1.5 * S)))
        else:
            # 角落小标签
            fade_out = max(0.0, min(1.0, (t1 - t) / 0.4)) * min(1.0, (t - (t0 + BIG_DUR)) / 0.5)
            f = font("Heavy", 34, S)
            d = ImageDraw.Draw(layer, "RGBA")
            a = int(210 * fade_out)
            d.text((48 * S, 40 * S), year, font=f, fill=GOLD + (a,))
            f2 = font("Regular", 22, S)
            d.text((48 * S, 86 * S), sub, font=f2, fill=GRAY_C + (int(180 * fade_out),))
            d.line([(48 * S, 120 * S), (150 * S, 120 * S)], fill=GOLD_DEEP + (int(150 * fade_out),),
                   width=max(1, int(1 * S)))
        break

# ── 通用图表工具 ───────────────────────────────────────
def _map_x(v, x0, x1, lo, hi):  # 值→像素
    return x0 + (v - lo) / (hi - lo) * (x1 - x0)

def draw_axes(layer, box, xt, yt, S, x_labels, y_labels):
    """box=(x0,y0,x1,y1)逻辑; xt/yt=(min,max) 值域; 画轴+刻度标签"""
    d = ImageDraw.Draw(layer, "RGBA")
    x0, y0, x1, y1 = [v * S for v in box]
    d.line([(x0, y1), (x1, y1)], fill=GOLD_DEEP + (190,), width=max(1, int(1.6 * S)))
    d.line([(x0, y0), (x0, y1)], fill=GOLD_DEEP + (190,), width=max(1, int(1.6 * S)))
    f = font("Regular", 22, S)
    lo, hi = xt
    for v, lab in x_labels:
        x = _map_x(v, x0, x1, lo, hi)
        d.line([(x, y1), (x, y1 + 5 * S)], fill=GOLD_DEEP + (190,), width=max(1, int(1.2 * S)))
        w = f.getlength(lab)
        d.text((x - w / 2, y1 + 8 * S), lab, font=f, fill=GRAY_C + (210,))
    lo, hi = yt
    for v, lab in y_labels:
        y = _map_x(v, y1, y0, lo, hi)  # y 反向
        d.line([(x0 - 5 * S, y), (x0, y)], fill=GOLD_DEEP + (190,), width=max(1, int(1.2 * S)))
        w = f.getlength(lab)
        d.text((x0 - 12 * S - w, y - 13 * S), lab, font=f, fill=GRAY_C + (210,))
    # 网格
    for v, _ in y_labels:
        y = _map_x(v, y1, y0, lo, hi)
        d.line([(x0, y), (x1, y)], fill=GOLD_DEEP + (38,), width=1)

def _pts_pix(pts, box, xt, yt, S):
    x0, y0, x1, y1 = [v * S for v in box]
    return [(_map_x(vx, x0, x1, *xt), _map_x(vy, y1, y0, *yt)) for vx, vy in pts]

def draw_polyline_reveal(layer, pts, frac, color, width=3, glow=True, dash=None):
    """按累计长度比例绘制折线；frac∈[0,1]。dash=间隔则虚线。"""
    total = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    limit = total * frac
    segs, acc, cur_seg = [], 0.0, [pts[0]]
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        L = math.dist(a, b)
        if acc + L <= limit:
            cur_seg.append(b); acc += L
        else:
            r = (limit - acc) / L
            if r > 0:
                p = (a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r)
                cur_seg.append(p)
            segs.append(cur_seg); break
    else:
        segs.append(cur_seg)
    if glow:
        gl = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(gl)
        for seg in segs:
            if len(seg) > 1:
                gd.line(seg, fill=color + (110,), width=int(width * 2.6))
        layer.alpha_composite(gl.filter(ImageFilter.GaussianBlur(5)))
    d = ImageDraw.Draw(layer, "RGBA")
    for seg in segs:
        if len(seg) > 1:
            d.line(seg, fill=color + (235,), width=int(width))
    if 0 < frac < 1 and segs:
        hx, hy = segs[-1][-1]
        d.ellipse([hx - 5, hy - 5, hx + 5, hy + 5], fill=(255, 240, 200, 235))

def ease(p):  # 平滑缓动
    return 0 if p <= 0 else 1 if p >= 1 else 1 - (1 - p) ** 3

def fade_alpha(t, t0, t1, fi=0.6, fo=0.6):
    if t < t0 or t > t1: return 0.0
    vals = [1.0, (t - t0) / fi if fi > 0 else 1.0]
    if fo > 0:
        vals.append((t1 - t) / fo)
    return min(*vals)

# ── 场景 ───────────────────────────────────────────────
def scene_hook(layer, t, S):
    cx, cy = 810 * S, 320 * S
    squash = abs(math.cos(t * 1.15))
    dia = 250 + 10 * math.sin(t * 0.8)
    draw_dashed_ring(layer, cx, cy + 170 * S, 170 * S, 46 * S, t, S)
    draw_coin(layer, cx, cy + math.sin(t * 1.4) * 10 * S, dia, squash, 0, S, glow=True)

def scene_stat213(layer, t, S):  # 21.3% 失业率数字卡（年份大卡淡出后再登场）
    a = fade_alpha(t, 55.6, 58.6)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    f = font("Heavy", 120, S)
    txt = "21.3%"
    bbox = d.textbbox((0, 0), txt, font=f)
    w = bbox[2] - bbox[0]
    cx = TL.W * S / 2
    d.text((cx - w / 2, 225 * S), txt, font=f, fill=RED_DARK + (int(255 * a),))
    f2 = font("Regular", 28, S)
    lab = "16–24岁 · 城镇调查失业率（2023.6 峰值）"
    w2 = f2.getlength(lab)
    d.text((cx - w2 / 2, 385 * S), lab, font=f2, fill=(205, 198, 182, int(235 * a)))
    layer.alpha_composite(lay)

def scene_coins_house(layer, t, S):
    box = (300, 150, 980, 470)
    d = ImageDraw.Draw(layer, "RGBA")
    # 阶段1：硬币堆
    if t < 26.5:
        n = int(ease((t - 14.4) / 6.5) * 8)
        for i in range(n):
            wob = 12 * math.sin(i * 1.7)
            draw_coin(layer, (560 + wob) * S, (430 - i * 34) * S, 150, 1.0, 0, S)
    # 阶段2：房子剪影（金色线稿自描）+ 硬币淡出
    a = fade_alpha(t, 21.8, 30.4, fi=1.2, fo=0.5)
    if a > 0:
        lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        x0, y0 = 640 * S, 200 * S
        w, h = 300 * S, 200 * S
        outline = [(x0, y0 + h * 0.45), (x0 + w / 2, y0), (x0 + w, y0 + h * 0.45),
                   (x0 + w, y0 + h), (x0, y0 + h), (x0, y0 + h * 0.45)]
        door = [(x0 + w * 0.38, y0 + h), (x0 + w * 0.38, y0 + h * 0.62),
                (x0 + w * 0.62, y0 + h * 0.62), (x0 + w * 0.62, y0 + h)]
        draw_polyline_reveal(lay, outline, ease((t - 21.8) / 3.2), GOLD, 3, glow=True)
        if t > 25.0:
            aa = min(1.0, (t - 25.0) / 2.0)
            ld.line(door, fill=GOLD_DEEP + (int(200 * aa),), width=int(2 * S))
        layer.alpha_composite(lay)

def scene_cliff(layer, t, S):
    t0, t1 = TL.SCENE["cliff_chart"]
    a = fade_alpha(t, t0, t1, fi=0.5, fo=0.5)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    box = (280, 140, 1000, 460)
    draw_axes(lay, box, (2015, 2024), (0, 4.5), S,
              x_labels=[(2015, "2015"), (2018, "2018"), (2021, "2021"), (2024, "2024")],
              y_labels=[(1, "1万"), (2, "2万"), (3, "3万"), (4, "4万")])
    pts = [(2015, 1.2), (2016, 1.8), (2017, 3.0), (2018, 3.2), (2019, 3.4),
           (2020, 3.8), (2021, 4.0), (2022, 2.8), (2023, 1.8), (2024, 1.2)]
    pix = _pts_pix(pts, box, (2015, 2024), (0, 4.5), S)
    n = len(pts)
    rise_done = ease((t - 31.2) / 6.2)       # 上涨段
    fall_done = ease((t - 38.6) / 3.4)       # 断崖段
    draw_polyline_reveal(lay, pix[:7], rise_done, GOLD, 3)
    if fall_done > 0:
        draw_polyline_reveal(lay, pix[6:], fall_done, RED_DARK, 4, glow=True)
        d = ImageDraw.Draw(lay)
        # 买入价虚线
        ybuy = _map_x(4.0, box[3] * S, box[1] * S, 0, 4.5)
        x0 = box[0] * S
        for sx in range(int(x0), int(box[2] * S), int(18 * S)):
            d.line([(sx, ybuy), (sx + 9 * S, ybuy)], fill=GOLD_DEEP + (140,), width=1)
        f = font("Bold", 26, S)
        peak, bottom = pix[6], pix[-1]
        if t > 40.2:
            d.ellipse([peak[0] - 6, peak[1] - 6, peak[0] + 6, peak[1] + 6], fill=GOLD_HI + (240,))
            d.text((peak[0] - 30 * S, peak[1] - 44 * S), "4万/平", font=f, fill=GOLD_HI + (240,))
        if t > 41.4:
            d.ellipse([bottom[0] - 6, bottom[1] - 6, bottom[0] + 6, bottom[1] + 6], fill=RED_DARK + (240,))
            d.text((bottom[0] - 60 * S, bottom[1] - 44 * S), "1.2万/平", font=f, fill=RED_DARK + (240,))
    layer.alpha_composite(lay)

def scene_neon(layer, t, S):
    a = fade_alpha(t, 58.8, 70.6, fi=0.8, fo=0.3)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx, cy = TL.W * S / 2, 300 * S
    # 招牌底板
    bw, bh = 520 * S, 180 * S
    d.rounded_rectangle([cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2], radius=18 * S,
                        outline=GOLD_DEEP + (int(220 * a),), width=int(3 * S))
    # 霓虹闪烁
    flicker = 0.75 + 0.25 * math.sin(t * 6) * math.sin(t * 2.3)
    if t > 69.6:  # 熄灭前闪烁
        flicker *= 0.4 + 0.6 * abs(math.sin(t * 18))
    txt = "创业 · 奶茶店"
    f = font("Heavy", 64, S)
    w = f.getlength(txt)
    col = (255, 226, 150, int(255 * a * flicker))
    for off in range(4):
        gl = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).text((cx - w / 2, cy - 52 * S), txt, font=f, fill=col)
        blurred = gl.filter(ImageFilter.GaussianBlur((5 + off * 4) * S))
        lay.alpha_composite(blurred)
        lay.alpha_composite(blurred)  # 叠一层增强辉光
    d.text((cx - w / 2, cy - 52 * S), txt, font=f, fill=(250, 238, 200, int(255 * a * flicker)))
    layer.alpha_composite(lay)

def scene_shutter(layer, t, S):
    a = fade_alpha(t, 70.8, 79.0, fi=0.4, fo=0.3)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx = TL.W * S / 2
    # ── 招牌（熄灭中）──
    bw, bh = 440 * S, 110 * S
    sy0, sy1 = 216 * S, 326 * S
    d.rounded_rectangle([cx - bw / 2, sy0, cx + bw / 2, sy1], radius=14 * S,
                        outline=(90, 82, 66, int(220 * a)), width=int(3 * S))
    f0 = font("Heavy", 52, S)
    txt0 = "创业 · 奶茶店"
    w0 = f0.getlength(txt0)
    dim = 0.35 + 0.15 * abs(math.sin(t * 2))  # 渐暗余晖
    d.text((cx - w0 / 2, sy0 + 24 * S), txt0, font=f0,
           fill=(200, 178, 130, int(255 * a * dim)))
    # ── 店门开口 + 卷帘门下落 ──
    ox0, ox1 = 500 * S, 780 * S
    oy0, oy1 = 350 * S, 505 * S
    d.rectangle([ox0, oy0, ox1, oy1], fill=(10, 9, 7, int(200 * a)),
                outline=(96, 88, 72, int(220 * a)), width=int(2.5 * S))
    p = ease((t - 72.8) / 3.8)
    if p > 0:
        sh_b = oy0 + (oy1 - oy0) * p
        i = 0
        yy = oy0
        while yy < sh_b:
            shade = 66 + (i % 2) * 13
            d.line([(ox0 + 5 * S, yy + 7 * S), (ox1 - 5 * S, yy + 7 * S)],
                   fill=(shade, shade - 7, shade - 13, int(235 * a)), width=int(6 * S))
            yy += 15 * S
            i += 1
        # 卷帘底缘
        d.line([(ox0, sh_b), (ox1, sh_b)], fill=GOLD_DEEP + (int(190 * a),), width=int(3 * S))
    # ── 计数滚动（顶部）──
    cnt = int(ease((t - 74.8) / 3.0) * 197000)
    f = font("Heavy", 96, S)
    txt = f"{cnt:,}"
    w = f.getlength(txt)
    ya = ease((t - 74.6) / 0.8)
    d.text((TL.W * S / 2 - w / 2, 66 * S), txt, font=f,
           fill=(240, 214, 138, int(255 * a * ya)))
    f2 = font("Regular", 26, S)
    lab = "家奶茶店 · 一年内闭店"
    w2 = f2.getlength(lab)
    d.text((TL.W * S / 2 - w2 / 2, 176 * S), lab, font=f2,
           fill=(205, 198, 182, int(230 * a * ya)))
    layer.alpha_composite(lay)

def scene_hourglass(layer, t, S):
    a = fade_alpha(t, 79.2, 96.5, fi=0.6, fo=0.5)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx, cy = 810 * S, 300 * S
    w, h = 200 * S, 320 * S
    # 沙漏轮廓
    frame = [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx, cy),
             (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2), (cx, cy),
             (cx - w / 2, cy - h / 2)]
    draw_polyline_reveal(lay, frame, ease((t - 79.2) / 2.0), GOLD_DEEP, 2, glow=False)
    d.line([(cx - w / 2 - 20 * S, cy - h / 2), (cx + w / 2 + 20 * S, cy - h / 2)], fill=GOLD_DEEP + (200,), width=int(3 * S))
    d.line([(cx - w / 2 - 20 * S, cy + h / 2), (cx + w / 2 + 20 * S, cy + h / 2)], fill=GOLD_DEEP + (200,), width=int(3 * S))
    # 硬币下落 + 堆积
    n_total = int(ease((t - 81.5) / 12.0) * 14)
    for i in range(n_total):
        ph = (t * 0.9 + i * 0.47) % 1.0
        if i == n_total - 1:  # 最新一枚下落中
            yy = cy - h / 2 + 40 * S + ph * (h - 80 * S)
            wob = math.sin(ph * 9 + i) * 18 * S
            draw_coin(lay, cx + wob, yy, 56, 0.45, 0, S)
        else:  # 堆底
            row, col = divmod(i, 4)
            draw_coin(lay, cx - 54 * S + col * 36 * S, cy + h / 2 - 26 * S - row * 26 * S,
                      56, 0.45, 0, S)
    layer.alpha_composite(lay)

def scene_dual(layer, t, S):
    t0, t1 = TL.SCENE["dual_chart"]
    a = fade_alpha(t, t0, t1, fi=0.5, fo=0.5)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    box = (250, 150, 950, 455)
    draw_axes(lay, box, (2019, 2026), (0, 100), S,
              x_labels=[(2019, "2019"), (2021, "2021"), (2023, "2023"), (2026, "2026")],
              y_labels=[(30, "30万"), (60, "60万"), (90, "90万")])
    d = ImageDraw.Draw(lay)
    buyer = [(2019, 20), (2020, 55), (2021, 90), (2022, 58), (2023, 34), (2024, 20), (2025, 15), (2026, 13)]
    saver = [(2019, 10), (2020, 15), (2021, 22), (2022, 34), (2023, 48), (2024, 64), (2025, 76), (2026, 90)]
    pb = _pts_pix(buyer, box, (2019, 2026), (0, 100), S)
    ps = _pts_pix(saver, box, (2019, 2026), (0, 100), S)
    g1 = ease((t - 102.5) / 6.5)
    g2 = ease((t - 110.5) / 6.5)
    if g1 > 0:
        draw_polyline_reveal(lay, pb, g1, GRAY_C, 2.5)
        if t > 108.2:
            f = font("Bold", 26, S)
            d.text((pb[4][0] - 170 * S, pb[4][1] + 22 * S), "杠杆买房者", font=f, fill=GRAY_C + (230,))
    if g2 > 0:
        draw_polyline_reveal(lay, ps, g2, GOLD, 3)
        if t > 116.8:
            f = font("Bold", 26, S)
            d.text((ps[-1][0] - 150 * S, ps[-1][1] - 40 * S), "躺平攒钱者", font=f, fill=GOLD_HI + (240,))
    # 2021 交叉竖线
    if t > 108.2:
        xx = _map_x(2021, box[0] * S, box[2] * S, 2019, 2026)
        for sy in range(int(box[1] * S), int(box[3] * S), int(16 * S)):
            d.line([(xx, sy), (xx, sy + 8 * S)], fill=GOLD_DEEP + (110,), width=1)
    layer.alpha_composite(lay)

def scene_jar(layer, t, S):
    a = fade_alpha(t, 104.6, 128.7, fi=0.5, fo=0.4)
    if a <= 0: return
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx, cy = 1090 * S, 330 * S
    # 存钱罐（线稿罐子）
    bw, bh = 150 * S, 190 * S
    outline = [(cx - bw / 2, cy - bh / 2 + 30 * S), (cx - bw / 2, cy + bh / 2),
               (cx + bw / 2, cy + bh / 2), (cx + bw / 2, cy - bh / 2 + 30 * S)]
    for seg in [(outline[0], outline[1]), (outline[2], outline[3])]:
        d.line(seg, fill=GOLD_DEEP + (int(230 * a),), width=int(2.5 * S))
    d.arc([cx - bw / 2, cy + bh / 2 - 70 * S, cx + bw / 2, cy + bh / 2 + 70 * S], 0, 180,
          fill=GOLD_DEEP + (int(230 * a),), width=int(2.5 * S))
    d.rounded_rectangle([cx - bw / 2 - 14 * S, cy - bh / 2, cx + bw / 2 + 14 * S, cy - bh / 2 + 34 * S],
                        radius=8 * S, outline=GOLD + (int(230 * a),), width=int(2.5 * S))
    d.ellipse([cx - 16 * S, cy - bh / 2 + 2 * S, cx + 16 * S, cy - bh / 2 + 22 * S],
              outline=(0, 0, 0, int(200 * a)), width=int(3 * S))  # 投币口
    # 落币
    n_total = int(ease((t - 106.0) / 18.0) * 9)
    for i in range(n_total):
        ph = (t * 0.55 + i * 0.31) % 1.0
        if i == n_total - 1:
            yy = 120 * S + ph * (cy + bh / 2 - 60 * S - 120 * S)
            draw_coin(lay, cx + math.sin(ph * 7) * 10 * S, yy, 46, 0.5, 0, S)
        else:
            row, col = divmod(i, 3)
            draw_coin(lay, cx - 30 * S + col * 30 * S, cy + bh / 2 - 24 * S - row * 24 * S,
                      46, 0.5, 0, S)
    layer.alpha_composite(lay)

def scene_ending(layer, t, S):
    t0 = 128.8
    lay = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    cx, cy = TL.W * S / 2, 300 * S
    # 罐子淡入
    a = fade_alpha(t, t0, 141.0, fi=0.8, fo=0.0)
    if a > 0:
        d = ImageDraw.Draw(lay)
        bw, bh = 240 * S, 300 * S
        d.rounded_rectangle([cx - bw / 2 - 20 * S, cy - bh / 2, cx + bw / 2 + 20 * S, cy - bh / 2 + 46 * S],
                            radius=10 * S, outline=GOLD + (int(235 * a),), width=int(3 * S))
        for seg in [((cx - bw / 2, cy - bh / 2 + 40 * S), (cx - bw / 2, cy + bh / 2)),
                    ((cx + bw / 2, cy - bh / 2 + 40 * S), (cx + bw / 2, cy + bh / 2))]:
            d.line(seg, fill=GOLD_DEEP + (int(235 * a),), width=int(3 * S))
        d.arc([cx - bw / 2, cy + bh / 2 - 100 * S, cx + bw / 2, cy + bh / 2 + 100 * S], 0, 180,
              fill=GOLD_DEEP + (int(235 * a),), width=int(3 * S))
        d.ellipse([cx - 22 * S, cy - bh / 2 + 8 * S, cx + 22 * S, cy - bh / 2 + 30 * S],
                  outline=(0, 0, 0, int(140 * a)), width=int(2.5 * S))
    # 硬币下落→躺平（正面朝上）
    p = ease((t - t0) / 2.6)
    if 0 < p < 1:
        yy = 60 * S + p * (cy + bh / 2 - 130 * S - 60 * S)
        draw_coin(lay, cx, yy, 120, 0.5, 0, S)
    elif p >= 1:
        # 躺平：正面完全朝上 + 光晕
        bloom = min(1.0, (t - t0 - 2.6) / 1.2)
        if bloom > 0:
            gl = Image.new("RGBA", layer.size, (0, 0, 0, 0))
            ImageDraw.Draw(gl).ellipse([cx - 220 * S, cy + bh / 2 - 220 * S,
                                        cx + 220 * S, cy + bh / 2 + 60 * S],
                                       fill=GOLD + (int(60 * bloom),))
            lay.alpha_composite(gl.filter(ImageFilter.GaussianBlur(30 * S)))
        draw_coin(lay, cx, cy + bh / 2 - 60 * S, 120, 1.0, 0, S, glow=True)
    layer.alpha_composite(lay)

# ── 合成一帧 ───────────────────────────────────────────
def render_frame(t, S=2, frame_idx=0):
    base = background(S).convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw_particles(layer, t, S)

    def run(name, fn):
        t0, t1 = TL.SCENE[name]
        if t0 <= t <= t1:
            fn(layer, t, S)

    run("coin_hook", scene_hook)
    run("coins_house", scene_coins_house)
    if 53.8 <= t <= 58.6:
        scene_stat213(layer, t, S)
    run("cliff_chart", scene_cliff)
    run("neon_sign", scene_neon)
    run("shutter", scene_shutter)
    run("hourglass", scene_hourglass)
    run("dual_chart", scene_dual)
    run("jar_coins", scene_jar)
    run("ending", scene_ending)

    draw_year_card(layer, t, S)
    out = Image.alpha_composite(base, layer)
    draw_subtitle(out, t, S)

    # 胶片颗粒
    arr = np.asarray(out.convert("RGB"), dtype=np.int16)
    rng = np.random.default_rng(1000 + frame_idx)
    noise = rng.normal(0, 4.2, (arr.shape[0], arr.shape[1], 1))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    if S != 1:
        img = img.resize((TL.W, TL.H), Image.LANCZOS)
    # 结尾淡出
    if t > 139.4:
        img = Image.eval(img, lambda v: int(v * max(0.0, 1 - (t - 139.4) / 1.6)))
    return img

# ── 入口 ───────────────────────────────────────────────
def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "preview"
    PY = sys.executable
    if mode == "preview":
        os.makedirs(os.path.join(ROOT, "output", "preview"), exist_ok=True)
        for ts in sys.argv[2:]:
            t = float(ts)
            img = render_frame(t, S=2, frame_idx=int(t * TL.FPS))
            p = os.path.join(ROOT, "output", "preview", f"t{t}.png")
            img.save(p)
            print("saved", p)
    elif mode == "video":
        os.makedirs(os.path.join(ROOT, "output"), exist_ok=True)
        out = os.path.join(ROOT, "output", "draft.mp4")
        S = 2
        n = int(TL.DURATION * TL.FPS)
        cmd = ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
               "-s", f"{TL.W}x{TL.H}", "-r", str(TL.FPS), "-i", "-",
               "-c:v", "libx264", "-crf", "18", "-preset", "medium",
               "-pix_fmt", "yuv420p", out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for i in range(n):
            img = render_frame(i / TL.FPS, S=S, frame_idx=i)
            proc.stdin.write(img.tobytes())
            if i % 300 == 0:
                print(f"frame {i}/{n} ({i / TL.FPS:.1f}s)", flush=True)
        proc.stdin.close()
        proc.wait()
        print("done:", out)

if __name__ == "__main__":
    main()
