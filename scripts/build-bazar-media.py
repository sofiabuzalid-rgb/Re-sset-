"""
HOTBOOK BAZAR — colour-isolation media: the RE:SET bag stays in its real colour, everything else becomes editorial B&W.
Per shot (src/bazar/edit.json):
  1. decode the iPhone HLG clip tone-mapped to SDR BT.709 (hable), 1080x1920;
  2. track the bag frame by frame (OpenCV CSRT on a half-res copy, from `hint`, forward and backward), or use
     hand-placed keyframe boxes (`keys`) where the bag passes over pink products / a pinkish top;
  3. inside the box, segment the bag as a solid object with GrabCut seeded by its pink (strong pink = sure
     foreground), keep only what touches clearly-pink fabric, fill holes (printed logo, folds), keep skin out,
     clip to the box, erode 2 px + feather so no colour halos; when the bag can't be separated (hidden, motion
     blur) the last good shape follows the box;
  4. composite: original colour (lifted +4 % so the bag reads as lit) through the mask, B&W elsewhere
     (BT.709 luma, S-curve contrast, deep blacks — not washed-out grey).
  s01 fades the colour in on the hand-off (the hook).
Output: public/bazar/<shot>.mp4 (+ debug contact sheets with --debug)
Usage: python3 scripts/build-bazar-media.py /folder/with/originals [--debug]
"""
import json, os, subprocess, sys
import cv2, numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
DEBUG = "--debug" in sys.argv
ONLY = [a for a in sys.argv[2:] if a.startswith("s")]
OUT = os.path.join(ROOT, "public", "bazar")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "bazar", "edit.json")))
W, H = 1080, 1920
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"


def decode(s):
    sp = s.get("speed", 1.0)
    cmd = ["ffmpeg", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, s["file"] + ".mov"), "-vf",
           f"{TM},setpts=PTS/{sp},fps=30,format=bgr24", "-frames:v", str(s["frames"]), "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (W * H * 3)
    fr = np.frombuffer(raw, np.uint8)[: n * W * H * 3].reshape(n, H, W, 3)
    if n < s["frames"]:  # pad with the last frame if the source runs out
        fr = np.concatenate([fr, np.repeat(fr[-1:], s["frames"] - n, 0)])
    return fr


def pink(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    return (((h >= 158) | (h <= 3)) & (s >= 24) & (s <= 150) & (v >= 100)).astype(np.uint8)


def seed_box(img, x, y):
    """Bag box at the hint frame: the pink component nearest to the hint point."""
    m = pink(img)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(m)
    px, py = x * img.shape[1], y * img.shape[0]
    best, bd = None, 1e9
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 150:
            continue
        d = np.hypot(cent[i][0] - px, cent[i][1] - py) - 0.02 * np.sqrt(stats[i, cv2.CC_STAT_AREA])
        if d < bd:
            best, bd = i, d
    x0, y0, w, h = stats[best][:4]
    return (int(x0), int(y0), int(w), int(h))


def track(small, k, box):
    boxes = [None] * len(small)
    boxes[k] = box
    for rng in (range(k + 1, len(small)), range(k - 1, -1, -1)):
        t = cv2.TrackerCSRT_create()
        t.init(small[k], box)
        last = box
        for i in rng:
            ok, b = t.update(small[i])
            if ok and b[2] > 4 and b[3] > 4:
                last = tuple(int(v) for v in b)
            boxes[i] = last
    # light temporal smoothing of the box centre/size
    a = np.array(boxes, float)
    ker = np.ones(5) / 5
    pad = np.pad(a, ((2, 2), (0, 0)), mode="edge")
    return np.stack([np.convolve(pad[:, j], ker, mode="valid") for j in range(4)], 1)



def segment(img, X0, Y0, X1, Y1, x, y, w, h):
    """Solid bag mask: GrabCut seeded by the tracked box + the bag's pink, holes filled, skin kept out."""
    roi = img[Y0:Y1, X0:X1]
    rh, rw = roi.shape[:2]
    if rh < 8 or rw < 8:
        return None
    k = min(1.0, 320 / max(rh, rw))
    sm = cv2.resize(roi, (max(8, int(rw * k)), max(8, int(rh * k))), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)
    hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    pink_lo = ((hh >= 155) | (hh <= 3)) & (ss >= 10) & (ss <= 160) & (vv >= 70)
    pink_hi = ((hh >= 160) | (hh <= 2)) & (ss >= 24) & (ss <= 150) & (vv >= 110)
    skin = (hh >= 5) & (hh <= 22) & (ss >= 55) & (vv < 235)  # real skin is more saturated than the bag's warm shadows
    gc = np.full(sm.shape[:2], cv2.GC_BGD, np.uint8)
    bx0, by0 = int((x - X0) * k), int((y - Y0) * k)
    bx1, by1 = int((x + w - X0) * k), int((y + h - Y0) * k)
    inner = np.zeros(sm.shape[:2], bool)
    inner[max(0, by0):by1, max(0, bx0):bx1] = True
    gc[inner] = cv2.GC_PR_BGD
    gc[inner & pink_lo] = cv2.GC_PR_FGD
    gc[inner & pink_hi] = cv2.GC_FGD
    gc[skin] = cv2.GC_BGD
    if (gc == cv2.GC_FGD).sum() < 15:
        return None
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    try:
        cv2.grabCut(sm, gc, None, bgd, fgd, 3, cv2.GC_INIT_WITH_MASK)
    except cv2.error:
        return None
    fg = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
    if n < 2:
        return None
    big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    keep = np.zeros_like(fg)
    for j in range(1, n):
        if st[j, cv2.CC_STAT_AREA] >= 0.3 * st[big, cv2.CC_STAT_AREA]:
            keep[lab == j] = 1
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    filled = keep.copy()
    cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(filled, cnts, -1, 1, thickness=-1)
    # only keep what lies near clearly-pink bag fabric: GrabCut spill onto the pale mauve top / sweater is dropped
    near_pink = cv2.dilate(pink_hi.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    keep = filled & near_pink
    cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(keep, cnts, -1, 1, thickness=-1)
    keep = keep & (~skin).astype(np.uint8)
    # never colour anything outside the tracked bag box (+6 %): stops tint creeping onto a pinkish top / neighbours
    ex, ey = int(0.06 * (bx1 - bx0)) + 2, int(0.06 * (by1 - by0)) + 2
    clip = np.zeros_like(keep)
    clip[max(0, by0 - ey):by1 + ey, max(0, bx0 - ex):bx1 + ex] = 1
    keep = keep & clip
    full = np.zeros(img.shape[:2], np.uint8)
    full[Y0:Y1, X0:X1] = cv2.resize(keep, (rw, rh), interpolation=cv2.INTER_LINEAR)
    return full


def bw(img):
    y = (0.0722 * img[..., 0] + 0.7152 * img[..., 1] + 0.2126 * img[..., 2]) / 255.0
    y = np.clip((y - 0.04) / 0.94, 0, 1)
    y = y * y * (3 - 2 * y) * 0.55 + y * 0.45  # S-curve: editorial contrast, deep blacks
    return (y * 255).astype(np.float32)[..., None].repeat(3, 2)


for s in e["shots"]:
    if ONLY and s["id"] not in ONLY:
        continue
    fr = decode(s)
    n = len(fr)
    small = [cv2.resize(f, (W // 2, H // 2), interpolation=cv2.INTER_AREA) for f in fr]
    if "keys" in s:  # hand-placed keyframe boxes, linearly interpolated
        kf = np.array(s["keys"], float)
        fx = np.arange(n)
        c = [np.interp(fx, kf[:, 0], kf[:, j]) for j in range(1, 5)]
        boxes = np.stack([c[0] * W, c[1] * H, (c[2] - c[0]) * W, (c[3] - c[1]) * H], 1)
        margin = 0.06
    else:
        hk = s["hint"]
        k = min(hk["frame"], n - 1)
        box = seed_box(small[k], hk["x"], hk["y"])
        boxes = track(small, k, box) * 2
        margin = 0.25
    out = os.path.join(OUT, f"{s['id']}.mp4")
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", "-pix_fmt", "yuv420p",
                            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], stdin=subprocess.PIPE)
    prev = None
    last = None
    dbg = []
    for i in range(n):
        img = fr[i]
        x, y, w, h = boxes[i]
        mx, my = 0.15 * w + 16, 0.15 * h + 16
        X0, Y0 = int(max(0, x - mx)), int(max(0, y - my))
        X1, Y1 = int(min(W, x + w + mx)), int(min(H, y + h + my))
        m = segment(img, X0, Y0, X1, Y1, x, y, w, h)
        if m is None:  # bag not separable in this frame (occluded/blurred): carry the last shape along with the box
            m = np.zeros((H, W), np.uint8)
            if last is not None:
                lm, (lx, ly) = last
                dx, dy = int(x - lx), int(y - ly)
                M = np.float32([[1, 0, dx], [0, 1, dy]])
                m = cv2.warpAffine(lm, M, (W, H))
        else:
            last = (m, (x, y))
        m = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))  # feather inward: no colour halo
        mf = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2.5)
        if prev is not None:
            mf = 0.8 * mf + 0.2 * np.minimum(prev, mf)  # steadies the edge without leaving a ghost where the bag was
        prev = mf
        a = mf.copy()
        if s["id"] == "s01":  # hook: colour blooms on the bag as it is handed over
            a *= float(np.clip((i - 8) / 22, 0, 1))
        col = np.clip(img.astype(np.float32) * 1.04 + 4, 0, 255)
        comp = col * a[..., None] + bw(img) * (1 - a[..., None])
        o = np.clip(comp, 0, 255).astype(np.uint8)
        enc.stdin.write(o.tobytes())
        if DEBUG and i % max(1, n // 6) == 0 and len(dbg) < 6:
            cx, cy, r = int(x + w / 2), int(y + h / 2), int(max(w, h) * 0.9) + 40
            c = o[max(0, cy - r):cy + r, max(0, cx - r):cx + r]
            dbg.append(cv2.resize(c, (240, 240)))
    enc.stdin.close()
    enc.wait()
    if DEBUG:
        while len(dbg) < 6:
            dbg.append(np.zeros_like(dbg[0]))
        cv2.imwrite(os.path.join(OUT, f"_dbg_{s['id']}.jpg"), np.hstack(dbg))
    print(s["id"], n, "frames")
