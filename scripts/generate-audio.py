"""
Synthesizes the soundtrack + SFX for the RE:SET Christmas Reel (numpy only, no samples).

Music: cinematic "Carol of the Bells" (melody: "Shchedryk", M. Leontovych, 1916 — public domain)
in G minor, 3/4 at 180 BPM -> 1 bar = 1.0 s = 30 frames @ 30 fps, 1 beat = 10 frames.

  bars 0-3    HOOK   celesta + pizzicato ostinato, drone, boom; timpani roll + swell into bar 4
  bar  4      DROP   taiko, strings, sleigh bells, choir
  bars 8-15          counter-melodies (strings, then choir + high strings)
  bars 16-19         descending "ding-dong" bell line, everything in
  bar  20     END    bright G-major chord (Picardy third) ringing out

Everything is sent through a synthetic convolution reverb.
Writes public/audio/{music,whoosh,shimmer,rip,sparkle}.wav
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 180
BEAT = 60 / BPM          # 1/3 s
BAR = 3 * BEAT           # 1.0 s
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(1916)

_NOTES = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
          "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def hz(n):
    p, o = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((12 * (o + 1) + _NOTES[p] - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.01, r=0.1, hold=None, curve=1.0):
    """attack / sustain / release envelope"""
    e = np.ones(n)
    A = max(1, int(a * SR))
    R = max(1, int(r * SR))
    H = n - R if hold is None else min(n - R, int(hold * SR))
    H = max(H, A)
    e[:A] = np.linspace(0, 1, A) ** curve
    e[H:] = np.linspace(1, 0, n - H) ** 2
    return e


def smooth(x, k):
    """moving-average low-pass (k samples)"""
    if k <= 1:
        return x
    c = np.cumsum(np.concatenate([np.zeros(k), x]))
    return (c[k:] - c[:-k]) / k


def hp(x):
    return np.diff(x, prepend=0.0)


# ---------------------------------------------------------------- instruments
def celesta(f, d=0.6, amp=1.0):
    t = tt(d + 1.4)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1)
         + 0.28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.35)
         + 0.10 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.15)
         + 0.05 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.05))
    s[:60] *= np.linspace(0, 1, 60)
    return amp * s


def pizz(f, d=0.6, amp=1.0, damp=0.994):
    """Karplus-Strong plucked string, vectorized per period."""
    N = max(2, int(SR / f))
    L = int(d * SR)
    out = np.zeros(L + N)
    out[:N] = smooth(rng.uniform(-1, 1, N + 8), 6)[:N]
    for s in range(N, L + N, N):
        e = min(s + N, L + N)
        a = out[s - N:e - N]
        b = np.concatenate([[out[s - N - 1] if s - N - 1 >= 0 else 0.0], out[s - N:e - N - 1]])
        out[s:e] = damp * 0.5 * (a + b)
    out = out[:L]
    return amp * out * env(L, 0.002, 0.08)


def saw_voice(f, t, harmonics=24, vib=0.0, bright=1.0):
    ph = 2 * np.pi * f * (t + vib)
    s = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if f * k > 9000:
            break
        s += np.sin(k * ph) / k * (bright ** (k - 1))
    return s


def strings(freqs, d, amp=1.0, attack=0.25, voices=5, bright=0.965, release=0.45):
    t = tt(d + release)
    s = np.zeros_like(t)
    for f in freqs:
        for v in range(voices):
            det = (v - (voices - 1) / 2) * 0.0035
            vib = 0.0025 / (2 * np.pi * 5.2) * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6.28))
            s += saw_voice(f * (1 + det), t, 24, vib, bright)
    s /= voices * max(1, len(freqs))
    return amp * s * env(len(t), attack, release, hold=d, curve=1.5)


def spiccato(f, amp=1.0):
    d = 0.16
    t = tt(d)
    s = sum(saw_voice(f * (1 + det), t, 10, 0, 0.8) for det in (-0.004, 0, 0.004)) / 3
    e = np.exp(-t / 0.05)
    e[:80] *= np.linspace(0, 1, 80)
    return amp * s * e


VOWEL_A = [(800, 90, 1.0), (1150, 110, 0.6), (2900, 220, 0.5), (3900, 260, 0.3)]


def choir(freqs, d, amp=1.0, attack=0.4, release=0.6):
    """'Aah' choir: harmonics weighted by vowel formants, vibrato, detuned singers."""
    t = tt(d + release)
    s = np.zeros_like(t)
    for f in freqs:
        for v in range(4):
            det = (v - 1.5) * 0.004
            ff = f * (1 + det)
            vib = 0.004 / (2 * np.pi * 5.5) * np.sin(2 * np.pi * (5.2 + v * 0.3) * t + v)
            ph = 2 * np.pi * ff * (t + vib)
            for k in range(1, 40):
                fk = ff * k
                if fk > 5000:
                    break
                g = sum(a * np.exp(-0.5 * ((fk - fc) / bw) ** 2) for fc, bw, a in VOWEL_A) + 0.02
                s += g * np.sin(k * ph) / np.sqrt(k)
    breath = smooth(rng.standard_normal(len(t)), 3) * 0.004
    s = s / (4 * max(1, len(freqs))) + breath
    return amp * s * env(len(t), attack, release, hold=d, curve=1.8)


def bass(f, d, amp=1.0):
    t = tt(d + 0.1)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return amp * s * env(len(t), 0.01, 0.1, hold=d)


def taiko(amp=1.0, pitch=1.0):
    t = tt(1.0)
    f = (58 + 70 * np.exp(-t / 0.03)) * pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    skin = smooth(rng.standard_normal(len(t)), 12) * np.exp(-t / 0.04) * 0.6
    return amp * (body + skin)


def kick(amp=1.0):
    t = tt(0.4)
    f = 48 + 120 * np.exp(-t / 0.03)
    return amp * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) + np.exp(-t / 0.002) * 0.3)


def snare(amp=1.0):
    t = tt(0.4)
    noise = hp(rng.standard_normal(len(t))) * np.exp(-t / 0.11) * 0.9
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.06)
    return amp * (noise + body)


def tom(f=110, amp=1.0):
    t = tt(0.5)
    ff = f * (1 + 0.6 * np.exp(-t / 0.03))
    return amp * np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / 0.2)


def shaker(amp=1.0):
    t = tt(0.07)
    s = hp(hp(rng.standard_normal(len(t))))
    e = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 2
    return amp * s * e * 0.11


def sleigh(amp=1.0):
    t = tt(0.18)
    s = hp(hp(rng.standard_normal(len(t)))) * 0.5
    for f in (5300, 6700, 8100, 9600, 11200):
        s += 0.5 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * np.exp(-t / 0.045) * 0.14


def crash(amp=1.0):
    t = tt(2.5)
    s = hp(rng.standard_normal(len(t)))
    for f in (3900, 5300, 6800, 8700):
        s += 0.3 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * np.exp(-t / 0.8) * 0.16


def boom(amp=1.0):
    t = tt(2.5)
    f = 28 + 70 * np.exp(-t / 0.12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    burst = smooth(rng.standard_normal(len(t)), 20) * np.exp(-t / 0.08) * 1.2
    return amp * (sub + burst)


def swell(d, amp=1.0):
    """reverse-cymbal style crescendo"""
    t = tt(d)
    p = t / d
    s = hp(rng.standard_normal(len(t)))
    for f in (4100, 5700, 7300):
        s += 0.25 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * p ** 3 * 0.25


def timpani_roll(d, f=hz("G2"), amp=1.0):
    t = tt(d)
    out = np.zeros(len(t) + SR)
    step = 0.045
    k = 0
    while k * step < d:
        p = (k * step) / d
        x = tt(0.4)
        hit = np.sin(2 * np.pi * f * x * (1 + 0.05 * np.exp(-x / 0.02))) * np.exp(-x / 0.25)
        i = int(k * step * SR)
        out[i:i + len(hit)] += hit * (0.1 + 0.9 * p ** 2)
        k += 1
    return amp * out


# ---------------------------------------------------------------- mixing
class Bus:
    def __init__(self, dur, verb=0.2):
        self.b = np.zeros((2, int(dur * SR)))
        self.verb = verb

    def add(self, sig, t, pan=0.0, gain=1.0):
        i = max(0, int(round(t * SR)))
        if i >= self.b.shape[1]:
            return
        j = min(self.b.shape[1], i + len(sig))
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.b[0, i:j] += sig[: j - i] * l * gain
        self.b[1, i:j] += sig[: j - i] * r * gain


def make_ir(seconds=2.8, predelay=0.025):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    irs = []
    for ch in range(2):
        noise = rng.standard_normal(n)
        # darker tail: progressively smoothed noise
        dark = smooth(noise, 9)
        mix = noise * np.exp(-t / 0.35) + dark * 2.2 * (1 - np.exp(-t / 0.35))
        ir = mix * np.exp(-t / (seconds / 6.5))
        pd = int(predelay * SR)
        ir = np.concatenate([np.zeros(pd), ir])
        # a few early reflections
        for d_ms, g in ((11, 0.5), (19, 0.35), (31, 0.28), (47, 0.2)):
            k = int((d_ms + ch * 3) / 1000 * SR)
            ir[k] += g * 8
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    return irs


def convolve(x, ir):
    n = len(x) + len(ir) - 1
    size = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return y


def reverb(stereo, irs):
    return np.vstack([convolve(stereo[0], irs[0]), convolve(stereo[1], irs[1])])


def write_wav(path, stereo, peak=0.9):
    stereo = stereo / (np.max(np.abs(stereo)) + 1e-9) * peak
    data = (np.clip(stereo, -1, 1).T * 32767).astype("<i2").tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


# ---------------------------------------------------------------- score
CELL = [(0, 1 / 3), (1 / 3, 1 / 6), (1 / 2, 1 / 6), (2 / 3, 1 / 3)]   # (onset, length) in bars
OSTINATO = ["Bb4", "A4", "Bb4", "G4"]
BASS = ["G2", "F2", "Eb2", "D2"]
CHORDS = [["G3", "Bb3", "D4"], ["F3", "A3", "C4"], ["Eb3", "G3", "Bb3"], ["D3", "F#3", "A3"]]
COUNTER_A = [["D5", "C5", "D5", "Bb4"], ["C5", "Bb4", "C5", "A4"], ["Bb4", "A4", "Bb4", "G4"], ["A4", "G4", "A4", "F#4"]]
COUNTER_B = [["G5", "F5", "G5", "D5"], ["F5", "Eb5", "F5", "C5"], ["Eb5", "D5", "Eb5", "Bb4"], ["D5", "C5", "D5", "A4"]]
DESCENT = [["G5", "F5", "Eb5"], ["D5", "C5", "Bb4"], ["C5", "Bb4", "G4"], ["D5", "C5", "A4"]]
FINAL_BAR = 20


def up(n, k=1):
    return n[:-1] + str(int(n[-1]) + k)


def music(FINAL_BAR=FINAL_BAR):
    dur = FINAL_BAR * BAR + 3.0
    keys = Bus(dur, 0.35)      # celesta, pizz
    strs = Bus(dur, 0.4)       # strings
    vox = Bus(dur, 0.55)       # choir
    low = Bus(dur, 0.08)       # bass
    perc = Bus(dur, 0.18)      # drums
    fx = Bus(dur, 0.3)         # booms, swells

    def cell(bus, notes, t0, fn, **kw):
        for (on, ln), n in zip(CELL, notes):
            bus.add(fn(hz(n), **kw) if fn in (spiccato,) else fn(hz(n), ln * BAR, **kw), t0 + on * BAR)

    # ---------------- HOOK: bars 0-3 ----------------
    fx.add(boom(1.0), 0.0)
    fx.add(crash(0.6), 0.0, pan=0.2)
    strs.add(strings([hz("G2"), hz("D3")], 4.0, 0.5, attack=1.5, bright=0.75), 0.0)
    for b in range(4):
        t0 = b * BAR
        g = 0.55 + b * 0.15
        cell(keys, [up(n) for n in OSTINATO], t0, celesta, amp=g)
        cell(keys, OSTINATO, t0, pizz, amp=0.5 + b * 0.1)
        low.add(pizz(hz(BASS[b]), 0.9, 0.9), t0)
    for b in (2, 3):
        perc.add(taiko(0.6 + 0.2 * (b - 2)), b * BAR)
    perc.add(timpani_roll(BAR - 0.05, amp=0.6), 3 * BAR)
    fx.add(swell(1.6, 1.0), 4 * BAR - 1.6)

    # ---------------- MAIN: bars 4-19 ----------------
    for b in range(4, FINAL_BAR):
        t0 = b * BAR
        i = b % 4
        # drums: taiko+kick on 1, snare on 3, toms, shaker 8ths, sleigh bells
        perc.add(taiko(0.9), t0)
        perc.add(kick(0.8), t0)
        perc.add(snare(0.75), t0 + 2 * BEAT, pan=0.05)
        perc.add(tom(140, 0.35), t0 + 1.5 * BEAT, pan=-0.3)
        for k in range(6):
            perc.add(shaker(1.0 if k % 2 else 0.6), t0 + k * BEAT / 2, pan=0.4)
            perc.add(sleigh(1.0 if k % 2 else 0.7), t0 + k * BEAT / 2, pan=-0.45)
        if i == 3:  # fill
            for k in range(6):
                perc.add(tom(170 - k * 15, 0.4 + 0.08 * k), t0 + 2 * BEAT + k * BEAT / 6, pan=-0.4 + 0.15 * k)
        if b in (4, 8, 12, 16):
            perc.add(crash(0.9), t0, pan=0.25)
            fx.add(boom(0.45 if b > 4 else 1.0), t0)
        # bass + strings pad
        low.add(bass(hz(BASS[i]), BAR * 0.95, 0.6), t0)
        low.add(bass(hz(up(BASS[i])), BAR / 6, 0.3), t0 + 2.5 * BEAT)
        strs.add(strings([hz(n) for n in CHORDS[i]], BAR * 0.98, 0.5, attack=0.12, bright=0.95, release=0.3), t0)
        # ostinato: spiccato strings + celesta (8va)
        cell(strs, OSTINATO, t0, spiccato, amp=0.55)
        cell(keys, [up(n) for n in OSTINATO], t0, celesta, amp=0.28)
        # counter-melodies
        if 8 <= b < 12:
            cell(strs, COUNTER_A[i], t0, lambda f, d, **k: strings([f], d, 0.45, attack=0.04, release=0.2, voices=4, bright=0.88))
        if 8 <= b < 20:
            vox.add(choir([hz(n) for n in CHORDS[i]], BAR * 0.98, 0.6), t0)
        if 12 <= b < 16:
            cell(strs, COUNTER_B[i], t0, lambda f, d, **k: strings([f], d, 0.4, attack=0.03, release=0.2, voices=4, bright=0.9))
            cell(keys, [up(n) for n in COUNTER_B[i]], t0, celesta, amp=0.25)
        if 16 <= b < 20:
            for k, n in enumerate(DESCENT[i]):
                strs.add(strings([hz(n)], BEAT * 0.95, 0.5, attack=0.03, release=0.25, voices=4, bright=0.9), t0 + k * BEAT)
                keys.add(celesta(hz(up(n)), BEAT, 0.5), t0 + k * BEAT)
    fx.add(swell(1.0, 0.8), FINAL_BAR * BAR - 1.0)

    # ---------------- FINAL: bright G major ----------------
    tf = FINAL_BAR * BAR
    fx.add(boom(1.0), tf)
    perc.add(taiko(1.0), tf)
    perc.add(crash(1.0), tf)
    low.add(bass(hz("G1"), 2.2, 1.0), tf)
    strs.add(strings([hz(n) for n in ["G3", "B3", "D4", "G4", "B4"]], 2.0, 0.9, attack=0.03, release=0.9), tf)
    vox.add(choir([hz(n) for n in ["G3", "B3", "D4", "G4"]], 2.0, 0.9, attack=0.05, release=0.9), tf)
    for k, n in enumerate(["G5", "B5", "D6", "G6", "B6"]):
        keys.add(celesta(hz(n), 1.0, 0.5), tf + 0.06 * k, pan=-0.4 + 0.2 * k)
    for k in range(10):
        perc.add(sleigh(1.0), tf + k * 0.04, pan=-0.4)

    # ---------------- mix + reverb + master ----------------
    irs = make_ir()
    buses = [(keys, 0.85), (strs, 0.9), (vox, 0.7), (low, 0.9), (perc, 0.95), (fx, 0.8)]
    dry = sum(b.b * g for b, g in buses)
    send = sum(b.b * g * b.verb for b, g in buses)
    wet = reverb(send, irs)
    mix = dry + wet * 1.1
    # master high-shelf for air + presence
    shelf = np.diff(mix, axis=1, prepend=0.0)
    presence = np.vstack([smooth(ch, 3) - smooth(ch, 8) for ch in mix])  # ~2.5-6.5 kHz band
    mix = mix + 0.4 * shelf + 3.2 * presence
    mix /= np.max(np.abs(mix))
    mix = np.tanh(mix * 1.5) / np.tanh(1.5)
    fade = int(1.2 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    return mix


# ---------------------------------------------------------------- SFX
def whoosh():
    d = 0.5
    n = int(d * SR)
    p = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    for k, w in ((3, 0.3), (10, 0.5), (30, 0.6)):
        y += smooth(noise, k) * w * np.sin(np.pi * np.clip(p * 1.6 - (k / 60), 0, 1)) ** 2
    e = np.sin(np.pi * p) ** 1.3
    return np.vstack([y * e * (1 - 0.6 * p), y * e * (0.4 + 0.6 * p)])


def shimmer():
    m = Bus(2.5)
    notes = ["D6", "G6", "Bb6", "D7", "G7", "Bb6", "D7", "G7"]
    for k, n in enumerate(notes):
        m.add(celesta(hz(n), 0.4, 0.35 * (1 - k * 0.06)), k * 0.045, pan=-0.6 + 0.15 * k)
    m.add(swell(0.6, 0.6), 0)
    return m.b + reverb(m.b * 0.6, make_ir(2.0))


def sparkle():
    m = Bus(2.2)
    for k, n in enumerate(["G6", "B6", "D7", "G7", "D7", "G7", "B7"]):
        m.add(celesta(hz(n), 0.4, 0.3 * (1 - k * 0.07)), 0.06 * k, pan=-0.5 + 0.17 * k)
    return m.b + reverb(m.b * 0.5, make_ir(2.0))


def rip():
    """Wrapping paper tearing: crackly band-limited noise bursts."""
    d = 0.55
    t = tt(d)
    noise = rng.standard_normal(len(t))
    crackle = (rng.random(len(t)) < 0.02) * rng.standard_normal(len(t)) * 3
    s = hp(noise) * 0.4 + smooth(noise, 4) * 0.6 + crackle
    e = np.minimum(1, t / 0.02) * np.exp(-t / 0.25) * (1 + 0.5 * np.sin(2 * np.pi * 23 * t))
    s = s * e
    return np.vstack([s, np.roll(s, 90)])


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    write_wav(os.path.join(OUT, "music.wav"), music(), peak=0.93)
    # shorter cut for the "Magic of Christmas" reel: final chord on bar 17
    write_wav(os.path.join(OUT, "music-magic.wav"), music(FINAL_BAR=17), peak=0.93)
    write_wav(os.path.join(OUT, "whoosh.wav"), whoosh(), peak=0.7)
    write_wav(os.path.join(OUT, "shimmer.wav"), shimmer(), peak=0.8)
    write_wav(os.path.join(OUT, "sparkle.wav"), sparkle(), peak=0.8)
    write_wav(os.path.join(OUT, "rip.wav"), rip(), peak=0.8)
    print("wrote", sorted(os.listdir(OUT)))
