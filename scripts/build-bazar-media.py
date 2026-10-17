"""
HOTBOOK BAZAR — colour-isolation media: the RE:SET bag stays in its real colour, everything else becomes editorial B&W.
Per shot (src/bazar/edit.json):
  1. decode the iPhone HLG clip tone-mapped to SDR BT.709 (hable), 1080x1920;
  2. track the bag frame by frame with an OpenCV CSRT tracker on a half-res copy, started from `hint`
     (a frame + a point inside the bag) and run forward AND backward from there;
  3. inside the tracked box (+ margin) key the bag's own pink (OpenCV HSV: hue >= 158 or <= 3, low-mid saturation,
     bright), close + fill holes so the printed logo is part of the bag, keep the components touching the box,
     feather 4 px and smooth over time so the edge doesn't flicker;
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
    dbg = []
    for i in range(n):
        img = fr[i]
        x, y, w, h = boxes[i]
        mx, my = margin * w + 12, margin * h + 12
        X0, Y0 = int(max(0, x - mx)), int(max(0, y - my))
        X1, Y1 = int(min(W, x + w + mx)), int(min(H, y + h + my))
        m = np.zeros((H, W), np.uint8)
        roi = pink(img[Y0:Y1, X0:X1])
        roi = cv2.morphologyEx(roi, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        nl, lab, st, _ = cv2.connectedComponentsWithStats(roi)
        keep = np.zeros_like(roi)
        # inner box (the tracked box itself) in ROI coordinates
        ix0, iy0, ix1, iy1 = x - X0, y - Y0, x + w - X0, y + h - Y0
        for j in range(1, nl):
            cx0, cy0, cw, ch, area = st[j]
            if area < 120:
                continue
            if cx0 + cw < ix0 or cx0 > ix1 or cy0 + ch < iy0 or cy0 > iy1:
                continue  # doesn't touch the tracked bag box
            keep[lab == j] = 1
        # fill holes (printed logo / shadows inside the bag outline)
        filled = keep.copy()
        cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(filled, cnts, -1, 1, thickness=-1)
        hsv = cv2.cvtColor(img[Y0:Y1, X0:X1], cv2.COLOR_BGR2HSV)
        skin = ((hsv[..., 0] >= 4) & (hsv[..., 0] <= 25) & (hsv[..., 1] >= 35)).astype(np.uint8)  # fingers over the bag stay B&W
        keep = keep | (filled & (1 - skin))
        m[Y0:Y1, X0:X1] = keep
        mf = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 4)
        if prev is not None:
            mf = 0.65 * mf + 0.35 * prev
        prev = mf
        a = mf.copy()
        if s["id"] == "s01":  # hook: colour blooms on the bag as it is handed over
            a *= float(np.clip((i - 8) / 22, 0, 1))
        col = np.clip(img.astype(np.float32) * 1.04 + 4, 0, 255)
        comp = col * a[..., None] + bw(img) * (1 - a[..., None])
        o = np.clip(comp, 0, 255).astype(np.uint8)
        enc.stdin.write(o.tobytes())
        if DEBUG and i % max(1, n // 6) == 0 and len(dbg) < 6:
            d = o.copy()
            cv2.rectangle(d, (int(x), int(y)), (int(x + w), int(y + h)), (0, 255, 0), 4)
            dbg.append(cv2.resize(d, (216, 384)))
    enc.stdin.close()
    enc.wait()
    if DEBUG:
        while len(dbg) < 6:
            dbg.append(np.zeros_like(dbg[0]))
        cv2.imwrite(os.path.join(OUT, f"_dbg_{s['id']}.jpg"), np.hstack(dbg))
    print(s["id"], n, "frames")
