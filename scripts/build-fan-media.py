"""
RE:SET — LIKE FATHER, LIKE FAN (Game Day) — media + ORIGINAL music.
EDL: src/fan/edit.json. Sources: IMG_2036–2040 (iPhone HLG, vertical), uploaded to the chat.
- Video: hable tone-map to SDR BT.709, crop with zoom <= 1.35 (keeps native sharpness), gentle sports-contrast grade,
  muted (no ambience at all).
- Music: ORIGINAL stadium-percussion track (numpy, no samples, no NFL/third-party audio), 120 BPM = 15 frames/beat:
  hit on frame 0, one hit per team change, half-time on "MISMO EQUIPO", build into the price hit, drum fill on the
  closing question, final hit + held chord on "HAZ MATCH CON RE:SET." Loudness -14 LUFS / -1 dBTP.
Usage: python3 scripts/build-fan-media.py
"""
import importlib.util, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "fan")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "fan", "edit.json")))
FPS, SR = e["fps"], 48000
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    sys.argv = [sys.argv[0]]
    spec.loader.exec_module(m)
    return m
m4 = load("m4", "build-meta4-media.py")
mu = load("mu", "build-meta4-music.py")
GRADE = "eq=gamma=1.02:contrast=1.06:saturation=1.08,unsharp=5:5:0.35:5:5:0"

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
B = 60 / e["bpm"]
st = {s["id"]: s["from"] / FPS for s in e["shots"]}
mx = mu.Mix(TOTAL, tail=1.5)
half0, half1 = st["pm"], st["pm"] + 2.0  # half-time on "MISMO EQUIPO / DIFERENTES TAMAÑOS"
price, fill, end = st["pr"], st["f1"], st["end"]


def tom(f0, a=1.0, d=0.22):
    t = mu.tt(d * 2)
    f = f0 * (1 + 0.6 * np.exp(-t / 0.03))
    return a * np.sin(2 * np.pi * np.cumsum(f) / mu.SR) * np.exp(-t / d)


def brass(fs, d, a=1.0):  # synth-brass stab (saw stack + quick filter-ish envelope)
    t = mu.tt(d + 0.1)
    s = sum(mu.saw(f * (1 + dt), t, 14) for f in fs for dt in (-0.003, 0.003)) / (2 * len(fs))
    return a * s * np.minimum(1, t / 0.008) * np.exp(-t / (d * 0.6))


CH = [["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["G3", "B3", "D4"]]
RT = ["A1", "F1", "C2", "G1"]
nb = int(TOTAL / FPS / (4 * B)) + 1
for b in range(nb):
    t0 = b * 4 * B
    c = b % 4
    for k in range(4):
        tb = t0 + k * B
        if tb >= end - 0.01:
            break
        half = half0 <= tb < half1
        if half:
            if k in (0,):
                mx.put("dr", mu.kick(1.0, 0.18), tb)
                mx.put("dr", tom(110, 0.6), tb)
            if k == 2:
                mx.put("dr", mu.clap(0.8), tb)
            mx.put("ba", mu.bass(mu.hz(RT[c]), B * 1.8, 0.6), tb) if k == 0 else None
            continue
        mx.put("dr", mu.kick(1.0, 0.14), tb)
        mx.duck(tb, 0.35)
        if k in (1, 3):
            mx.put("dr", mu.clap(0.75), tb)
            mx.put("dr", mu.noise(0.18, 0.06, 0.25, 1), tb)  # snare body
        mx.put("dr", mu.hat(0.9, 0.03), tb + B / 2)
        mx.put("dr", mu.hat(0.5, 0.02), tb + B / 4)
        mx.put("dr", mu.hat(0.5, 0.02), tb + 3 * B / 4)
        mx.put("dr", tom(150 if k % 2 else 95, 0.35), tb + B / 2) if k in (2, 3) else None
        mx.put("ba", mu.bass(mu.hz(RT[c]), B * 0.42, 0.7), tb)
        mx.put("ba", mu.bass(mu.hz(RT[c]) * 2, B * 0.2, 0.35), tb + 0.75 * B)
        if k in (0, 2):
            mx.put("mu", brass(mu.chord(CH[c]), 0.18, 0.28), tb + B / 2)
# hits: frame 0, each team change, price, final
hits = [0.0, st["h2"]] + [st[f"t{i}"] for i in range(1, 6)] + [price, end]
for h in hits:
    mx.put("fx", mu.impact(0.55 if h not in (0.0, price, end) else 0.95), h)
    mx.put("mu", brass(mu.chord(["A3", "C4", "E4", "A4"]), 0.25, 0.45), h)
mx.put("fx", mu.riser(1.0, 0.3), price - 1.0)
for k in range(8):  # tom fill on the closing question
    mx.put("dr", tom([180, 160, 140, 120, 110, 95, 85, 75][k], 0.6, 0.14), fill + k * B / 3)
mx.put("mu", brass(mu.chord(["A3", "C4", "E4", "A4", "C5"]), 1.4, 0.7), end)
mx.put("mu", mu.pad(mu.chord(["A3", "C4", "E4", "G4"]), 1.6, 0.25), end)
mx.put("ba", mu.bass(mu.hz("A1"), 1.4, 0.8), end)
mx.render(os.path.join(OUT, "music.wav"), verb=0.12, drive=1.6, fade=0.5)
print("fan", len(e["shots"]), "shots,", TOTAL / FPS, "s")
