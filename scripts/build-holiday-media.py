"""
"Your Holiday RE:SET" media.

Video: graded 1080x1920 shots from the two parts of IMG_1526 (rotation applied, muted). The voice is not used in this
cut (see docs/holiday-reset.md). Photos: copied untouched (exact prints and colours).
Music: an ORIGINAL instrumental (no samples, no third-party material, no carol melodies): bright holiday fashion pop,
120 BPM, D major, which moves to B minor under the Hanukkah section. Plus two discreet SFX (whoosh, soft tick).

Usage: python3 scripts/build-holiday-media.py <folder with 1526a.mov 1526b.mov and the 5 photos>
"""
import json, os, shutil, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "holiday")
e = json.load(open(os.path.join(ROOT, "src", "holiday", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- picture
# The rack video is a white/grey room under cool LEDs: neutral already. Gentle contrast and a touch of warmth so it sits
# with the warm studio photos. Saturation is left alone so the reds, greens and navy stay true.
GRADE = ("colorchannelmixer=rr=1.01:bb=0.985,eq=contrast=1.05:brightness=0.005:gamma=0.98,"
         "scale=1080:1920:flags=lanczos,unsharp=5:5:0.25:5:5:0,format=yuv420p")
total = 0.0
for s in e["shots"]:
    d = s["out"] - s["in"] if s["kind"] == "video" else s["dur"]
    assert abs(d * 2 - round(d * 2)) < 1e-6, s["id"]  # every shot is a whole number of beats
    total += d
    if s["kind"] != "video":
        continue
    frames = round(d * FPS)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in']:.3f}", "-i", os.path.join(SRC, f"1526{s['src']}.mov"), "-an",
                    "-vf", GRADE, "-frames:v", str(frames), "-c:v", "libx264", "-preset", "medium", "-crf", "13", "-g", "15",
                    "-movflags", "+faststart", os.path.join(OUT, f"{s['id']}.mp4")], check=True)
for p in ("red", "green", "bear", "bear_detail", "bear_rack"):
    shutil.copyfile(os.path.join(SRC, f"{p}.jpg"), os.path.join(OUT, f"{p}.jpg"))
print("timeline", total, "s")

# ---------------------------------------------------------------- music
rng = np.random.default_rng(1225)
BEAT = 60 / BPM
BAR = 4 * BEAT
N = int((total + 2) * SR)
bus = {k: np.zeros(N) for k in ("drums", "keys", "bass", "lead", "fx")}
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
hp = lambda x: np.diff(x, prepend=0.0)  # noqa: E731


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


def saw(f, t, h=10, br=0.8, det=0.0):
    return sum(np.sin(2 * np.pi * f * k * (1 + det) * t) / k * br ** (k - 1) for k in range(1, h + 1) if f * k < 14000)


def stab(ns, d, a=1.0):
    """Short bright chord stab (detuned saws, quick decay): the pop 'hit' on the off-beats."""
    t = tt(d + 0.2)
    s = sum(saw(hz(n), t, 9, 0.75, dt) for n in ns for dt in (-0.006, 0.006)) / (2 * len(ns))
    return a * s * np.exp(-t / 0.16) * env(len(t), 0.003, 0.08, hold=d)


def epiano(f, d, a=1.0):
    t = tt(d + 0.5)
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.1 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4)
    return a * body * np.exp(-t / 1.4) * env(len(t), 0.004, 0.35, hold=d)


def chord(ns, d, a=1.0):
    out = np.zeros(int((d + 0.6) * SR))
    for k, n in enumerate(ns):
        x = epiano(hz(n), d, a / len(ns) ** 0.7)
        i = int(k * 0.01 * SR)
        out[i:i + len(x)] += x[: len(out) - i]
    return out


def glock(f, d=0.6, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.45) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.12)
                + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.05))


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.25 * saw(f, t, 5, 0.5)) * env(len(t), 0.004, 0.05)


def kick(a=1.0):
    t = tt(0.32)
    f = 46 + 110 * np.exp(-t / 0.028)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14) + 0.15 * np.exp(-t / 0.002))


def clap(a=1.0):
    t = tt(0.25)
    n = hp(rng.standard_normal(len(t)))
    burst = sum(np.exp(-np.clip(t - o, 0, None) / 0.006) * (t >= o) for o in (0, 0.009, 0.018))
    return a * 0.35 * n * (0.6 * burst + np.exp(-t / 0.06))


def hat(a=1.0, open_=False):
    t = tt(0.25 if open_ else 0.05)
    return a * hp(hp(rng.standard_normal(len(t)))) * np.exp(-t / (0.08 if open_ else 0.012)) * 0.14


def riser(d, a=1.0):
    t = tt(d)
    p = t / d
    return a * hp(rng.standard_normal(len(t))) * p ** 2.5 * 0.2 + a * 0.05 * np.sin(2 * np.pi * (300 + 900 * p ** 2) * t) * p


def impact(a=1.0):
    t = tt(1.6)
    return a * (np.sin(2 * np.pi * 42 * t) * np.exp(-t / 0.4) + 0.3 * hp(rng.standard_normal(len(t))) * np.exp(-t / 0.25))


def whoosh(d=0.5, a=1.0):
    t = tt(d)
    p = t / d
    n = rng.standard_normal(len(t))
    k = np.exp(-((p - 0.55) / 0.22) ** 2)
    lp = np.convolve(n, np.ones(12) / 12, "same")
    return a * (lp * k * 0.6 + hp(n) * k * 0.08)


def tick(a=1.0):
    t = tt(0.08)
    return a * np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.012) * 0.3


XMAS = [["F#3", "A3", "D4"], ["F#3", "B3", "D4"], ["G3", "B3", "D4"], ["E3", "A3", "C#4"]]       # D – Bm – G – A
XROOT = ["D2", "B1", "G1", "A1"]
HANU = [["F#3", "B3", "D4"], ["G3", "B3", "D4"], ["F#3", "A3", "D4"], ["E3", "A3", "C#4"]]       # Bm – G – D – A
HROOT = ["B1", "G1", "D2", "A1"]
XMEL = [["F#5", "A5", "D6", "A5"], ["F#5", "B5", "D6", "B5"], ["G5", "B5", "D6", "B5"], ["E5", "A5", "C#6", "E6"]]
HMEL = [["F#5", "B5", "D6", "B5"], ["G5", "B5", "D6", "G5"], ["F#5", "A5", "D6", "A5"], ["E5", "A5", "C#6", "A5"]]

T_HANU, T_CLOSE, END = 10.0, 20.0, total
n_bars = int(np.ceil(T_CLOSE / BAR))
for b in range(n_bars):
    t0 = b * BAR
    hanu = T_HANU <= t0 < 16.0
    c = b % 4 if not hanu else (b - 5) % 4
    ch, rt, mel = (HANU[c], HROOT[c], HMEL[c]) if hanu else (XMAS[c], XROOT[c], XMEL[c])
    put("keys", chord(ch, BAR * 0.95, 0.5), t0)
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= T_CLOSE:
            break
        if k % 2 == 0:
            put("drums", kick(0.9), tk)
        if k in (2, 6) and not (hanu and t0 == T_HANU):
            put("drums", clap(0.75), tk)
        put("drums", hat(0.55 if k % 2 else 0.3, open_=(k % 2 == 1 and k in (3, 7))), tk)
        put("drums", hat(0.2), tk + BEAT / 4)
        if k % 2 == 1:
            put("keys", stab(ch, 0.12, 0.35), tk)
        put("bass", bass(hz(rt) * (2 if k in (3, 6) else 1), BEAT / 2 * 0.8, 0.6), tk)
        if t0 >= 3.0 or b == 0:
            put("lead", glock(hz(mel[k % 4]), 0.5, 0.22 if k % 2 == 0 else 0.15), tk)
# section accents
put("fx", impact(0.5), 0.0)
put("fx", riser(1.0, 0.7), T_HANU - 1.0)
put("fx", impact(0.6), T_HANU)
put("fx", whoosh(0.5, 0.8), T_HANU - 0.25)
put("fx", riser(1.0, 0.5), T_CLOSE - 1.0)
for tx in ("christmas", "hanukkah", "favorite"):
    put("fx", tick(0.7), next(x["from"] for x in e["texts"] if x["id"] == tx) + 0.1)
# close: final Dmaj9 hit, a bar of light groove, then it rings out under the CTA
put("keys", chord(["F#3", "A3", "D4", "E4", "A4"], 2.6, 0.75), T_CLOSE)
put("bass", bass(hz("D1"), 2.2, 0.7), T_CLOSE)
put("fx", impact(0.5), T_CLOSE)
for k, n in enumerate(["A5", "D6", "F#6", "A6", "D7"]):
    put("lead", glock(hz(n), 1.4, 0.18), T_CLOSE + k * 0.08)
for k in range(4):
    put("drums", hat(0.35), T_CLOSE + 0.5 + k * BEAT / 2)

pump = np.ones(N)
for b in range(int(T_CLOSE / BEAT)):
    i = int(b * BEAT * SR)
    n = int(0.2 * SR)
    pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.32 * np.exp(-np.arange(n) / SR / 0.07))
dry = bus["drums"] * 0.85 + (bus["keys"] * 0.8 + bus["bass"] * 0.85) * pump + bus["lead"] * 0.8 + bus["fx"] * 0.8
ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir = np.convolve(ir, np.ones(6) / 6, "same")
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
send = bus["keys"] + bus["lead"] + 0.3 * bus["fx"] + 0.1 * bus["drums"]
wet = np.fft.irfft(np.fft.rfft(send, size) * np.fft.rfft(ir, size), size)[:N]
side = np.fft.irfft(np.fft.rfft(bus["lead"] + bus["keys"], size) * np.fft.rfft(np.roll(ir, 1100), size), size)[:N]
mix = dry + 0.25 * wet
peak = np.max(np.abs(mix))
L, R = mix + 0.12 * side, mix - 0.12 * side
L, R = (np.tanh(x / peak * 1.25) / np.tanh(1.25) for x in (L, R))
n_out = int(END * SR)
L, R = L[:n_out], R[:n_out]
fo = int(0.8 * SR)
for x in (L, R):
    x[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    x[:64] *= np.linspace(0, 1, 64)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, np.stack([L, R], 1).astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=8", "-ar", "48000",
                os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", END, "s")
