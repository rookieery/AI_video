# 字幕方案对比图拼版（书名 / 太极开局名）
# 用法: python sheet.py  （在 _style/title/ 下生成 book-compare.png 与 taiji-compare.png）
from PIL import Image, ImageDraw, ImageFont

FONT = r"C:\Windows\Fonts\msyh.ttc"

def load(p):
    return Image.open(p).convert("RGB")

def tile(frame, crop_box, label, sub, tw=620, ch=360):
    """上半：局部放大（crop_box 在 1920x1080 坐标系）；下半：全帧缩略"""
    im = load(frame)
    cz = im.crop(crop_box).resize((tw, ch), Image.LANCZOS)
    full = im.resize((tw, int(tw * 1080 / 1920)), Image.LANCZOS)
    W, H = tw, ch + full.height + 56
    out = Image.new("RGB", (W, H), (10, 14, 24))
    out.paste(cz, (0, 0))
    out.paste(full, (0, ch + 36))
    d = ImageDraw.Draw(out)
    f1 = ImageFont.truetype(FONT, 26)
    f2 = ImageFont.truetype(FONT, 17)
    d.rectangle([0, ch, W, ch + 36], fill=(16, 24, 40))
    d.text((12, ch + 5), label, font=f1, fill=(159, 238, 255))
    d.text((12, ch + 5), "", font=f2)
    tw2 = d.textlength(label, font=f1)
    d.text((14 + tw2, ch + 12), sub, font=f2, fill=(140, 170, 190))
    return out

def sheet(tiles, out, pad=14, label_h=None):
    cols = len(tiles)
    w = max(t.width for t in tiles)
    h = max(t.height for t in tiles)
    canvas = Image.new("RGB", (cols * w + (cols + 1) * pad, h + 2 * pad), (6, 9, 16))
    for i, t in enumerate(tiles):
        canvas.paste(t, (pad + i * (w + pad), pad))
    canvas.save(out, quality=92)
    print(out, canvas.size)

# —— 书名方案（内侧扉页 3 种字体效果 + 封面顶部位置备选）——
BOOK_BOX = (420, 520, 1240, 1060)   # 翻开书区域（t=3.3）
TOP_BOX = (700, 300, 1260, 760)     # 闭合书区域（t=1.5）
sheet([
    tile("v-inner-solid.png", BOOK_BOX, "方案B1·实心霓虹", "扉页两行｜微调节拍", 620, 400),
    tile("v-inner-hollow.png", BOOK_BOX, "方案B2·空心描边", "扉页两行｜微调节拍", 620, 400),
    tile("v-inner-scan.png", BOOK_BOX, "方案B3·扫描线", "扉页两行｜微调节拍", 620, 400),
], "book-compare.png")

im = load("v-top-solid.png")
cz = im.crop(TOP_BOX).resize((1240, 1017), Image.LANCZOS)
cz.save("book-top-zoom.png", quality=92)
print("book-top-zoom.png", cz.size)

# —— 太极开局名方案（3 种字体效果 × 弧排 + 1 种水平排布）——
TJ_BOX = (700, 280, 1220, 800)      # 太极区域（t=8.5）
sheet([
    tile("t-solid-arc.png", TJ_BOX, "方案T1·实心霓虹·弧排", "推荐", 620, 400),
    tile("t-hollow-arc.png", TJ_BOX, "方案T2·空心描边·弧排", "", 620, 400),
    tile("t-scan-arc.png", TJ_BOX, "方案T3·扫描线·弧排", "", 620, 400),
    tile("t-solid-flat.png", TJ_BOX, "方案T4·实心·水平", "带区下部", 620, 400),
], "taiji-compare.png")
