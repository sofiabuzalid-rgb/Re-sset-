"""Turn transparent product cutouts into sticker PNGs (white outline, no shadow;
the soft shadow is added in Remotion so it can be tweaked per item).

usage: python3 tools/make_stickers.py assets/cutouts public/stickers
Any PNG with alpha dropped into assets/cutouts gets a sticker of the same name.
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

LONG_SIDE = 1100   # sticker resolution (displayed at ~300-560 px, so 2x+ headroom)
OUTLINE = 24       # px at LONG_SIDE; ~8-10 px once on the 1080 canvas
PAD = OUTLINE + 6

def sticker(path, out):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > 10)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = LONG_SIDE / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    W, H = im.width + 2 * PAD, im.height + 2 * PAD
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(im, (PAD, PAD))
    alpha = np.array(canvas)[..., 3].astype(np.float32) / 255
    solid = alpha > 0.5
    # fill small interior holes so the outline reads as one die-cut shape
    solid = ndi.binary_closing(solid, iterations=6)
    dist = ndi.distance_transform_edt(~solid)
    ring = np.clip(OUTLINE + 0.5 - dist, 0, 1)          # anti-aliased outer edge
    white = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    wa = (np.maximum(ring, alpha) * 255).astype(np.uint8)
    white.putalpha(Image.fromarray(wa))
    white.alpha_composite(canvas)                         # product untouched on top
    white.save(out, optimize=True)
    return W, H

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '*.png'))):
        name = os.path.basename(f).split('__')[0] + '.png'
        print(name, sticker(f, os.path.join(dst, name)))
