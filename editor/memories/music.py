"""RE:SET · The Memories We Wear — música original (compuesta en código: RE:SET es dueña, sin licencia de terceros).

01 "Los recuerdos que vas a crear"  90 BPM 4/4, Re mayor, 7 compases (18.67 s = 560 cuadros).
   Piano solo con cuerdas suaves → entra el arpegio → campanillas en cada cambio de recuerdo → pulso suave y ráfaga
   (compás 4, segunda mitad: corte en cada corchea) → cadencia y acorde final con campanas en la marca.
02 "Una pijama, mil recuerdos"      72 BPM 3/4 (vals), Sol mayor, 6.4 compases (16 s = 480 cuadros). Más contemplativo:
   piano de vals, cuerdas, celesta; sin percusión.
Cada cambio de escena del video cae en un tiempo fuerte (ver BAR en src/memories/Memories.tsx).
Uso: python3 editor/memories/music.py
"""
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402  (building blocks: filt, saw, noise, kick, shaker…)

SR = M.SR
OUT = Path(__file__).resolve().parents[1] / "video/public/memories"
rng = np.random.default_rng(1225)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano(m, dur, vel=0.7):
    """two slightly detuned strings per note, inharmonic partials, brighter when struck harder, felt hammer thump"""
    f = mtof(m)
    n = int(SR * (dur + 2.5))
    t = np.arange(n) / SR
    base = float(np.clip(3.2 * (220 / f) ** 0.45, 0.9, 6.0))
    B = 0.00035
    y = np.zeros(n)
    for h in range(1, 13):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 16000:
            break
        amp = vel ** (0.6 + 0.25 * h) / h ** 1.15
        tau = base / (1 + 0.45 * (h - 1))
        for d in (-0.6, 0.7):
            y += np.sin(2 * np.pi * fh * 2 ** (d / 1200) * t + rng.uniform(0, 6.28)) * amp * np.exp(-t / tau) * 0.5
    # two-stage decay (prompt + aftersound), like a real string
    y *= 0.65 * np.exp(-t / (base * 0.35)) + 0.35
    y += M.filt(rng.uniform(-1, 1, n), "bp", [min(f * 2, 3000), min(f * 8, 9000)]) * np.exp(-t / 0.006) * 0.08 * vel
    rel = np.clip((dur + 0.25 - t) / 0.25, 0, 1)  # damper (keeps a little ring: half pedal)
    y *= 0.25 + 0.75 * rel
    y *= np.clip(t / 0.002, 0, 1)
    return M.fade_tail(y * 0.5)


def bell(m, vel=0.5):
    """soft glockenspiel / celesta"""
    f = mtof(m)
    n = int(SR * 3.0)
    t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) * g for r, d, g in [(1, 1.6, 1), (2.0, 0.6, 0.25), (2.76, 0.45, 0.3), (5.4, 0.12, 0.12), (8.93, 0.05, 0.06)])
    return M.fade_tail(y * np.clip(t / 0.0015, 0, 1) * vel * 0.4)


def strings(notes, dur, att=0.9, lp=1900):
    """ensemble: 3 detuned saws per note with slow vibrato, warm low-pass, slow bow attack and release"""
    n = int(SR * (dur + 1.4))
    t = np.arange(n) / SR
    L, R = np.zeros(n), np.zeros(n)
    for m in notes:
        for k, c in enumerate((-9, 0, 8)):
            vib = 1 + 0.0018 * np.sin(2 * np.pi * (4.8 + 0.4 * k) * t + rng.uniform(0, 6.28))
            ph = np.cumsum(mtof(m) * 2 ** (c / 1200) * vib) / SR + rng.uniform()
            v = 2 * (ph % 1.0) - 1
            (L if k != 1 else R)[:] += v * (1.0 if k != 1 else 0.8)
            if k == 1:
                L[:] += v * 0.3
    env = np.clip(t / att, 0, 1) ** 1.5 * np.clip((dur + 1.4 - t) / 1.4, 0, 1)
    out = np.stack([M.filt(L, "lp", lp, 2), M.filt(R, "lp", lp, 2)], 1)
    out = np.stack([M.filt(out[:, c], "hp", 120) for c in range(2)], 1)
    return out * env[:, None] / (len(notes) * 3)


def sub(m, dur):
    n = int(SR * (dur + 0.6))
    t = np.arange(n) / SR
    return M.fade_tail(np.sin(2 * np.pi * mtof(m) * t) * np.clip(t / 0.08, 0, 1) * np.clip((dur + 0.6 - t) / 0.6, 0, 1) * 0.5)


def swell(dur):
    """reverse-cymbal style air swell into a downbeat"""
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = M.filt(rng.uniform(-1, 1, n), "hp", 3000)
    return (x * (t / dur) ** 2.5 * 0.25)


def reverb(x, secs=2.8, wet=0.32):
    n = int(SR * secs)
    t = np.arange(n) / SR
    ir = []
    for c in range(2):
        r = rng.normal(0, 1, n) * np.exp(-t / (secs / 6.9))
        r = M.filt(r, "lp", 6500) * np.clip(t / 0.02, 0, 1)
        r[: int(0.022 * SR)] = 0
        ir.append(r / np.sqrt(np.sum(r ** 2)))
    w = np.stack([ss.fftconvolve(x[:, c], ir[c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + w * wet * 2.2


class Track:
    def __init__(self, secs):
        self.n = int(SR * secs)
        self.st = {}

    def add(self, stem, at, y, pan=0.0, g=1.0):
        if stem not in self.st:
            self.st[stem] = np.zeros((self.n, 2))
        if y.ndim == 1:
            y = np.stack([y * (1 - pan) ** 0.5 * 1.41 / 2 ** 0.5, y * (1 + pan) ** 0.5 * 1.41 / 2 ** 0.5], 1) / 1.41
        i = int(at * SR)
        if i >= self.n:
            return
        k = min(len(y), self.n - i)
        self.st[stem][i:i + k] += y[:k] * g

    def mix(self, gains, wets, tail=1.2):
        out = np.zeros((self.n, 2))
        for k, v in self.st.items():
            out += reverb(v, wet=wets.get(k, 0.3)) * gains.get(k, 1.0)
        out = np.stack([M.filt(out[:, c], "hp", 35) for c in range(2)], 1)
        out /= np.max(np.abs(out)) + 1e-9
        out = np.tanh(out * 1.3) / np.tanh(1.3)
        k = int(SR * tail)
        out[-k:] *= np.linspace(1, 0, k)[:, None] ** 1.5
        return out * 10 ** (-1 / 20) / (np.max(np.abs(out)) + 1e-9)


def write(name, x):
    OUT.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT / name, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    print("wrote", OUT / name, f"{len(x) / SR:.2f}s")


# ---------- 01 · 90 BPM 4/4, D major ----------
def track01():
    bpm = 90
    b = 60 / bpm
    tr = Track(560 / 30)
    # chord per half bar (beat index, arpeggio notes, string voicing, root)
    ch = [(0, [50, 57, 64, 66], [62, 66, 69, 76], 38), (4, [49, 57, 61, 64], [61, 64, 69, 73], 37),
          (8, [47, 54, 57, 62], [59, 62, 66, 69], 35), (12, [43, 50, 59, 66], [59, 62, 66, 71], 31),
          (16, [52, 59, 62, 67], [59, 62, 67, 71], 40), (18, [45, 52, 62, 67], [57, 62, 64, 69], 33),
          (20, [43, 50, 59, 62], [59, 62, 67, 71], 31), (22, [45, 52, 61, 64], [57, 61, 64, 69], 33),
          (24, [38, 50, 57, 62, 66], [62, 66, 69, 74, 78], 38)]
    ends = [c[0] for c in ch[1:]] + [28]
    for (bt, arp, strv, root), e in zip(ch, ends):
        dur = (e - bt) * b
        if bt == 0:  # hook: just a soft open fifth under the melody
            tr.add("lh", 0, piano(50, 4 * b, 0.45), -0.2)
            tr.add("lh", 0, piano(57, 4 * b, 0.4), -0.1)
        elif bt < 24:
            pat = arp + arp[2:0:-1]  # up-down eighths
            for k in range(int((e - bt) * 2)):
                v = 0.42 + (0.1 if k % 2 == 0 else 0) + (0.08 if bt >= 16 else 0)
                tr.add("lh", (bt + k / 2) * b, piano(pat[k % len(pat)], b * 0.9, v), -0.25)
        else:
            for m in arp:
                tr.add("lh", bt * b, piano(m, 4 * b, 0.55), -0.2)
        if bt >= 4:
            tr.add("str", bt * b - (0.15 if bt > 4 else 0), strings(strv, dur + 0.15, att=1.6 if bt == 4 else 0.5))
        if bt >= 12:
            tr.add("sub", bt * b, sub(root + 12, dur))
    mel = [(0, 78, 1), (1, 76, .5), (1.5, 74, .5), (2, 69, 2),
           (4, 76, 1), (5, 74, .5), (5.5, 73, .5), (6, 69, 1), (7, 71, 1),
           (8, 74, 1), (9, 73, .5), (9.5, 71, .5), (10, 66, 1.5), (11.5, 69, .5),
           (12, 71, 1), (13, 74, .5), (13.5, 78, .5), (14, 79, 1), (15, 78, .5), (15.5, 76, .5),
           (16, 76, 1), (17, 74, .5), (17.5, 76, .5), (18, 78, 1), (19, 81, 1),
           (20, 83, 1.5), (21.5, 81, .5), (22, 79, 1), (23, 76, 1),
           (24, 78, 4)]
    for bt, m, d in mel:
        tr.add("rh", bt * b, piano(m, d * b, 0.62 if bt < 20 else 0.7), 0.15)
    # bells on every memory change (frames 80/160/240/320) and the brand chord
    for bt, m in [(4, 88), (8, 86), (12, 85), (16, 83)]:
        tr.add("bell", bt * b, bell(m, 0.5), 0.35)
    for k, m in enumerate([86, 90, 93]):
        tr.add("bell", 24 * b + k * 0.09, bell(m, 0.55), -0.3 + 0.3 * k)
    # burst (beats 18–20): one cut per eighth — soft heartbeat kick + shaker + rising celesta
    for k in range(4):
        tr.add("perc", (18 + k / 2) * b, M.kick(0.16, 120, 50) * (0.35 + 0.1 * k))
        tr.add("bell", (18 + k / 2) * b, bell([81, 85, 88, 90][k], 0.32), 0.4 - 0.25 * k)
    for k in range(16):  # shaker on 16ths, beats 16–20, growing
        tr.add("perc", (16 + k / 4) * b, M.shaker() * (0.25 + 0.04 * k), 0.3)
    tr.add("air", 20 * b - 2.0, swell(2.0))
    tr.add("air", 24 * b - 1.6, swell(1.6) * 0.7)
    x = tr.mix({"lh": 0.8, "rh": 1.0, "str": 0.55, "sub": 0.3, "bell": 0.5, "perc": 0.35, "air": 0.5},
               {"lh": 0.3, "rh": 0.3, "str": 0.4, "sub": 0.05, "bell": 0.45, "perc": 0.15, "air": 0.5}, tail=1.4)
    write("music01.wav", x)


# ---------- 02 · 72 BPM 3/4 waltz, G major ----------
def track02():
    bpm = 72
    b = 60 / bpm
    tr = Track(480 / 30)
    bars = [([43, 50, 59, 66], [62, 66, 71], 31), ([42, 50, 57, 62], [62, 66, 69], 30), ([40, 47, 54, 59, 62], [59, 62, 66], 28),
            ([36, 43, 52, 59], [59, 64, 67], 24), ([45, 52, 60, 64], [60, 64, 67], 33), ([43, 50, 57, 59, 62], [62, 67, 71, 74], 31)]
    for i, (chd, strv, root) in enumerate(bars):
        t0 = i * 3 * b
        last = i == len(bars) - 1
        if i == 0:
            tr.add("lh", t0, piano(chd[0], 3 * b, 0.4), -0.25)
            tr.add("lh", t0 + b, piano(chd[2], 2 * b, 0.32), -0.15)
        elif not last:
            tr.add("lh", t0, piano(chd[0], 3 * b, 0.5), -0.25)
            for k in (1, 2):
                for m in chd[2:]:
                    tr.add("lh", t0 + k * b, piano(m, b * 0.85, 0.3), -0.1)
            if i == 4:  # Am7 → D7sus on beat 3
                tr.add("lh", t0 + 2 * b, piano(38, b, 0.45), -0.25)
        else:
            for k, m in enumerate(chd):
                tr.add("lh", t0 + k * 0.05, piano(m, 4 * b, 0.5), -0.2)
        if i >= 1:
            tr.add("str", t0 - 0.2, strings(strv, (3 if not last else 4) * b + 0.2, att=1.4 if i == 1 else 0.7, lp=1600))
            tr.add("sub", t0, sub(root + 12, 3 * b))
    mel = [(0, 74, 1.5), (1.5, 71, .5), (2, 69, 1), (3, 69, 2), (5, 74, 1), (6, 78, 1.5), (7.5, 76, .5), (8, 74, 1),
           (9, 76, 2), (11, 71, 1), (12, 72, 1), (13, 71, 1), (14, 69, 1), (15, 67, 3.4)]
    for bt, m, d in mel:
        tr.add("rh", bt * b, piano(m, d * b, 0.58), 0.15)
    for bt, m in [(9, 88), (10, 86), (11, 83), (12, 84), (13, 83), (14, 81)]:  # celesta countermelody, bars 3–4
        tr.add("bell", bt * b, bell(m, 0.3), 0.4)
    for k, m in enumerate([79, 83, 86, 91]):
        tr.add("bell", 15 * b + 0.12 * k, bell(m, 0.45), -0.3 + 0.2 * k)
    tr.add("air", 15 * b - 1.8, swell(1.8) * 0.6)
    x = tr.mix({"lh": 0.75, "rh": 1.0, "str": 0.6, "sub": 0.25, "bell": 0.5, "air": 0.5},
               {"lh": 0.35, "rh": 0.35, "str": 0.45, "sub": 0.05, "bell": 0.5, "air": 0.5}, tail=1.6)
    write("music02.wav", x)


if __name__ == "__main__":
    track01()
    track02()
