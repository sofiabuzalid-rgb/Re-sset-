"""
Christmas 2026 ad media from IMG_8498/8502/8504/8506/8507/8508/8509 (720x1280 sources).
- Shots: pre-cut, Lanczos-upscaled to 1080x1920 (x1.5, no invented detail), light shared grade, muted.
- Voice: IMG_8504 only — spectral denoise (noise profile from its own quiet frames), EQ, de-ess, compression,
  expander; inner pauses tightened with 12 ms fades.
- Music: ORIGINAL Christmas-pop instrumental (no samples / third-party material), 120 BPM, C major
  I–vi–IV–V with glockenspiel motif and discreet sleigh bells; ducked under the voice, up for the montage,
  final chord on the closing card.
Output: public/xmas/<shot>.mp4, public/xmas/mix.wav
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "xmas")
e = json.load(open(os.path.join(ROOT, "src", "xmas", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
src = lambda n: sorted(glob.glob(os.path.join(SRC, f"*{n}.MP4")))[0]  # noqa: E731
run = lambda c: subprocess.run(c, check=True)  # noqa: E731

# ---------------- shots
t = 0
starts = {}
for s in e["shots"]:
    starts[s["id"]] = t
    vf = ("hqdn3d=1:1:3:3,eq=contrast=1.04:brightness=0.005:saturation=1.03,"
          "scale=1080:1920:flags=lanczos,unsharp=5:5:0.4:5:5:0,format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", vf, "-frames:v", str(s["frames"]),
         "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", os.path.join(OUT, f"{s['id']}.mp4")])
    t += s["frames"]
TOTAL = t
talk_end = sum(round((v["b"] - v["a"]) * FPS) for v in e["voice"])
montage0 = starts["m01"]
close0 = starts["close"]
print("total", TOTAL, "talk_end", talk_end, "montage", montage0, "close", close0)

# ---------------- voice
N, HOP = 2048, 512
WIN = np.hanning(N)
x = None
p = os.path.join(OUT, "_v.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", src("IMG_8504"), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=90:poles=2", p])
x = sf.read(p, dtype="float64")[0]
pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
S = np.fft.rfft(np.array([pad[i:i + N] * WIN for i in range(0, len(pad) - N, HOP)]), axis=1)
mag = np.abs(S)
en = mag.sum(1)
noise = np.mean(mag[en <= np.percentile(en, 12)] ** 2, 0)
snr = np.maximum(mag ** 2 / (2 * noise) - 1, 0)
g = swv(np.pad(snr / (snr + 1), ((2, 2), (1, 1)), mode="edge"), (5, 3)).mean(axis=(-1, -2))
fr = np.fft.irfft(S * np.maximum(g, 10 ** (-20 / 20)), axis=1) * WIN
y = np.zeros(len(fr) * HOP + N)
nr = np.zeros_like(y)
for k, f in enumerate(fr):
    y[k * HOP:k * HOP + N] += f
    nr[k * HOP:k * HOP + N] += WIN ** 2
x = (y / np.maximum(nr, 1e-8))[N:N + len(x)]
sf.write(p, x.astype("float32"), SR)
chain = ("equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1:g=3,equalizer=f=9000:t=h:w=0.7:g=1.5,deesser=i=0.3,"
         "acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2,agate=threshold=0.012:ratio=2.5:range=0.12:attack=4:release=200,alimiter=limit=0.9")
p2 = os.path.join(OUT, "_v2.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", chain, "-ar", str(SR), "-ac", "1", p2])
x = sf.read(p2, dtype="float64")[0]
L = int(TOTAL / FPS * SR) + SR
voice = np.zeros(L)
vmask = np.zeros(L)
o = 0
fd = int(0.012 * SR)
for v in e["voice"]:
    n = round((v["b"] - v["a"]) * FPS)
    seg = x[int(v["a"] * SR):int(v["a"] * SR) + int(n / FPS * SR)].copy()
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    i = int(o / FPS * SR)
    voice[i:i + len(seg)] += seg
    vmask[i:i + len(seg)] = 1
    o += n
voice *= 10 ** ((-20 - 20 * np.log10(np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2)) + 1e-9)) / 20)

# ---------------- music
rng = np.random.default_rng(1224)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("dr", "in", "ba", "fx")}
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11, "Bb": 10}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
hp = lambda z: np.diff(z, prepend=0.0)  # noqa: E731


def put(b, z, ts, gg=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * gg


def envl(n, a, r, hold=None):
    z = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, int(r * SR))
    H = n - R if hold is None else max(A, min(n - R, int(hold * SR)))
    z[:A] = np.linspace(0, 1, A)
    z[H:] = np.linspace(1, 0, n - H) ** 2
    return z


saw = lambda f, t_, h=10, br=0.8, dt=0: sum(np.sin(2 * np.pi * f * k * (1 + dt) * t_) / k * br ** (k - 1) for k in range(1, h + 1) if f * k < 12000)  # noqa: E731


def glock(f, d=0.5, a=1.0):
    t_ = tt(d + 0.6)
    return a * sum(gg * np.sin(2 * np.pi * f * r * t_) * np.exp(-t_ / dc) for r, gg, dc in [(1, 1, 0.6), (2.76, 0.3, 0.15), (5.4, 0.12, 0.05)])


def keys(fs, d, a=1.0):
    t_ = tt(d + 0.3)
    s = sum(np.sin(2 * np.pi * f * t_ + 0.8 * np.sin(2 * np.pi * f * t_) * np.exp(-t_ / 0.3)) * np.exp(-t_ / 1.2) for f in fs) / len(fs)
    return a * s * envl(len(t_), 0.004, 0.2, hold=d)


def pad_(fs, d, a=1.0):
    t_ = tt(d + 0.5)
    return a * sum(saw(f, t_, 8, 0.7, dt) for f in fs for dt in (-0.004, 0, 0.004)) / (3 * len(fs)) * envl(len(t_), 0.3, 0.5, hold=d)


def bass(f, d, a=1.0):
    t_ = tt(d)
    return a * (np.sin(2 * np.pi * f * t_) + 0.2 * saw(f, t_, 5, 0.6)) * envl(len(t_), 0.004, 0.05)


def kick(a=1.0):
    t_ = tt(0.35)
    f = 45 + 100 * np.exp(-t_ / 0.03)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.15) + 0.2 * np.exp(-t_ / 0.002))


def clap(a=1.0):
    t_ = tt(0.25)
    n = hp(rng.standard_normal(len(t_)))
    ev = sum(np.where(t_ >= q, np.exp(-(t_ - q) / (0.012 if q < 0.02 else 0.08)), 0) for q in (0, 0.01, 0.02))
    return a * n * ev * 0.3


def sleigh(a=1.0):
    t_ = tt(0.15)
    s = hp(hp(rng.standard_normal(len(t_)))) * 0.4 + sum(0.4 * np.sin(2 * np.pi * f * t_ + rng.uniform(0, 6)) for f in (5600, 7100, 8900))
    return a * s * np.exp(-t_ / 0.04) * 0.1


CH = [["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]]
RT = ["C2", "A1", "F1", "G1"]
MOT = [["E5", "G5", "C6", "G5"], ["E5", "A5", "C6", "A5"], ["F5", "A5", "C6", "A5"], ["D5", "G5", "B5", "D6"]]
close_bar = close0 // 60
mont_bar = montage0 // 60
n_bars = int(np.ceil(TOTAL / 60)) + 1
for b in range(n_bars):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < close_bar:
        put("in", pad_(fs, BAR * 0.98, 0.35), t0)
        for k in (0, 1.5, 2, 3):
            put("in", keys(fs, BEAT * 0.45, 0.5), t0 + k * BEAT)
        for k in range(8):
            if b >= mont_bar or k % 2 == 0:
                put("fx", glock(hz(MOT[c][k % 4]), 0.3, 0.3), t0 + k * BEAT / 2)
        for k in range(4):
            put("dr", kick(0.85), t0 + k * BEAT)
        put("dr", clap(0.75), t0 + BEAT)
        put("dr", clap(0.75), t0 + 3 * BEAT)
        for k in range(8):
            put("dr", sleigh(1.0 if k % 2 else 0.55), t0 + k * BEAT / 2)
            put("ba", bass(hz(RT[c]) * (2 if k % 2 else 1), BEAT / 2 * 0.85, 0.6), t0 + k * BEAT / 2)
    if b == close_bar:
        put("in", pad_([hz(n) for n in ["C4", "E4", "G4", "C5"]], 3.0, 0.6), t0)
        for k, n in enumerate(["G5", "C6", "E6", "G6", "C7"]):
            put("fx", glock(hz(n), 1.4, 0.3), t0 + k * 0.07)
        put("dr", kick(0.8), t0)
        put("ba", bass(hz("C1"), 1.6, 0.7), t0)
        for k in range(10):
            put("dr", sleigh(0.8), t0 + k * 0.05)
# label / card shimmer
for sid in ("m01", "m05", "close"):
    for k, n in enumerate(["C6", "E6", "G6"]):
        put("fx", glock(hz(n), 0.6, 0.12), starts[sid] / FPS + k * 0.05)
pump = np.ones(L)
for b in range(close_bar):
    for k in range(4):
        i = int((b * BAR + k * BEAT) * SR)
        n = int(0.22 * SR)
        if i + n < L:
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.4 * np.exp(-np.arange(n) / SR / 0.08))
music = bus["dr"] * 0.9 + (bus["in"] * 0.8 + bus["ba"] * 0.8) * pump + bus["fx"]
ir_n = int(1.6 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.35)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
music = music + 0.25 * np.fft.irfft(np.fft.rfft(bus["in"] + bus["fx"], size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.3) / np.tanh(1.3)
music *= 10 ** ((-19 - 20 * np.log10(np.sqrt(np.mean(music ** 2)))) / 20)
# automation: ducked under the voice (-12 dB), full for the montage and close
gdb = np.where(vmask > 0, -12.0, 0.0)
k = int(0.25 * SR)
gdb = np.convolve(gdb, np.ones(k) / k, mode="same")
gm = 10 ** (gdb / 20)
gm[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
end = int(TOTAL / FPS * SR)
fo = int(1.2 * SR)
mix = (voice + music * gm)[:end]
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
for f in (p, p2, pre):
    os.remove(f)
print("mix", TOTAL / FPS, "s")
