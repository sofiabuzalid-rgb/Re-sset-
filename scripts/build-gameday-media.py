"""
RE:SET GAME DAY ("En esta casa no todos le vamos al mismo equipo") — media.
- Shots: iPhone HLG -> SDR BT.709 (hable tone-map), natural warm/bright lift (gamma, a touch of saturation and warmth),
  light sharpening; no strong filter. Muted (no voice-over; music only).
- Optional constant speed per shot (slow close).
- Music: ORIGINAL stadium-inspired hype instrumental (no samples, no NFL/third-party music), 120 BPM (beat = 15
  frames), energy from frame 1: heavy kick, stomp-clap, drumline snare 16ths, toms, sub bass, brass-like stabs
  (D minor); an impact hit (low boom + noise burst) on every team change listed in edit.json "hits", a short
  whoosh into each hand-swipe reveal, half-time drop for the family "match" moment, final stab on the close.
Output: public/day2/<shot>.mp4, public/day2/music.wav
Usage: python3 scripts/build-day2-media.py /folder/with/originals
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "gameday")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "gameday", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.07:contrast=1.04:saturation=1.06,colorbalance=rm=0.015:bm=-0.015,unsharp=5:5:0.4:5:5:0"
procs = []
for s in e["shots"]:
    sp = s.get("speed", 1.0)
    procs.append(subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, s["file"]), "-an",
                                   "-vf", f"{TM},setpts=PTS/{sp},{GRADE},format=yuv420p", "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264",
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


NOTE.update({"F": 5, "G": 7, "A#": 10, "C": 0})
CH = [["D4", "F4", "A4"], ["A#3", "D4", "F4"], ["C4", "E4", "G4"], ["A3", "C#4", "E4"]]
RT = ["D2", "A#1", "C2", "A1"]


def snare(a=1.0):
    t = tt(0.18)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    return a * (0.5 * body + noise(0.18, 0.06, 0.35, 1)[: len(t)])


def tom(f, a=1.0):
    t = tt(0.4)
    return a * np.sin(2 * np.pi * np.cumsum(f * (1 + 0.4 * np.exp(-t / 0.03))) / SR) * np.exp(-t / 0.18)


end_fr = e["close"]["from"]  # final stab on the closing card (frame 500)
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if t0 * FPS >= end_fr:
        continue
    for k in range(4):
        tb = t0 + k * BEAT
        if tb * FPS >= end_fr - 1:
            continue
        put("dr", kick(1.0), tb)
        if k in (1, 3):
            put("dr", clap(1.0), tb)
            put("dr", snare(0.6), tb)
        drop = 240 <= tb * FPS < 345
        for h in range(4):  # drumline 16ths, accented (half-time drop for the family "match" moment)
            if not drop or h == 0:
                put("dr", snare(0.28 if h == 0 else 0.12), tb + h * BEAT / 4)
        put("ba", bass(hz(RT[c]), BEAT * 0.45, 0.8), tb)
        put("ba", bass(hz(RT[c]), BEAT * 0.2, 0.5), tb + 0.75 * BEAT)
    for k in (0, 0.75, 1.5, 2.5, 3.0):  # brass stabs
        if (t0 + k * BEAT) * FPS < end_fr - 1:
            put("syn", stab(fs, 0.16, 0.55), t0 + k * BEAT)
    if b % 2 == 1:  # tom fill at the end of every second bar
        for j, f in enumerate((200, 170, 140, 110)):
            if (t0 + (3 + j / 4) * BEAT) * FPS < end_fr - 1:
                put("dr", tom(f, 0.5), t0 + (3 + j / 4) * BEAT)
t0 = end_fr / FPS
put("syn", stab([hz(n) for n in ["D4", "F4", "A4", "D5"]], 1.8, 0.85), t0)
put("ba", bass(hz("D2"), 1.6, 0.9), t0)
put("dr", kick(1.2), t0)
put("dr", clap(0.9), t0)
for j in range(12):  # snare roll into the hit
    put("dr", snare(0.15 + 0.03 * j), t0 - (12 - j) * BEAT / 8)
for fr in e["hits"]:  # impact on every team change
    t = tt(0.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.22)
    put("fx", 0.55 * boom + noise(0.6, 0.06, 0.12, 1)[: len(t)], fr / FPS)
for fr in (90, 135, 180, 210):  # whoosh into each hand-swipe reveal
    t = tt(0.5)
    w = np.diff(rng.standard_normal(len(t) + 1)) * np.sin(np.pi * t / 0.5) ** 2 * 0.06
    put("fx", w, fr / FPS + 0.1)
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
fo = int(1.5 * SR)
music[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, music.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", TOTAL / FPS, "s")
