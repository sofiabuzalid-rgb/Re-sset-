"""
MY RE:SET ROTATION — media.
- Shots: iPhone HLG -> SDR BT.709 (hable tone-map), natural warm/bright lift (gamma, a touch of saturation and warmth),
  light sharpening; no strong filter. Muted (no voice-over; music only).
- Shots may be iPhone HLG (tone-mapped) or SDR (the 720p fitting-room clip, Lanczos-upscaled x1.5, no invented detail).
- Music: ORIGINAL cool-girl indie pop (no samples or third-party material), 120 BPM (beat = 15 frames), groove from
  frame 1: kick/snare backbeat, tambourine, melodic bass, muted-guitar plucks, synth hook (D–Bm–G–A),
  final chord on the closing shot.
Output: public/day2/<shot>.mp4, public/day2/music.wav
Usage: python3 scripts/build-day2-media.py /folder/with/originals
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "rotation")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "rotation", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.07:contrast=1.04:saturation=1.06,colorbalance=rm=0.015:bm=-0.015,unsharp=5:5:0.4:5:5:0"
procs = []
for s in e["shots"]:
    hdr = s["file"].lower().endswith(".mov") and "IMG_" in s["file"]
    pre = f"{TM}," if hdr else "scale=1080:1920:flags=lanczos,"
    procs.append(subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, s["file"]), "-an",
                                   "-vf", f"{pre}{GRADE},format=yuv420p", "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264",
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


NOTE.update({"G": 7, "F": 5})
CH = [["D4", "F#4", "A4"], ["B3", "D4", "F#4"], ["G3", "B3", "D4"], ["A3", "C#4", "E4"]]
RT = ["D2", "B1", "G1", "A1"]
HOOK = [["F#5", "A5", "B5", "A5"], ["F#5", "D5", "E5", "F#5"], ["G5", "F#5", "E5", "D5"], ["E5", "F#5", "A5", None]]
close_bar = None
end_fr = e["close"]["from"] - 3  # final chord on the closing shot (frame 375)
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    for k in range(4):
        tb = t0 + k * BEAT
        if tb * FPS >= end_fr - 1:
            continue
        put("dr", kick(0.9 if k in (0, 2) else 0.0), tb)
        if k in (1, 3):
            put("dr", clap(0.9), tb)
        put("dr", kick(0.45), tb + 0.5 * BEAT) if k == 1 else None
        for h in range(2):  # tambourine 8ths
            put("dr", noise(0.08, 0.025, 0.07 if h else 0.04), tb + h * BEAT / 2)
        put("ba", bass(hz(RT[c]) * (2 if k == 3 else 1), BEAT * 0.45, 0.75), tb)
        put("ba", bass(hz(RT[c]) * 1.5, BEAT * 0.2, 0.45), tb + 0.75 * BEAT)
        for h in (0, 0.5):  # muted-guitar plucks
            put("syn", pluck(fs[(k + int(h * 2)) % 3] , 0.08, 0.22), tb + h * BEAT)
        n = HOOK[c][k]
        if n and b >= 1:
            put("syn", pluck(hz(n), 0.25, 0.3), tb)
t0 = end_fr / FPS
put("syn", stab([hz(n) for n in ["D4", "F#4", "A4", "D5"]], 1.8, 0.7), t0)
put("syn", pluck(hz("A5"), 0.6, 0.3), t0)
put("ba", bass(hz("D2"), 1.6, 0.8), t0)
put("dr", kick(1.0), t0)
put("dr", clap(0.6), t0)
close_bar = int(end_fr // 60)
pump = np.ones(L)
for b in range(close_bar + 1):
    for k in range(4):
        i = int((b * BAR + k * BEAT) * SR)
        if (b * BAR + k * BEAT) * FPS >= end_fr - 1:
            continue
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
