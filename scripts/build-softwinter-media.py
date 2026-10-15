"""
Prepares media for the "Soft Winter" ad from the six original clips (IMG_8483/84/88/90/91/93.MP4).

Video  -> public/softwinter/<id>.mp4 per source: light temporal denoise (hqdn3d), per-clip grade from
          edit.json (white balance trim, gamma, contrast — no saturation boost, product colour preserved),
          Lanczos upscale 720x1280 -> 1080x1920 with mild sharpening, H.264 CRF 14, GOP 10 (frame-accurate seeking).
Audio  -> public/softwinter/mix.wav, the whole soundtrack already laid out on the output timeline:
          voice cuts are spectrally denoised (noise profile = quietest 12 % of that clip), EQ'd, compressed,
          matched in loudness; B-roll cuts keep their own room/ambience at a low level; 12 ms fades on every
          edit + short crossfades; final two-pass loudnorm to -14 LUFS / -1 dBTP.

Usage: python3 scripts/build-softwinter-media.py /folder/with/originals
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
edit = json.load(open(os.path.join(ROOT, "src", "softwinter", "edit.json")))
FPS = edit["fps"]
SR = 48000
os.makedirs(TMP, exist_ok=True)


def src_path(n):
    return [p for p in glob.glob(os.path.join(SRC_DIR, f"*IMG_{n}.*")) if p.lower().endswith(".mp4")][0]


def run(cmd):
    subprocess.run(cmd, check=True)


# ------------------------------------------------------------------ video
for n, g in edit["grade"].items():
    vf = ",".join([
        "hqdn3d=1.2:1.2:4:4",
        f"colorchannelmixer=rr={g['r']}:bb={g['b']}",
        f"eq=gamma={g['gamma']}:contrast={g['contrast']}:brightness={g['bright']}:saturation=1.0",
        "scale=1080:1920:flags=lanczos",
        "unsharp=5:5:0.35:5:5:0.0",
        "format=yuv420p",
    ])
    run(["ffmpeg", "-y", "-v", "error", "-i", src_path(n), "-an", "-vf", vf, "-r", str(FPS), "-c:v", "libx264", "-preset", "slow",
         "-crf", "14", "-g", "10", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-movflags", "+faststart", os.path.join(OUT, f"{n}.mp4")])
    print("video", n)

# ------------------------------------------------------------------ audio helpers
N, HOP = 2048, 512
WIN = np.hanning(N)


def load(n):
    p = os.path.join(TMP, f"{n}.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", src_path(n), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=80:poles=2", p])
    x, _ = sf.read(p, dtype="float64")
    return x


def stft(x):
    pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
    return np.fft.rfft(np.array([pad[i:i + N] * WIN for i in range(0, len(pad) - N, HOP)]), axis=1)


def istft(S, length):
    fr = np.fft.irfft(S, axis=1) * WIN
    out = np.zeros(len(fr) * HOP + N)
    norm = np.zeros_like(out)
    for k, f in enumerate(fr):
        out[k * HOP:k * HOP + N] += f
        norm[k * HOP:k * HOP + N] += WIN ** 2
    return (out / np.maximum(norm, 1e-8))[N:N + length]


def denoise(x, floor_db=-16):
    S = stft(x)
    mag = np.abs(S)
    energy = mag.sum(axis=1)
    quiet = energy <= np.percentile(energy, 12)
    noise = np.mean(mag[quiet] ** 2, axis=0)
    snr = np.maximum(mag ** 2 / (2.0 * noise) - 1, 0)
    gain = snr / (snr + 1)
    gain = swv(np.pad(gain, ((2, 2), (1, 1)), mode="edge"), (5, 3)).mean(axis=(-1, -2))
    gain = np.maximum(gain, 10 ** (floor_db / 20))
    return istft(S * gain, len(x))


def ff(x, chain):
    a, b = os.path.join(TMP, "a.wav"), os.path.join(TMP, "b.wav")
    sf.write(a, x.astype("float32"), SR)
    run(["ffmpeg", "-y", "-v", "error", "-i", a, "-af", chain, "-ar", str(SR), "-ac", "1", b])
    y, _ = sf.read(b, dtype="float64")
    return y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


VOICE_CHAIN = ",".join([
    "equalizer=f=250:t=q:w=1.2:g=-2",
    "equalizer=f=3200:t=q:w=1.0:g=2.5",
    "equalizer=f=9000:t=h:w=0.7:g=1.5",
    "deesser=i=0.3",
    "acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2",
    "alimiter=limit=0.9:attack=2:release=40",
])

voice_src = {c["src"] for c in edit["cuts"] if c["audio"] == "voice"}
raw = {n: load(n) for n in edit["grade"]}
proc = {}
for n, x in raw.items():
    proc[n] = ff(denoise(x), VOICE_CHAIN) if n in voice_src else x

# loudness match: every voice cut to the same speech level; ambience well below it
VOICE_TARGET = -20.0
AMB_TARGET = -42.0
total = sum(c["out"] - c["in"] for c in edit["cuts"]) + edit["logoSeconds"]
mix = np.zeros(int(round(total * SR)) + SR)
t = 0.0
fade = int(0.012 * SR)
for c in edit["cuts"]:
    seg = proc[c["src"]][int(round(c["in"] * SR)):int(round(c["out"] * SR))].copy()
    if c["audio"] == "voice":
        loud = seg[np.abs(seg) > 10 ** (-40 / 20)]
        seg *= 10 ** ((VOICE_TARGET - rms_db(loud if len(loud) > SR // 10 else seg)) / 20)
    else:
        seg *= min(1.0, 10 ** ((AMB_TARGET - rms_db(seg)) / 20))
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(round(t * SR))
    mix[i:i + len(seg)] += seg
    t += c["out"] - c["in"]
mix = mix[: int(round(total * SR))]
# soundtrack fades out with the logo
lf = int(edit["logoSeconds"] * SR)
mix[-lf:] *= np.linspace(1, 0, lf) ** 2

pre = os.path.join(TMP, "pre.wav")
sf.write(pre, mix.astype("float32"), SR)
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", probe, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", ln, "-ar", str(SR), "-ac", "2", os.path.join(OUT, "mix.wav")])
for f in glob.glob(os.path.join(TMP, "*")):
    os.remove(f)
os.rmdir(TMP)
print(f"mix.wav {total:.2f}s")
