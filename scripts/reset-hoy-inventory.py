"""RESET HOY — technical inventory of every clip (run once; results are reused by every ad).
Per clip: duration, resolution, display orientation, fps, and a voice-activity map (50 ms frames: level > -42 dBFS
in the speech band AND clear pitch 80-400 Hz) merged into segments, so clips with dialogue can be found without
listening to all of them. Output: docs/reset-hoy/inventory.json
Usage: python3 scripts/reset-hoy-inventory.py /folder/with/clips
"""
import glob, json, os, subprocess, sys
import numpy as np

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "reset-hoy", "inventory.json")
SR = 16000
inv = json.load(open(OUT)) if os.path.exists(OUT) else {}


def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", p],
                                  capture_output=True, text=True).stdout)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    rot = 0
    for sd in v.get("side_data_list", []):
        rot = int(sd.get("rotation", 0)) or rot
    w, h = v["width"], v["height"]
    if abs(rot) == 90:
        w, h = h, w
    num, den = map(int, v["r_frame_rate"].split("/"))
    return float(j["format"]["duration"]), w, h, round(num / den, 2), any(s["codec_type"] == "audio" for s in j["streams"]), v.get("color_transfer", "")


def voice(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=150,lowpass=f=3800",
                          "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    n = SR // 20
    segs, on = [], None
    for i in range(0, len(x) - n, n):
        f = x[i:i + n]
        db = 20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-9)
        ac = np.correlate(f, f, "full")[n - 1:]
        clar = ac[SR // 400:SR // 80].max() / (ac[0] + 1e-9)
        sp = db > -42 and clar > 0.45
        t = i / SR
        if sp and on is None:
            on = t
        if not sp and on is not None:
            segs.append([on, t])
            on = None
    if on is not None:
        segs.append([on, len(x) / SR])
    merged = []
    for a, b in segs:  # bridge short gaps between syllables
        if merged and a - merged[-1][1] < 0.35:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    merged = [[round(a, 2), round(b, 2)] for a, b in merged if b - a >= 0.3]
    return merged, round(sum(b - a for a, b in merged), 2)


for p in sorted(glob.glob(os.path.join(SRC, "IMG_*"))):
    name = os.path.basename(p).rsplit(".", 1)[0]
    if name in inv or p.endswith("SKIP_TOO_LARGE"):
        continue
    d, w, h, fps, has_a, trc = probe(p)
    segs, sp = voice(p) if has_a else ([], 0)
    inv[name] = {"file": os.path.basename(p), "dur": round(d, 2), "res": f"{w}x{h}", "orient": "vertical" if h > w else "horizontal",
                 "fps": fps, "hdr": trc == "arib-std-b67", "speech_s": sp, "speech": segs}
inv.setdefault("IMG_8954", {"file": "IMG_8954.MP4", "note": "13 MB, over the Drive connector's 10 MB download limit; not analysed"})
json.dump(inv, open(OUT, "w"), indent=1, ensure_ascii=False)
talk = sorted((k for k, v in inv.items() if v.get("speech_s", 0) >= 1.5), key=lambda k: -inv[k]["speech_s"])
print(len(inv), "clips;", "with speech >=1.5 s:", len(talk))
for k in talk:
    print(k, inv[k]["dur"], inv[k]["speech_s"], inv[k]["speech"][:6])
