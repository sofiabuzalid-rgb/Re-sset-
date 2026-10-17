"""
"Mi hallazgo en HOTBOOK BAZAR" media: a customer's voice-over (AUDIO-2026-10-17-17-00-25.m4a) over her bazaar clips.

Video: iPhone HDR (HLG) tone-mapped to SDR BT.709 (Hable, no desaturation), a touch of warmth (R +1.5 %, B -1.5 %),
gentle contrast. No saturation change. Voice: spectral noise reduction + EQ + soft compression. Subtitles: word times
from src/bazar/transcript.json (faster-whisper small) mapped onto the hand-checked text in edit.json. Music: ORIGINAL
cozy lo-fi pop (no samples, no third-party material), 96 BPM, ducked -14 dB under the voice.

Usage: python3 scripts/build-bazar-media.py <folder with the IMG_17xx/18xx .mov files and vo.m4a>
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "bazar")
e = json.load(open(os.path.join(ROOT, "src", "bazar", "edit.json")))
words = json.load(open(os.path.join(ROOT, "src", "bazar", "transcript.json")))["words"]
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
fr = lambda s: round(s * FPS)  # noqa: E731

GRADE = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,"
         "tonemap=tonemap=hable:desat=0:peak=4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
         "eq=gamma=1.12:contrast=1.04,colorchannelmixer=rr=1.015:bb=0.985,scale=1080:1920:flags=lanczos,format=yuv420p")
shots = e["shots"]
TOTAL_F = fr(shots[-1]["at"] + shots[-1]["dur"])
for i, s in enumerate(shots):
    s["from"] = fr(s["at"])
    s["frames"] = (fr(shots[i + 1]["at"]) if i + 1 < len(shots) else TOTAL_F) - s["from"]
    if s.get("kind") == "end":
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", os.path.join(SRC, f"{s['src']}.mov"), "-frames:v", "1",
                        "-vf", GRADE.rsplit(",format=yuv420p", 1)[0], "-q:v", "2",
                        os.path.join(OUT, "end.jpg")], check=True)
        continue
    rate = s.get("rate", 1.0)
    vf = (f"setpts=PTS/{rate}," if rate != 1.0 else "") + GRADE
    path = os.path.join(SRC, f"{s['src']}.mov")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    assert s["in"] + s["frames"] / FPS * rate <= dur - 0.03, (s["id"], dur)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in']:.3f}", "-i", path, "-an", "-vf", vf, "-frames:v", str(s["frames"]),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", "-movflags", "+faststart",
                    os.path.join(OUT, f"{s['id']}.mp4")], check=True)

# subtitles
v = e["voice"]
off = v["at"] - v["in"]
toks = e["subtitles"].split()
src_w = [w for w in words if v["in"] <= (w[0] + w[1]) / 2 < v["out"]]
real = [t for t in toks if t != "|"]
# "HOTBOOK BAZAR" is heard as three words (Hot / Book / Bazaar): merge them
merged, k = [], 0
while k < len(src_w):
    if src_w[k][2].lower().startswith("hot") and k + 2 < len(src_w):
        merged.append([src_w[k][0], src_w[k + 1][1], "HOTBOOK"]); merged.append(src_w[k + 2]); k += 3
    else:
        merged.append(src_w[k]); k += 1
assert len(real) == len(merged), (len(real), len(merged))
phrases, j = [], 0
for t in toks:
    if t == "|":
        phrases.append([]); continue
    w = merged[j]; j += 1
    phrases[-1].append({"w": t, "s": round(w[0] + off, 3), "e": round(w[1] + off, 3)})
json.dump({"total": TOTAL_F, "shots": shots, "phrases": phrases}, open(os.path.join(OUT, "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("timeline", TOTAL_F / FPS, "s")

# voice clean-up
N_FFT, HOP = 2048, 512
win = np.hanning(N_FFT)


def denoise(x):
    pad = np.concatenate([np.zeros(N_FFT), x, np.zeros(N_FFT)])
    idx = range(0, len(pad) - N_FFT, HOP)
    X = np.array([np.fft.rfft(pad[i:i + N_FFT] * win) for i in idx])
    P = np.abs(X) ** 2
    noise = P[P.sum(1) <= np.percentile(P.sum(1), 10)].mean(0) + 1e-12
    g = np.maximum(np.maximum(1 - 1.6 * noise / (P + 1e-12), 0.0), 0.15)
    for q in range(1, len(g)):
        g[q] = 0.6 * g[q] + 0.4 * g[q - 1]
    y = np.zeros(len(pad)); nrm = np.zeros(len(pad))
    for jj, i in enumerate(idx):
        y[i:i + N_FFT] += np.fft.irfft(X[jj] * g[jj]) * win; nrm[i:i + N_FFT] += win ** 2
    return (y / np.maximum(nrm, 1e-6))[N_FFT:N_FFT + len(x)]


raw = os.path.join(OUT, "_vo.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(SRC, e["voiceFile"]), "-ac", "1", "-ar", str(SR), "-af", "highpass=f=80", raw], check=True)
x, _ = sf.read(raw, dtype="float64")
sf.write(raw, denoise(x).astype("float32"), SR)
cl = os.path.join(OUT, "_voc.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", "equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=2,"
                "equalizer=f=9000:t=q:w=1:g=1.5,deesser=i=0.3,acompressor=threshold=0.09:ratio=2.5:attack=8:release=150:makeup=2,alimiter=limit=0.89", cl], check=True)
clean, _ = sf.read(cl, dtype="float64"); os.remove(raw); os.remove(cl)
N = TOTAL_F * SR // FPS + SR
voice = np.zeros(N)
seg = clean[int(v["in"] * SR):int(v["out"] * SR)].copy()
f_ = int(0.02 * SR); seg[:f_] *= np.linspace(0, 1, f_); seg[-f_:] *= np.linspace(1, 0, f_)
voice[int(v["at"] * SR):int(v["at"] * SR) + len(seg)] += seg

# music: cozy lo-fi pop
rng = np.random.default_rng(1813)
BEAT = 60 / BPM; BAR = 4 * BEAT
bus = {k: np.zeros(N) for k in ("drums", "keys", "bass", "lead")}
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "Bb": 10, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731
hp = lambda q: np.diff(q, prepend=0.0)  # noqa: E731


def put(b, q, t0, g=1.0):
    i = int(t0 * SR)
    if 0 <= i < N:
        jj = min(N, i + len(q)); bus[b][i:jj] += q[: jj - i] * g


def env(n, a, r):
    q = np.ones(n); A, R = max(1, int(a * SR)), max(1, int(r * SR))
    q[:A] = np.linspace(0, 1, A); q[n - R:] = np.linspace(1, 0, R) ** 2
    return q


def epiano(f, d, a=1.0):
    t_ = tt(d + 0.6)
    body = np.sin(2 * np.pi * f * t_ + np.sin(2 * np.pi * f * 7 * t_) * 0.8 * np.exp(-t_ / 0.06))
    return a * body * np.exp(-t_ / 1.8) * (1 + 0.1 * np.sin(2 * np.pi * 4 * t_)) * env(len(t_), 0.005, 0.5)


def chord(ns, d, a=1.0):
    out = np.zeros(int((d + 0.7) * SR))
    for k, n in enumerate(ns):
        q = epiano(hz(n), d, a / len(ns) ** 0.7); i = int(k * 0.015 * SR); out[i:i + len(q)] += q[: len(out) - i]
    return out


def kick(a=1.0):
    t_ = tt(0.3); f = 50 + 80 * np.exp(-t_ / 0.03)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.14)


def rim(a=1.0):
    t_ = tt(0.1)
    return a * (0.25 * hp(rng.standard_normal(len(t_))) * np.exp(-t_ / 0.02) + 0.2 * np.sin(2 * np.pi * 1900 * t_) * np.exp(-t_ / 0.01))


def hat(a=1.0):
    t_ = tt(0.04)
    return a * hp(hp(rng.standard_normal(len(t_)))) * np.exp(-t_ / 0.01) * 0.1


def bass(f, d, a=1.0):
    t_ = tt(d)
    return a * np.sin(2 * np.pi * f * t_) * env(len(t_), 0.01, 0.08)


def bell(f, d=1.6, a=1.0):
    t_ = tt(d)
    return a * (np.sin(2 * np.pi * f * t_) * np.exp(-t_ / 1.0) + 0.3 * np.sin(2 * np.pi * 2 * f * t_) * np.exp(-t_ / 0.4))


CH = [["E3", "G#3", "B3", "D#4"], ["C#3", "E3", "G#3", "B3"], ["A2", "C#3", "E3", "G#3"], ["B2", "D#3", "F#3", "A3"]]  # Emaj7 C#m7 Amaj7 B7
RT = ["E1", "C#2", "A1", "B1"]
MEL = [["B4", "G#4", "D#5", "B4"], ["G#4", "E4", "B4", "G#4"], ["E4", "C#4", "G#4", "E4"], ["F#4", "D#4", "A4", "F#4"]]
END_T = shots[-1]["at"]
for b in range(int(np.ceil(END_T / BAR))):
    t0 = b * BAR; c = b % 4
    put("keys", chord(CH[c], BAR * 0.95, 0.5), t0)
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk >= END_T:
            break
        if k in (0, 3, 4):
            put("drums", kick(0.6), tk)
        if k in (2, 6):
            put("drums", rim(0.5), tk)
        put("drums", hat(0.4 if k % 2 else 0.2), tk + (0.03 if k % 2 else 0))
        if k % 2 == 0:
            put("bass", bass(hz(RT[c]), BEAT * 0.9, 0.5), tk)
        put("lead", bell(hz(MEL[c][k % 4]), 0.6, 0.08), tk)
put("keys", chord(["E3", "G#3", "B3", "D#4", "F#4"], 2.0, 0.7), END_T)
put("bass", bass(hz("E1"), 1.5, 0.5), END_T)
for k, n in enumerate(["B5", "E6", "G#6"]):
    put("lead", bell(hz(n), 1.6, 0.1), END_T + k * 0.09)
music = bus["drums"] * 0.7 + bus["keys"] * 0.9 + bus["bass"] * 0.8 + bus["lead"] * 0.8
lp = np.convolve(music, np.ones(5) / 5, "same")  # soft lo-fi top end
ir_n = int(1.8 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.4); ir = np.convolve(ir, np.ones(10) / 10, "same"); ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (N + ir_n).bit_length()
music = lp + 0.25 * np.fft.irfft(np.fft.rfft(bus["keys"] + bus["lead"], size) * np.fft.rfft(ir, size), size)[:N]
music = np.tanh(music / np.max(np.abs(music)) * 1.2) / np.tanh(1.2)
ev = np.convolve(np.abs(voice), np.ones(int(0.03 * SR)) / int(0.03 * SR), "same")
talk = np.minimum(1, np.convolve((ev > 0.01).astype(float), np.ones(int(0.4 * SR)) / int(0.4 * SR), "same") * 3)
music *= 1 - talk * (1 - 10 ** (-14 / 20))
mix = 0.5 * music + 0.95 * voice / np.max(np.abs(voice))
mix = mix[: TOTAL_F * SR // FPS]
fo = int(0.6 * SR); mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5; mix[:64] *= np.linspace(0, 1, 64)
pre = os.path.join(OUT, "_pre.wav"); sf.write(pre, mix.astype("float32"), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")], check=True)
os.remove(pre)
print("mix done")
