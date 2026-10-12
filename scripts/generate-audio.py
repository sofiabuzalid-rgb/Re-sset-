"""
Synthesizes the soundtrack and SFX for the RE:SET Christmas Reel.

- public/audio/jingle.wav  : 32 s "Jingle Bells" chorus arrangement (public domain,
                             J. L. Pierpont, 1857) at 120 BPM -> 1 beat = 15 frames @ 30 fps
- public/audio/whoosh.wav  : transition whoosh
- public/audio/sparkle.wav : magic chime for logo hits

Only depends on numpy. Run: python3 scripts/generate-audio.py
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {"G3": 55, "A3": 57, "B3": 59, "C4": 60, "C#4": 61, "D4": 62, "E4": 64, "F#4": 66,
        "G4": 67, "A4": 69, "B4": 71, "C5": 72, "D5": 74, "E5": 76, "F#5": 78, "G5": 79,
        "G2": 43, "A2": 45, "B2": 47, "C3": 48, "D3": 50, "E3": 52, "F#3": 54}


def env(n, a=0.005, d=0.4):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    att = int(a * SR)
    if att > 0:
        e[:att] *= np.linspace(0, 1, att)
    return e


def bell(freq, dur, amp=1.0):
    """Glockenspiel-ish bell: inharmonic partials with fast decay on the highs."""
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    partials = [(1, 1.0, 0.9), (2.0, 0.35, 0.5), (2.76, 0.25, 0.3), (5.4, 0.12, 0.15), (8.93, 0.06, 0.08)]
    s = np.zeros(n)
    for ratio, a, dec in partials:
        s += a * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / dec)
    s *= env(n, 0.002, 10)
    return amp * s


def epiano(freq, dur, amp=1.0):
    """Soft FM electric piano for doubling the melody an octave down."""
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * t) * 1.2 * np.exp(-t / 0.3)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / 0.9)
    rel = np.ones(n)
    off = int(dur * SR)
    rel[off:] = np.exp(-np.arange(n - off) / SR / 0.12)
    return amp * s * rel * env(n, 0.004, 100)


def bass(freq, dur, amp=1.0):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t) + 0.1 * np.sin(2 * np.pi * 3 * freq * t)
    e = env(n, 0.01, 0.6)
    e[int(dur * SR):] *= np.linspace(1, 0, n - int(dur * SR))
    return amp * s * e


def pad(freqs, dur, amp=1.0):
    n = int((dur + 0.4) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.004):
            s += np.sin(2 * np.pi * f * (1 + det) * t) + 0.25 * np.sin(2 * np.pi * 2 * f * (1 + det) * t)
    a = int(0.25 * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[int(dur * SR):] = np.linspace(1, 0, n - int(dur * SR))
    return amp * s / (3 * len(freqs)) * e


def highpass_fast(x, k=1):
    return np.diff(x, n=k, prepend=np.zeros(k))


def sleigh(amp=1.0):
    n = int(0.18 * SR)
    noise = rng.standard_normal(n)
    s = highpass_fast(highpass_fast(noise))
    # jingly ring: a few high resonant sines
    t = np.arange(n) / SR
    for f in (5200, 6900, 8300, 9700):
        s += 0.8 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * env(n, 0.003, 0.045) * 0.16


def kick(amp=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 50 + 90 * np.exp(-t / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * np.exp(-t / 0.12)


def clap(amp=1.0):
    n = int(0.25 * SR)
    noise = highpass_fast(rng.standard_normal(n))
    e = np.zeros(n)
    for off in (0, 0.012, 0.024):
        o = int(off * SR)
        e[o:] += np.exp(-np.arange(n - o) / SR / 0.05)
    return amp * noise * e * 0.25


def place(buf, sig, t, pan=0.0):
    i = max(0, int(t * SR))
    if i >= buf.shape[1]:
        return
    j = min(buf.shape[1], i + len(sig))
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += sig[: j - i] * l
    buf[1, i:j] += sig[: j - i] * r


def write_wav(path, stereo):
    peak = np.max(np.abs(stereo))
    stereo = stereo / peak * 0.89
    data = (stereo.T * 32767).astype("<i2").tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


# --- Jingle Bells chorus: (note, beats) per bar ------------------------------
B, D5, G, A, C, Dn = "B4", "D5", "G4", "A4", "C5", "D5"
MELODY = [
    [(B, 1), (B, 1), (B, 2)],
    [(B, 1), (B, 1), (B, 2)],
    [(B, 1), (D5, 1), (G, 1.5), (A, 0.5)],
    [(B, 4)],
    [(C, 1), (C, 1), (C, 1.5), (C, 0.5)],
    [(C, 1), (B, 1), (B, 1), (B, 0.5), (B, 0.5)],
    [(B, 1), (A, 1), (A, 1), (B, 1)],
    [(A, 2), (D5, 2)],
    [(B, 1), (B, 1), (B, 2)],
    [(B, 1), (B, 1), (B, 2)],
    [(B, 1), (D5, 1), (G, 1.5), (A, 0.5)],
    [(B, 4)],
    [(C, 1), (C, 1), (C, 1.5), (C, 0.5)],
    [(C, 1), (B, 1), (B, 1), (B, 0.5), (B, 0.5)],
    [(Dn, 1), (Dn, 1), (C, 1), (A, 1)],
    [(G, 4)],
]
CHORDS = ["G", "G", "G", "G", "C", "G", "A7", "D7", "G", "G", "G", "G", "C", "G", "D7", "G"]
CHORD_NOTES = {
    "G": (["G3", "B3", "D4"], ["G2", "D3"]),
    "C": (["C4", "E4", "G4"], ["C3", "G2"]),
    "A7": (["G3", "C#4", "E4"], ["A2", "E3"]),
    "D7": (["F#3", "A3", "C4"], ["D3", "A2"]),
}


def jingle():
    bars = len(MELODY)
    total = bars * 4 * BEAT + 2.0
    buf = np.zeros((2, int(total * SR)))
    bar_len = 4 * BEAT
    for b, bar in enumerate(MELODY):
        t0 = b * bar_len
        t = t0
        for note, beats in bar:
            f = midi(NOTE[note]) * 2  # bell an octave up sparkles
            place(buf, bell(f, beats * BEAT, 0.33), t, pan=0.15)
            place(buf, epiano(midi(NOTE[note]), beats * BEAT * 0.9, 0.22), t, pan=-0.1)
            t += beats * BEAT
        tones, roots = CHORD_NOTES[CHORDS[b]]
        freqs = [midi(NOTE[x]) for x in tones]
        place(buf, pad(freqs, bar_len, 0.22), t0)
        # bass: root on 1, fifth on 3
        place(buf, bass(midi(NOTE[roots[0]]), BEAT * 1.8, 0.5), t0)
        place(buf, bass(midi(NOTE[roots[1]]), BEAT * 1.8, 0.45), t0 + 2 * BEAT)
        # sleigh bells: 8ths, accented off-beats, start right away
        for k in range(8):
            accent = 1.0 if k % 2 else 0.55
            place(buf, sleigh(accent), t0 + k * BEAT / 2 + rng.uniform(-0.004, 0.004), pan=0.35)
        # drums enter from bar 2, full from bar 5
        if b >= 1:
            place(buf, kick(0.55), t0)
            place(buf, kick(0.5), t0 + 2 * BEAT)
        if b >= 4:
            place(buf, clap(0.6), t0 + BEAT, pan=-0.05)
            place(buf, clap(0.6), t0 + 3 * BEAT, pan=0.05)
    # final ring: big G chord bell spray on last bar
    t_end = (bars - 1) * bar_len
    for i, n in enumerate(["G4", "B4", "D5", "G5"]):
        place(buf, bell(midi(NOTE[n]) * 2, 3.0, 0.18), t_end + 0.06 * i, pan=-0.3 + 0.2 * i)
    # gentle fade over the final 1.5 s
    fade = int(1.5 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    # tiny stereo room: short delays
    for d, g in ((0.031, 0.18), (0.047, 0.14)):
        o = int(d * SR)
        buf[0, o:] += g * buf[1, :-o]
        buf[1, o:] += g * buf[0, :-o]
    return buf


def whoosh():
    dur = 0.6
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # sweep a one-pole lowpass cutoff up then down
    alpha = 0.02 + 0.35 * np.sin(np.pi * t) ** 2
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += alpha[i] * (noise[i] - acc)
        y[i] = acc
    e = np.sin(np.pi * t) ** 1.5
    l = y * e * (1 - 0.6 * t)
    r = y * e * (0.4 + 0.6 * t)
    return np.vstack([l, r])


def sparkle():
    dur = 2.2
    buf = np.zeros((2, int(dur * SR)))
    notes = [91, 95, 98, 103, 98, 103, 107]
    for i, m in enumerate(notes):
        place(buf, bell(midi(m), 0.6, 0.25 * (1 - i * 0.07)), 0.055 * i, pan=-0.6 + 0.2 * i)
    return buf


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write_wav(os.path.join(OUT, "jingle.wav"), jingle())
    write_wav(os.path.join(OUT, "whoosh.wav"), whoosh())
    write_wav(os.path.join(OUT, "sparkle.wav"), sparkle())
    print("wrote", os.listdir(OUT))
