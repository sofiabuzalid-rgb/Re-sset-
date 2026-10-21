"""Procedural rumpled-linen background in warm neutrals (cream / beige / soft greige).
Rendered a bit larger than 1080x1920 so Remotion can drift it slowly.
usage: python3 tools/make_background.py public/bg-linen.jpg
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

W, H = 1240, 2200
rng = np.random.default_rng(7)

def field(sigma, sx=1.0, sy=1.0, angle=0.0):
    th, tw = H + 200, W + 200
    n = rng.standard_normal((int(th / sy), int(tw / sx)))
    n = ndi.gaussian_filter(n, sigma, mode='wrap')
    n = ndi.zoom(n, (th / n.shape[0], tw / n.shape[1]), order=1)[:th, :tw]
    n = ndi.rotate(n, angle, reshape=False, mode='reflect')[100:100 + H, 100:100 + W]
    return (n - n.mean()) / (n.std() + 1e-9)

# broad billows + long directional folds + a few soft creases
h = 1.0 * field(150, 1, 1)
h += 0.55 * field(70, 2.6, 1.0, 30)
h += 0.35 * field(50, 1.0, 2.6, -40)
for ang in (24, -55):
    r = field(55, 3.0, 1.0, ang)
    h += 0.22 * (1 - np.abs(np.tanh(r * 1.3)))           # crease ridges
h = ndi.gaussian_filter(h, 3.0)

gy, gx = np.gradient(h * 95)
nz = 1.0 / np.sqrt(gx ** 2 + gy ** 2 + 1)
nx, ny = -gx * nz, -gy * nz
L = np.array([-0.55, -0.62, 0.56]); L /= np.linalg.norm(L)  # light from top-left window
lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
shade = 0.70 + 0.38 * lam

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
win = np.exp(-(((xx - W * 0.05) / (W * 0.9)) ** 2 + ((yy - H * 0.05) / (H * 0.55)) ** 2))  # warm sun patch
warm = np.array([238, 220, 196]) / 255     # sunlit cream
cool = np.array([196, 190, 186]) / 255     # shaded greige
base = cool[None, None] * (1 - win[..., None]) + warm[None, None] * win[..., None]
img = base * shade[..., None] * (0.92 + 0.14 * win[..., None])

grain = ndi.gaussian_filter(rng.standard_normal((H, W)), 0.7) * 0.012
img += grain[..., None]
vig = 1 - 0.18 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.7)) ** 2)
img *= vig[..., None]
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(sys.argv[1], quality=94)
