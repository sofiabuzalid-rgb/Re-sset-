"""
DAY 2 AT HOTBOOK BAZAR — media.
- Shots: iPhone HLG -> SDR BT.709 (hable tone-map), natural warm/bright lift (gamma, a touch of saturation and warmth),
  light sharpening; no strong filter. Muted (no voice-over; music only).
- Music: ORIGINAL indie-dance / electropop (no samples or third-party material), 120 BPM (beat = 15 frames),
  beat from the first second: four-on-the-floor, clap, 16th hats, off-beat bass, bright synth arpeggio + chord stabs
  (F#m–D–A–E), riser into the client section and into the final montage, button ending on the closing card.
Output: public/day2/<shot>.mp4, public/day2/music.wav
Usage: python3 scripts/build-day2-media.py /folder/with/originals
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "day2")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "day2", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.07:contrast=1.04:saturation=1.06,colorbalance=rm=0.015:bm=-0.015,unsharp=5:5:0.4:5:5:0"
procs = []
for s in e["shots"]:
    procs.append(subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, s["file"] + ".mov"), "-an",
                                   "-vf", f"{TM},{GRADE},format=yuv420p", "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264",
                                   "-preset", "medium", "-crf", "15", "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709",
                                   "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")]))
    if len(procs) >= 4:
        procs.pop(0).wait()
for p in procs:
    p.wait()
TOTAL = sum(s["frames"] for s in e["shots"])
print("video", TOTAL)

L = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(1752)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("dr", "syn", "ba", "fx")}
NOTE = {"C": 0, "C#": 1, "D": 2, "E": 4, "F#": 6, "G#": 8, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, g=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * g


def saw(f, t, n=12):
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, n + 1) if f * k < 14000)


def pluck(f, d=0.18, a=1.0):
    t = tt(d + 0.2)
    s = saw(f, t, 8) * np.exp(-t / 0.09) + 0.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.05)
    return a * s * np.minimum(1, t / 0.002)


def stab(fs, d, a=1.0):
    t = tt(d + 0.15)
    s = sum(saw(f, t, 10) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t)) for f in fs) / len(fs)
    return a * s * np.minimum(1, t / 0.004) * np.exp(-t / 0.25)


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.35 * saw(f, t, 4)) * np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.02)


def kick(a=1.0):
    t = tt(0.35)
    f = 50 + 120 * np.exp(-t / 0.025)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13) + 0.15 * np.exp(-t / 0.002))


def noise(d, dec, a, order=2):
    t = tt(d)
    n = rng.standard_normal(len(t) + order)
    for _ in range(order):
        n = np.diff(n)
    return a * n[: len(t)] * np.exp(-t / dec)


def clap(a=1.0):
    t = tt(0.22)
    n = np.diff(rng.standard_normal(len(t) + 1))
    ev = sum(np.where(t >= q, np.exp(-(t - q) / (0.01 if q < 0.02 else 0.08)), 0) for q in (0, 0.009, 0.018))
    return a * n * ev * 0.3


CH = [["F#3", "A3", "C#4", "E4"], ["D3", "F#3", "A3", "C#4"], ["A3", "C#4", "E4", "G#4"], ["E3", "G#3", "B3", "D4"]]
RT = ["F#1", "D1", "A1", "E1"]
ARP = [["F#5", "A5", "C#6", "A5"], ["F#5", "A5", "D6", "A5"], ["E5", "A5", "C#6", "E6"], ["E5", "G#5", "B5", "D6"]]
close_bar = e["outro"]["from"] // 60 + 1  # 812 -> bar 14 (frame 840)
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < close_bar:
        for k in range(4):
            put("dr", kick(0.95), t0 + k * BEAT)
            put("ba", bass(hz(RT[c]) * 2, BEAT * 0.42, 0.7), t0 + (k + 0.5) * BEAT)
        put("dr", clap(0.85), t0 + BEAT)
        put("dr", clap(0.85), t0 + 3 * BEAT)
        for k in range(16):
            put("dr", noise(0.06, 0.012 if k % 2 == 0 else 0.03, 0.05 if k % 2 == 0 else 0.08), t0 + k * BEAT / 4)
        for k in range(16):
            if b >= 1 or k % 2 == 0:
                put("syn", pluck(hz(ARP[c][k % 4]), 0.12, 0.32), t0 + k * BEAT / 4)
        for k in (0, 1.5, 3):
            put("syn", stab(fs, 0.14, 0.4), t0 + k * BEAT)
    if b == close_bar:
        put("syn", stab([hz(n) for n in ["F#3", "A3", "C#4", "E4", "A4"]], 1.6, 0.7), t0)
        put("ba", bass(hz("F#1"), 1.4, 0.8), t0)
        put("dr", kick(1.0), t0)
        put("dr", clap(0.7), t0)
for fr in (300, 600):  # risers into the client section and the final montage
    t = tt(1.0)
    put("fx", np.diff(rng.standard_normal(len(t) + 1)) * (t / 1.0) ** 3 * 0.07, fr / FPS - 1.0)
pump = np.ones(L)
for b in range(close_bar):
    for k in range(4):
        i = int((b * BAR + k * BEAT) * SR)
        n = int(0.18 * SR)
        if i + n < L:
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.5 * np.exp(-np.arange(n) / SR / 0.06))
music = bus["dr"] + (bus["syn"] + bus["ba"] * 0.85) * pump + bus["fx"]
ir_n = int(1.2 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.25)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
music = music + 0.18 * np.fft.irfft(np.fft.rfft(bus["syn"], size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.35) / np.tanh(1.35)
end = int(TOTAL / FPS * SR)
music = music[:end]
fo = int(0.4 * SR)
music[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, music.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", TOTAL / FPS, "s")
