"""
"Feel the Difference" media (IMG_1533, two parts: a = colours 19.1 s, b = material 14.1 s).

1. Video: muted 1080x1920 shots (rotation applied), HDR (HLG) tone-mapped to SDR BT.709 with no colour-channel or
   saturation changes, so the garments keep their real tones.
2. Voice: the presenter's own voice. Per-file spectral noise reduction (noise profile = quietest 10 % of STFT frames,
   Wiener-style gain with a floor so it never sounds metallic), then 80 Hz high-pass, de-mud / presence EQ, soft de-ess,
   gentle compression and a limiter. Chunks are placed on the output timeline with 15 ms fades.
3. Subtitles: word timings from the transcript (src/feel/transcript.json, faster-whisper small) mapped to output time.
   The words shown are the hand-corrected text in edit.json; the script checks that the word counts match.
4. Music: an ORIGINAL instrumental (no samples, no third-party material): clean fashion pop, 120 BPM, A major. It ducks
   under the voice (about -15 dB), lifts slightly for the colours and resolves under the end card.

Usage: python3 scripts/build-feel-media.py <folder with a.mov and b.mov>
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "feel")
e = json.load(open(os.path.join(ROOT, "src", "feel", "edit.json")))
words = json.load(open(os.path.join(ROOT, "src", "feel", "transcript.json")))["words"]
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
fr = lambda s: round(s * FPS)  # noqa: E731

# ---------------------------------------------------------------- timeline
t = 0
for s in e["shots"]:
    s["at"] = t / FPS
    t += fr(s["out"]) - fr(s["in"])
CUTS_F = t
TOTAL_F = CUTS_F + fr(e["endcard"]["seconds"])
TOTAL = TOTAL_F / FPS

# ---------------------------------------------------------------- picture
# The iPhone source is HDR (HLG, BT.2020, 10-bit): tone-map to SDR BT.709 (Hable, no desaturation) so the garments
# keep their real hues, then a small gamma lift to restore the room's brightness. No channel or saturation changes.
TONEMAP = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=0:peak=4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,eq=gamma=1.12:contrast=1.03")
GRADE = TONEMAP + ",scale=1080:1920:flags=lanczos,format=yuv420p"
for s in e["shots"]:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in']:.3f}", "-i", os.path.join(SRC, f"{s['src']}.mov"), "-an", "-vf", GRADE,
                    "-frames:v", str(fr(s["out"]) - fr(s["in"])), "-c:v", "libx264", "-preset", "medium", "-crf", "13", "-g", "15",
                    "-movflags", "+faststart", os.path.join(OUT, f"{s['id']}.mp4")], check=True)
st = e["endcard"]["still"]
subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(st["t"]), "-i", os.path.join(SRC, f"{st['src']}.mov"), "-frames:v", "1",
                "-vf", TONEMAP + ",scale=1080:1920:flags=lanczos", "-q:v", "2", os.path.join(OUT, "rack.jpg")], check=True)
print("timeline", TOTAL, "s")

# ---------------------------------------------------------------- voice
N_FFT, HOP = 2048, 512
win = np.hanning(N_FFT)


def denoise(x):
    pad = np.concatenate([np.zeros(N_FFT), x, np.zeros(N_FFT)])
    idx = range(0, len(pad) - N_FFT, HOP)
    X = np.array([np.fft.rfft(pad[i:i + N_FFT] * win) for i in idx])
    P = np.abs(X) ** 2
    energy = P.sum(1)
    noise = P[energy <= np.percentile(energy, 10)].mean(0) + 1e-12
    g = np.maximum(1 - 1.6 * noise / (P + 1e-12), 0.0)
    g = np.maximum(g, 0.14)
    for k in range(1, len(g)):  # temporal smoothing avoids musical noise
        g[k] = 0.6 * g[k] + 0.4 * g[k - 1]
    Y = X * g
    y = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    for j, i in enumerate(idx):
        y[i:i + N_FFT] += np.fft.irfft(Y[j]) * win
        norm[i:i + N_FFT] += win ** 2
    y = y / np.maximum(norm, 1e-6)
    return y[N_FFT:N_FFT + len(x)]


clean = {}
for k in ("a", "b"):
    raw = os.path.join(OUT, f"_{k}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(SRC, f"{k}.mov"), "-map", "0:a:0", "-ac", "1", "-ar", str(SR),
                    "-af", "highpass=f=80:poles=2", raw], check=True)
    x, _ = sf.read(raw, dtype="float64")
    sf.write(raw, denoise(x).astype("float32"), SR)
    out = os.path.join(OUT, f"_{k}c.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af",
                    "equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1.4:g=2.5,equalizer=f=9000:t=q:w=1:g=1.5,"
                    "deesser=i=0.35,acompressor=threshold=0.09:ratio=2.8:attack=8:release=140:makeup=2,alimiter=limit=0.89",
                    out], check=True)
    clean[k], _ = sf.read(out, dtype="float64")
    os.remove(raw)
    os.remove(out)

N = int(TOTAL * SR) + SR
voice = np.zeros(N)
chunks = []
t_vo = e["voiceover"][0]["at"]
for v in e["voiceover"]:
    chunks.append({**v, "at": t_vo})
    t_vo += v["out"] - v["in"]
for s in e["shots"]:
    if "voice" in s:
        chunks.append({"src": s["src"], "in": s["in"], "out": s["out"], "at": s["at"], "text": s["voice"]})
chunks.sort(key=lambda c: c["at"])
fade = int(0.015 * SR)
for c in chunks:
    seg = clean[c["src"]][int(c["in"] * SR):int(c["out"] * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(c["at"] * SR)
    voice[i:i + len(seg)] += seg

# ---------------------------------------------------------------- subtitles
phrases = []
for c in chunks:
    toks = c["text"].split()
    src_w = [w for w in words[c["src"]] if c["in"] <= (w[0] + w[1]) / 2 < c["out"]]
    real = [x for x in toks if x != "|"]
    assert len(real) == len(src_w), (c["text"], [w[2] for w in src_w])
    j = 0
    for tok in toks:
        if tok == "|":
            phrases.append([])
            continue
        w = src_w[j]
        j += 1
        a = c["at"] + max(w[0], c["in"]) - c["in"]
        b = c["at"] + min(w[1], c["out"]) - c["in"]
        phrases[-1].append({"w": tok.lstrip("*"), "hl": tok.startswith("*"), "s": round(a, 3), "e": round(b, 3)})
json.dump({"total": TOTAL_F, "cuts": CUTS_F, "phrases": phrases}, open(os.path.join(OUT, "subs.json"), "w"), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- music
rng = np.random.default_rng(1533)
BEAT = 60 / BPM
BAR = 4 * BEAT
bus = {k: np.zeros(N) for k in ("drums", "keys", "bass", "lead", "fx")}
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
hp = lambda x: np.diff(x, prepend=0.0)  # noqa: E731


def put(b, x, t0, g=1.0):
    i = int(t0 * SR)
    if 0 <= i < N:
        j = min(N, i + len(x))
        bus[b][i:j] += x[: j - i] * g


def env(n, a, r, hold=None):
    x = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, int(r * SR))
    H = n - R if hold is None else max(A, min(n - R, int(hold * SR)))
    x[:A] = np.linspace(0, 1, A)
    x[H:] = np.linspace(1, 0, n - H) ** 2
    return x


def epiano(f, d, a=1.0):
    t_ = tt(d + 0.5)
    mod = np.sin(2 * np.pi * f * 14 * t_) * 1.0 * np.exp(-t_ / 0.05)
    body = np.sin(2 * np.pi * f * t_ + mod) + 0.22 * np.sin(2 * np.pi * 2 * f * t_) * np.exp(-t_ / 0.4)
    return a * body * np.exp(-t_ / 1.5) * env(len(t_), 0.004, 0.35, hold=d)


def chord(ns, d, a=1.0):
    out = np.zeros(int((d + 0.6) * SR))
    for k, n in enumerate(ns):
        x = epiano(hz(n), d, a / len(ns) ** 0.7)
        i = int(k * 0.012 * SR)
        out[i:i + len(x)] += x[: len(out) - i]
    return out


def pluck(f, d=0.22, a=1.0):
    t_ = tt(d + 0.3)
    return a * sum(np.sin(2 * np.pi * f * k * t_) / k ** 1.3 * np.exp(-t_ * (7 + 6 * k)) for k in range(1, 7)) * env(len(t_), 0.003, 0.1)


def bass(f, d, a=1.0):
    t_ = tt(d)
    return a * (np.sin(2 * np.pi * f * t_) + 0.15 * np.sin(2 * np.pi * 2 * f * t_)) * env(len(t_), 0.005, 0.05)


def kick(a=1.0):
    t_ = tt(0.3)
    f = 48 + 95 * np.exp(-t_ / 0.026)
    return a * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.13) + 0.1 * np.exp(-t_ / 0.002))


def snap(a=1.0):
    t_ = tt(0.18)
    return a * (0.3 * hp(rng.standard_normal(len(t_))) * np.exp(-t_ / 0.03) + 0.2 * np.sin(2 * np.pi * 1700 * t_) * np.exp(-t_ / 0.008))


def hat(a=1.0):
    t_ = tt(0.05)
    return a * hp(hp(rng.standard_normal(len(t_)))) * np.exp(-t_ / 0.013) * 0.13


def bell(f, d=1.4, a=1.0):
    t_ = tt(d)
    return a * sum(g * np.sin(2 * np.pi * f * r * t_) * np.exp(-t_ / dc) for r, g, dc in [(1, 1, 1.0), (2, 0.3, 0.5), (3.01, 0.12, 0.25)])


def tick(a=1.0):
    t_ = tt(0.06)
    return a * np.sin(2 * np.pi * 2600 * t_) * np.exp(-t_ / 0.01) * 0.25


CH = [["A3", "C#4", "E4", "B4"], ["G#3", "B3", "E4", "F#4"], ["F#3", "A3", "C#4", "E4"], ["E3", "G#3", "B3", "D4"]]
RT = ["A1", "E1", "F#1", "E1"]
MEL = [["E5", "C#5", "B4", "C#5"], ["E5", "B4", "G#4", "B4"], ["C#5", "A4", "F#4", "A4"], ["B4", "G#4", "E4", "G#4"]]
colors_at = next(s["at"] for s in e["shots"] if s.get("part") == "colors")
END_T = CUTS_F / FPS
for b in range(int(np.ceil(END_T / BAR))):
    t0 = b * BAR
    c = b % 4
    put("keys", chord(CH[c], BAR * 0.95, 0.45), t0)
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= END_T - 0.01:
            break
        if k % 2 == 0:
            put("drums", kick(0.8), tk)
        if k in (2, 6):
            put("drums", snap(0.6), tk)
        put("drums", hat(0.5 if k % 2 else 0.28), tk)
        put("bass", bass(hz(RT[c]) * (2 if k in (3, 7) else 1), BEAT / 2 * 0.8, 0.55), tk)
        if tk < 2.0 or tk >= colors_at:  # melody only where nobody is explaining (hook) and under the colours
            put("lead", pluck(hz(MEL[c][k % 4]), 0.2, 0.25), tk + (BEAT / 4 if k % 2 else 0))
for s in e["shots"]:
    if "color" in s:
        put("fx", tick(0.6), s["at"])
put("keys", chord(["A3", "C#4", "E4", "G#4", "B4"], 2.4, 0.7), END_T)
put("bass", bass(hz("A1"), 2.0, 0.6), END_T)
put("drums", kick(0.6), END_T)
for k, n in enumerate(["E5", "A5", "C#6"]):
    put("fx", bell(hz(n), 1.8, 0.12), END_T + k * 0.08)

pump = np.ones(N)
for b in range(int(END_T / BEAT)):
    i = int(b * BEAT * SR)
    n = int(0.2 * SR)
    pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.28 * np.exp(-np.arange(n) / SR / 0.07))
music = bus["drums"] * 0.8 + (bus["keys"] * 0.85 + bus["bass"] * 0.8) * pump + bus["lead"] * 0.8 + bus["fx"] * 0.9
ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir = np.convolve(ir, np.ones(8) / 8, "same")
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
music = music + 0.25 * np.fft.irfft(np.fft.rfft(bus["keys"] + bus["lead"] + bus["fx"], size) * np.fft.rfft(ir, size), size)[:N]
music = np.tanh(music / np.max(np.abs(music)) * 1.2) / np.tanh(1.2)

# ducking: follow the voice envelope, -15 dB while she talks (-12 dB under the colours, so the music lifts a little)
env_v = np.abs(voice)
k = int(0.03 * SR)
env_v = np.convolve(env_v, np.ones(k) / k, "same")
talking = (env_v > 0.01).astype(float)
k = int(0.35 * SR)
talking = np.minimum(1, np.convolve(talking, np.ones(k) / k, "same") * 3)
t_axis = np.arange(N) / SR
depth = np.where((t_axis >= colors_at) & (t_axis < END_T), 10 ** (-12 / 20), 10 ** (-15 / 20))
duck = 1 - talking * (1 - depth)
music *= duck
mix = 0.5 * music + 0.95 * voice / np.max(np.abs(voice))
mix = mix[: int(TOTAL * SR)]
fo = int(0.7 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
mix[:64] *= np.linspace(0, 1, 64)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "2",
                os.path.join(OUT, "mix.wav")], check=True)
os.remove(pre)
print("mix", TOTAL, "s;", len(phrases), "subtitle phrases")
