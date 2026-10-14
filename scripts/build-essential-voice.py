"""
Builds public/essential/voice.wav from the studio voice-over (replaces the on-camera audio).

1. Spectral noise reduction with a noise profile learned from the voice-over's own silent tail
   (no speech after 14.95 s): STFT, per-bin noise estimate, smoothed Wiener-style gain with a floor
   so the voice keeps its natural tone (no "underwater" artefacts).
2. ffmpeg: 80 Hz high-pass, mud cut / presence / air EQ, de-ess, compression, then an expander AFTER
   the compressor so the room tone between phrases stays down, then two-pass loudnorm to -14 LUFS / -1 dBTP.

Usage: python3 scripts/build-essential-voice.py /path/to/The_Face_Method_4.m4a
"""
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
vo = json.load(open(os.path.join(ROOT, "src", "essential", "voiceover.json")))
OUT = os.path.join(ROOT, "public", "essential", "voice.wav")
TMP = OUT.replace(".wav", "-tmp")
SR = 48000

# --- decode -------------------------------------------------------------------
dec = TMP + "-in.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-af", "highpass=f=80:poles=2", "-ac", "1", "-ar", str(SR), dec], check=True)
x, _ = sf.read(dec, dtype="float64")

# --- spectral noise reduction ---------------------------------------------------
N, HOP = 2048, 512
win = np.hanning(N)


def stft(sig):
    pad = np.concatenate([np.zeros(N), sig, np.zeros(N)])
    frames = [pad[i:i + N] * win for i in range(0, len(pad) - N, HOP)]
    return np.fft.rfft(np.array(frames), axis=1)


def istft(S, length):
    frames = np.fft.irfft(S, axis=1) * win
    out = np.zeros(len(frames) * HOP + N)
    norm = np.zeros_like(out)
    for k, fr in enumerate(frames):
        out[k * HOP:k * HOP + N] += fr
        norm[k * HOP:k * HOP + N] += win ** 2
    out /= np.maximum(norm, 1e-8)
    return out[N:N + length]


S = stft(x)
mag = np.abs(S)
t_of = lambda k: (k * HOP - N) / SR  # noqa: E731
noise_frames = [k for k in range(len(S)) if vo["trimEnd"] + 0.15 < t_of(k) < len(x) / SR - 0.1]
noise = np.mean(mag[noise_frames] ** 2, axis=0)  # noise power per bin

snr = np.maximum(mag ** 2 / (2.0 * noise) - 1, 0)  # over-subtraction factor 2
gain = snr / (snr + 1)
# smooth gain across time and frequency to avoid musical noise
from numpy.lib.stride_tricks import sliding_window_view as swv  # noqa: E402

g = np.pad(gain, ((2, 2), (1, 1)), mode="edge")
gain = swv(g, (5, 3)).mean(axis=(-1, -2))
gain = np.maximum(gain, 10 ** (-18 / 20))  # never cut more than 18 dB -> natural sound
y = istft(S * gain, len(x))
den = TMP + "-den.wav"
sf.write(den, y.astype("float32"), SR)

# --- polish + level ------------------------------------------------------------
a, b = vo["trimStart"], vo["trimEnd"]
chain = ",".join([
    f"atrim={a}:{b},asetpts=PTS-STARTPTS",
    "equalizer=f=250:t=q:w=1.2:g=-2",      # less boxiness
    "equalizer=f=3200:t=q:w=1.0:g=2.5",    # presence / intelligibility
    "equalizer=f=9000:t=h:w=0.7:g=1.5",    # air
    "deesser=i=0.3",
    "acompressor=threshold=-20dB:ratio=3:attack=6:release=120:makeup=3",
    # expander after the compressor: room tone between words stays down
    "agate=threshold=0.02:ratio=3:range=0.1:attack=4:release=160:knee=3",
    "afade=t=in:d=0.03",
    f"afade=t=out:st={b - a - 0.2}:d=0.2",
])
pre = TMP + "-pre.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", den, "-af", chain, "-ar", str(SR), "-ac", "1", pre], check=True)
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", probe, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", ln, "-ar", str(SR), "-ac", "2", OUT], check=True)
for f in (dec, den, pre):
    os.remove(f)
print("wrote", OUT, "| noise profile from", len(noise_frames), "frames")
