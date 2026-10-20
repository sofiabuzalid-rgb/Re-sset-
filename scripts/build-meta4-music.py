"""
RE:SET — 4 Meta Ads — ORIGINAL music (synthesised here with numpy; no samples, no third-party material).
Each track is arranged on the ad's own timeline (src/meta4/aN.json): drums enter / drop / hit exactly on its cuts.
  a1 Navidad en familia  — warm Christmas pop, 120 BPM half-time: celesta + sleigh bells, piano chords, soft groove.
  a2 Producto            — minimal deep-house 120 BPM: warm 7th chords, soft four-on-the-floor, a "tick" on each detail.
  a3 Mamá y yo           — tender piano pop 90 BPM: arpeggios, light claps and shaker, music-box bells.
  a4 Conversión          — punchy 120 BPM: impact on the price, four-on-the-floor, claps, bass stabs, riser + drop.
Loudness: -14 LUFS integrated, -1 dBTP (Meta / Instagram).
Usage: python3 scripts/build-meta4-music.py a1 [a2 ...]
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR, FPS = 48000, 30
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
rng = np.random.default_rng(2026)


def saw(f, t, n=10):
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, n + 1) if f * k < 15000)


def env(t, a, d):
    return np.minimum(1, t / a) * np.exp(-t / d)


def kick(a=1.0, d=0.14):
    t = tt(0.4)
    f = 48 + 110 * np.exp(-t / 0.03)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / d) + 0.12 * np.exp(-t / 0.002))


def noise(d, dec, a=1.0, hp=2):
    t = tt(d)
    n = rng.standard_normal(len(t) + hp)
    for _ in range(hp):
        n = np.diff(n)
    return a * n[: len(t)] * np.exp(-t / dec)


def clap(a=1.0):
    t = tt(0.25)
    n = np.diff(rng.standard_normal(len(t) + 1))
    ev = sum(np.where(t >= q, np.exp(-(t - q) / (0.009 if q < 0.02 else 0.07)), 0) for q in (0, 0.01, 0.02))
    return a * 0.3 * n * ev


def hat(a=1.0, d=0.03):
    return noise(0.12, d, 0.25 * a, 3)


def sleigh(a=1.0):
    t = tt(0.12)
    s = noise(0.12, 0.03, 0.4, 2) + sum(0.3 * np.sin(2 * np.pi * f * t) for f in (5600, 7100, 8900))
    return a * 0.1 * s * np.exp(-t / 0.035)


def bell(f, a=1.0, d=0.6):
    t = tt(d * 2.2)
    return a * sum(g * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * k)) for r, g, k in [(1, 1, 1), (2.76, 0.3, 0.25), (5.4, 0.12, 0.1)]) * np.minimum(1, t / 0.002)


def piano(f, a=1.0, d=1.2):
    t = tt(d * 1.6)
    s = sum(g * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t / (d / k ** 0.7)) for k, g in [(1, 1), (2, 0.5), (3, 0.22), (4, 0.12), (5, 0.06)])
    return a * s * np.minimum(1, t / 0.003)


def pad(fs, d, a=1.0):
    t = tt(d)
    s = sum(saw(f * (1 + dt), t, 6) for f in fs for dt in (-0.004, 0.004)) / (2 * len(fs))
    return a * s * np.minimum(1, t / 0.25) * np.minimum(1, np.maximum(0, d - t) / 0.3)


def ep(fs, d, a=1.0):  # soft electric-piano chord
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.3)) for f in fs) / len(fs)
    return a * s * env(t, 0.005, d * 0.45)


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.25 * saw(f, t, 4)) * np.minimum(1, t / 0.004) * np.minimum(1, np.maximum(0, d - t) / 0.02)


def stab(fs, d, a=1.0):
    t = tt(d + 0.15)
    return a * sum(saw(f, t, 10) for f in fs) / len(fs) * env(t, 0.003, 0.18)


def impact(a=1.0):
    t = tt(1.6)
    f = 38 + 70 * np.exp(-t / 0.08)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) + noise(1.6, 0.25, 0.25, 1)[: len(t)])


def riser(d, a=1.0):
    t = tt(d)
    n = noise(d, 1e9, 1.0, 2)
    return a * n * (t / d) ** 2 * 0.5


def tick(a=1.0):
    t = tt(0.08)
    return a * np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.012)


def chord(names):
    return [hz(n) for n in names]


class Mix:
    def __init__(self, total_frames, tail=2.0):
        self.L = int((total_frames / FPS + tail) * SR)
        self.end = int(total_frames / FPS * SR)
        self.b = {k: np.zeros(self.L) for k in ("dr", "mu", "ba", "fx")}
        self.side = np.ones(self.L)

    def put(self, bus, z, ts, g=1.0):
        i = int(ts * SR)
        if 0 <= i < self.L:
            j = min(self.L, i + len(z))
            self.b[bus][i:j] += z[: j - i] * g

    def duck(self, ts, depth=0.45, rel=0.07):
        i, n = int(ts * SR), int(0.22 * SR)
        if i + n < self.L:
            self.side[i:i + n] = np.minimum(self.side[i:i + n], 1 - depth * np.exp(-np.arange(n) / SR / rel))

    def render(self, out, verb=0.2, drive=1.3, fade=1.4):
        m = self.b["dr"] + (self.b["mu"] + self.b["ba"]) * self.side + self.b["fx"]
        ir_n = int(1.6 * SR)
        ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.35)
        ir /= np.sqrt(np.sum(ir ** 2))
        size = 1 << (self.L + ir_n).bit_length()
        m = m + verb * np.fft.irfft(np.fft.rfft(self.b["mu"] + 0.4 * self.b["fx"], size) * np.fft.rfft(ir, size), size)[: self.L]
        m = np.tanh(m / np.max(np.abs(m)) * drive) / np.tanh(drive)
        m = m[: self.end]
        fo = int(fade * SR)
        m[-fo:] *= np.linspace(1, 0, fo) ** 1.6
        pre = out + "_pre.wav"
        sf.write(pre, m.astype("float32"), SR)
        pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
        j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", out], check=True)
        os.remove(pre)


def starts(e):
    t, d = 0, {}
    for s in e["shots"]:
        d[s["id"]] = t
        t += s["frames"]
    return d, t


def a1(e, mx, st, total):
    B = 0.5  # 120 BPM -> beat 15 frames
    CH = [["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]]
    RT = ["C2", "A1", "F1", "G1"]
    MEL = [["E5", "G5", "C6", "B5"], ["C6", "A5", "E5", "A5"], ["F5", "A5", "C6", "D6"], ["D6", "B5", "G5", None]]
    groove, price, close = st["a02"] / FPS, st["a11"] / FPS, st["a12"] / FPS
    for k, n in enumerate(["G5", "C6", "E6", "G6"]):  # opening shimmer under "ESTE AÑO,"
        mx.put("mu", bell(hz(n), 0.18, 0.8), 0.05 + k * 0.11)
    mx.put("mu", pad(chord(CH[0]), groove, 0.25), 0)
    nb = int(total / FPS / (4 * B)) + 1
    for b in range(nb):
        t0 = b * 4 * B
        c = b % 4
        if t0 >= close:
            break
        mx.put("mu", pad(chord(CH[c]), 4 * B, 0.16), t0)
        for k in range(4):
            tb = t0 + k * B
            if tb >= close - 0.01:
                break
            if tb >= groove:
                if not (price <= tb < price + 4 * B):
                    if k in (0, 2):
                        mx.put("dr", kick(0.85), tb)
                        mx.duck(tb, 0.3)
                    if k == 2:
                        mx.put("dr", clap(0.55), tb)
                    for h in range(2):
                        mx.put("dr", sleigh(0.8 if h else 0.5), tb + h * B / 2)
                mx.put("ba", bass(hz(RT[c]), B * 0.9, 0.55), tb)
                mx.put("mu", piano(chord(CH[c])[k % 3] * 2, 0.16, 0.6), tb + B / 2)
            n = MEL[c][k]
            if n and tb >= groove:
                mx.put("mu", bell(hz(n), 0.2, 0.5), tb)
    for tb in (st["a04"], st["a05"], st["a03"]):  # little sparkle on each "PARA ..."
        for k, n in enumerate(["C6", "E6", "G6"]):
            mx.put("fx", bell(hz(n), 0.12, 0.4), tb / FPS + k * 0.05)
    mx.put("fx", riser(1.0, 0.25), price - 1.0)
    mx.put("mu", piano(hz("C5"), 0.3, 1.5), price)
    mx.put("mu", piano(hz("G5"), 0.25, 1.5), price + 0.05)
    mx.put("mu", pad(chord(["C4", "E4", "G4", "B4", "D5"]), total / FPS - close + 0.5, 0.3), close)
    for k, n in enumerate(["G5", "C6", "E6", "G6", "C7"]):
        mx.put("mu", bell(hz(n), 0.2, 0.9), close + k * 0.08)
    mx.put("ba", bass(hz("C2"), 2.0, 0.7), close)
    mx.put("dr", kick(0.9, 0.3), close)


def a2(e, mx, st, total):
    B = 0.5
    CH = [["A3", "C4", "E4", "G4"], ["D4", "F4", "A4", "C5"], ["F3", "A3", "C4", "E4"], ["E3", "G#3", "B3", "D4"]]
    RT = ["A1", "D2", "F1", "E1"]
    groove, colors, close = st["b02"] / FPS, st["b09"] / FPS, st["b15"] / FPS
    mx.put("mu", pad(chord(CH[0]), groove + 0.2, 0.22), 0)
    nb = int(total / FPS / (4 * B)) + 1
    for b in range(nb):
        t0 = b * 4 * B
        c = (b // 1) % 4
        if t0 >= close:
            break
        mx.put("mu", ep(chord(CH[c]), 4 * B, 0.3), t0)
        for k in range(4):
            tb = t0 + k * B
            if tb < groove or tb >= close - 0.01:
                continue
            mx.put("dr", kick(0.8, 0.12), tb)
            mx.duck(tb, 0.45)
            mx.put("dr", hat(0.9, 0.04), tb + B / 2)
            if tb >= colors:
                mx.put("dr", hat(0.5, 0.02), tb + B / 4)
                mx.put("dr", hat(0.5, 0.02), tb + 3 * B / 4)
            if k in (1, 3) and tb >= st["b04"] / FPS:
                mx.put("dr", clap(0.35), tb)
            mx.put("ba", bass(hz(RT[c]), B * 0.45, 0.6), tb + B / 2)
    for t in e["texts"]:
        if t["type"] == "label":
            mx.put("fx", tick(0.5), t["from"] / FPS)
    for k in range(6):  # colour run: one pluck per colour
        mx.put("mu", bell(hz(["E5", "G5", "A5", "C6", "D6", "E6"][k]), 0.16, 0.25), colors + k * 0.5)
    mx.put("fx", riser(1.0, 0.2), close - 1.0)
    mx.put("mu", ep(chord(["A3", "C4", "E4", "G4", "B4"]), 3.6, 0.45), close)
    mx.put("ba", bass(hz("A1"), 2.0, 0.7), close)
    mx.put("dr", kick(0.9, 0.3), close)


def a3(e, mx, st, total):
    B = 60 / 90  # 90 BPM -> beat 20 frames
    CH = [["G3", "B3", "D4"], ["D3", "F#3", "A3"], ["E3", "G3", "B3"], ["C3", "E3", "G3"]]
    RT = ["G1", "D2", "E2", "C2"]
    beatin, xmas, price, close = st["c03"] / FPS, st["c09"] / FPS, st["c10"] / FPS, st["c11"] / FPS
    nb = int(total / FPS / (4 * B)) + 1
    for b in range(nb):
        t0 = b * 4 * B
        c = b % 4
        if t0 >= close:
            break
        fs = chord(CH[c])
        for k in range(8):  # piano arpeggio in eighths
            tb = t0 + k * B / 2
            if tb >= close - 0.01:
                break
            n = [fs[0], fs[1], fs[2], fs[1] * 2, fs[2], fs[1], fs[0] * 2, fs[2]][k]
            mx.put("mu", piano(n * 2, 0.22 if k % 2 == 0 else 0.15, 0.9), tb)
        mx.put("mu", pad(fs, 4 * B, 0.1), t0)
        for k in range(4):
            tb = t0 + k * B
            if tb < beatin or tb >= close - 0.01:
                continue
            if k in (0, 2):
                mx.put("dr", kick(0.6, 0.12), tb)
            if k in (1, 3):
                mx.put("dr", clap(0.38), tb)
            mx.put("dr", hat(0.5, 0.025), tb + B / 2)
            mx.put("ba", bass(hz(RT[c]), B * 0.9, 0.5), tb)
            if tb >= xmas:
                mx.put("dr", sleigh(0.6), tb + B / 2)
    for k, n in enumerate(["D6", "G6", "B6"]):  # music-box answer on "DOS TAMAÑOS." and on Christmas
        mx.put("fx", bell(hz(n), 0.12, 0.5), st["c02"] / FPS + k * 0.09)
        mx.put("fx", bell(hz(n), 0.14, 0.5), xmas + k * 0.09)
    mx.put("mu", piano(hz("G5"), 0.3, 1.6), price)
    mx.put("mu", pad(chord(["G3", "B3", "D4", "F#4", "A4"]), total / FPS - close + 0.5, 0.25), close)
    for k, n in enumerate(["B5", "D6", "G6", "B6"]):
        mx.put("mu", bell(hz(n), 0.18, 0.9), close + k * 0.1)
    mx.put("ba", bass(hz("G1"), 2.2, 0.6), close)


def a4(e, mx, st, total):
    B = 0.5
    CH = [["F3", "A3", "C4"], ["G3", "B3", "D4"], ["A3", "C4", "E4"], ["A3", "C4", "E4"]]
    RT = ["F1", "G1", "A1", "A1"]
    kids, store, close = st["d09"] / FPS, st["d10"] / FPS, st["d11"] / FPS
    for ts in (0.0, kids, close):  # price hits / final drop
        mx.put("fx", impact(0.9), ts)
        mx.put("mu", stab(chord(["A3", "C4", "E4", "A4"]), 0.3, 0.6), ts)
    mx.put("fx", riser(1.2, 0.35), kids - 1.2)
    mx.put("fx", riser(1.0, 0.3), close - 1.0)
    nb = int(total / FPS / (4 * B)) + 1
    for b in range(nb):
        t0 = b * 4 * B
        c = b % 4
        for k in range(4):
            tb = t0 + k * B
            if tb >= total / FPS - 1.0:
                break
            if tb < 0.5 or (kids - 0.6 <= tb < kids) or (close - 0.6 <= tb < close):
                continue
            mx.put("dr", kick(1.0, 0.13), tb)
            mx.duck(tb, 0.5)
            mx.put("dr", hat(1.0, 0.035), tb + B / 2)
            if k in (1, 3):
                mx.put("dr", clap(0.7), tb)
            mx.put("ba", bass(hz(RT[c]), B * 0.4, 0.75), tb + B / 2)
            mx.put("ba", bass(hz(RT[c]) * 2, B * 0.2, 0.35), tb + 3 * B / 4)
            if k in (0, 2):
                mx.put("mu", stab(chord(CH[c]), 0.16, 0.32), tb + B / 2)
    for k in range(7):  # carousel: one stab per product
        mx.put("fx", tick(0.45), (st["d02"] + 15 * k) / FPS)


for ad in sys.argv[1:]:
    e = json.load(open(os.path.join(ROOT, "src", "meta4", f"{ad}.json")))
    st, total = starts(e)
    mx = Mix(total)
    globals()[ad](e, mx, st, total)
    out = os.path.join(ROOT, "public", "meta4", ad, "music.wav")
    mx.render(out, verb={"a1": 0.24, "a2": 0.16, "a3": 0.24, "a4": 0.1}[ad], drive={"a4": 1.6}.get(ad, 1.3))
    print(ad, "music", round(total / FPS, 2), "s")
