"""
PINK PAJAMA DETAIL EDIT media from IMG_1694 + IMG_1695 (iPhone HLG HDR, 1080x1920).
- Shots: HLG -> SDR BT.709 (hable tone-map); light exposure/contrast lift only (gamma/contrast), saturation untouched
  so the pink stays true; optional constant speed (slow close), muted (store background music in the originals).
- Music: ORIGINAL soft fashion / chic minimal pop (no samples or third-party material), 120 BPM half-time feel:
  electric-piano Fmaj7–Am7–Dm7–Bbmaj7, soft kick + finger snap, light shaker, round bass, sparse bell motif;
  ends on a held Fmaj9 on the closing card.
Output: public/pink/<shot>.mp4, public/pink/mix.wav
Usage: python3 scripts/build-pink-media.py /folder/with/originals
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "pink")
e = json.load(open(os.path.join(ROOT, "src", "pink", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731
src = lambda n: sorted(glob.glob(os.path.join(SRC, f"*{n}.mov")) + glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)[-1]  # noqa: E731
TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.07:contrast=1.04:brightness=0.01"

starts, t = {}, 0
for s in e["shots"]:
    starts[s["id"]] = t
    t += s["frames"]
    sp = s.get("speed", 1.0)
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", f"{TONEMAP},setpts=PTS/{sp},{GRADE},format=yuv420p",
         "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
TOTAL = t
print("total", TOTAL)

L = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(1694)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("dr", "ep", "ba", "fx")}
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, gg=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * gg


def epiano(fs, d, a=1.0):
    t_ = tt(d + 0.6)
    s = sum(np.sin(2 * np.pi * f * t_ + 1.2 * np.exp(-t_ / 0.15) * np.sin(2 * np.pi * f * t_)) * np.exp(-t_ / 1.4) for f in fs) / len(fs)
    s *= 1 + 0.15 * np.sin(2 * np.pi * 4.5 * t_)  # gentle tremolo
    return a * s * np.minimum(1, t_ / 0.004) * np.where(t_ > d, np.exp(-(t_ - d) / 0.2), 1)


def bell(f, a=1.0):
    t_ = tt(1.4)
    return a * sum(g * np.sin(2 * np.pi * f * r * t_) * np.exp(-t_ / dc) for r, g, dc in [(1, 1, 0.7), (2.0, 0.25, 0.3), (3.01, 0.1, 0.12)])


def bass(f, d, a=1.0):
    t_ = tt(d)
    return a * np.sin(2 * np.pi * f * t_) * np.minimum(1, t_ / 0.01) * np.minimum(1, (d - t_) / 0.05)


def kick(a=1.0):
    t_ = tt(0.35)
    f = 50 + 80 * np.exp(-t_ / 0.03)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.15)


def snap(a=1.0):
    t_ = tt(0.12)
    n = np.diff(np.diff(rng.standard_normal(len(t_) + 2)))
    return a * n * np.exp(-t_ / 0.02) * 0.12


def shaker(a=1.0):
    t_ = tt(0.07)
    n = np.diff(np.diff(rng.standard_normal(len(t_) + 2)))
    return a * n * np.sin(np.pi * t_ / 0.07) * 0.04


CH = [["F3", "A3", "C4", "E4"], ["A3", "C4", "E4", "G4"], ["D3", "F3", "A3", "C4"], ["Bb2", "D3", "F3", "A3"]]
RT = ["F1", "A1", "D2", "Bb1"]
MOT = ["C6", "A5", "E6", "D6"]
close_from = starts["close"]
stop = close_from // 60
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < stop:
        for k in (0, 1.5, 2.5):
            put("ep", epiano(fs, BEAT * (1.4 if k == 0 else 0.8), 0.45), t0 + k * BEAT)
        put("dr", kick(0.8), t0)
        put("dr", kick(0.45), t0 + 2.5 * BEAT)
        put("dr", snap(1.0), t0 + 2 * BEAT)
        if b >= 1:
            for k in range(8):
                put("dr", shaker(1.0 if k % 2 else 0.5), t0 + k * BEAT / 2)
            put("ba", bass(hz(RT[c]), BEAT * 1.8, 0.6), t0)
            put("ba", bass(hz(RT[c]), BEAT * 0.9, 0.5), t0 + 2.5 * BEAT)
        if b % 2 == 0:
            put("fx", bell(hz(MOT[c]), 0.18), t0 + 3 * BEAT)
    if b == stop:
        put("ep", epiano([hz(n) for n in ["F3", "A3", "C4", "E4", "G4"]], 2.8, 0.6), t0)
        put("ba", bass(hz("F1"), 2.4, 0.6), t0)
        for k, n in enumerate(["C6", "F6", "A6"]):
            put("fx", bell(hz(n), 0.16), t0 + 0.12 * k)
# soft chime at the hook title and at each label
for sid in [s["id"] for s in e["shots"]][1:-1]:
    put("fx", bell(hz("A6"), 0.06), starts[sid] / FPS)
music = bus["dr"] + bus["ep"] + bus["ba"] * 0.8 + bus["fx"]
ir_n = int(1.8 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.4)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
music = music + 0.28 * np.fft.irfft(np.fft.rfft(bus["ep"] + bus["fx"], size) * np.fft.rfft(ir, size), size)[:L]
music = np.tanh(music / np.max(np.abs(music)) * 1.15) / np.tanh(1.15)
end = int(TOTAL / FPS * SR)
mix = music[:end]
fi = int(0.05 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
fo = int(1.2 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix", TOTAL / FPS, "s")
