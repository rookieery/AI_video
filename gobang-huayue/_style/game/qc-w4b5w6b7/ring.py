import sys
from PIL import Image
import numpy as np

Q = r'_style/game/qc-w4b5w6b7'

def arr(p):
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.float32).mean(2)

yy, xx = np.mgrid[0:1080, 0:1920]

def ring(p, cx, cy):
    Y = arr(p)
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    return Y[(d >= 30) & (d < 60)].mean()

# args: tag cx cy  ->  ring(before) -> ring(after)   (files: {tag}-t18.2.png / {tag}-t19.0.png)
for spec in sys.argv[1:]:
    tag, cx, cy = spec.split(',')
    b = ring(f'{Q}/{tag}-t18.2.png', int(cx), int(cy))
    a = ring(f'{Q}/{tag}-t19.0.png', int(cx), int(cy))
    print(f'{tag:12s} ring30-60: {b:6.2f} -> {a:6.2f}  (delta {a-b:+6.2f})')
