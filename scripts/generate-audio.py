"""
Synthesizes the soundtrack + SFX for the RE:SET Christmas Reel (numpy only).

Music: an upbeat dance-pop take on "Jingle Bells" (public domain, J. L. Pierpont, 1857)
at 150 BPM -> 1 beat = 0.4 s = 12 frames @ 30 fps, 1 bar = 48 frames.

  bars 0-1   HOOK / BUILD : impact hit, filtered pluck teaser, snare roll + riser, gap
  bars 2-13  DROP / CHORUS: four-on-the-floor, claps, bouncy octave bass with sidechain pump,
                            off-beat chord stabs, bright lead + glockenspiel, sleigh bells
  bar  14    BUTTON       : final stab + glock sparkle ring-out

Writes public/audio/{music,whoosh,pop,sparkle,impact}.wav
Run: python3 scripts/generate-audio.py
"""
import os
import wave

import numpy as np

SR = 44100
BPM = 150
BEAT = 60 / BPM
BAR = 4 * BEAT
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(25)

NOTE_NAMES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    """'F#4' -> Hz"""
    pitch, octave = name[:-1], int(name[-1])
    m = 12 * (octave + 1) + NOTE_NAMES[pitch]
    return 440.0 * 2 ** ((m - 69) / 12)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def adsr(n, a=0.005, d=0.1, s=0.6, r=0.05, hold=None):
    """Simple ADSR; `hold` = seconds before release starts (defaults to full length - r)."""
    e = np.zeros(n)
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    H = n - R if hold is None else min(n - R, int(hold * SR))
    H = max(H, A + 1)
    e[:A] = np.linspace(0, 1, A, endpoint=False)
    dEnd = min(H, A + D)
    e[A:dEnd] = np.linspace(1, s, dEnd - A, endpoint=False)
    e[dEnd:H] = s
    e[H:] = np.linspace(e[H - 1], 0, n - H)
    return e


def additive(freq, dur, harmonics=12, bright_decay=0.25, odd_only=False, detune=0.0):
    """Band-limited saw/square-ish tone whose upper harmonics decay faster (pluck brightness)."""
    t = t_axis(dur)
    out = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if odd_only and k % 2 == 0:
            continue
        f = freq * k
        if f > SR / 2.2:
            break
        amp = 1.0 / k
        decay = np.exp(-t * (k - 1) / max(bright_decay, 1e-3) * 0.6)
        out += amp * decay * np.sin(2 * np.pi * f * (1 + detune) * t)
    return out


def bell(freq, dur, amp=1.0):
    n_dur = dur + 1.0
    t = t_axis(n_dur)
    s = np.zeros_like(t)
    for ratio, a, dec in [(1, 1.0, 0.8), (2.0, 0.35, 0.4), (2.76, 0.25, 0.25), (5.4, 0.12, 0.12), (8.93, 0.06, 0.06)]:
        s += a * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / dec)
    return amp * s


def lead(freq, dur, amp=1.0):
    """Bright, bouncy pluck lead (two detuned band-limited saws)."""
    total = dur + 0.15
    s = additive(freq, total, harmonics=14, bright_decay=0.18, detune=-0.004)
    s += additive(freq, total, harmonics=14, bright_decay=0.18, detune=0.004)
    n = len(s)
    e = adsr(n, a=0.003, d=0.12, s=0.55, r=0.08, hold=dur)
    return amp * s * e * 0.5


def stab(freqs, dur=0.16, amp=1.0):
    total = dur + 0.08
    s = sum(additive(f, total, harmonics=10, bright_decay=0.06, odd_only=True) for f in freqs)
    return amp * s * adsr(len(s), a=0.002, d=0.08, s=0.3, r=0.06, hold=dur) / len(freqs)


def bass(freq, dur, amp=1.0):
    total = dur + 0.03
    t = t_axis(total)
    s = np.sin(2 * np.pi * freq * t) * 1.0 + additive(freq, total, harmonics=6, bright_decay=0.08) * 0.5
    return amp * s * adsr(len(s), a=0.004, d=0.06, s=0.7, r=0.03, hold=dur)


def kick(amp=1.0):
    t = t_axis(0.38)
    f = 46 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = np.exp(-t / 0.003) * 0.35
    return amp * (np.sin(ph) * np.exp(-t / 0.16) + click)


def hpf(x):
    return np.diff(x, prepend=0.0)


def clap(amp=1.0):
    t = t_axis(0.28)
    noise = hpf(rng.standard_normal(len(t)))
    e = np.zeros_like(t)
    for off in (0, 0.009, 0.018, 0.027):
        o = int(off * SR)
        e[o:] += np.exp(-np.arange(len(t) - o) / SR / (0.012 if off < 0.027 else 0.09))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.6  # snare-ish body
    return amp * (noise * e * 0.3 + body)


def hat(open_=False, amp=1.0):
    t = t_axis(0.25 if open_ else 0.05)
    s = hpf(hpf(rng.standard_normal(len(t))))
    for f in (7100, 8650, 10300):
        s += 0.6 * np.sign(np.sin(2 * np.pi * f * t))
    return amp * s * np.exp(-t / (0.09 if open_ else 0.014)) * 0.12


def sleigh(amp=1.0):
    t = t_axis(0.16)
    s = hpf(hpf(rng.standard_normal(len(t))))
    for f in (5200, 6900, 8300, 9700):
        s += 0.8 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * np.exp(-t / 0.04) * 0.12


def crash(amp=1.0):
    t = t_axis(1.8)
    s = hpf(rng.standard_normal(len(t)))
    for f in (4200, 5600, 7400, 9100):
        s += 0.4 * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return amp * s * np.exp(-t / 0.55) * 0.18


def boom(amp=1.0):
    """Cinematic impact: deep sub drop + noise burst."""
    t = t_axis(1.6)
    f = 32 + 90 * np.exp(-t / 0.08)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t / 0.5)
    burst = hpf(rng.standard_normal(len(t))) * np.exp(-t / 0.06) * 0.35
    return amp * (sub + burst)


def riser(dur, amp=1.0):
    t = t_axis(dur)
    p = t / dur
    noise = rng.standard_normal(len(t))
    # brighten over time by mixing raw and differentiated noise
    s = noise * (1 - p) * 0.3 + hpf(noise) * p
    tone_f = 300 * 2 ** (p * 3)
    s += 0.25 * np.sin(2 * np.pi * np.cumsum(tone_f) / SR)
    return amp * s * p ** 1.6 * 0.5


class Mix:
    def __init__(self, dur):
        self.buf = np.zeros((2, int(dur * SR)))

    def add(self, sig, t, pan=0.0, gain=1.0):
        i = max(0, int(round(t * SR)))
        if i >= self.buf.shape[1]:
            return
        j = min(self.buf.shape[1], i + len(sig))
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.buf[0, i:j] += sig[: j - i] * l * gain
        self.buf[1, i:j] += sig[: j - i] * r * gain


def write_wav(path, stereo, peak=0.9):
    stereo = stereo / (np.max(np.abs(stereo)) + 1e-9) * peak
    data = (np.clip(stereo, -1, 1).T * 32767).astype("<i2").tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


def soft_clip(x, drive=1.4):
    return np.tanh(x * drive) / np.tanh(drive)


# ---- Score -----------------------------------------------------------------
B4, D5, G4, A4, C5 = "B4", "D5", "G4", "A4", "C5"
CHORUS = [  # Jingle Bells chorus, (note, beats)
    [(B4, 1), (B4, 1), (B4, 2)],
    [(B4, 1), (B4, 1), (B4, 2)],
    [(B4, 1), (D5, 1), (G4, 1.5), (A4, 0.5)],
    [(B4, 4)],
    [(C5, 1), (C5, 1), (C5, 1.5), (C5, 0.5)],
    [(C5, 1), (B4, 1), (B4, 1), (B4, 0.5), (B4, 0.5)],
    [(B4, 1), (A4, 1), (A4, 1), (B4, 1)],
    [(A4, 2), (D5, 2)],
    [(C5, 1), (C5, 1), (C5, 1.5), (C5, 0.5)],
    [(C5, 1), (B4, 1), (B4, 1), (B4, 0.5), (B4, 0.5)],
    [(D5, 1), (D5, 1), (C5, 1), (A4, 1)],
    [(G4, 4)],
]
CHORDS = ["G", "G", "G", "G", "C", "G", "A", "D", "C", "G", "D", "G"]
CHORD = {
    "G": (["G3", "B3", "D4"], "G2"),
    "C": (["C4", "E4", "G4"], "C2"),
    "A": (["A3", "C#4", "E4"], "A2"),
    "D": (["F#3", "A3", "D4"], "D2"),
}
HOOK_BARS = 2


def octave_up(name):
    return name[:-1] + str(int(name[-1]) + 1)


def music():
    chorus_bars = len(CHORUS)
    total_bars = HOOK_BARS + chorus_bars + 1  # + button bar
    dur = total_bars * BAR + 1.5
    drums, music_bus, lead_bus = Mix(dur), Mix(dur), Mix(dur)

    # ---------------- HOOK (bars 0-1) ----------------
    drums.add(boom(1.0), 0.0)
    drums.add(crash(0.9), 0.0, pan=0.2)
    drums.add(kick(1.0), 0.0)
    # muted pluck teaser of "jingle bells, jingle bells" + ticking hats
    teaser = [(B4, 1), (B4, 1), (B4, 2), (B4, 1), (B4, 1), (B4, 2)]
    t = 0.0
    for note, beats in teaser:
        f = hz(note)
        sig = additive(f, beats * BEAT * 0.45, harmonics=4, bright_decay=0.05)
        sig *= adsr(len(sig), a=0.002, d=0.05, s=0.4, r=0.03)
        lead_bus.add(sig, t, gain=0.35)
        lead_bus.add(bell(f * 2, 0.2, 0.15), t, pan=0.2)
        t += beats * BEAT
    for k in range(16):  # 8th hats over both hook bars
        drums.add(hat(amp=0.7 if k % 2 else 0.4), k * BEAT / 2, pan=0.3)
    for k in range(4):  # pulsing muted bass on beats of bar 0
        music_bus.add(bass(hz("G1"), BEAT * 0.4, 0.6), k * BEAT)
    # bar 1: accelerating snare roll + riser, then a 1/8 gap before the drop
    roll_t = BAR
    for sub, beats in ((2, 2), (4, 1), (8, 0.5)):
        step = BEAT / sub
        count = int(beats * sub)
        for k in range(count):
            amp = 0.35 + 0.6 * ((roll_t - BAR) / (BAR - BEAT / 2))
            drums.add(clap(min(amp, 1.0)), roll_t, gain=0.55)
            roll_t += step
    drums.add(riser(BAR - BEAT / 2, 1.0), BAR, gain=0.9)

    # ---------------- CHORUS (bars 2-13) ----------------
    t_drop = HOOK_BARS * BAR
    kick_times = []
    for b in range(chorus_bars):
        t0 = t_drop + b * BAR
        tones, root = CHORD[CHORDS[b]]
        # drums
        for k in range(4):
            drums.add(kick(1.0), t0 + k * BEAT)
            kick_times.append(t0 + k * BEAT)
        drums.add(clap(0.9), t0 + BEAT, pan=-0.05)
        drums.add(clap(0.9), t0 + 3 * BEAT, pan=0.05)
        for k in range(16):
            drums.add(hat(amp=0.9 if k % 4 == 2 else 0.45), t0 + k * BEAT / 4, pan=0.35)
        for k in range(4):
            drums.add(hat(open_=True, amp=0.5), t0 + k * BEAT + BEAT / 2, pan=-0.3)
        for k in range(8):
            drums.add(sleigh(1.0 if k % 2 else 0.6), t0 + k * BEAT / 2, pan=-0.45)
        if b in (0, 8):
            drums.add(crash(0.8), t0, pan=0.25)
        # fill into the second half (bar before index 8)
        if b == 7:
            for k in range(8):
                drums.add(clap(0.4 + 0.07 * k), t0 + 2 * BEAT + k * BEAT / 4, gain=0.6)
            drums.add(riser(2 * BEAT, 0.8), t0 + 2 * BEAT, gain=0.6)
        # bouncy octave bass on 8ths
        rf = hz(root)
        for k in range(8):
            music_bus.add(bass(rf * (2 if k % 2 else 1), BEAT / 2 * 0.85, 0.75), t0 + k * BEAT / 2)
        # off-beat chord stabs (the "skank")
        freqs = [hz(octave_up(x)) for x in tones]
        for k in range(4):
            music_bus.add(stab(freqs, 0.13, 0.55), t0 + k * BEAT + BEAT / 2, pan=0.25 if k % 2 else -0.25)
        # lead + glock
        t = t0
        for note, beats in CHORUS[b]:
            f = hz(note) * 2
            lead_bus.add(lead(f, beats * BEAT * 0.8, 0.55), t, pan=-0.08)
            lead_bus.add(bell(f * 2, beats * BEAT, 0.22), t, pan=0.2)
            t += beats * BEAT

    # ---------------- BUTTON (bar 14) ----------------
    t_end = (HOOK_BARS + chorus_bars) * BAR
    drums.add(kick(1.0), t_end)
    drums.add(boom(0.6), t_end)
    drums.add(crash(1.0), t_end)
    music_bus.add(stab([hz(x) for x in ["G4", "B4", "D5", "G5"]], 0.5, 1.0), t_end)
    music_bus.add(bass(hz("G1"), 0.8, 0.9), t_end)
    for i, n in enumerate(["G5", "B5", "D6", "G6"]):
        lead_bus.add(bell(hz(n), 1.5, 0.22), t_end + 0.07 * i, pan=-0.3 + 0.2 * i)
    for k in range(6):
        drums.add(sleigh(1.0), t_end + k * 0.05, pan=-0.4)

    # sidechain pump on the music bus (ducks after every chorus kick)
    n = music_bus.buf.shape[1]
    duck = np.ones(n)
    for kt in kick_times:
        i = int(kt * SR)
        j = min(n, i + int(0.3 * SR))
        x = np.arange(j - i) / SR
        duck[i:j] = np.minimum(duck[i:j], 1 - 0.65 * np.exp(-x / 0.09))
    music_bus.buf *= duck

    mix = drums.buf * 0.9 + music_bus.buf * 0.8 + lead_bus.buf * 0.85
    # small stereo room
    for d, g in ((0.023, 0.12), (0.041, 0.09)):
        o = int(d * SR)
        mix[0, o:] += g * mix[1, :-o].copy()
        mix[1, o:] += g * mix[0, :-o].copy()
    mix = mix / np.max(np.abs(mix))
    mix = soft_clip(mix, 1.6)  # glue + loudness
    fade = int(1.0 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    return mix


def whoosh():
    dur = 0.45
    n = int(dur * SR)
    p = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    alpha = 0.03 + 0.5 * np.sin(np.pi * p) ** 2
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += alpha[i] * (noise[i] - acc)
        y[i] = acc
    e = np.sin(np.pi * p) ** 1.2
    return np.vstack([y * e * (1 - 0.7 * p), y * e * (0.3 + 0.7 * p)])


def pop():
    """Bubbly cartoon pop for text."""
    t = t_axis(0.12)
    f = 500 + 900 * np.exp(-t / 0.02)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
    return np.vstack([s, s])


def sparkle():
    m = Mix(1.8)
    for i, note in enumerate(["G6", "B6", "D7", "G7", "D7", "G7", "B7"]):
        m.add(bell(hz(note), 0.5, 0.25 * (1 - i * 0.07)), 0.05 * i, pan=-0.6 + 0.2 * i)
    return m.buf


def impact():
    s = boom(1.0) + crash(0.6)[: int(1.6 * SR)]
    return np.vstack([s, s])


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for old in ("jingle.wav",):
        p = os.path.join(OUT, old)
        if os.path.exists(p):
            os.remove(p)
    write_wav(os.path.join(OUT, "music.wav"), music(), peak=0.93)
    write_wav(os.path.join(OUT, "whoosh.wav"), whoosh(), peak=0.8)
    write_wav(os.path.join(OUT, "pop.wav"), pop(), peak=0.7)
    write_wav(os.path.join(OUT, "sparkle.wav"), sparkle(), peak=0.8)
    write_wav(os.path.join(OUT, "impact.wav"), impact(), peak=0.9)
    print("wrote", sorted(os.listdir(OUT)))
