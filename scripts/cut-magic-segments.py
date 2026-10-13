"""
Cuts the source iPhone clips into the exact segments used by the "Magic of Christmas" reel.
Each segment is trimmed, speed-adjusted (and optionally reversed) and encoded as 1080x1920 H.264
so Remotion plays every segment at 1x, frame-accurately.

Usage: python3 scripts/cut-magic-segments.py <folder with the original IMG_xxxx.mov files>
"""
import glob
import os
import subprocess
import sys

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "magic")

# id, source clip, start s, end s, speed, reverse
SEGMENTS = [
    # 1 — RED NORDIC
    ("red-enter", "IMG_1339", 1.35, 2.45, 1.0, True),    # bag lowered into frame (reversed lift)
    ("red-tie", "IMG_1338", 1.0, 3.0, 1.6, False),        # bow being tied
    ("red-lift", "IMG_1339", 1.35, 2.30, 1.0, False),     # bag lifted up and out
    ("red-reveal", "IMG_1331", 0.2, 3.6, 1.35, False),    # glide over the nordic print
    # 2 — GREEN GINGERBREAD
    ("green-bag", "IMG_1340", 0.4, 2.2, 1.5, False),
    ("green-open", "IMG_1341", 4.0, 6.6, 2.0, False),
    ("green-reveal", "IMG_1341", 11.9, 13.9, 1.15, False),
    # 3 — STRIPED TEDDY
    ("stripe-out", "IMG_1346", 4.2, 8.2, 2.2, True),     # pants come out of the bag (reversed packing)
    ("stripe-reveal", "IMG_1345", 6.3, 8.7, 1.2, False),
    # 4 — WHITE
    ("white-enter", "IMG_1352", 0.05, 1.45, 1.3, True),
    ("white-open", "IMG_1347", 3.0, 5.6, 2.4, False),
    ("white-reveal", "IMG_1347", 21.0, 23.7, 1.2, False),
    # FINALE — the whole collection
    ("finale-close", "IMG_1327", 3.3, 6.1, 1.5, False),
    ("finale-tower", "IMG_1327", 7.3, 9.6, 1.0, False),
]


def find(name):
    hits = [p for p in glob.glob(os.path.join(SRC, f"*{name}.*")) if p.lower().endswith(".mov")]
    if not hits:
        raise SystemExit(f"missing {name}")
    return sorted(hits)[0]


os.makedirs(OUT, exist_ok=True)
for sid, src, a, b, speed, rev in SEGMENTS:
    vf = [f"setpts=(PTS-STARTPTS)/{speed}"]
    if rev:
        vf.insert(0, "reverse")
    vf += ["fps=30", "scale=1080:1920:force_original_aspect_ratio=increase", "crop=1080:1920", "setsar=1", "format=yuv420p"]
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", find(src), "-an",
           "-vf", ",".join(vf), "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-g", "10",
           "-movflags", "+faststart", os.path.join(OUT, f"{sid}.mp4")]
    subprocess.run(cmd, check=True)
    print(sid)
