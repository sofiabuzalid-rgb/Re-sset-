"""
"The Details Edit" media: the voice-over drives the whole timeline.

1. Voice: the creator's own recording (edit.json `voiceFile`; currently Las_Quesadillas_de_Anita_2.m4a). Spectral noise reduction (noise profile = quietest
   10 % of frames, Wiener gain with a floor), 80 Hz high-pass, de-mud / presence EQ, soft de-ess, gentle compression,
   limiter. Pauses between sentences are shortened to `gap` seconds; words are never cut or re-ordered.
2. Timeline: every shot in edit.json starts on a WORD of the voice ("fíjate#1" = first "fíjate"), so the picture always
   shows what the voice is naming. Word times come from src/details/transcript.json (faster-whisper small); the
   subtitle text is the hand-corrected script in edit.json, and the script checks that the word counts match
   ("~" = a hesitation the model heard as a word, kept in the audio but not subtitled; "a_b" = two words the model
   heard as one).
3. Video: iPhone HDR (HLG, BT.2020) tone-mapped to SDR BT.709 (Hable, no desaturation, gamma 1.12): true colours,
   no channel or saturation changes.
4. Music: ORIGINAL instrumental (no samples or third-party material): chic editorial pop, 112 BPM, D major, ducked
   -15 dB under the voice, soft resolve under the logo.

Usage: python3 scripts/build-details-media.py <folder with 1687/1688/1690/1694/1695/1700/1533.mov and vo.m4a>
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "details")
e = json.load(open(os.path.join(ROOT, "src", "details", "edit.json")))
words = json.load(open(os.path.join(ROOT, "src", "details", "transcript.json")))["words"]
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
fr = lambda s: round(s * FPS)  # noqa: E731
norm = lambda w: re.sub(r"[^\wáéíóúñü]", "", w.lower())  # noqa: E731

# ---------------------------------------------------------------- voice → output word times + subtitles
t = e["voice"][0]["at"]
placed, phrases, key_t, count = [], [], {}, {}
for c in e["voice"]:
    c["at"] = t
    toks = c["text"].split()
    src_w = [w for w in words if c["in"] <= (w[0] + w[1]) / 2 < c["out"]]
    real = [x for x in toks if x != "|"]
    assert len(real) == len(src_w), (c["text"][:40], len(real), len(src_w), [w[2] for w in src_w])
    j = 0
    for tok in toks:
        if tok == "|":
            phrases.append([])
            continue
        w = src_w[j]
        j += 1
        a = round(c["at"] + max(w[0], c["in"]) - c["in"], 3)
        b = round(c["at"] + min(w[1], c["out"]) - c["in"], 3)
        if tok == "~":  # a hesitation the model heard as a word: kept in the audio, not shown
            continue
        word = tok.lstrip("*")
        phrases[-1].append({"w": word.replace("_", " "), "hl": tok.startswith("*"), "s": a, "e": b})
        k = norm(word)
        count[k] = count.get(k, 0) + 1
        key_t[f"{k}#{count[k]}"] = a
    placed.append(c)
    t += c["out"] - c["in"] + e["gap"]
VOICE_END = placed[-1]["at"] + placed[-1]["out"] - placed[-1]["in"]
TOTAL_F = fr(VOICE_END + e["endSeconds"])

# ---------------------------------------------------------------- shots
starts = []
for i, s in enumerate(e["shots"]):
    if s.get("at") == "start":
        st = 0
    elif "at" in s:
        st = fr(key_t[s["at"]] - 0.06)
    else:
        prev = e["shots"][i - 1]
        st = starts[-1] + fr(prev["dur"])
    starts.append(st)
for i, s in enumerate(e["shots"]):
    s["from"] = starts[i]
    s["frames"] = (starts[i + 1] if i + 1 < len(starts) else TOTAL_F) - starts[i]
    assert s["frames"] >= 6, (s["id"], s["frames"])
    if "dur" in s and i + 1 < len(e["shots"]) and "at" not in e["shots"][i + 1]:
        assert s["frames"] == fr(s["dur"]), s["id"]

TONEMAP = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=0:peak=4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,eq=gamma=1.12:contrast=1.03")
GRADE = TONEMAP + ",scale=1080:1920:flags=lanczos,format=yuv420p"
dur_of = {}


def cut(src, t_in, frames, name):
    path = os.path.join(SRC, f"{src}.mov")
    if src not in dur_of:
        dur_of[src] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                           capture_output=True, text=True).stdout)
    assert t_in + frames / FPS <= dur_of[src] - 0.03, (name, src, t_in, frames / FPS, dur_of[src])
    out, key = os.path.join(OUT, f"{name}.mp4"), f"{src} {t_in:.3f} {frames} {GRADE}"
    if os.path.exists(out) and os.path.exists(out + ".key") and open(out + ".key").read() == key:
        return  # unchanged shot: keep the existing cut
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t_in:.3f}", "-i", path, "-an", "-vf", GRADE, "-frames:v", str(frames),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", "-movflags", "+faststart",
                    out], check=True)
    open(out + ".key", "w").write(key)


for s in e["shots"]:
    if "panels" in s:
        for k, p in enumerate(s["panels"]):
            cut(p["src"], p["in"], s["frames"], f"{s['id']}_{k}")
    elif s.get("still"):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, f"{s['src']}.mov"), "-frames:v", "1",
                        "-vf", TONEMAP + ",scale=1080:1920:flags=lanczos", "-q:v", "2", os.path.join(OUT, f"{s['id']}.jpg")], check=True)
    else:
        cut(s["src"], s["in"], s["frames"], s["id"])
labels = [{"text": l["text"], "from": fr(key_t[l["at"]] - 0.06), "to": fr(key_t[l["until"]] - 0.06)} for l in e["labels"]]
json.dump({"total": TOTAL_F, "voiceEnd": fr(VOICE_END), "shots": e["shots"], "labels": labels, "phrases": phrases},
          open(os.path.join(OUT, "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("timeline", TOTAL_F / FPS, "s,", len(e["shots"]), "shots")

# ---------------------------------------------------------------- voice clean-up
N_FFT, HOP = 2048, 512
win = np.hanning(N_FFT)


def denoise(x):
    pad = np.concatenate([np.zeros(N_FFT), x, np.zeros(N_FFT)])
    idx = range(0, len(pad) - N_FFT, HOP)
    X = np.array([np.fft.rfft(pad[i:i + N_FFT] * win) for i in idx])
    P = np.abs(X) ** 2
    energy = P.sum(1)
    noise = P[energy <= np.percentile(energy, 10)].mean(0) + 1e-12
    g = np.maximum(np.maximum(1 - 1.6 * noise / (P + 1e-12), 0.0), 0.14)
    for k in range(1, len(g)):
        g[k] = 0.6 * g[k] + 0.4 * g[k - 1]
    Y = X * g
    y = np.zeros(len(pad))
    nrm = np.zeros(len(pad))
    for j, i in enumerate(idx):
        y[i:i + N_FFT] += np.fft.irfft(Y[j]) * win
        nrm[i:i + N_FFT] += win ** 2
    return (y / np.maximum(nrm, 1e-6))[N_FFT:N_FFT + len(x)]


raw = os.path.join(OUT, "_vo.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(SRC, e.get("voiceFile", "vo.m4a")), "-ac", "1", "-ar", str(SR),
                "-af", "highpass=f=80:poles=2", raw], check=True)
x, _ = sf.read(raw, dtype="float64")
sf.write(raw, denoise(x).astype("float32"), SR)
cl = os.path.join(OUT, "_voc.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af",
                "equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1.4:g=2,equalizer=f=9000:t=q:w=1:g=1.5,"
                "deesser=i=0.35,acompressor=threshold=0.09:ratio=2.6:attack=8:release=150:makeup=2,alimiter=limit=0.89", cl], check=True)
clean, _ = sf.read(cl, dtype="float64")
os.remove(raw)
os.remove(cl)
N = TOTAL_F * SR // FPS + SR
voice = np.zeros(N)
fade = int(0.02 * SR)
for c in placed:
    seg = clean[int(c["in"] * SR):int(c["out"] * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(c["at"] * SR)
    voice[i:i + len(seg)] += seg

# ---------------------------------------------------------------- music
rng = np.random.default_rng(1688)
BEAT = 60 / BPM
BAR = 4 * BEAT
bus = {k: np.zeros(N) for k in ("drums", "keys", "bass", "lead", "fx")}
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
hp = lambda v: np.diff(v, prepend=0.0)  # noqa: E731


def put(b, v, t0, g=1.0):
    i = int(t0 * SR)
    if 0 <= i < N:
        j = min(N, i + len(v))
        bus[b][i:j] += v[: j - i] * g


def env(n, a, r, hold=None):
    v = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, int(r * SR))
    H = n - R if hold is None else max(A, min(n - R, int(hold * SR)))
    v[:A] = np.linspace(0, 1, A)
    v[H:] = np.linspace(1, 0, n - H) ** 2
    return v


def epiano(f, d, a=1.0):
    t_ = tt(d + 0.5)
    mod = np.sin(2 * np.pi * f * 14 * t_) * 1.0 * np.exp(-t_ / 0.05)
    body = np.sin(2 * np.pi * f * t_ + mod) + 0.22 * np.sin(2 * np.pi * 2 * f * t_) * np.exp(-t_ / 0.4)
    return a * body * np.exp(-t_ / 1.5) * env(len(t_), 0.004, 0.35, hold=d)


def chord(ns, d, a=1.0):
    out = np.zeros(int((d + 0.6) * SR))
    for k, n in enumerate(ns):
        v = epiano(hz(n), d, a / len(ns) ** 0.7)
        i = int(k * 0.012 * SR)
        out[i:i + len(v)] += v[: len(out) - i]
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


CH = [["F#3", "A3", "D4", "E4"], ["E3", "G3", "B3", "D4"], ["D3", "F#3", "A3", "C#4"], ["E3", "A3", "C#4", "E4"]]  # Dadd9 – Em7 – Dmaj7/Bm – A
RT = ["D2", "E2", "B1", "A1"]
MEL = [["A4", "F#4", "E4", "F#4"], ["B4", "G4", "E4", "G4"], ["F#4", "D4", "C#4", "D4"], ["E4", "C#4", "A3", "C#4"]]
END_T = VOICE_END
for b in range(int(np.ceil(END_T / BAR))):
    t0 = b * BAR
    c = b % 4
    put("keys", chord(CH[c], BAR * 0.95, 0.45), t0)
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= END_T:
            break
        if k % 2 == 0:
            put("drums", kick(0.75), tk)
        if k in (2, 6):
            put("drums", snap(0.55), tk)
        put("drums", hat(0.45 if k % 2 else 0.25), tk)
        put("bass", bass(hz(RT[c]) * (2 if k in (3, 7) else 1), BEAT / 2 * 0.8, 0.55), tk)
        put("lead", pluck(hz(MEL[c][k % 4]), 0.2, 0.18), tk + (BEAT / 4 if k % 2 else 0))
put("keys", chord(["F#3", "A3", "D4", "E4", "A4"], 2.6, 0.7), END_T)
put("bass", bass(hz("D2"), 2.0, 0.6), END_T)
put("drums", kick(0.55), END_T)
for k, n in enumerate(["A5", "D6", "F#6"]):
    put("fx", bell(hz(n), 1.8, 0.1), END_T + k * 0.08)
pump = np.ones(N)
for b in range(int(END_T / BEAT)):
    i = int(b * BEAT * SR)
    n = int(0.2 * SR)
    pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.25 * np.exp(-np.arange(n) / SR / 0.07))
music = bus["drums"] * 0.8 + (bus["keys"] * 0.85 + bus["bass"] * 0.8) * pump + bus["lead"] * 0.8 + bus["fx"] * 0.9
ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir = np.convolve(ir, np.ones(8) / 8, "same")
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
music = music + 0.25 * np.fft.irfft(np.fft.rfft(bus["keys"] + bus["lead"] + bus["fx"], size) * np.fft.rfft(ir, size), size)[:N]
music = np.tanh(music / np.max(np.abs(music)) * 1.2) / np.tanh(1.2)
ev = np.convolve(np.abs(voice), np.ones(int(0.03 * SR)) / int(0.03 * SR), "same")
talk = np.minimum(1, np.convolve((ev > 0.01).astype(float), np.ones(int(0.4 * SR)) / int(0.4 * SR), "same") * 3)
music *= 1 - talk * (1 - 10 ** (-15 / 20))
mix = 0.5 * music + 0.95 * voice / np.max(np.abs(voice))
mix = mix[: TOTAL_F * SR // FPS]
fo = int(0.7 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
mix[:64] *= np.linspace(0, 1, 64)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "2",
                os.path.join(OUT, "mix.wav")], check=True)
os.remove(pre)
print("mix done")
