from PIL import Image
import numpy as np

Q = r'_style/game/qc-w4b5w6b7'

def arr(p):
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.int16)

# 1) seam: fixed-render f0 vs accepted baseline f0
a = arr(f'{Q}/new8-f0.png')
b = arr(f'{Q}/fix-t0.png')
d = np.abs(a - b).sum(2)
print(f'seam f0 vs accepted: {100*(d>0).mean():.2f}% / max {d.max()}')

# 2) glow rings
Y = lambda p: arr(p).astype(np.float32).mean(2)
yy, xx = np.mgrid[0:1080, 0:1920]

def ring(p, cx, cy):
    Z = Y(p)
    dd = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    return Z[(dd >= 30) & (dd < 60)].mean()

for name, pa, pb, cx, cy in [
    ('B11 (1,3)', f'{Q}/fix-t18.2.png', f'{Q}/fix-t19.0.png', 1017, 361),
    ('B9  (0,2)', f'{Q}/new8-t12.9.png', f'{Q}/fix-t13.7.png', 962, 419),
]:
    print(f'{name}: {ring(pa, cx, cy):.2f} -> {ring(pb, cx, cy):.2f}')
