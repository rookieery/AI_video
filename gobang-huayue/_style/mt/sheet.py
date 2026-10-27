# 对弈解说字幕方案对比拼图
from PIL import Image, ImageDraw, ImageFont

FONT = r"C:\Windows\Fonts\msyh.ttc"
ROWS = [("a", "方案A 星尘聚字·四散爆开·竖排"),
        ("b", "方案B 逐字点尘·上扬星屑·竖排"),
        ("c", "方案C 星尘聚字·吸入落子·横排")]
COLS = [("1.0", "聚字中(白4)"), ("1.75", "成字·白4右"), ("2.0", "消散"), ("3.75", "成字·黑5左")]

def grid(crop, out, zw):
    tiles = []
    for rk, rlabel in ROWS:
        row = []
        for ck, clabel in COLS:
            im = Image.open(f"{rk}-{ck}.png").convert("RGB")
            if crop:
                box = (1400, 60, 1920, 760) if ck != "3.75" else (0, 60, 520, 760)
                im = im.crop(box)
                im = im.resize((zw, int(zw * im.height / im.width)), Image.LANCZOS)
            else:
                im = im.resize((480, 270), Image.LANCZOS)
            d = ImageDraw.Draw(im)
            f1 = ImageFont.truetype(FONT, 20 if crop else 15)
            f2 = ImageFont.truetype(FONT, 15 if crop else 12)
            d.rectangle([0, 0, im.width, 30 if crop else 22], fill=(10, 16, 28))
            d.text((8, 3 if crop else 2), rlabel.split(" ")[1] + " " + clabel, font=f1, fill=(159, 238, 255))
            d.text((im.width - 8 - d.textlength(rlabel.split(" ")[0], font=f2), 6 if crop else 3), rlabel.split(" ")[0], font=f2, fill=(150, 175, 195))
            row.append(im)
        tiles.append(row)
    cw = max(t.width for r in tiles for t in r)
    ch = max(t.height for r in tiles for t in r)
    pad = 10
    canvas = Image.new("RGB", (4 * cw + 5 * pad, 3 * ch + 4 * pad), (6, 9, 16))
    for i, row in enumerate(tiles):
        for j, t in enumerate(row):
            canvas.paste(t, (pad + j * (cw + pad), pad + i * (ch + pad)))
    canvas.save(out, quality=92)
    print(out, canvas.size)

grid(True, "mt-compare-zoom.png", 430)
grid(False, "mt-compare-full.png", 480)
