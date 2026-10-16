"""
"YOUR COMFY ERA" ad media from IMG_1522 + IMG_1525 (iPhone HLG HDR, 1080x1920).
- Shots: HLG -> SDR BT.709 (hable tone-map), one shared light grade (garment colours kept), muted, frame-accurate pre-cuts.
- Voice: both takes cleaned with the same chain — gentle spectral denoise (floor -14 dB, no metallic artefacts), EQ, de-ess,
  soft compression; each take loudness-matched to the same speech level, 15 ms fades on every edit.
- Music: ORIGINAL minimal fashion-pop instrumental (no samples / third-party material), 120 BPM (beat = 15 frames):
  four-on-the-floor kick, clap, 16th hats, sub bass, muted-pluck Fmaj7–Em7–Dm7–Cmaj7; ducked -11 dB under the voice,
  stop-time hit on the closing card and a final chord.
Output: public/comfy/<shot>.mp4, public/comfy/mix.wav
Usage: python3 scripts/build-comfy-media.py /folder/with/originals
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "comfy")
e = json.load(open(os.path.join(ROOT, "src", "comfy", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731
src = lambda n: sorted(glob.glob(os.path.join(SRC, f"*{n}.mov")) + glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)[-1]  # noqa: E731

TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.06:contrast=1.04:saturation=1.03"

starts, t = {}, 0
for s in e["shots"]:
    starts[s["id"]] = t
    t += s["frames"]
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", f"{TONEMAP},{GRADE},format=yuv420p",
         "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
TOTAL = t
print("total", TOTAL)

# ---------------- voice
N, HOP = 2048, 512
WIN = np.hanning(N)
CHAIN = ("highpass=f=95:poles=2,equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=3000:t=q:w=1.0:g=2.5,equalizer=f=10000:t=h:w=0.7:g=1.5,"
         "deesser=i=0.35,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=150:makeup=2,alimiter=limit=0.9")


def clean(n):
    p = os.path.join(OUT, "_v.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", src(n), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=95:poles=2", p])
    x = sf.read(p, dtype="float64")[0]
    pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
    S = np.fft.rfft(np.array([pad[i:i + N] * WIN for i in range(0, len(pad) - N, HOP)]), axis=1)
    mag = np.abs(S)
    en = mag.sum(1)
    noise = np.mean(mag[en <= np.percentile(en, 10)] ** 2, 0)
    snr = np.maximum(mag ** 2 / (1.6 * noise) - 1, 0)
    g = swv(np.pad(snr / (snr + 1), ((3, 3), (2, 2)), mode="edge"), (7, 5)).mean(axis=(-1, -2))
    fr = np.fft.irfft(S * np.maximum(g, 10 ** (-14 / 20)), axis=1) * WIN
    y = np.zeros(len(fr) * HOP + N)
    nr = np.zeros_like(y)
    for k, f in enumerate(fr):
        y[k * HOP:k * HOP + N] += f
        nr[k * HOP:k * HOP + N] += WIN ** 2
    sf.write(p, ((y / np.maximum(nr, 1e-8))[N:N + len(x)]).astype("float32"), SR)
    p2 = os.path.join(OUT, "_v2.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", CHAIN, "-ar", str(SR), "-ac", "1", p2])
    z = sf.read(p2, dtype="float64")[0]
    os.remove(p)
    os.remove(p2)
    sp = z[np.abs(z) > 0.01]
    return z * 10 ** ((-20 - 20 * np.log10(np.sqrt(np.mean(sp ** 2)) + 1e-9)) / 20)  # same speech level for both takes


takes = {n: clean(n) for n in {v["src"] for v in e["voice"]}}
L = int(TOTAL / FPS * SR) + SR
voice = np.zeros(L)
vmask = np.zeros(L)
fd = int(0.015 * SR)
for v in e["voice"]:
    n = round((v["b"] - v["a"]) * FPS)
    seg = takes[v["src"]][int(v["a"] * SR):int(v["a"] * SR) + int(n / FPS * SR)].copy()
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    i = int(v["at"] / FPS * SR)
    voice[i:i + len(seg)] += seg
    vmask[i:i + len(seg)] = 1

# ---------------- music
rng = np.random.default_rng(1525)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("dr", "ch", "ba", "fx")}
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, gg=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * gg


def pluck(fs, d, a=1.0):
    t_ = tt(d + 0.25)
    s = sum(sum((0.7 ** (k - 1)) * np.sin(2 * np.pi * f * k * t_) * np.exp(-t_ * (5 + 4 * k)) for k in range(1, 6)) for f in fs) / len(fs)
    return a * s * np.minimum(1, t_ / 0.003)


def padc(fs, d, a=1.0):
    t_ = tt(d + 0.6)
    s = sum(np.sin(2 * np.pi * f * (1 + dt) * t_) + 0.2 * np.sin(4 * np.pi * f * (1 + dt) * t_) for f in fs for dt in (-0.004, 0, 0.004)) / (3 * len(fs))
    return a * s * np.minimum(1, t_ / 0.4) * np.where(t_ > d, np.exp(-(t_ - d) / 0.3), 1)


def sub(f, d, a=1.0):
    t_ = tt(d)
    return a * (np.sin(2 * np.pi * f * t_) + 0.25 * np.sin(4 * np.pi * f * t_)) * np.minimum(1, t_ / 0.005) * np.minimum(1, (d - t_) / 0.03)


def kick(a=1.0):
    t_ = tt(0.35)
    f = 50 + 110 * np.exp(-t_ / 0.03)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.14) + 0.15 * np.exp(-t_ / 0.002))


def clap(a=1.0):
    t_ = tt(0.22)
    n = np.diff(rng.standard_normal(len(t_) + 1))
    ev = sum(np.where(t_ >= q, np.exp(-(t_ - q) / (0.01 if q < 0.02 else 0.07)), 0) for q in (0, 0.009, 0.018))
    return a * n * ev * 0.28


def hat(a=1.0, d=0.05):
    t_ = tt(d)
    n = np.diff(np.diff(rng.standard_normal(len(t_) + 2)))
    return a * n * np.exp(-t_ / (d / 4)) * 0.05


CH = [["F3", "A3", "C4", "E4"], ["E3", "G3", "B3", "D4"], ["D3", "F3", "A3", "C4"], ["C3", "E3", "G3", "B3"]]
RT = ["F1", "E1", "D1", "C1"]
close_bar = e["close"]["from"] // 60  # 589 // 60 = 9 -> stop-time on bar 10 (frame 600)
stop = close_bar + 1
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < stop:
        put("ch", padc(fs, BAR * 0.98, 0.18), t0)
        for k in (0, 0.75, 1.5, 2.5, 3.0):  # syncopated muted plucks
            put("ch", pluck(fs, 0.12, 0.42), t0 + k * BEAT)
        for k in range(4):
            put("dr", kick(0.9), t0 + k * BEAT)
        put("dr", clap(0.8), t0 + BEAT)
        put("dr", clap(0.8), t0 + 3 * BEAT)
        for k in range(16):
            put("dr", hat(1.0 if k % 4 == 2 else 0.45, 0.09 if k % 4 == 2 else 0.04), t0 + k * BEAT / 4)
        for k in (0, 1.5, 2, 3, 3.5):
            put("ba", sub(hz(RT[c]) * (2 if k == 3.5 else 1), BEAT * 0.45, 0.75), t0 + k * BEAT)
    if b == stop:
        put("ch", padc([hz(n) for n in ["F3", "A3", "C4", "E4", "G4"]], 2.6, 0.45), t0)
        put("ch", pluck([hz(n) for n in ["F4", "A4", "C5", "E5"]], 0.6, 0.6), t0)
        put("dr", kick(1.0), t0)
        put("dr", clap(0.6), t0)
        put("ba", sub(hz("F1"), 1.6, 0.9), t0)
# riser into the comparison moment
t_ = tt(1.0)
put("fx", np.diff(rng.standard_normal(len(t_) + 1)) * (t_ / 1.0) ** 3 * 0.05, 505 / FPS - 1.0)
pump = np.ones(L)
for b in range(stop):
    for k in range(4):
        i = int((b * BAR + k * BEAT) * SR)
        n = int(0.2 * SR)
        if i + n < L:
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.45 * np.exp(-np.arange(n) / SR / 0.07))
music = bus["dr"] + (bus["ch"] + bus["ba"] * 0.85) * pump + bus["fx"]
ir_n = int(1.2 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.25)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
music = music + 0.2 * np.fft.irfft(np.fft.rfft(bus["ch"], size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.3) / np.tanh(1.3)
music *= 10 ** ((-19 - 20 * np.log10(np.sqrt(np.mean(music ** 2)))) / 20)
gdb = np.where(vmask > 0, -11.0, 0.0)
k = int(0.2 * SR)
gdb = np.convolve(gdb, np.ones(k) / k, mode="same")
gm = 10 ** (gdb / 20)
end = int(TOTAL / FPS * SR)
mix = (voice + music * gm)[:end]
fo = int(0.5 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix", TOTAL / FPS, "s")
