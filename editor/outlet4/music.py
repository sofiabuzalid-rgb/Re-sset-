"""Original music + SFX for the four OUTLET 25% OFF ads (composed in code, so RE:SET owns them: no third-party licence).

AD1  "Ya llegó"        124 BPM nu-disco / fast fashion  (A minor)
AD2  "Chat"            100 BPM playful cool-girl pop     (F major)
AD4  "No te duermas"   128 BPM energetic pop-EDM         (A minor), opens with a music-box lullaby
AD3 uses the Pixabay afro house the client supplied (Pixabay licence, commercial use allowed).

Section boundaries are in beats and match src/outlet4/config.ts, so every cut, text hit and drop lands on the music.
Usage: python3 music.py  → editor/video/public/outlet4/audio/*.wav
"""
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "video" / "public" / "outlet4" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(25)


# ---------- building blocks ----------
def T(n):
    return np.arange(n) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def filt(x, kind, fc, order=2):
    if kind == "bp":
        sos = ss.butter(order, fc, "bandpass", fs=SR, output="sos")
    else:
        sos = ss.butter(order, min(fc, SR * 0.45), "low" if kind == "lp" else "high", fs=SR, output="sos")
    return ss.sosfilt(sos, x)


def saw(freq, n, ph0=0.0):
    """band-limited (polyBLEP) sawtooth"""
    dt = freq / SR
    ph = (ph0 + np.arange(n) * dt) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def noise(n):
    return rng.uniform(-1, 1, n)


def ad(n, a, tau):
    """attack (s) then exponential decay (tau s)"""
    t = T(n)
    e = np.exp(-np.maximum(t - a, 0) / tau)
    if a > 0:
        e *= np.clip(t / a, 0, 1)
    return e


def fade_tail(x, s=0.01):
    k = min(len(x), int(s * SR))
    if k:
        r = np.linspace(1, 0, k)
        x[-k:] *= r[:, None] if x.ndim == 2 else r
    return x


# drums
def kick(dec=0.2, f0=170, f1=55, punch=1.0):
    """punchy kick: short low tail (phones can't play sub anyway), a 100 Hz knock and a click so it reads on small speakers"""
    n = int(SR * dec * 2.2)
    t = T(n)
    f = f1 + (f0 - f1) * np.exp(-t / 0.03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
    knock = filt(noise(n), "bp", [90, 260]) * np.exp(-t / 0.03) * 0.5
    click = filt(noise(n), "hp", 2500) * np.exp(-t / 0.004) * 0.45 * punch
    return fade_tail(filt(np.tanh((y + knock + click) * 1.6), "hp", 38))


def clap(dec=0.16, tone=1400):
    n = int(SR * 0.45)
    t = T(n)
    env = np.zeros(n)
    for k, d in enumerate([0.0, 0.011, 0.023]):
        env += np.exp(-np.maximum(t - d, 0) / (0.007 if k < 2 else dec)) * (t >= d)
    return fade_tail(filt(noise(n), "bp", [tone * 0.6, tone * 2.6]) * env * 0.9)


def snap():
    n = int(SR * 0.12)
    t = T(n)
    y = filt(noise(n), "bp", [1800, 5200]) * np.exp(-t / 0.018)
    y += np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.006) * 0.3
    return fade_tail(y)


def hat(dec=0.035, hp=7500):
    n = int(SR * max(0.08, dec * 6))
    return fade_tail(filt(noise(n), "hp", hp, 4) * ad(n, 0.0005, dec) * 0.6)


def shaker():
    n = int(SR * 0.09)
    return fade_tail(filt(noise(n), "bp", [4000, 11000]) * ad(n, 0.012, 0.02) * 0.5)


def snare(dec=0.15):
    n = int(SR * 0.4)
    t = T(n)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    nz = filt(noise(n), "bp", [1500, 7000]) * np.exp(-t / dec)
    return fade_tail(body * 0.5 + nz)


def crash(dec=1.2):
    n = int(SR * dec * 3)
    return fade_tail(filt(noise(n), "hp", 5000, 2) * ad(n, 0.002, dec) * 0.5)


def impact():
    n = int(SR * 1.6)
    t = T(n)
    boom = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t / 0.4) + 32) / SR) * np.exp(-t / 0.45)
    hit = filt(noise(n), "lp", 2500) * np.exp(-t / 0.08) * 0.6
    return fade_tail(np.tanh((boom + hit) * 1.4))


def riser(dur, f0=300, f1=6000):
    n = int(SR * dur)
    t = T(n)
    p = t / dur
    nz = noise(n)
    # sweep a band-pass by blending a few fixed bands (cheap, smooth)
    bands = np.geomspace(f0, f1, 8)
    out = np.zeros(n)
    for k, fc in enumerate(bands):
        w = np.clip(1 - np.abs(p * (len(bands) - 1) - k), 0, 1)
        out += filt(nz, "bp", [fc * 0.7, fc * 1.4]) * w
    f = 110 * 2 ** (p * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    return (out + tone) * (p ** 2) * 0.9


# tonal
def supersaw(notes, dur, a=0.005, tau=0.25, lp_lo=600, lp_hi=5000, env_tau=0.12, width=0.7):
    n = int(SR * (dur + tau * 3))
    L = np.zeros(n)
    R = np.zeros(n)
    det = [-22, -11, -4, 0, 4, 11, 22]
    for m in notes:
        for k, c in enumerate(det):
            v = saw(mtof(m) * 2 ** (c / 1200), n, rng.uniform())
            pan = (k / (len(det) - 1) - 0.5) * width
            L += v * (0.5 - pan)
            R += v * (0.5 + pan)
    amp = ad(n, a, tau) if tau < 50 else np.clip(T(n) / a, 0, 1)
    gate = np.clip((dur + 0.02 - T(n)) / 0.02, 0, 1)
    fenv = np.exp(-T(n) / env_tau)
    out = []
    for ch in (L, R):
        dark = filt(ch, "lp", lp_lo)
        bright = filt(ch, "lp", lp_hi)
        out.append((dark * (1 - fenv) + bright * fenv) * amp * gate / (len(notes) * 4))
    return fade_tail(np.stack(out, 1))


def pad(notes, dur, lp=2200):
    n = int(SR * (dur + 0.4))
    L = np.zeros(n)
    R = np.zeros(n)
    for m in notes:
        for k, c in enumerate([-14, -5, 6, 15]):
            v = saw(mtof(m) * 2 ** (c / 1200), n, rng.uniform())
            (L if k % 2 else R)[:] += v
    t = T(n)
    amp = np.clip(t / 0.12, 0, 1) * np.clip((dur + 0.4 - t) / 0.4, 0, 1)
    return fade_tail(np.stack([filt(L, "lp", lp), filt(R, "lp", lp)], 1) * amp[:, None] / (len(notes) * 4))


def bass(m, dur, lp=420, saw_mix=0.6, tau=0.2):
    n = int(SR * (dur + 0.03))
    t = T(n)
    f = mtof(m)
    y = np.sin(2 * np.pi * f * t) * (1 - saw_mix) + filt(saw(f, n), "lp", lp, 4) * saw_mix * 1.4
    env = ad(n, 0.003, tau) * np.clip((dur + 0.03 - t) / 0.03, 0, 1)
    return fade_tail(np.tanh(y * 1.3) * env)


def pluck(m, dur=0.25, bright=4500, tau=0.18):
    n = int(SR * (dur + 0.3))
    t = T(n)
    f = mtof(m)
    raw = saw(f, n) * 0.7 + saw(f * 1.004, n, 0.3) * 0.5
    fenv = np.exp(-t / 0.05)
    y = filt(raw, "lp", 700) * (1 - fenv) + filt(raw, "lp", bright) * fenv
    return fade_tail(y * ad(n, 0.002, tau) * 0.6)


def marimba(m, tau=0.32):
    n = int(SR * 1.0)
    t = T(n)
    f = mtof(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    y += np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / (tau * 0.22)) * 0.35
    y += np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / (tau * 0.07)) * 0.12
    y += filt(noise(n), "bp", [f * 2, min(f * 8, 18000)]) * np.exp(-t / 0.004) * 0.2
    return fade_tail(y * np.clip(t / 0.002, 0, 1))


def epiano(notes, dur):
    n = int(SR * (dur + 0.8))
    t = T(n)
    y = np.zeros(n)
    for m in notes:
        f = mtof(m)
        y += np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.3)) * np.exp(-t / 1.4)
        y += np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.25) * 0.2
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.6 * t)
    gate = np.clip((dur + 0.8 - t) / 0.8, 0, 1)
    y = y * trem * gate / len(notes)
    return fade_tail(np.stack([y * (1 + 0.15 * np.sin(2 * np.pi * 4.6 * t)), y * (1 - 0.15 * np.sin(2 * np.pi * 4.6 * t))], 1) * 0.6)


def musicbox(m):
    n = int(SR * 2.2)
    t = T(n)
    f = mtof(m)
    y = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t / d) * g for h, d, g in [(1, 1.1, 1), (2.0, 0.5, 0.35), (3.01, 0.25, 0.2), (4.18, 0.12, 0.12), (5.43, 0.07, 0.08)])
    return fade_tail(y * np.clip(t / 0.001, 0, 1) * 0.5)


# ---------- mixing ----------
class Mix:
    def __init__(self, seconds, bpm):
        self.n = int(SR * seconds)
        self.B = 60 / bpm
        self.bus = {k: np.zeros((self.n, 2)) for k in ("drums", "kick", "music", "verb", "fx")}

    def at(self, beat):
        return beat * self.B

    def add(self, bus, sig, beat=None, sec=None, gain=1.0, pan=0.0):
        t = sec if sec is not None else self.at(beat)
        i = int(round(t * SR))
        if i >= self.n:
            return
        a = (pan + 1) * np.pi / 4  # constant-power pan, -1 left … +1 right
        s = sig if sig.ndim == 2 else np.stack([sig * np.cos(a), sig * np.sin(a)], 1)
        j = min(self.n, i + len(s))
        self.bus[bus][i:j] += s[: j - i] * gain

    def render(self, kicks, duck=0.65, verb_send=0.25, tail_fade=0.35, name="mix"):
        """sidechain music to the kicks, reverb send, then hand the stems to master()"""
        side = np.ones(self.n)
        for b in kicks:
            i = int(round(self.at(b) * SR))
            if i >= self.n:
                continue
            k = min(self.n - i, int(SR * 0.3))
            side[i : i + k] = np.minimum(side[i : i + k], 1 - duck * np.exp(-T(k) / 0.07))
        music = self.bus["music"] * side[:, None]
        ir_n = int(SR * 1.6)
        ir = np.stack([filt(noise(ir_n), "lp", 6000) * np.exp(-T(ir_n) / 0.4) for _ in range(2)], 1) * 0.05
        wet_src = music * verb_send + self.bus["verb"]
        wet = np.stack([ss.fftconvolve(wet_src[:, c], ir[:, c])[: self.n] for c in range(2)], 1)
        stems = {"kick": self.bus["kick"], "drums": self.bus["drums"], "music": music + wet, "fx": self.bus["fx"]}
        STEMS.mkdir(parents=True, exist_ok=True)
        np.savez(STEMS / f"{name}.npz", **stems)
        return master(stems, tail_fade, GAINS[name])


STEMS = Path(__file__).resolve().parent / "stems"  # not versioned; lets the balance be re-tuned without re-synthesising
# per-track stem balance, tuned so energy sits like a commercial dance mix (sub ~10-18 %, lows ~40-55 %, mids ~25-35 %, presence/air ~5-10 %)
GAINS = {
    "ad1": {"kick": 0.8, "drums": 2.6, "music": 3.0, "fx": 0.9},
    "ad2": {"kick": 1.8, "drums": 2.6, "music": 2.1, "fx": 0.9},
    "ad4": {"kick": 0.75, "drums": 3.2, "music": 2.8, "fx": 0.9},
}
FILES = {"ad1": "ad1_ya_llego.wav", "ad2": "ad2_chat.wav", "ad4": "ad4_no_te_duermas.wav"}


def master(stems, tail_fade, gains):
    """balance the stems, glue (soft clip) and peak-normalise to -1 dBFS"""
    mix = sum(stems[k] * g for k, g in gains.items())
    mix = np.stack([filt(mix[:, c], "hp", 32) for c in range(2)], 1)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix = np.tanh(mix * 1.8) / np.tanh(1.8)
    k = int(SR * tail_fade)
    mix[-k:] *= np.linspace(1, 0, k)[:, None]
    mix *= 10 ** (-1 / 20) / (np.max(np.abs(mix)) + 1e-9)
    return mix


def write(name, x):
    wavfile.write(OUT / name, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    print("wrote", OUT / name, f"{len(x) / SR:.2f}s")


# ---------- AD1 · YA LLEGÓ — 124 BPM nu-disco, A minor, 15 bars ----------
def ad1():
    BARS = 15
    m = Mix(BARS * 4 * 60 / 124, 124)
    prog = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]]  # Am7 Fmaj7 Cmaj7 G6
    roots = [45, 41, 48, 43]
    kicks = []
    m.add("fx", impact(), 0, gain=0.9)
    for bar in range(BARS):
        ch, rt = prog[bar % 4], roots[bar % 4]
        b0 = bar * 4
        breakdown = bar == 7
        hook = bar == 0
        for q in range(4):
            if not breakdown:
                m.add("kick", kick(), b0 + q, gain=1.0)
                kicks.append(b0 + q)
            if q in (1, 3) and not hook:
                m.add("drums", clap(), b0 + q, gain=0.55, pan=0.05)
            if not hook:
                m.add("drums", hat(0.12, 6500), b0 + q + 0.5, gain=0.35, pan=0.25)
            for s in range(4):
                if not hook or q >= 2:
                    m.add("drums", hat(), b0 + q + s / 4, gain=0.16 + (0.1 if s == 2 else 0), pan=-0.3)
            # octave disco bass on 8ths
            if not hook or q >= 2:
                for e, oc in ((0, 0), (0.5, 12)):
                    m.add("music", bass(rt + oc, m.B * 0.42, lp=600 if bar < 10 else 900), b0 + q + e, gain=0.5 if not breakdown else 0.35)
        # chord stabs, syncopated 16ths; in the hook bar the filter opens up toward the 25% OFF drop
        for st in (2, 6, 10, 13):
            lp_hi = 1200 + 3800 * (st / 16) if hook else 5200
            m.add("music", supersaw(ch, m.B * 0.22, tau=0.11, lp_lo=500, lp_hi=lp_hi), b0 + st / 4, gain=0.55)
        if not hook:
            m.add("music", pad(ch, m.B * 4, lp=1600 if breakdown else 2400), b0, gain=0.22)
        # 16th pluck arpeggio in the grid and variety sections
        if 4 <= bar <= 6 or 10 <= bar <= 13:
            seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12]
            for s in range(16):
                m.add("music", pluck(seq[s % 8], m.B / 4 * 0.9, bright=5200, tau=0.09), b0 + s / 4, gain=0.22, pan=0.2 if s % 2 else -0.2)
    m.add("drums", crash(), 4, gain=0.55)  # 25% OFF lands
    m.add("fx", impact(), 4, gain=0.6)
    m.add("fx", riser(m.B * 4), 36, gain=0.5)  # bar 9 builds into the variety burst
    m.add("drums", crash(), 40, gain=0.6)
    m.add("fx", riser(m.B * 3.5, 500, 7000), 0.5, gain=0.25)
    m.add("drums", crash(1.6), 52, gain=0.45)  # CTA
    m.add("music", supersaw(prog[0], m.B * 3, tau=1.2, lp_lo=900, lp_hi=4000, env_tau=0.6), 56, gain=0.5)
    write("ad1_ya_llego.wav", m.render(kicks, duck=0.6, verb_send=0.22, name="ad1"))


# ---------- AD2 · CHAT — 100 BPM playful cool-girl pop, F major, 13 bars ----------
def ad2():
    BARS = 13
    m = Mix(BARS * 4 * 0.6, 100)
    prog = [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [67, 71, 74, 77]]  # Fmaj7 Em7 Dm7 G7
    roots = [41, 40, 38, 43]
    motifs = [[81, 84, 79, 76, None, 74, 76, 79], [79, 76, 74, 71, None, 74, 76, 74], [77, 74, 72, 69, None, 72, 74, 77], [79, 83, 86, 83, None, 81, 79, 77]]
    kicks = []
    for bar in range(BARS):
        b0 = bar * 4
        k = bar % 4
        chat = bar < 2
        if chat:
            # the chat: just snaps and a soft marimba answer between the message pings
            for q in (1, 3):
                m.add("drums", snap(), b0 + q, gain=0.35, pan=0.15)
            for i, nt in enumerate(motifs[k][:4]):
                m.add("music", marimba(nt, 0.4), b0 + i * 0.5 + (0 if bar == 0 else 2), gain=0.28, pan=-0.2)
            m.add("music", epiano(prog[k], m.B * 3.8), b0, gain=0.22)
            continue
        for st in (0, 6, 10):
            m.add("kick", kick(0.2, 150, 58, 0.8), b0 + st / 4, gain=0.85)
            kicks.append(b0 + st / 4)
            m.add("music", bass(roots[k] + (0 if st != 10 else 7), m.B * (1.4 if st == 0 else 0.9), lp=380, saw_mix=0.35, tau=0.35), b0 + st / 4, gain=0.6)
        for q in (1, 3):
            m.add("drums", clap(0.12, 1700), b0 + q, gain=0.45)
            m.add("drums", snap(), b0 + q + 0.02, gain=0.3, pan=-0.2)
        for s in range(8):
            m.add("drums", shaker(), b0 + s / 2 + 0.25, gain=0.35 if s % 2 else 0.22, pan=0.3)
        if bar >= 7:
            for s in range(16):
                m.add("drums", hat(0.025), b0 + s / 4, gain=0.12, pan=-0.35)
        m.add("music", epiano(prog[k], m.B * 1.6), b0, gain=0.3)
        m.add("music", epiano(prog[k], m.B * 0.6), b0 + 1.75, gain=0.18)
        m.add("music", epiano(prog[k], m.B * 1.2), b0 + 2.75, gain=0.24)
        lift = 12 if 7 <= bar <= 9 else 0
        for i, nt in enumerate(motifs[k]):
            if nt is not None:
                m.add("music", marimba(nt + lift - 12 * (bar >= 11), 0.3), b0 + i * 0.5, gain=0.3, pan=0.2 if i % 2 else -0.15)
    m.add("fx", riser(m.B * 2.5, 400, 6000), 5.5, gain=0.45)  # out of the chat …
    m.add("fx", impact(), 8, gain=0.75)  # … smash into the pajamas
    m.add("drums", crash(), 8, gain=0.5)
    m.add("drums", crash(), 28, gain=0.35)
    m.add("drums", crash(1.4), 38, gain=0.45)
    m.add("music", marimba(84, 0.6), 48, gain=0.35)
    m.add("music", marimba(89, 0.6), 48.5, gain=0.3)
    m.add("music", epiano([65, 69, 72, 76, 79], m.B * 3), 48, gain=0.35)
    write("ad2_chat.wav", m.render(kicks, duck=0.35, verb_send=0.3, name="ad2"))


# ---------- AD4 · NO TE DUERMAS — music-box lullaby, alarm, then 128 BPM pop-EDM, A minor, 18 bars ----------
def ad4():
    BARS = 18
    m = Mix(BARS * 4 * 60 / 128, 128)
    prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    roots = [45, 41, 48, 43]
    hook = [[81, 84, 88, 84, 81, 84, 86, 84], [81, 84, 89, 84, 81, 84, 88, 84], [79, 84, 88, 84, 79, 84, 86, 84], [79, 83, 86, 83, 79, 83, 86, 88]]
    kicks = []
    # bar 0: sleepy music box (Brahms' Wiegenlied opening, public domain) → the alarm is an SFX in the edit
    for i, (nt, b) in enumerate([(76, 0.0), (76, 0.55), (79, 1.1), (76, 1.95), (76, 2.35)]):
        m.add("music", musicbox(nt + 12), sec=b, gain=0.55, pan=-0.2 if i % 2 else 0.2)
    m.add("music", pad([57, 64, 72], 2.2, lp=900), sec=0.0, gain=0.18)
    m.add("fx", riser(m.B * 1.6, 600, 9000), 2.4, gain=0.55)
    for bar in range(1, BARS):
        b0 = bar * 4
        k = (bar - 1) % 4
        build = 10 <= bar <= 11  # grid "elige rápido": build-up into the drop at bar 12
        light = 4 <= bar <= 5  # the line about the outlet: breathing room
        if not build:
            for q in range(4):
                m.add("kick", kick(0.2, 175, 55, 1.1), b0 + q, gain=1.0)
                kicks.append(b0 + q)
        for q in (1, 3):
            if not build:
                m.add("drums", clap(0.18, 1300), b0 + q, gain=0.6)
                m.add("drums", snare(0.1), b0 + q, gain=0.25)
        for s in range(8):
            m.add("drums", hat(0.03 if s % 2 == 0 else 0.1, 7000), b0 + s / 2, gain=0.18 if s % 2 == 0 else 0.3, pan=0.25)
        if build:
            # snare roll that doubles each half bar
            step = 0.5 if bar == 10 else 0.25
            nrolls = int(4 / step)
            for r in range(nrolls):
                g = 0.15 + 0.4 * ((bar - 10) * 4 + r * step) / 8
                m.add("drums", snare(0.07), b0 + r * step, gain=g)
        # off-beat house bass
        for q in range(4):
            if not build or bar == 11 and q < 2:
                m.add("music", bass(roots[k] + 12, m.B * 0.4, lp=900, saw_mix=0.8, tau=0.12), b0 + q + 0.5, gain=0.45)
                m.add("music", bass(roots[k], m.B * 0.45, lp=200, saw_mix=0.1, tau=0.2), b0 + q + 0.5, gain=0.4)
        lp = 1200 + 600 * (bar - 10) * 4 if build else (2600 if light else 4800)
        m.add("music", supersaw([n + 12 for n in prog[k]], m.B * 3.9, a=0.01, tau=99, lp_lo=lp * 0.6, lp_hi=lp, env_tau=0.3), b0, gain=0.5 if not build else 0.35)
        if not light and not build:
            for i, nt in enumerate(hook[k]):
                m.add("music", pluck(nt - 12, m.B * 0.45, bright=6500, tau=0.16), b0 + i * 0.5, gain=0.35, pan=0.15 if i % 2 else -0.15)
    for b in (4, 48, 64):
        m.add("drums", crash(1.4), b, gain=0.55)
        m.add("fx", impact(), b, gain=0.55)
    m.add("fx", riser(m.B * 8), 40, gain=0.6)
    m.add("fx", impact(), 68, gain=0.5)
    m.add("music", supersaw([69, 72, 76, 81], m.B * 3.5, tau=1.6, lp_lo=1500, lp_hi=6000, env_tau=0.8), 68, gain=0.45)
    write("ad4_no_te_duermas.wav", m.render(kicks, duck=0.7, verb_send=0.2, name="ad4"))


# ---------- SFX ----------
def sfx():
    def mono(x, g=1.0):
        x = x / (np.max(np.abs(x)) + 1e-9) * g
        return np.stack([x, x], 1)

    n = int(SR * 0.45)
    t = T(n)
    p = t / t[-1]
    bands = [filt(noise(n), "bp", [f * 0.6, f * 1.6]) for f in (400, 900, 2000, 4000)]
    sweep = sum(b * np.clip(1 - np.abs(p * 3 - k), 0, 1) for k, b in enumerate(bands))
    write("sfx_whoosh.wav", mono(sweep * np.sin(np.pi * p) ** 1.5, 0.8))
    n = int(SR * 0.2)
    t = T(n)
    write("sfx_swipe.wav", mono(filt(noise(n), "bp", [1500, 8000]) * np.sin(np.pi * t / t[-1]) ** 2, 0.6))
    n = int(SR * 0.05)
    t = T(n)
    write("sfx_click.wav", mono(filt(noise(n), "hp", 2000) * np.exp(-t / 0.003) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.004) * 0.5, 0.7))
    n = int(SR * 0.14)
    t = T(n)
    write("sfx_pop.wav", mono(np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t / 0.02) + 380) / SR) * np.exp(-t / 0.035), 0.7))
    n = int(SR * 0.3)
    t = T(n)
    shut = filt(noise(n), "bp", [1200, 6000]) * (np.exp(-t / 0.006) + 0.7 * np.exp(-np.maximum(t - 0.07, 0) / 0.01) * (t > 0.07))
    write("sfx_snap.wav", mono(shut, 0.75))
    n = int(SR * 0.6)
    t = T(n)
    ding = sum(np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(t - d, 0) / 0.18) * (t >= d) * g for f, d, g in [(1568, 0, 1), (3136, 0, 0.25), (2093, 0.09, 1), (4186, 0.09, 0.2)])
    write("sfx_notif.wav", mono(ding, 0.55))
    n = int(SR * 0.7)
    t = T(n)
    ring = (np.sin(2 * np.pi * 2350 * t) + 0.6 * np.sin(2 * np.pi * 3310 * t) + 0.3 * np.sin(2 * np.pi * 5120 * t)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 17 * t)))
    write("sfx_alarm.wav", mono(ring * np.clip(t / 0.01, 0, 1) * np.clip((t[-1] - t) / 0.05, 0, 1), 0.6))
    write("sfx_impact.wav", mono(impact(), 0.9))


if __name__ == "__main__":
    if "--remaster" in sys.argv:  # re-balance from the saved stems only (seconds instead of minutes)
        for name, fn in FILES.items():
            write(fn, master(dict(np.load(STEMS / f"{name}.npz")), 0.35, GAINS[name]))
    else:
        sfx()
        ad1()
        ad2()
        ad4()
