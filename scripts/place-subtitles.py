"""
Place each subtitle where it reads best without covering the face or the print.
Renders the composition with no text ("bare"), then for every subtitle block samples its first, middle and last
frame and scores candidate positions: dark and calm areas win (white text reads on dark; a busy area is usually
the print), faces are excluded (OpenCV Haar cascade, OpenCV licence), and positions near 74% of the height
(the lower safe area) are preferred. Blocks in the same shot share one position so the text never jumps.
Writes "top" into the subtitle entries (the .subs.json, or the edit's own "subtitles" list for ChristmasAtHome).
Needs OpenCV 4.x (cv2.CascadeClassifier; OpenCV 5 dropped it): run with PYTHONPATH pointing at an opencv-python-headless 4.10 install.
Usage: python3 scripts/place-subtitles.py <CompositionId> <edit.json> <subs.json | -> [render_dir]
"""
import json, os, subprocess, sys
import cv2
import numpy as np

COMP, EDIT, SUBS = sys.argv[1:4]
TMP = sys.argv[4] if len(sys.argv) > 4 else "/tmp"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
e = json.load(open(EDIT))
FPS = e.get("fps", 30)
B = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
vid = os.path.join(TMP, f"{COMP}_bare.mp4")
if not os.path.exists(vid):
    subprocess.run(["npx", "remotion", "render", COMP, vid, "--props", '{"bare":true}', "--scale", "0.5", "--muted",
                    "--browser-executable", B, "--log", "error"], cwd=ROOT, check=True)
cap = cv2.VideoCapture(vid)
face = cv2.CascadeClassifier(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "haarcascade_frontalface_default.xml"))


def frame(n):
    cap.set(cv2.CAP_PROP_POS_FRAMES, n)
    ok, f = cap.read()
    return f if ok else None


# subtitle blocks on the timeline
if SUBS == "-":  # ChristmasAtHome: blocks live in the edit as voice-source seconds
    v = e["voice"]
    blocks = [{"from": v["at"] + round((s["a"] - v["a"]) * FPS), "to": v["at"] + round((s["b"] - v["a"]) * FPS), "text": s["text"]}
              for s in e["subtitles"]]
else:
    blocks = json.load(open(SUBS))
# shot boundaries, and where the hook / sign-off sit (the top band is off-limits while they show)
bounds, t = [], 0
for s in e["shots"]:
    bounds.append(t)
    t += s["frames"]
graph = [(g["from"], g["to"]) for g in e.get("graphics", [])]
graph += [(x["from"], x["to"]) for x in e.get("texts", []) if x.get("kind") == "hook"]
if "endTag" in e:
    graph.append((e["endTag"]["from"], t))
shot_of = lambda fr: max(i for i, b in enumerate(bounds) if b <= fr)  # noqa: E731

CANDS = list(range(1180, 1561, 20)) + list(range(300, 601, 20))
S = 0.5  # the bare render is half size


def scores(img, text, block):
    h, w = img.shape[:2]
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    edges = cv2.Canny((g * 255).astype(np.uint8), 60, 140).astype(np.float32) / 255
    faces = face.detectMultiScale((g * 255).astype(np.uint8), 1.1, 5, minSize=(36, 36))
    lines = 1 if len(text) <= 34 else 2
    bh = (lines * 58 + 14) * S
    bw = min(860, len(text) / lines * 24.5 + 40) * S
    x0, x1 = int(w / 2 - bw / 2), int(w / 2 + bw / 2)
    top_busy = any(a < block["to"] and block["from"] < b for a, b in graph)
    out = []
    for c in CANDS:
        y0, y1 = int(c * S), int(c * S + bh)
        if c < 1000 and top_busy:
            out.append(9.0)
            continue
        hit = False
        for fx, fy, fw, fh in faces:
            if not (x1 < fx - fw * 0.2 or x0 > fx + fw * 1.2 or y1 < fy - fh * 0.4 or y0 > fy + fh * 1.3):
                hit = True
        if hit:
            out.append(9.0)
            continue
        reg = g[y0:y1, x0:x1]
        L, SD, E = float(reg.mean()), float(reg.std()), float(edges[y0:y1, x0:x1].mean())
        pref = abs(c - 1420) / 1000 * 0.35 + (0.12 if c < 1000 else 0)
        out.append(0.55 * L + 1.6 * SD + 0.9 * E + pref)
    return np.array(out)


groups = {}
for i, b in enumerate(blocks):
    sc = None
    for fr in sorted({b["from"] + 2, (b["from"] + b["to"]) // 2, b["to"] - 2}):
        img = frame(max(0, fr))
        if img is None:
            continue
        s_ = scores(img, b["text"], b)
        sc = s_ if sc is None else np.maximum(sc, s_)
    groups.setdefault(shot_of(b["from"]), []).append((i, sc))
# one resting position for the whole ad (lower band); a shot moves only when that spot is clearly worse there,
# and the top band is used only when the whole lower band is blocked (e.g. a face)
nb = sum(1 for c in CANDS if c >= 1000)
tots = {k: sum(sc for _, sc in items) / len(items) for k, items in groups.items()}
base = int(np.argmin(sum(np.minimum(t_[:nb], 3.0) for t_ in tots.values())))
for k, items in groups.items():
    t_ = tots[k]
    j = base
    if t_[base] - t_[:nb].min() > 0.12:
        j = int(np.argmin(t_[:nb]))
    if t_[j] >= 9.0:
        j = int(np.argmin(t_))
    for i, _ in items:
        blocks[i]["top"] = CANDS[j]
if SUBS == "-":
    for s, b in zip(e["subtitles"], blocks):
        s["top"] = b["top"]
    json.dump(e, open(EDIT, "w"), indent=2, ensure_ascii=False)
else:
    json.dump(blocks, open(SUBS, "w"), indent=1, ensure_ascii=False)
for b in blocks:
    print(f'{b["from"]:4d}-{b["to"]:4d}  top {b["top"]:4d}  {b["text"]}')
