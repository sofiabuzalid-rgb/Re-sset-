"""
Soundtrack for "Soft Winter v2" (public/softwinter/mix-v2.wav), laid out on the output timeline of
src/softwinter/edit-v2.json. Reuses the graded video intermediates; only audio is rebuilt.

- Voice: spectral denoise (per-clip noise profile), EQ, de-ess, compression; level-matched.
- Route shots: their own ambience, low.
- Music: ORIGINAL instrumental composed here (no samples, no third-party material) — clean-pop at 120 BPM,
  F–Am–Dm–Bb. Soft intro under the in-store talk (ducked under the voice), drop exactly on the first look cut,
  recap fill, breakdown under the question, final chord on the end card. Beat = 15 frames, bar = 60 frames.
- Final two-pass loudnorm -14 LUFS / -1 dBTP.
"""
import glob
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC_DIR = sys.argv[1]
OUT = os.path.join(ROOT, "public", "softwinter")
TMP = os.path.join(OUT, "_tmp")
os.makedirs(TMP, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "softwinter", "edit-v2.json")))
FPS, SR = e["fps"], 48000
BEAT_F = 15
rng = np.random.default_rng(8)


def run(cmd):
    subprocess.run(cmd, check=True)


def fr(s):
    return int(round(s * FPS))


# ---- timeline
t = 0
segs = []
for s in e["segments"]:
    d = fr(s["out"]) - fr(s["in"])
    segs.append({**s, "from": t, "dur": d})
    t += d
CUTS_END = t
TOTAL_F = CUTS_END + fr(e["endCardSeconds"])
LOOK0 = next(s["from"] for s in segs if s["part"] == "look")
QUESTION = next(s["from"] for s in segs if s["part"] == "question")
MUSIC0 = LOOK0 - 8 * 4 * BEAT_F  # 8 bars of soft intro before the drop
total_s = TOTAL_F / FPS
N_OUT = int(round(total_s * SR))
sec = lambda f: f / FPS  # noqa: E731

# ---- voice / ambience
N, HOP = 2048, 512
WIN = np.hanning(N)


def src_path(n):
    return [p for p in glob.glob(os.path.join(SRC_DIR, f"*IMG_{n}.*")) if p.lower().endswith(".mp4")][0]


def load(n):
    p = os.path.join(TMP, f"{n}.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", src_path(n), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=80:poles=2", p])
    return sf.read(p, dtype="float64")[0]


def stft(x):
    pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
    return np.fft.rfft(np.array([pad[i:i + N] * WIN for i in range(0, len(pad) - N, HOP)]), axis=1)


def istft(S, length):
    f = np.fft.irfft(S, axis=1) * WIN
    out = np.zeros(len(f) * HOP + N)
    nrm = np.zeros_like(out)
    for k, x in enumerate(f):
        out[k * HOP:k * HOP + N] += x
        nrm[k * HOP:k * HOP + N] += WIN ** 2
    return (out / np.maximum(nrm, 1e-8))[N:N + length]


def denoise(x):
    S = stft(x)
    mag = np.abs(S)
    en = mag.sum(axis=1)
    noise = np.mean(mag[en <= np.percentile(en, 12)] ** 2, axis=0)
    snr = np.maximum(mag ** 2 / (2 * noise) - 1, 0)
    g = swv(np.pad(snr / (snr + 1), ((2, 2), (1, 1)), mode="edge"), (5, 3)).mean(axis=(-1, -2))
    return istft(S * np.maximum(g, 10 ** (-16 / 20)), len(x))


def ff(x, chain):
    a, b = os.path.join(TMP, "a.wav"), os.path.join(TMP, "b.wav")
    sf.write(a, x.astype("float32"), SR)
    run(["ffmpeg", "-y", "-v", "error", "-i", a, "-af", chain, "-ar", str(SR), "-ac", "1", b])
    y = sf.read(b, dtype="float64")[0]
    return y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


VOICE = "equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1:g=2.5,equalizer=f=9000:t=h:w=0.7:g=1.5,deesser=i=0.3,acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2,alimiter=limit=0.9"
need = {s["src"] for s in segs if s["audio"] != "none"}
raw = {n: load(n) for n in need}
voice_src = {s["src"] for s in segs if s["audio"] == "voice"}
proc = {n: (ff(denoise(x), VOICE) if n in voice_src else x) for n, x in raw.items()}

dialog = np.zeros(N_OUT)
voice_mask = np.zeros(N_OUT)
fade = int(0.012 * SR)
for s in segs:
    if s["audio"] == "none":
        continue
    x = proc[s["src"]][int(s["in"] * SR):int(s["in"] * SR) + int(sec(s["dur"]) * SR)].copy()
    if s["audio"] == "voice":
        loud = x[np.abs(x) > 10 ** (-40 / 20)]
        x *= 10 ** ((-20 - rms_db(loud if len(loud) > SR // 10 else x)) / 20)
    else:
        x *= min(4.0, 10 ** ((-30 - rms_db(x)) / 20))
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    i = int(sec(s["from"]) * SR)
    dialog[i:i + len(x)] += x
    if s["audio"] == "voice":
        voice_mask[i:i + len(x)] = 1

# ---- music (original composition)
BEAT = 60 / e["bpm"]
NOTES = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}


def hz(n):
    return 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTES[n[:-1]] - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, r, hold=None):
    x = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, int(r * SR))
    H = n - R if hold is None else max(A, min(n - R, int(hold * SR)))
    x[:A] = np.linspace(0, 1, A)
    x[H:] = np.linspace(1, 0, n - H) ** 2
    return x


def saw(f, t, h=18, bright=0.9, det=0.0):
    s = np.zeros_like(t)
    for k in range(1, h + 1):
        if f * k > 12000:
            break
        s += np.sin(2 * np.pi * f * k * (1 + det) * t) / k * bright ** (k - 1)
    return s


def pluck(f, d=0.35, amp=1.0):
    t = tt(d + 0.25)
    s = np.zeros_like(t)
    for k in range(1, 12):
        s += np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (6 + k * 5))
    s += 0.4 * np.sin(2 * np.pi * f * 2.001 * t) * np.exp(-t * 9)
    return amp * s * env(len(t), 0.003, 0.08)


def pad(fs, d, amp=1.0):
    t = tt(d + 0.6)
    s = sum(saw(f, t, 10, 0.75, dt) for f in fs for dt in (-0.004, 0.0, 0.004)) / (3 * len(fs))
    return amp * s * env(len(t), 0.5, 0.6, hold=d)


def bass(f, d, amp=1.0):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * saw(f, t, 6, 0.6)
    return amp * s * env(len(t), 0.004, 0.05)


def kick(amp=1.0):
    t = tt(0.35)
    f = 45 + 95 * np.exp(-t / 0.035)
    return amp * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) + 0.25 * np.exp(-t / 0.002))


def hp(x):
    return np.diff(x, prepend=0.0)


def clap(amp=1.0):
    t = tt(0.25)
    n = hp(rng.standard_normal(len(t)))
    e_ = sum(np.where(t >= o, np.exp(-(t - o) / (0.012 if o < 0.02 else 0.08)), 0) for o in (0, 0.01, 0.02))
    return amp * n * e_ * 0.3


def hat(amp=1.0, open_=False):
    t = tt(0.2 if open_ else 0.05)
    return amp * hp(hp(rng.standard_normal(len(t)))) * np.exp(-t / (0.06 if open_ else 0.012)) * 0.15


def riser(d, amp=1.0):
    t = tt(d)
    p = t / d
    n = rng.standard_normal(len(t))
    return amp * (hp(n) * p + n * 0.2 * (1 - p)) * p ** 2 * 0.25


music_len = int((total_s - sec(MUSIC0) + 1.5) * SR)
M = {k: np.zeros(music_len) for k in ("drums", "inst", "bass")}


def put(bus, sig, t_s, g=1.0):
    i = int(t_s * SR)
    if 0 <= i < music_len:
        j = min(music_len, i + len(sig))
        M[bus][i:j] += sig[: j - i] * g


CH = [["F3", "A3", "C4"], ["E3", "A3", "C4"], ["D3", "F3", "A3"], ["D3", "F3", "Bb3"]]
ROOT_N = ["F2", "A2", "D2", "Bb1"]
ARP = [[0, 1, 2, 1], [0, 1, 2, 1], [0, 1, 2, 1], [0, 1, 2, 1]]
bar_s = 4 * BEAT
drop_bar = 8
q_bar = drop_bar + (QUESTION - LOOK0) // (4 * BEAT_F)
recap_bar = q_bar - 1
end_bar = drop_bar + (CUTS_END - LOOK0) // (4 * BEAT_F)
n_bars = int(np.ceil((total_s - sec(MUSIC0)) / bar_s))
for b in range(n_bars):
    t0 = b * bar_s
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < end_bar:
        put("inst", pad(fs, bar_s * 0.98, 0.5 if b < drop_bar else 0.4), t0)
    # pluck arpeggio (8ths) one octave up
    if b < end_bar:
        for k in range(8):
            if b < drop_bar - 4 and k % 2:
                continue
            n = fs[ARP[c][k % 4]] * 2
            put("inst", pluck(n, 0.3, 0.55 if b >= drop_bar else 0.4), t0 + k * BEAT / 2)
    # shaker / hats
    if b >= drop_bar - 4 and b < q_bar:
        for k in range(8):
            put("drums", hat(0.6 if k % 2 else 0.35), t0 + k * BEAT / 2)
    if drop_bar <= b < q_bar:
        for k in range(4):
            put("drums", kick(0.9), t0 + k * BEAT)
            put("drums", hat(0.5, True), t0 + k * BEAT + BEAT / 2)
        put("drums", clap(0.8), t0 + BEAT)
        put("drums", clap(0.8), t0 + 3 * BEAT)
        for k in range(8):
            put("bass", bass(hz(ROOT_N[c]) * (2 if k % 2 else 1), BEAT / 2 * 0.85, 0.6), t0 + k * BEAT / 2)
        if b == recap_bar:  # recap: 16th hats for energy
            for k in range(16):
                put("drums", hat(0.45), t0 + k * BEAT / 4)
    if b == drop_bar - 1:
        put("drums", riser(bar_s, 1.0), t0)
    if b == q_bar - 1:
        put("drums", riser(BEAT * 2, 0.6), t0 + 2 * BEAT)
    if b == end_bar:  # final chord under the logo
        put("inst", pad([hz(n) for n in ["F3", "A3", "C4", "F4"]], bar_s * 1.2, 0.6), t0)
        for k, n in enumerate(["C5", "F5", "A5", "C6"]):
            put("inst", pluck(hz(n), 0.8, 0.4), t0 + k * 0.06)
        put("drums", kick(0.8), t0)
        put("bass", bass(hz("F1"), 1.2, 0.7), t0)

# sidechain pump on inst + bass from the kicks (drop section only)
pump = np.ones(music_len)
for b in range(drop_bar, q_bar):
    for k in range(4):
        i = int((b * bar_s + k * BEAT) * SR)
        n = int(0.25 * SR)
        if i + n < music_len:
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.45 * np.exp(-np.arange(n) / SR / 0.08))
music = M["drums"] * 0.9 + (M["inst"] * 0.8 + M["bass"] * 0.8) * pump
# small room reverb
ir_n = int(1.6 * SR)
tir = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-tir / 0.35)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (music_len + ir_n).bit_length()
wet = np.fft.irfft(np.fft.rfft(M["inst"], size) * np.fft.rfft(ir, size), size)[:music_len]
music = music + 0.25 * wet * pump
music = np.tanh(music / (np.max(np.abs(music)) + 1e-9) * 1.4) / np.tanh(1.4)

# place music on the timeline with level automation
mtrack = np.zeros(N_OUT)
m0 = int(sec(MUSIC0) * SR)
n = min(N_OUT - m0, music_len)
mtrack[m0:m0 + n] = music[:n]
gain_db = np.full(N_OUT, -60.0)
look_i = int(sec(LOOK0) * SR)
gain_db[m0:look_i] = -15.0                          # soft intro in the store
gain_db[look_i:] = -1.5                             # lookbook: music up
# duck under the voice (with 250 ms smoothing)
vm = np.convolve(voice_mask, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
gain_db = gain_db - 9.0 * np.clip(vm * 1.5, 0, 1)
# fade in at start, fade out at the very end
g = 10 ** (gain_db / 20)
fi = int(1.0 * SR)
g[m0:m0 + fi] *= np.linspace(0, 1, fi)
fo = int(1.2 * SR)
g[-fo:] *= np.linspace(1, 0, fo) ** 1.5
k = int(0.05 * SR)
g = np.convolve(g, np.ones(k) / k, mode="same")
mix = dialog + mtrack * g * 10 ** (-17 / 20) / (np.sqrt(np.mean(music ** 2)) * 1.0 + 1e-9) * 10 ** (-3 / 20)

pre = os.path.join(TMP, "pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", ln, "-ar", str(SR), "-ac", "2", os.path.join(OUT, "mix-v2.wav")])
for f in glob.glob(os.path.join(TMP, "*")):
    os.remove(f)
os.rmdir(TMP)
print(f"mix-v2.wav {total_s:.2f}s | music from frame {MUSIC0}, drop on frame {LOOK0}, question frame {QUESTION}")
