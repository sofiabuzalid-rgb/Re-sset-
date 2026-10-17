"""
"ASÍ VIVIMOS HOTBOOK BAZAR" — RE:SET event recap media.
- Shots: iPhone HLG HDR (10-bit BT.2020) tone-mapped to SDR BT.709 (hable), one shared warm editorial grade
  (lifted shadows, soft contrast, a touch of warmth, gentle sharpening) so every clip matches, native 1080x1920, muted.
  A shot with "xf" gets xf extra frames before its in-point so it can dissolve in over the previous one.
- Music: ORIGINAL soft dance-pop (no samples or third-party material), 120 BPM, F major Fmaj7–Am7–Dm7–Bbmaj7:
  felt-piano chords, warm pad, soft kick, finger snaps, shaker, round sub bass and a glassy bell hook.
  Breaks down to piano + pad for the human moments (bars 7–9), builds back with a swell, resolves on Fmaj9 for the close.
Output: public/hotbook/<shot>.mp4, public/hotbook/mix.wav
Usage: python3 scripts/build-hotbook-media.py /folder/with/originals
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "hotbook")
e = json.load(open(os.path.join(ROOT, "src", "hotbook", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731


def src(n):
    c = sorted(glob.glob(os.path.join(SRC, f"*{n}.mov")) + glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)
    return c[-1]


TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = ("eq=gamma=1.08:contrast=1.02:saturation=1.03:brightness=0.01,"
         "curves=all='0/0.035 0.5/0.52 1/0.98',"
         "colorbalance=rs=0.02:gs=0.005:bs=-0.012:rm=0.012:bm=-0.012:rh=0.01:bh=-0.006,"
         "unsharp=5:5:0.45:5:5:0.0")

# ---------------- shots
TOTAL = 0
for s in e["shots"]:
    TOTAL += s["frames"]
    if "photo" in s:
        continue
    xf = s.get("xf", 0)
    vf = f"{TONEMAP},{GRADE},scale=1080:1920:flags=lanczos,format=yuv420p"
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in'] - xf / FPS:.3f}", "-i", src(s["src"]), "-an", "-vf", vf,
         "-frames:v", str(s["frames"] + xf), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
print("total", TOTAL, "frames")

# ---------------- music
rng = np.random.default_rng(1784)
BEAT, BAR = 60 / BPM, 240 / BPM
L = int(TOTAL / FPS * SR) + 3 * SR
bus = {k: np.zeros(L) for k in ("dr", "pi", "bell", "pad", "ba")}
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, gg=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * gg


def piano(f, d, a=1.0):
    t_ = tt(d + 1.0)
    s = sum(gg * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t_) * np.exp(-t_ * (1.0 + 1.7 * k))
            for k, gg in [(1, 1.0), (2, 0.42), (3, 0.16), (4, 0.07), (5, 0.03)])
    rel = np.where(t_ > d, np.exp(-(t_ - d) / 0.22), 1)
    return a * s * np.minimum(1, t_ / 0.006) * rel


def bell(f, a=1.0):
    # glassy FM bell: bright attack, long shimmering tail
    t_ = tt(1.6)
    idx = 2.2 * np.exp(-t_ / 0.25)
    s = np.sin(2 * np.pi * f * t_ + idx * np.sin(2 * np.pi * f * 3.5 * t_)) * np.exp(-t_ / 0.55)
    s += 0.3 * np.sin(2 * np.pi * f * 2 * t_) * np.exp(-t_ / 0.3)
    return a * s * np.minimum(1, t_ / 0.003)


def padc(fs, d, a=1.0):
    t_ = tt(d + 0.8)
    s = sum(np.sin(2 * np.pi * f * (1 + dt) * t_) + 0.2 * np.sin(4 * np.pi * f * (1 + dt) * t_)
            for f in fs for dt in (-0.004, 0, 0.004)) / (3 * len(fs))
    env = np.minimum(1, t_ / 0.5) * np.where(t_ > d, np.exp(-(t_ - d) / 0.4), 1)
    return a * s * env


def bass(f, d, a=1.0):
    t_ = tt(d)
    s = np.sin(2 * np.pi * f * t_) + 0.2 * np.sin(4 * np.pi * f * t_) + 0.05 * np.sin(6 * np.pi * f * t_)
    return a * s * np.minimum(1, t_ / 0.008) * np.minimum(1, (d - t_) / 0.05)


def kick(a=1.0):
    t_ = tt(0.35)
    f = 50 + 80 * np.exp(-t_ / 0.03)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.14)


def snap(a=1.0):
    t_ = tt(0.12)
    n = np.diff(rng.standard_normal(len(t_) + 1))
    body = np.sin(2 * np.pi * 1800 * t_) * np.exp(-t_ / 0.012)
    return a * (0.35 * n * np.exp(-t_ / 0.02) + 0.25 * body) * np.minimum(1, t_ / 0.0008)


def shaker(a=1.0):
    t_ = tt(0.07)
    n = np.diff(np.diff(rng.standard_normal(len(t_) + 2)))
    return a * n * np.sin(np.pi * t_ / 0.07) * 0.05


CH = [["A3", "C4", "E4", "F4"], ["A3", "C4", "E4", "G4"], ["A3", "C4", "D4", "F4"], ["A3", "Bb3", "D4", "F4"]]
RT = ["F2", "A1", "D2", "Bb1"]
# chord stab rhythm in 8ths (1 = hit): a light, syncopated pop comp
COMP = [1, 0, 0, 1, 0, 0, 1, 0]
HOOK = [["C6", None, "A5", None, "G5", "A5", None, None], ["E5", None, "G5", None, "A5", None, None, None],
        ["F5", None, "A5", None, "C6", "D6", None, "C6"], ["A5", None, "G5", None, "F5", None, None, None]]
fb = lambda fr_: fr_ // 60  # noqa: E731  bar index of a frame (bar = 60 frames at 120 BPM)
B_BREAK, B_BACK, B_END = fb(420), fb(600), fb(720)
for b in range(B_END):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    brk = B_BREAK <= b < B_BACK
    put("pad", padc(fs + [hz(RT[c]) * 2], BAR * 0.98, 0.3 if brk else 0.22), t0)
    for k, hit in enumerate(COMP):
        if hit or (brk and k % 2 == 0):
            for n in CH[c]:
                put("pi", piano(hz(n), BEAT * (0.9 if brk else 0.4), 0.16), t0 + k * BEAT / 2 + rng.uniform(0, 0.008))
    if not brk:
        for k in range(8):
            put("dr", shaker(1.0 if k % 2 else 0.55), t0 + k * BEAT / 2)
        if b >= 1:
            for k in range(4):
                put("dr", kick(0.8), t0 + k * BEAT)
                put("ba", bass(hz(RT[c]), BEAT * 0.45, 0.5), t0 + k * BEAT + BEAT / 2)
            put("dr", snap(1.0), t0 + BEAT)
            put("dr", snap(1.0), t0 + 3 * BEAT)
        else:
            put("dr", snap(0.8), t0 + BEAT)
            put("dr", snap(0.8), t0 + 3 * BEAT)
        if b >= 2:
            for k, n in enumerate(HOOK[c]):
                if n:
                    put("bell", bell(hz(n), 0.22), t0 + k * BEAT / 2)
    else:
        # breakdown: sustained root, a sparse bell answer on the last bar
        put("ba", bass(hz(RT[c]), BAR * 0.9, 0.35), t0)
        if b == B_BACK - 1:
            for k, n in enumerate(["A5", "C6", "D6", "F6"]):
                put("bell", bell(hz(n), 0.14), t0 + (2 + k * 0.5) * BEAT)
# rising swell into the return of the drums, and a soft one into the close
for at, dur, g in ((B_BACK * BAR, 1.8, 0.05), (690 / FPS, 1.2, 0.025)):
    t_ = tt(dur)
    sw = np.diff(rng.standard_normal(len(t_) + 1)) * (t_ / dur) ** 3 * g
    put("dr", np.convolve(sw, np.ones(3) / 3, mode="same"), at - dur)
# resolving Fmaj9 on the close, rings out under the end card
t0 = B_END * BAR
put("pad", padc([hz(n) for n in ["F2", "C3", "A3", "E4", "G4", "C5"]], 3.6, 0.38), t0)
for k, n in enumerate(["F3", "C4", "E4", "G4", "A4", "C5"]):
    put("pi", piano(hz(n), 3.0, 0.2), t0 + k * 0.045)
put("bell", bell(hz("A5"), 0.18), t0 + 0.3)
put("bell", bell(hz("C6"), 0.14), t0 + 0.8)
put("ba", bass(hz("F1"), 2.6, 0.5), t0)
put("dr", kick(0.6), t0)

music = bus["dr"] + bus["pi"] + bus["bell"] * 0.9 + bus["pad"] * 0.8 + bus["ba"] * 0.85
ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir = np.convolve(ir, np.ones(8) / 8, mode="same")
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
wet = bus["pi"] + bus["bell"] * 1.4 + bus["pad"] * 0.5 + bus["dr"] * 0.15
music = music + 0.28 * np.fft.irfft(np.fft.rfft(wet, size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.3) / np.tanh(1.3)
end = int(TOTAL / FPS * SR)
fo = int(1.2 * SR)
mix = music[:end].copy()
fi = int(0.04 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
stereo = np.stack([mix, mix], 1)
# a little width: delay the reverb-rich side by 9 ms on the right
d = int(0.009 * SR)
stereo[d:, 1] = 0.82 * mix[d:] + 0.18 * mix[:-d]
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, stereo.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix", TOTAL / FPS, "s")
