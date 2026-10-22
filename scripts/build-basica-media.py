"""
ANUNCIO 04 — "La pijama que no te quieres quitar" (Colección básica) media, from the 'RESET HOY' Drive clips (720x1280 H.264, SDR).
- Shots: trimmed, upscaled to 1080x1920 (lanczos + light sharpen), bright/natural grade (no skin smoothing, no fabric "softening").
- Voice: only her own phrases (src/basica/edit.json "voice"), cleaned per phrase: high-pass, FFT denoise, presence EQ,
  gentle compression; 12 ms edge fades; placed on the timeline frame-exactly.
- Music: ORIGINAL bed (no samples, no third-party material), 104 BPM warm lifestyle pop/house: Rhodes-style keys
  Dmaj9-Bm9-Gmaj7-A6sus, soft kick, rim/clap, shaker, round bass, airy pluck motif. Ducked under the voice, lifted in the
  lifestyle section, resolves on the close card.
Output: public/basica/<shot>.mp4, public/basica/mix.wav
Usage: python3 scripts/build-basica-media.py /folder/with/RESET_HOY_clips
"""
import glob, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "basica")
e = json.load(open(os.path.join(ROOT, "src", "basica", "edit.json")))
FPS, SR, BPM = e["fps"], 48000, e["bpm"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731
src = lambda n: glob.glob(os.path.join(SRC, f"{n}.MP4")) [0]  # noqa: E731
GRADE = "eq=gamma=1.05:contrast=1.03:brightness=0.012:saturation=1.03,colorbalance=rs=0.015:bs=-0.01"

TOTAL = 0
for s in e["shots"]:
    TOTAL += s["frames"]
    sp = s.get("speed", 1.0)
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an",
         "-vf", f"setpts=PTS/{sp},scale=1080:1920:flags=lanczos,unsharp=5:5:0.45,{GRADE},format=yuv420p",
         "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
print("total frames", TOTAL)

L = int(TOTAL / FPS * SR) + SR
voice = np.zeros(L)
VCHAIN = ("highpass=f=85,afftdn=nf=-28:nr=10:tn=1,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=2.5,"
          "highshelf=f=9000:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=2")
for v in e["voice"]:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(v["in"]), "-to", str(v["out"]), "-i", src(v["src"]),
                          "-af", VCHAIN, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32).astype(np.float64)
    f = int(0.012 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    i = int(v["at"] / FPS * SR)
    voice[i:i + len(x)] += x[: L - i]

# ---------- original music bed ----------
rng = np.random.default_rng(904)
BEAT, BAR = 60 / BPM, 240 / BPM
bus = {k: np.zeros(L) for k in ("keys", "drums", "bass", "pluck")}
NOTE = {"C": 0, "C#": 1, "D": 2, "E": 4, "F#": 6, "G": 7, "A": 9, "B": 11}
hz = lambda n: 440 * 2 ** ((12 * (int(n[-1]) + 1) + NOTE[n[:-1]] - 69) / 12)  # noqa: E731
tt = lambda d: np.arange(int(d * SR)) / SR  # noqa: E731


def put(b, z, ts, g=1.0):
    i = int(ts * SR)
    if 0 <= i < L:
        j = min(L, i + len(z))
        bus[b][i:j] += z[: j - i] * g


def rhodes(fs, d, a=1.0):
    t = tt(d + 0.8)
    s = sum(np.sin(2 * np.pi * f * t + 0.7 * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.6) for f in fs) / len(fs)
    s *= 1 + 0.1 * np.sin(2 * np.pi * 5 * t)
    return a * s * np.minimum(1, t / 0.005) * np.where(t > d, np.exp(-(t - d) / 0.25), 1)


def kick(a=1.0):
    t = tt(0.32)
    return a * np.sin(2 * np.pi * np.cumsum(46 + 90 * np.exp(-t / 0.025)) / SR) * np.exp(-t / 0.14)


def noise(d, decay, a, hp=True):
    t = tt(d)
    n = rng.standard_normal(len(t) + 2)
    n = np.diff(np.diff(n)) if hp else n[2:]
    return a * n * np.exp(-t / decay)


def bass(f, d, a=1.0):
    t = tt(d)
    return a * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.008) * np.minimum(1, (d - t) / 0.04)


def pluck(f, a=1.0):
    t = tt(0.6)
    return a * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.16) * np.minimum(1, t / 0.003)


CH = [["D3", "F#3", "A3", "C#4", "E4"], ["B2", "D3", "F#3", "A3", "C#4"], ["G2", "B2", "D3", "F#3", "A3"], ["A2", "D3", "E3", "G3", "B3"]]
RT = ["D2", "B1", "G1", "A1"]
MOT = ["F#5", "A5", "E5", "C#5"]
close_t = (TOTAL - e["shots"][-1]["frames"]) / FPS
b = 0
while b * BAR < close_t:
    t0, c = b * BAR, b % 4
    fs = [hz(n) for n in CH[c]]
    put("keys", rhodes(fs, BEAT * 1.6, 0.45), t0)
    put("keys", rhodes(fs[1:], BEAT * 0.8, 0.3), t0 + 2.5 * BEAT)
    put("bass", bass(hz(RT[c]), BEAT * 1.7, 0.6), t0)
    put("bass", bass(hz(RT[c]) * 2, BEAT * 0.4, 0.35), t0 + 2.5 * BEAT)
    put("bass", bass(hz(RT[c]), BEAT * 0.9, 0.5), t0 + 3 * BEAT)
    for k in range(4):
        ts = t0 + k * BEAT
        if ts >= close_t:
            break
        put("drums", kick(0.8), ts)
        if k in (1, 3):
            put("drums", noise(0.15, 0.045, 0.16), ts)
        for h in range(4):
            put("drums", noise(0.06, 0.012, 0.05 if h % 2 else 0.025), ts + h * BEAT / 4)
    for k, n in enumerate([MOT[c], MOT[(c + 1) % 4]]):
        put("pluck", pluck(hz(n), 0.12), t0 + (1.5 + k) * BEAT)
    b += 1
put("keys", rhodes([hz(n) for n in ["D3", "A3", "C#4", "E4", "F#4", "A4"]], 1.6, 0.65), close_t)
put("bass", bass(hz("D2"), 1.4, 0.55), close_t)
for k, n in enumerate(["A5", "C#6", "F#6"]):
    put("pluck", pluck(hz(n), 0.1), close_t + 0.15 * k)
music = bus["keys"] + 0.9 * bus["drums"] + 0.75 * bus["bass"] + bus["pluck"]
ir_n = int(1.6 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.35)
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << (L + ir_n).bit_length()
music = music + 0.25 * np.fft.irfft(np.fft.rfft(bus["keys"] + bus["pluck"], size) * np.fft.rfft(ir, size), size)[:L]
music /= np.max(np.abs(music))

# ducking: follow the voice envelope (40 ms attack / 250 ms release); lift between phrases and in the lifestyle block
env = np.abs(voice)
k = int(0.02 * SR)
env = np.convolve(env, np.ones(k) / k, "same")
duck = np.zeros(L)
g = 0.0
a_up, a_dn = 1 - np.exp(-1 / (0.04 * SR)), 1 - np.exp(-1 / (0.25 * SR))
target = (env > 0.01).astype(float)
for i in range(L):
    g += (a_up if target[i] > g else a_dn) * (target[i] - g)
    duck[i] = g
mgain = 0.30 * (1 - duck) + 0.11 * duck
vpk = np.max(np.abs(voice))
mix = voice / vpk * 0.9 + music * mgain
end = int(TOTAL / FPS * SR)
mix = mix[:end]
fo = int(0.9 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.4
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix", TOTAL / FPS, "s")
