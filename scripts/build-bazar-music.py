"""
HOTBOOK BAZAR soundtrack — ORIGINAL (no samples / third-party material): warm minimal deep-house, 120 BPM (beat = 15 frames),
A minor Am9–Dm9–Fmaj7–Em7 Rhodes stabs, sub bass, 4/4 kick, off-beat hat, clap, hand-percussion for the bazaar energy.
Bar 1 is filtered (the hook), full groove from the second shot, final stab + tail under the closing text.
Output: public/bazar/music.wav (-14 LUFS)
"""
import json, os, re, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "bazar")
e = json.load(open(os.path.join(ROOT, "src", "bazar", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
TOTAL = sum(s["frames"] for s in e["shots"])
L = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(1812)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("dr", "rh", "ba", "pc")}
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, g=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * g


def rhodes(fs, d, a=1.0):
    t = tt(d + 0.5)
    s = sum(np.sin(2 * np.pi * f * t + 1.5 * np.exp(-t / 0.12) * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.0) for f in fs) / len(fs)
    return a * s * np.minimum(1, t / 0.003) * np.where(t > d, np.exp(-(t - d) / 0.15), 1)


def sub(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.03)


def kick(a=1.0):
    t = tt(0.4)
    f = 48 + 110 * np.exp(-t / 0.03)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) + 0.12 * np.exp(-t / 0.002))


def noise_hit(d, dec, hpn=2, a=1.0):
    t = tt(d)
    n = rng.standard_normal(len(t) + hpn)
    for _ in range(hpn):
        n = np.diff(n)
    return a * n[: len(t)] * np.exp(-t / dec)


def conga(f, a=1.0):
    t = tt(0.3)
    return a * np.sin(2 * np.pi * f * (1 + 0.3 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.09)


CH = [["A3", "C4", "E4", "G4", "B4"], ["D3", "F3", "A3", "C4", "E4"], ["F3", "A3", "C4", "E4"], ["E3", "G3", "B3", "D4"]]
RT = ["A1", "D2", "F1", "E1"]
end_bar = (TOTAL - 90) // 60 + 1  # bar after the closing shot starts
for b in range(int(np.ceil(TOTAL / 60)) + 1):
    t0 = b * BAR
    c = b % 4
    fs = [hz(n) for n in CH[c]]
    if b < end_bar:
        for k in (0.5, 1.75, 2.5, 3.25):
            put("rh", rhodes(fs, 0.18, 0.5), t0 + k * BEAT)
        for k in range(4):
            put("dr", kick(0.95 if b > 0 else 0.5), t0 + k * BEAT)
            put("dr", noise_hit(0.12, 0.03, 2, 0.08 if b > 0 else 0.03), t0 + (k + 0.5) * BEAT)  # off-beat hat
        if b > 0:
            put("dr", noise_hit(0.2, 0.05, 1, 0.22), t0 + BEAT)
            put("dr", noise_hit(0.2, 0.05, 1, 0.22), t0 + 3 * BEAT)
            for k in (0, 0.75, 1.5, 2, 2.75, 3.5):
                put("ba", sub(hz(RT[c]), BEAT * 0.4, 0.8), t0 + k * BEAT)
            for k, f in ((0.25, 330), (1.25, 250), (2.25, 330), (2.75, 250), (3.75, 400)):  # hand percussion
                put("pc", conga(f, 0.25), t0 + k * BEAT)
    if b == end_bar:
        put("rh", rhodes([hz(n) for n in ["A3", "C4", "E4", "G4", "B4", "E5"]], 2.4, 0.7), t0)
        put("ba", sub(hz("A1"), 1.8, 0.9), t0)
        put("dr", kick(1.0), t0)
mix = bus["dr"] + bus["rh"] * 0.9 + bus["ba"] * 0.8 + bus["pc"]
# bar 1 low-passed (the hook), opening into the full groove
n1 = int(BAR * SR)
k = 40
mix[:n1] = np.convolve(mix[:n1], np.ones(k) / k, mode="same") * 1.4
ir_n = int(1.4 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.3)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
mix = mix + 0.22 * np.fft.irfft(np.fft.rfft(bus["rh"], size) * np.fft.rfft(ir, size), size)[:L]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) / np.tanh(1.3)
end = int(TOTAL / FPS * SR)
mix = mix[:end]
fo = int(0.6 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "music.wav")], check=True)
os.remove(pre)
print("music", TOTAL / FPS, "s")
