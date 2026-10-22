"""
Anuncio 03 — "Tu pijama para llevarte a todos lados" media from the RESET HOY clips (720x1280 iPhone sources).
- Shots: pre-cut, Lanczos-upscaled to 1080x1920 (x1.5, no invented detail), neutral grade (navy kept true), muted.
  "slow": 2 plays the source at half speed and then holds its last frame ("hold_after": source seconds to play first).
- Voice: real audio of IMG_8982 / IMG_8974 / IMG_8988 only. Per segment: high-pass + hum notches, light FFT
  denoise, EQ for intelligibility, de-ess, gentle compression; 20 ms crossfade edges; placed at its "at" time so
  the talking shots stay lip-synced. Final limiter.
- Ambience: the clips' own sound (suitcase, wheels) under the B-roll, low.
- Music: ORIGINAL instrumental synthesised here (no samples / third-party material), 104 BPM, Fmaj9–Em7–Dm9–Cmaj9,
  warm keys + soft pulse; ducked ~16 dB under the voice.
usage: python3 scripts/build-travel-media.py <folder with IMG_*.mp4>
Output: public/travel/<shot>.mp4, public/travel/mix.wav
"""
import glob, json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "travel")
e = json.load(open(os.path.join(ROOT, "src", "travel", "edit.json")))
FPS, SR = e["fps"], 48000
os.makedirs(OUT, exist_ok=True)
src = lambda n: sorted(glob.glob(os.path.join(SRC, f"{n}.*")))[0]  # noqa: E731
run = lambda c: subprocess.run(c, check=True)  # noqa: E731

# ---------------- shots
starts, TOTAL = {}, 0
for s in e["shots"]:
    slow = s.get("slow", 1)
    hold = f"trim=duration={s['hold_after']}," if s.get("hold_after") else ""
    pre = (hold + f"setpts={slow}*PTS,tpad=stop_mode=clone:stop_duration=10,") if slow != 1 else ""
    vf = pre + ("hqdn3d=1:1:3:3,eq=contrast=1.04:brightness=0.008:saturation=1.02,"
                "scale=1080:1920:flags=lanczos,unsharp=5:5:0.4:5:5:0,format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", vf,
         "-frames:v", str(s["frames"]), "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
         os.path.join(OUT, f"{s['id']}.mp4")])
    starts[s["id"]] = TOTAL
    TOTAL += s["frames"]
DUR = TOTAL / FPS
N = int(DUR * SR)
print("total frames", TOTAL, f"{DUR:.2f}s")


def grab(name, a, dur, af):
    p = os.path.join(OUT, "_t.wav")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-t", str(dur), "-i", src(name), "-vn", "-ac", "1", "-ar", str(SR), "-af", af, p])
    x = sf.read(p, dtype="float64")[0]
    os.remove(p)
    return x


def level(x, win=0.35, max_boost_db=10):
    """Gentle level riding: evens out phrases that drop in loudness, without touching pauses."""
    w = int(win * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, mode="same"))
    voiced = rms > rms.max() * 10 ** (-32 / 20)
    target = np.median(rms[voiced])
    g = np.where(voiced, target / np.maximum(rms, 1e-6), 1.0)
    g = np.clip(g, 10 ** (-6 / 20), 10 ** (max_boost_db / 20))
    g = np.convolve(g, np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same")
    return x * g


def fade(x, ms=20):
    f = min(len(x) // 2, int(ms / 1000 * SR))
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


# ---------------- voice
VOICE_AF = ("highpass=f=85:poles=2,bandreject=f=60:width_type=q:w=8,bandreject=f=120:width_type=q:w=8,"
            "afftdn=nf=-30:nr=10:nt=w,equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=3000:t=q:w=1.3:g=2.5,"
            "equalizer=f=9000:t=h:w=0.7:g=1,deesser=i=0.35,"
            "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=150:makeup=2")
voice = np.zeros(N + SR)
for v in e["voice"]:
    x = fade(level(grab(v["src"], v["a"], v["b"] - v["a"], VOICE_AF)))
    i = int(round(v["at"] * SR))
    voice[i:i + len(x)] += x
voice = voice[:N]
speech = np.abs(voice) > 1e-4
voice *= 10 ** (-16 / 20) / (np.sqrt(np.mean(voice[speech] ** 2)) + 1e-9)

# ---------------- ambience (the clips' own sound under B-roll)
amb = np.zeros(N + SR)
shots = {s["id"]: s for s in e["shots"]}
for a in e.get("ambience", []):
    s = shots[a["shot"]]
    x = fade(grab(s["src"], s["in"], s["frames"] / FPS, "highpass=f=80,afftdn=nf=-30"), 60)
    x *= 10 ** (-16 / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 10 ** (a["gain"] / 20)
    i = int(round(starts[a["shot"]] / FPS * SR))
    amb[i:i + len(x)] += x
amb = amb[:N]

# ---------------- original music: warm keys + soft pulse, 104 BPM
rng = np.random.default_rng(3)
BPM = 104
beat = 60 / BPM
t_all = np.arange(N) / SR
music = np.zeros((N, 2))


def add(sig, start, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    music[i:i + len(sig), 0] += sig * (1 - pan)
    music[i:i + len(sig), 1] += sig * (1 + pan)


hz = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731
chords = [[53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62]]
bar = 4 * beat
t0, k = 0.0, 0
while t0 < DUR:
    c = chords[k % 4]
    L = bar + 0.6
    tt = np.arange(int(L * SR)) / SR
    env = np.minimum(tt / 0.6, 1) * np.clip((L - tt) / 0.8, 0, 1)
    for m in c:  # soft pad
        w = sum(np.sin(2 * np.pi * hz(m) * d * tt + ph) for d, ph in ((1, 0), (1.004, 1.3), (0.996, 2.1))) / 3
        add(w * env * 0.05, t0)
    for j, m in enumerate([c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 12]):  # keys, on 1 & 2.5 & 3 & 4
        st = t0 + [0, 1.5, 2, 3][j] * beat
        tt2 = np.arange(int(1.6 * SR)) / SR
        w = np.sin(2 * np.pi * hz(m) * tt2 + 0.5 * np.exp(-tt2 * 7) * np.sin(2 * np.pi * hz(m) * tt2)) * np.exp(-tt2 * 2.6)
        add(w * 0.06 * np.minimum(tt2 / 0.004, 1), st, 0.2 if j % 2 else -0.2)
    tt3 = np.arange(int(bar * SR)) / SR  # bass
    add(np.sin(2 * np.pi * hz(c[0] - 12) * tt3) * np.exp(-tt3 * 1.2) * 0.14, t0)
    if k >= 1:  # soft pulse from bar 2
        for b in range(4):
            tk = np.arange(int(0.35 * SR)) / SR
            add(np.sin(2 * np.pi * (52 + 70 * np.exp(-tk * 28)) * tk) * np.exp(-tk * 11) * 0.16, t0 + b * beat)
            th = np.arange(int(0.06 * SR)) / SR
            add(np.diff(rng.standard_normal(len(th) + 1)) * np.exp(-th * 70) * 0.02, t0 + b * beat + beat / 2, 0.3)
    t0 += bar
    k += 1
ir_t = np.arange(int(1.4 * SR)) / SR
for ch in range(2):  # cheap room
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.5)
    ir /= np.abs(ir).sum() / 5
    music[:, ch] = 0.78 * music[:, ch] + 0.3 * np.convolve(music[:, ch], ir)[:N]
music /= np.abs(music).max() + 1e-9
music *= 10 ** (-14 / 20) / (np.sqrt(np.mean(music ** 2)) + 1e-9)

# ducking: -16 dB under the voice, smooth
env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
talk = np.clip(env / 0.015, 0, 1)
talk = np.convolve(talk, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
mgain = 10 ** (-9 / 20) * (1 - (1 - 10 ** (-16 / 20)) * talk)
mgain[: int(0.25 * SR)] *= np.linspace(0, 1, int(0.25 * SR))
mgain[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))
mix = music * mgain[:, None] + (voice + amb)[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.89)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix, SR)
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=8,alimiter=limit=0.84:level=false",
     "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix ok")
