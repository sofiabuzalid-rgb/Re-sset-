"""
Original soft music bed for the PetalEditorial composition (no samples, no third-party material).
80 BPM lo-fi e-piano (Fmaj9 - Em7 - Dm9 - Cmaj7), brushed kit, round bass, a soft swish on the carousel
swipe (frame 150) and a held chord under the closing card (frame 282).
Output: public/editorial/music.wav
"""
import json, os, re, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "editorial", "music.wav")
SR, FPS, TOTAL = 48000, 30, 315
BEAT = 60 / 80
L = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(1148)
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
bus = {k: np.zeros(L) for k in ("keys", "drums", "bass", "fx")}


def put(b, z, ts, g=1.0):
    i = int(ts * SR)
    j = min(L, i + len(z))
    bus[b][i:j] += z[: j - i] * g


def epiano(fs, d, a=1.0):
    t = tt(d + 1.0)
    s = sum(np.sin(2 * np.pi * f * t + 0.9 * np.exp(-t / 0.2) * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.8) for f in fs) / len(fs)
    s *= 1 + 0.12 * np.sin(2 * np.pi * 4 * t)
    return a * s * np.minimum(1, t / 0.006) * np.where(t > d, np.exp(-(t - d) / 0.35), 1)


def brush(a=1.0, d=0.18):
    t = tt(d)
    return a * np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t / 0.06) * 0.06


def kick(a=1.0):
    t = tt(0.3)
    return a * np.sin(2 * np.pi * np.cumsum(48 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.16)


def bass(f, d, a=1.0):
    t = tt(d)
    return a * np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.08)


CH = [["F3", "A3", "C4", "E4", "G4"], ["E3", "G3", "B3", "D4"], ["D3", "F3", "A3", "C4", "E4"], ["C3", "E3", "G3", "B3"]]
RT = ["F1", "E1", "D1", "C2"]
close = 282 / FPS
b = 0
while b * 4 * BEAT < close:
    t0 = b * 4 * BEAT
    c = b % 4
    put("keys", epiano([hz(n) for n in CH[c]], BEAT * 2.5, 0.5), t0)
    put("keys", epiano([hz(n) for n in CH[c][1:]], BEAT * 1.2, 0.3), t0 + 2.5 * BEAT)
    put("bass", bass(hz(RT[c]), BEAT * 3.6, 0.5), t0)
    for k in range(4):
        ts = t0 + k * BEAT
        if ts >= close:
            break
        if b > 0 or k >= 2:
            put("drums", kick(0.55 if k in (0, 2) else 0), ts)
            put("drums", brush(1.0 if k in (1, 3) else 0.35), ts)
            put("drums", brush(0.25, 0.08), ts + BEAT / 2)
    b += 1
# soft swish on the carousel swipe
t = tt(0.6)
n = rng.standard_normal(len(t))
put("fx", np.convolve(n, np.ones(40) / 40, "same") * np.sin(np.pi * t / 0.6) ** 2 * 0.25, 150 / FPS - 0.3)
# closing chord
put("keys", epiano([hz(n) for n in ["F2", "C3", "A3", "E4", "G4", "C5"]], 1.2, 0.7), close)
put("bass", bass(hz("F1"), 1.0, 0.5), close)
# vinyl-ish air
air = rng.standard_normal(L)
air = np.convolve(air, np.ones(6) / 6, "same") * 0.006
mix = bus["keys"] + 0.9 * bus["drums"] + 0.8 * bus["bass"] + bus["fx"] + air
ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.5)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
mix = mix + 0.3 * np.fft.irfft(np.fft.rfft(bus["keys"], size) * np.fft.rfft(ir, size), size)[:L]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.1) / np.tanh(1.1)
end = int(TOTAL / FPS * SR)
mix = mix[:end]
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
fo = int(0.8 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = OUT.replace(".wav", "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-16:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", OUT], check=True)
os.remove(pre)
print("music", TOTAL / FPS, "s")
