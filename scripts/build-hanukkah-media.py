"""
Hanukkah ad media: pre-cut shots (speed applied, 1080x1920, muted — the originals only carry handling noise)
and an ORIGINAL instrumental (no samples, no third-party material): modern festive pop at 120 BPM in D minor
with a phrygian-dominant ("Ahava Rabbah") colour in the lead, clean drums, warm bells on text reveals.

Usage: python3 scripts/build-hanukkah-media.py /folder/with/IMG_1344-1346
"""
import glob, json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "hanukkah")
e = json.load(open(os.path.join(ROOT, "src", "hanukkah", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)


def src(n):
    return sorted(p for p in glob.glob(os.path.join(SRC, f"*{n}.*")) if p.lower().endswith(".mov"))[0]


# ---------------------------------------------------------------- video
total_f = 0
for s in e["shots"]:
    frames = round((s["out"] - s["in"]) * FPS / s["rate"])
    assert frames % 15 == 0, (s["id"], frames)
    total_f += frames
    vf = (f"trim={s['in']}:{s['out']},setpts=(PTS-STARTPTS)/{s['rate']},fps=30,"
          "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,"
          "eq=contrast=1.05:brightness=0.01:saturation=1.03,unsharp=5:5:0.3:5:5:0,format=yuv420p")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src(s["src"]), "-an", "-vf", vf, "-frames:v", str(frames),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", "-movflags", "+faststart",
                    os.path.join(OUT, f"{s['id']}.mp4")], check=True)
print("shots", total_f, "frames")

# ---------------------------------------------------------------- music
rng = np.random.default_rng(5786)
BEAT = 60 / BPM
BAR = 4 * BEAT
CLOSE_F = total_f - next(round((s["out"] - s["in"]) * FPS / s["rate"]) for s in e["shots"] if s["id"] == "close")
dur = total_f / FPS + 1.0
N = int(dur * SR)
bus = {k: np.zeros(N) for k in ("drums", "inst", "bass", "fx")}
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, x, t, g=1.0):
    i = int(t * SR)
    if 0 <= i < N:
        j = min(N, i + len(x))
        bus[b][i:j] += x[: j - i] * g


def env(n, a, r, hold=None):
    x = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, int(r * SR))
    H = n - R if hold is None else max(A, min(n - R, int(hold * SR)))
    x[:A] = np.linspace(0, 1, A)
    x[H:] = np.linspace(1, 0, n - H) ** 2
    return x


def saw(f, t, h=12, br=0.85, det=0.0):
    return sum(np.sin(2 * np.pi * f * k * (1 + det) * t) / k * br ** (k - 1) for k in range(1, h + 1) if f * k < 12000)


def pluck(f, d=0.3, a=1.0):
    t = tt(d + 0.3)
    s = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (5 + 5 * k)) for k in range(1, 10))
    return a * s * env(len(t), 0.003, 0.1)


def bell(f, d=1.2, a=1.0):
    t = tt(d)
    s = sum(g * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dc) for r, g, dc in [(1, 1, 0.9), (2, 0.4, 0.5), (3.01, 0.2, 0.25), (5.4, 0.08, 0.1)])
    return a * s


def pad(fs, d, a=1.0):
    t = tt(d + 0.5)
    s = sum(saw(f, t, 8, 0.7, dt) for f in fs for dt in (-0.004, 0, 0.004)) / (3 * len(fs))
    return a * s * env(len(t), 0.35, 0.5, hold=d)


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.2 * saw(f, t, 5, 0.6)) * env(len(t), 0.004, 0.05)


def kick(a=1.0):
    t = tt(0.35)
    f = 45 + 100 * np.exp(-t / 0.03)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.15) + 0.2 * np.exp(-t / 0.002))


hp = lambda x: np.diff(x, prepend=0.0)  # noqa: E731


def snap(a=1.0):
    t = tt(0.2)
    return a * hp(rng.standard_normal(len(t))) * np.exp(-t / 0.03) * 0.35 + a * 0.4 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.01)


def hat(a=1.0):
    t = tt(0.05)
    return a * hp(hp(rng.standard_normal(len(t)))) * np.exp(-t / 0.012) * 0.15


def riser(d, a=1.0):
    t = tt(d)
    p = t / d
    return a * hp(rng.standard_normal(len(t))) * p ** 2.5 * 0.25


# D minor progression: Dm – Bb – Gm – A (A major = the phrygian-dominant colour)
CH = [["D3", "F3", "A3"], ["D3", "F3", "Bb3"], ["D3", "G3", "Bb3"], ["C#3", "E3", "A3"]]
ROOT = ["D2", "Bb1", "G1", "A1"]
# lead motif over A major uses Bb–C#: the Ahava Rabbah colour
MOTIF = [["D5", "F5", "A5", "F5"], ["D5", "F5", "Bb5", "F5"], ["D5", "G5", "Bb5", "G5"], ["C#5", "E5", "A5", "Bb5"]]
n_bars = int(np.ceil(dur / BAR))
close_bar = CLOSE_F // 60
for b in range(n_bars):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    full = 1 <= b < close_bar
    if b <= close_bar:
        put("inst", pad(fs, BAR * 0.98, 0.45), t0)
        for k in range(8):
            put("inst", pluck(hz(MOTIF[c][k % 4]), 0.25, 0.5 if full else 0.4), t0 + k * BEAT / 2)
    if full:
        for k in range(4):
            put("drums", kick(0.85), t0 + k * BEAT)
        put("drums", snap(0.8), t0 + BEAT)
        put("drums", snap(0.8), t0 + 3 * BEAT)
        for k in range(8):
            put("drums", hat(0.6 if k % 2 else 0.35), t0 + k * BEAT / 2)
            put("bass", bass(hz(ROOT[c]) * (2 if k % 2 else 1), BEAT / 2 * 0.85, 0.6), t0 + k * BEAT / 2)
    if b == 0:
        for k in range(8):  # 8 nights: 8 bells over the first bar (one per flame)
            put("fx", bell(hz(["A5", "D6", "F6", "A6", "D6", "F6", "A6", "D7"][k]), 0.8, 0.22), t0 + k * BEAT / 2)
        put("drums", riser(BAR, 0.6), t0)
    if b == close_bar:
        put("inst", pad([hz(n) for n in ["D3", "F#3", "A3", "D4"]], 2.2, 0.6), t0)  # Picardy D major: warm ending
        for k, n in enumerate(["A5", "D6", "F#6", "A6"]):
            put("fx", bell(hz(n), 1.6, 0.25), t0 + k * 0.07)
        put("drums", kick(0.8), t0)
        put("bass", bass(hz("D1"), 1.4, 0.7), t0)
# delicate bell on each text reveal
for tx in e["texts"]:
    put("fx", bell(hz("A6"), 0.9, 0.18), tx["from"] / FPS)
# sidechain pump
pump = np.ones(N)
for b in range(1, close_bar):
    for k in range(4):
        i = int((b * BAR + k * BEAT) * SR)
        n = int(0.22 * SR)
        if i + n < N:
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.4 * np.exp(-np.arange(n) / SR / 0.08))
mix = bus["drums"] * 0.9 + (bus["inst"] * 0.8 + bus["bass"] * 0.8) * pump + bus["fx"] * 0.9
ir_n = int(1.8 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.4)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
wet = np.fft.irfft(np.fft.rfft(bus["inst"] + bus["fx"], size) * np.fft.rfft(ir, size), size)[:N]
mix = mix + 0.3 * wet
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) / np.tanh(1.3)
mix = mix[: int(total_f / FPS * SR)]
fo = int(1.0 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
mix[:120] *= np.linspace(0, 1, 120)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, np.stack([mix, mix], 1).astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9", "-ar", "48000", os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", total_f / FPS, "s")
