"""
Mini Lookbook media: graded 1080x1920 shots (muted: the original audio is ambience/background only, no dialogue)
and an ORIGINAL instrumental (no samples, no third-party material): soft fashion pop at 120 BPM in F major,
warm electric piano, round sub bass, light kick/snap/shaker. Every cut in edit.json lands on a beat (0.5 s).

Usage: python3 scripts/build-lookbook-media.py /path/to/v1c044g50000db8itv7og65rqs0jimkg.mp4
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "lookbook")
e = json.load(open(os.path.join(ROOT, "src", "lookbook", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- video
# One grade for every shot (exposure is already consistent across the clip, mean luma 125-132):
# trim the warm cast of the tungsten light a touch, gentle contrast, a hair of lift, saturation kept ~true
# so skin and the sage set keep their real colour. Light temporal denoise, Lanczos x1.875 upscale, mild sharpening.
GRADE = ("colorchannelmixer=rr=0.97:bb=1.035,eq=contrast=1.06:brightness=0.012:gamma=1.04:saturation=0.97,"
         "hqdn3d=1.2:1.2:3:3,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35:5:5:0,format=yuv420p")
total_f = 0
for s in e["shots"]:
    frames = round((s["out"] - s["in"]) * FPS)
    assert frames % 15 == 0, (s["id"], frames)
    total_f += frames
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in']:.3f}", "-i", SRC, "-an", "-vf", GRADE, "-frames:v", str(frames),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-g", "15", "-movflags", "+faststart",
                    os.path.join(OUT, f"{s['id']}.mp4")], check=True)
CUTS_F = total_f
total_f += round(e["holdSeconds"] * FPS)
print("shots", CUTS_F, "frames; total", total_f)

# ---------------------------------------------------------------- music
rng = np.random.default_rng(2611)
BEAT = 60 / BPM
BAR = 4 * BEAT
dur = total_f / FPS + 1.5
N = int(dur * SR)
bus = {k: np.zeros(N) for k in ("drums", "keys", "bass", "fx")}
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


def epiano(f, d, a=1.0):
    """Rhodes-ish: sine body + soft FM tine that decays fast, slow tremolo."""
    t = tt(d + 0.6)
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.2 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return a * body * trem * np.exp(-t / 1.6) * env(len(t), 0.004, 0.45, hold=d)


def chord(ns, d, a=1.0, strum=0.012):
    out = np.zeros(int((d + 0.6 + strum * len(ns)) * SR))
    for k, n in enumerate(ns):
        x = epiano(hz(n), d, a / len(ns) ** 0.7)
        i = int(k * strum * SR)
        out[i:i + len(x)] += x
    return out


def pluck(f, d=0.25, a=1.0):
    t = tt(d + 0.3)
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.4 * np.exp(-t * (6 + 6 * k)) for k in range(1, 7))
    return a * s * env(len(t), 0.003, 0.1)


def bell(f, d=1.4, a=1.0):
    t = tt(d)
    return a * sum(g * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dc) for r, g, dc in [(1, 1, 1.0), (2, 0.3, 0.5), (3.01, 0.12, 0.25)])


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.12 * np.sin(2 * np.pi * 2 * f * t)) * env(len(t), 0.006, 0.06)


def kick(a=1.0):
    t = tt(0.3)
    f = 48 + 80 * np.exp(-t / 0.025)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) + 0.08 * np.exp(-t / 0.002))


def snap(a=1.0):
    t = tt(0.18)
    n = hp(rng.standard_normal(len(t)))
    return a * (0.3 * n * np.exp(-t / 0.025) + 0.25 * np.sin(2 * np.pi * 1650 * t) * np.exp(-t / 0.008))


def shaker(a=1.0):
    t = tt(0.06)
    return a * hp(hp(rng.standard_normal(len(t)))) * (t / 0.006).clip(0, 1) * np.exp(-t / 0.018) * 0.1


def swell(d, a=1.0):
    t = tt(d)
    return a * hp(rng.standard_normal(len(t))) * (t / d) ** 3 * 0.12


# F major, I – iii – vi – IV with sevenths/ninths: warm, modern, unsentimental
CH = [["F3", "A3", "C4", "E4"], ["E3", "G3", "A3", "C4"], ["D3", "F3", "A3", "C4"], ["Bb2", "D3", "F3", "A3"]]
RT = ["F1", "A1", "D2", "Bb1"]
MEL = [["C5", "A4", "G4", "A4"], ["E5", "C5", "B4", "C5"], ["A4", "F4", "E4", "F4"], ["D5", "C5", "A4", "F4"]]
END_T = CUTS_F / FPS          # the hold on the last frame starts here: music resolves on this downbeat
n_bars = int(np.ceil(END_T / BAR))
for b in range(n_bars):
    t0 = b * BAR
    c = b % 4
    for k, (pos, ln) in enumerate([(0, 1.4), (1.5, 0.45), (2.5, 1.4)]):  # syncopated comp
        if t0 + pos * BEAT < END_T - 0.01:
            put("keys", chord(CH[c], ln * BEAT, 0.55 if k != 1 else 0.35), t0 + pos * BEAT)
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= END_T - 0.01:
            break
        full = tk >= 2.0
        if k % 2 == 0:
            put("drums", kick(0.75 if full else 0.5), tk)
        if full and k in (2, 6):
            put("drums", snap(0.7), tk)
        if full:
            put("drums", shaker(0.5 if k % 2 else 0.3), tk)
            put("drums", shaker(0.22), tk + BEAT / 4)
            put("bass", bass(hz(RT[c]) * (2 if k in (3, 7) else 1), BEAT / 2 * 0.8, 0.55), tk)
        elif k % 2 == 0:
            put("bass", bass(hz(RT[c]), BEAT * 0.9, 0.4), tk)
        if 7.0 <= tk:  # light pluck line from the movement section on
            put("fx", pluck(hz(MEL[c][k % 4]), 0.22, 0.28), tk + (BEAT / 4 if k % 2 else 0))
put("fx", swell(1.0, 0.8), END_T - 1.0)
# resolve: Fmaj9 ringing out under the logo
put("keys", chord(["F3", "A3", "C4", "E4", "G4"], 1.6, 0.7, 0.02), END_T)
put("bass", bass(hz("F1"), 1.6, 0.6), END_T)
put("drums", kick(0.6), END_T)
for k, n in enumerate(["C6", "F6", "A6"]):
    put("fx", bell(hz(n), 1.8, 0.12), END_T + k * 0.09)
# a delicate bell under each text reveal
for tx in e["texts"]:
    if tx["id"] != "tagline":
        put("fx", bell(hz("A5"), 1.0, 0.1), tx["from"])

pump = np.ones(N)
for b in range(n_bars * 4):
    i = int(b * BEAT * SR)
    n = int(0.2 * SR)
    if b * BEAT >= 2.0 and b * BEAT < END_T and i + n < N:
        pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.3 * np.exp(-np.arange(n) / SR / 0.07))
dry = bus["drums"] * 0.85 + (bus["keys"] * 0.9 + bus["bass"] * 0.85) * pump + bus["fx"] * 0.9
ir_n = int(2.2 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.5)
ir = np.convolve(ir, np.ones(8) / 8, "same")  # darker tail
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
wet = np.fft.irfft(np.fft.rfft(bus["keys"] + bus["fx"] + 0.2 * bus["drums"], size) * np.fft.rfft(ir, size), size)[:N]
mix = dry + 0.28 * wet
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) / np.tanh(1.2)
mix = mix[: int(total_f / FPS * SR)]
fo = int(0.6 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
mix[:96] *= np.linspace(0, 1, 96)
# subtle stereo: widen the reverb only
side = 0.12 * np.fft.irfft(np.fft.rfft(bus["keys"] + bus["fx"], size) * np.fft.rfft(np.roll(ir, 900), size), size)[: len(mix)]
side /= max(1e-9, np.max(np.abs(mix)))
L, R = mix + side, mix - side
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, np.stack([L, R], 1).astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=8", "-ar", "48000", os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", total_f / FPS, "s")
