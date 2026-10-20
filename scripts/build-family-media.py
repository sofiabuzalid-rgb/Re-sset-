"""
RE:SET CHRISTMAS — THE FAMILY MATCH EDIT — media + music.
EDL: src/family/edit.json. Sources: IMG_2041–2053 (iPhone HLG, vertical), uploaded to the chat. No Grinch design.
- Video: hable tone-map to SDR BT.709, crop with zoom <= 1.35 (keeps native sharpness), gentle sports-contrast grade,
  muted (no ambience at all).
- Music: if public/family/track.* exists (the client's licensed track) it is used, trimmed and faded to the edit;
  otherwise an ORIGINAL modern Christmas pop placeholder (numpy, no samples), 120 BPM = 15 frames/beat, with
  sleigh bells, claps, bass, bells hook; hit on every section change. Loudness -14 LUFS / -1 dBTP.
Usage: python3 scripts/build-fan-media.py
"""
import importlib.util, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "family")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "family", "edit.json")))
FPS, SR = e["fps"], 48000
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    sys.argv = [sys.argv[0]]
    spec.loader.exec_module(m)
    return m
m4 = load("m4", "build-meta4-media.py")
mu = load("mu", "build-meta4-music.py")
GRADE = "eq=gamma=1.03:contrast=1.05:saturation=1.08,colorbalance=rm=0.01:bm=-0.008,unsharp=5:5:0.35:5:5:0"

procs = []
for s in e["shots"]:
    src = m4.resolve(s["src"])
    w, h, hdr = m4.probe(src)
    z = s.get("z", 1.0)
    W, H = round(1080 * z / 2) * 2, round(1920 * z / 2) * 2
    sc = f"scale=-2:{H}:flags=lanczos" if w / h > 1080 / 1920 else f"scale={W}:-2:flags=lanczos"
    vf = ([m4.TM] if hdr else []) + [sc, f"crop=1080:1920:(iw-1080)*{s.get('cx', .5)}:(ih-1920)*{s.get('cy', .5)}", GRADE, "format=yuv420p"]
    procs.append(subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src, "-an", "-vf", ",".join(vf),
                                   "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "13",
                                   "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                                   os.path.join(OUT, f"{s['id']}.mp4")]))
    while len(procs) >= 6:
        procs.pop(0).wait()
for p in procs:
    p.wait()

# ---------------- music
TOTAL = e["total"]
dur = TOTAL / FPS
tracks = [f for f in os.listdir(OUT) if f.startswith("track.")]
if tracks:
    tr = os.path.join(OUT, tracks[0])
    off = float(e.get("track_offset", 0))
    pre = os.path.join(OUT, "_pre.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(off), "-i", tr, "-t", str(dur), "-af", f"afade=t=out:st={dur - 0.25}:d=0.25", "-ar", "48000", "-ac", "2", pre], check=True)
    pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true", "-ar", "48000", os.path.join(OUT, "music.wav")], check=True)
    os.remove(pre)
    print("music: client track", tracks[0])
    sys.exit(0)
B = 60 / e["bpm"]
st = {s["id"]: s["from"] / FPS for s in e["shots"]}
mx = mu.Mix(TOTAL, tail=1.5)
CH = [["G3", "B3", "D4"], ["E3", "G3", "B3"], ["C4", "E4", "G4"], ["D4", "F#4", "A4"]]
RT = ["G1", "E1", "C2", "D2"]
HOOK = [["B5", "D6", "G6", "D6"], ["B5", "E6", "D6", None], ["C6", "E6", "G6", "E6"], ["D6", "F#6", "A6", None]]
end = st["end"]
for b in range(int(dur / (4 * B)) + 1):
    t0 = b * 4 * B
    c = b % 4
    mx.put("mu", mu.pad(mu.chord(CH[c]), 4 * B, 0.12), t0)
    for k in range(4):
        tb = t0 + k * B
        if tb >= end - 0.01:
            break
        mx.put("dr", mu.kick(0.95, 0.12), tb)
        mx.duck(tb, 0.35)
        if k in (1, 3):
            mx.put("dr", mu.clap(0.6), tb)
        for h in range(4):
            mx.put("dr", mu.sleigh(0.9 if h % 2 else 0.45), tb + h * B / 4)
        mx.put("ba", mu.bass(mu.hz(RT[c]), B * 0.42, 0.65), tb)
        mx.put("ba", mu.bass(mu.hz(RT[c]) * 2, B * 0.2, 0.3), tb + 0.75 * B)
        if k in (0, 2):
            mx.put("mu", mu.stab(mu.chord(CH[c]), 0.16, 0.3), tb + B / 2)
        n = HOOK[c][k]
        if n:
            mx.put("mu", mu.bell(mu.hz(n), 0.2, 0.4), tb)
for sid in ("h1", "h2", "c1", "m1", "m2", "p1", "p2", "r1"):
    mx.put("fx", mu.impact(0.4), st[sid])
for k, n in enumerate(["D6", "G6", "B6", "D7"]):
    mx.put("fx", mu.bell(mu.hz(n), 0.14, 0.6), st["p1"] + k * 0.05)
mx.put("fx", mu.riser(1.0, 0.25), end - 1.0)
mx.put("mu", mu.stab(mu.chord(["G3", "B3", "D4", "G4"]), 1.3, 0.6), end)
mx.put("mu", mu.pad(mu.chord(["G3", "B3", "D4", "F#4", "A4"]), 2.0, 0.3), end)
for k, n in enumerate(["G5", "B5", "D6", "G6"]):
    mx.put("mu", mu.bell(mu.hz(n), 0.2, 0.9), end + k * 0.07)
mx.put("ba", mu.bass(mu.hz("G1"), 1.8, 0.8), end)
mx.put("dr", mu.kick(1.0, 0.3), end)
mx.render(os.path.join(OUT, "music.wav"), verb=0.2, drive=1.35, fade=0.6)
print("family", len(e["shots"]), "shots,", dur, "s (original placeholder music)")
