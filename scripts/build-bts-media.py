"""
"LO QUE NO VES" — RE:SET brand documentary media.
- Shots: iPhone HLG HDR (10-bit BT.2020) tone-mapped to SDR BT.709 (hable), one shared light grade so every clip matches,
  native 1080x1920, optional constant speed ramps (b-roll only, no dialogue), muted.
- Voice: Ilana Baradon, IMG_1523 only — gentle spectral denoise (floor -14 dB, avoids the metallic sound), EQ, de-ess,
  soft compression, expander; segments placed on the timeline with 15 ms fades.
- Music: ORIGINAL warm-indie / documentary build (no samples or third-party material), 90 BPM, D major
  I–V6–vi–IV: felt piano + pad under the voice, plucked ostinato, brushed kit and bass for the process montage,
  fuller final bars, resolving chord on the closing shot. Ducked -14 dB under the voice.
Output: public/bts/<shot>.mp4, public/bts/mix.wav
Usage: python3 scripts/build-bts-media.py /folder/with/originals
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "bts")
e = json.load(open(os.path.join(ROOT, "src", "bts", "edit.json")))
FPS, SR, BPM, OFF = e["fps"], 48000, e["bpm"], e["gridOffset"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731


def src(n):
    c = sorted(glob.glob(os.path.join(SRC, f"*{n}.mov")) + glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)
    return c[-1]  # longest take when a clip was uploaded twice


TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.06:contrast=1.03:saturation=1.04,colorbalance=rs=0.015:bs=-0.015:rh=0.01:bh=-0.01"

# ---------------- shots
t = 0
starts = {}
for s in e["shots"]:
    starts[s["id"]] = t
    t += s["frames"]
    if "photo" in s:
        continue
    sp = s.get("speed", 1.0)
    vf = f"{TONEMAP},setpts=PTS/{sp},{GRADE},scale=1080:1920:flags=lanczos,format=yuv420p"
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", vf, "-frames:v", str(s["frames"]),
         "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
TOTAL = t
print("total", TOTAL)

# ---------------- voice
N, HOP = 2048, 512
WIN = np.hanning(N)
p = os.path.join(OUT, "_v.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", src("IMG_1523"), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=100:poles=2", p])
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
x = (y / np.maximum(nr, 1e-8))[N:N + len(x)]
sf.write(p, x.astype("float32"), SR)
chain = ("equalizer=f=200:t=q:w=1.0:g=-2.5,equalizer=f=450:t=q:w=1.2:g=-1.5,equalizer=f=3000:t=q:w=1.0:g=2.5,"
         "equalizer=f=10000:t=h:w=0.7:g=1.5,deesser=i=0.35,"
         "acompressor=threshold=-24dB:ratio=2.5:attack=8:release=150:makeup=2,"
         "agate=threshold=0.01:ratio=2:range=0.25:attack=5:release=250,alimiter=limit=0.9")
p2 = os.path.join(OUT, "_v2.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", chain, "-ar", str(SR), "-ac", "1", p2])
x = sf.read(p2, dtype="float64")[0]
L = int(TOTAL / FPS * SR) + SR
voice = np.zeros(L)
vmask = np.zeros(L)
fd = int(0.015 * SR)
for v, at in zip(e["voice"], e["voiceAt"]):
    n = round((v["b"] - v["a"]) * FPS)
    seg = x[int(v["a"] * SR):int(v["a"] * SR) + int(n / FPS * SR)].copy()
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    i = int(at / FPS * SR)
    voice[i:i + len(seg)] += seg
    vmask[i:i + len(seg)] = 1
voice *= 10 ** ((-20 - 20 * np.log10(np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2)) + 1e-9)) / 20)

# ---------------- music
rng = np.random.default_rng(1523)
BEAT, BAR = 60 / BPM, 240 / BPM
T0 = OFF / FPS
bus = {k: np.zeros(L) for k in ("dr", "pi", "pl", "pad", "ba")}
NOTE = {"C": 0, "C#": 1, "D": 2, "E": 4, "F#": 6, "G": 7, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, gg=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * gg


def piano(f, d, a=1.0):
    # felt piano: soft hammer, inharmonic partials, fast HF decay
    t_ = tt(d + 1.2)
    s = sum(gg * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t_) * np.exp(-t_ * (0.9 + 1.6 * k))
            for k, gg in [(1, 1.0), (2, 0.45), (3, 0.18), (4, 0.08), (5, 0.04)])
    atk = np.minimum(1, t_ / 0.006)
    rel = np.where(t_ > d, np.exp(-(t_ - d) / 0.25), 1)
    return a * s * atk * rel


def pluck(f, a=1.0):
    t_ = tt(0.9)
    s = sum((0.8 ** (k - 1)) * np.sin(2 * np.pi * f * k * t_) * np.exp(-t_ * (3 + 2.2 * k)) for k in range(1, 8))
    return a * s * np.minimum(1, t_ / 0.002)


def padc(fs, d, a=1.0):
    t_ = tt(d + 1.0)
    s = sum(np.sin(2 * np.pi * f * (1 + dt) * t_ + 0.3 * np.sin(2 * np.pi * 0.3 * t_)) + 0.25 * np.sin(4 * np.pi * f * (1 + dt) * t_)
            for f in fs for dt in (-0.003, 0, 0.003)) / (3 * len(fs))
    env = np.minimum(1, t_ / 0.8) * np.where(t_ > d, np.exp(-(t_ - d) / 0.5), 1)
    return a * s * env


def bass(f, d, a=1.0):
    t_ = tt(d)
    s = np.sin(2 * np.pi * f * t_) + 0.15 * np.sin(4 * np.pi * f * t_)
    return a * s * np.minimum(1, t_ / 0.01) * np.minimum(1, (d - t_) / 0.06)


def kick(a=1.0):
    t_ = tt(0.4)
    f = 48 + 70 * np.exp(-t_ / 0.04)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.18)


def brush(a=1.0, d=0.22):
    t_ = tt(d)
    n = np.diff(rng.standard_normal(len(t_) + 1))
    n = np.convolve(n, np.ones(6) / 6, mode="same")
    return a * n * np.exp(-t_ / (d / 3)) * np.minimum(1, t_ / 0.01) * 0.25


def shaker(a=1.0):
    t_ = tt(0.08)
    n = np.diff(np.diff(rng.standard_normal(len(t_) + 2)))
    return a * n * np.sin(np.pi * t_ / 0.08) * 0.06


CH = [["D3", "F#3", "A3", "C#4"], ["C#3", "E3", "A3", "B3"], ["B2", "D3", "F#3", "A3"], ["G2", "B2", "D3", "F#3"]]
RT = ["D2", "C#2", "B1", "G1"]
ARP = [["D4", "A4", "F#4", "A4", "E5", "A4", "F#4", "A4"], ["C#4", "A4", "E4", "A4", "B4", "A4", "E4", "A4"],
       ["B3", "F#4", "D4", "F#4", "C#5", "F#4", "D4", "F#4"], ["G3", "D4", "B3", "D4", "F#4", "D4", "B3", "A4"]]
MEL = [["F#5", None, "E5", "D5"], ["E5", None, "C#5", "A4"], ["D5", None, "C#5", "B4"], ["A4", "B4", "D5", None]]
fb = lambda fr_: (fr_ - OFF) // 80  # noqa: E731  bar index of a frame
b_mont, b_act3, b_end = fb(495), fb(975), fb(1195)
n_bars = int(np.ceil((TOTAL - OFF) / 80)) + 1
for b in range(-1, n_bars):
    t0 = T0 + b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b == -1:
        put("pi", piano(hz("A4"), BEAT * 0.9, 0.35), T0 - BEAT)  # pickup into bar 0 (frame 15)
        continue
    if b < b_end:
        put("pad", padc(fs, BAR * 0.98, 0.25 if b < b_mont else 0.32), t0)
        # felt-piano arpeggio in 8ths; sparser while she talks
        for k in range(8):
            if b >= b_mont or k % 2 == 0:
                put("pi", piano(hz(ARP[c][k]), BEAT * 0.45, 0.3 if b < b_mont else 0.34), t0 + k * BEAT / 2)
        put("pi", piano(hz(CH[c][0]) / 1, BAR * 0.9, 0.32), t0)
        if b >= fb(252):
            for k in range(4):  # plucked ostinato on off-beats
                put("pl", pluck(hz(ARP[c][(2 * k + 1) % 8]) * 2, 0.16), t0 + (k + 0.5) * BEAT)
        if b >= b_mont:
            for k in range(4):
                put("dr", kick(0.75 if k in (0, 2) else 0.0), t0 + k * BEAT)
                put("dr", brush(0.9 if k in (1, 3) else 0.35), t0 + k * BEAT)
            put("dr", kick(0.4), t0 + 2.5 * BEAT)
            for k in range(8):
                put("dr", shaker(1.0 if k % 2 else 0.6), t0 + k * BEAT / 2)
            for k in range(4):
                put("ba", bass(hz(RT[c]), BEAT * 0.9, 0.55), t0 + k * BEAT)
        if b >= b_act3:
            for k, n in enumerate(MEL[c]):
                if n:
                    put("pi", piano(hz(n), BEAT * 0.9, 0.42), t0 + k * BEAT)
    if b == b_end:
        put("pad", padc([hz(n) for n in ["D3", "A3", "D4", "F#4", "A4"]], 3.0, 0.4), t0)
        for k, n in enumerate(["D3", "A3", "F#4", "A4", "D5"]):
            put("pi", piano(hz(n), 2.6, 0.32), t0 + k * 0.05)
        put("ba", bass(hz("D2"), 2.4, 0.55), t0)
        put("dr", kick(0.5), t0)
# swell into the montage and into act 3
for fr_ in (495, 975):
    t_ = tt(1.6)
    sw = np.diff(rng.standard_normal(len(t_) + 1)) * (t_ / 1.6) ** 3 * 0.05
    put("dr", sw, fr_ / FPS - 1.6)
music = bus["dr"] + bus["pi"] * 0.9 + bus["pl"] + bus["pad"] * 0.8 + bus["ba"] * 0.8
ir_n = int(2.2 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.5)
ir = np.convolve(ir, np.ones(8) / 8, mode="same")
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
wet = bus["pi"] + bus["pl"] + bus["pad"] * 0.5
music = music + 0.3 * np.fft.irfft(np.fft.rfft(wet, size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.2) / np.tanh(1.2)
music *= 10 ** ((-19 - 20 * np.log10(np.sqrt(np.mean(music ** 2)))) / 20)
# automation: soft intro, -14 dB under the voice, up for the montage and act 3
gdb = np.where(vmask > 0, -14.0, -3.0)
fi = np.arange(L) / SR * FPS
gdb = np.where(fi >= 495, np.where(vmask > 0, -12.0, 0.0), gdb)
k = int(0.3 * SR)
gdb = np.convolve(gdb, np.ones(k) / k, mode="same")
gm = 10 ** (gdb / 20)
fi0 = int(0.6 * SR)
gm[:fi0] *= np.linspace(0, 1, fi0) ** 2
end = int(TOTAL / FPS * SR)
fo = int(1.4 * SR)
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
