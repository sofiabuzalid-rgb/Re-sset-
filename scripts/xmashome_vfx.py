"""Window key + winter exterior + layered snow for the CHRISTMAS AT HOME shots (used by build-xmashome-media.py).

The snow lives only behind the glass:
  mask = (hand-drawn glass polygon for the shot, tracked with the camera by phase correlation)
         AND (exterior key: lit, non-neutral foliage/sky pixels; dark mullions, frames and anything interior fall out)
The polygon keeps the key off the room (white jambs, bookshelves, the pajama); the key keeps the snow off the frames.
Exterior pixels are pushed to a cold, misty overcast (desaturated, lifted, slightly blue), then three depth layers of
flakes fall behind the glass with parallax against the camera move. Flakes are sized for distance (far 1-2 px, near <= 6 px).
"""
import cv2
import numpy as np

W, H = 1080, 1920


def track(frames):
    """Camera translation of each frame relative to frame 0 (pixels at 1080x1920)."""
    prev, acc, out = None, np.zeros(2), []
    for f in frames:
        g = cv2.cvtColor(cv2.resize(f, (360, 640)), cv2.COLOR_BGR2GRAY).astype(np.float32)
        if prev is not None:
            (dx, dy), _ = cv2.phaseCorrelate(prev, g)
            acc = acc + (dx, dy)
        out.append(acc * 3.0)
        prev = g
    return np.array(out)


def key(frame, poly, shift):
    """Soft 0..1 mask of the exterior seen through the glass."""
    region = np.zeros((H, W), np.uint8)
    pts = (np.array(poly, np.float32) * (W / 720.0) + shift).astype(np.int32)
    cv2.fillPoly(region, [pts], 255)
    region = cv2.erode(region, np.ones((9, 9), np.uint8))
    hls = cv2.cvtColor(frame, cv2.COLOR_BGR2HLS).astype(np.float32)
    l, s = hls[..., 1] / 255.0, hls[..., 2] / 255.0
    ext = np.clip((l - 0.22) / 0.12, 0, 1) * np.clip((s + l * 0.6 - 0.25) / 0.15, 0, 1)
    m = (region / 255.0) * ext
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return cv2.GaussianBlur(m, (0, 0), 2.2)


def winterize(frame, m):
    # depth haze: soften the foliage texture behind the glass so the flakes read against it
    soft = cv2.GaussianBlur(frame, (0, 0), 2.6)
    f = (frame.astype(np.float32) * (1 - m[..., None] * 0.85) + soft.astype(np.float32) * m[..., None] * 0.85) / 255.0
    lum = f @ np.array([0.114, 0.587, 0.299], np.float32)
    cold = np.stack([lum * 1.04 + 0.03, lum * 0.99 + 0.02, lum * 0.95], -1)  # BGR: a touch of blue
    mist = 0.36 + 0.5 * cold  # lifted, low-contrast grey-blue overcast, dark enough for the flakes to read
    w = np.clip(0.8 * m, 0, 1)[..., None]
    out = f * (1 - w) + mist * w
    return np.clip(out * 255, 0, 255).astype(np.uint8)


class Snow:
    def __init__(self, seed, n_frames, wind=0.4):
        rng = np.random.default_rng(seed)
        self.layers = []
        for count, size, speed, alpha, depth, blur in ((1800, 1.4, 2.0, 0.7, 0.25, 0.0),
                                                        (650, 2.3, 3.8, 0.9, 0.55, 0.5),
                                                        (170, 3.4, 6.2, 0.95, 0.9, 1.1)):
            self.layers.append(dict(
                x=rng.uniform(-200, W + 200, count), y=rng.uniform(-200, H + 200, count),
                sz=size * rng.uniform(0.7, 1.3, count), sp=speed * rng.uniform(0.75, 1.25, count),
                ph=rng.uniform(0, 2 * np.pi, count), wob=rng.uniform(0.6, 1.6, count),
                alpha=alpha, depth=depth, blur=blur))
        self.wind = wind

    def render(self, t, shift):
        """Snow layer (0..1 alpha) for frame t; parallax follows the camera by layer depth."""
        acc = np.zeros((H, W), np.float32)
        for L in self.layers:
            layer = np.zeros((H, W), np.float32)
            y = (L["y"] + L["sp"] * t) % (H + 400) - 200
            x = (L["x"] + self.wind * L["sp"] * t + 6 * L["sz"] * np.sin(L["ph"] + 0.05 * L["wob"] * t)) % (W + 400) - 200
            x = x + shift[0] * L["depth"]
            y = y + shift[1] * L["depth"]
            for xi, yi, si in zip(x, y, L["sz"]):
                if -10 < xi < W + 10 and -10 < yi < H + 10:
                    cv2.circle(layer, (int(xi * 4), int(yi * 4)), max(1, int(si * 2)), 1.0, -1, cv2.LINE_AA, shift=2)
            k = 1.0 + L["blur"]
            layer = cv2.GaussianBlur(layer, (0, 0), k)
            layer = np.clip(layer * (1.6 + 0.4 * k), 0, 1) * L["alpha"]
            acc = 1 - (1 - acc) * (1 - layer)
        return acc


def composite(frame, m, snow):
    f = winterize(frame, m).astype(np.float32)
    a = (snow * m)[..., None]
    white = np.array([250, 248, 244], np.float32)  # BGR, a touch warm from the room light on the glass
    return np.clip(f * (1 - a) + white * a, 0, 255).astype(np.uint8)
