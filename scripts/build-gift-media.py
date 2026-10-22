"""
Anuncio 01 — "¿Qué vas a regalar esta Navidad?" media from the RESET HOY recordings (720x1280 iPhone sources).
- Shots: pre-cut, Lanczos-upscaled to 1080x1920 (x1.5, no invented detail), light warm grade, muted.
  "slow": 2 plays the source at half speed (closing shot only).
- Voice: real audio of the talking clips only (IMG_8931 / 8944 / 8946 / 8949), each segment cleaned
  (high-pass, FFT denoise, de-ess, gentle compression) with 15 ms edge fades, placed at its "at" time so the
  talking shots stay lip-synced.
- Music: Spacetrain Unlimited — Christmas Wonderland (licensed via Artlist), started so its natural ending lands
  on the end card; ducked under the voice, up after the last line.
usage: python3 scripts/build-gift-media.py <folder with IMG_*.mp4 + the mp3>
Output: public/gift/<shot>.mp4, public/gift/mix.wav
"""
import glob, json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "gift")
e = json.load(open(os.path.join(ROOT, "src", "gift", "edit.json")))
FPS, SR = e["fps"], 48000
os.makedirs(OUT, exist_ok=True)
src = lambda n: sorted(glob.glob(os.path.join(SRC, f"{n}.*")))[0]  # noqa: E731
run = lambda c: subprocess.run(c, check=True)  # noqa: E731

# ---------------- shots
TOTAL = 0
for s in e["shots"]:
    slow = s.get("slow", 1)
    vf = (f"setpts={slow}*PTS," if slow != 1 else "") + (
        "hqdn3d=1:1:3:3,eq=contrast=1.05:brightness=0.006:saturation=1.05,"
        "colorbalance=rs=0.02:bs=-0.02:rm=0.015:bm=-0.015,"
        "scale=1080:1920:flags=lanczos,unsharp=5:5:0.4:5:5:0,format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(s["in"]), "-i", src(s["src"]), "-an", "-vf", vf,
         "-frames:v", str(s["frames"]), "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
         os.path.join(OUT, f"{s['id']}.mp4")])
    TOTAL += s["frames"]
DUR = TOTAL / FPS
print("total frames", TOTAL, f"{DUR:.2f}s")

# ---------------- voice (each real segment cleaned, then placed at its timeline position)
voice = np.zeros(int(DUR * SR) + SR)
for v in e["voice"]:
    p = os.path.join(OUT, "_seg.wav")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(v["a"]), "-t", str(v["b"] - v["a"]), "-i", src(v["src"]), "-vn",
         "-ac", "1", "-ar", str(SR), "-af",
         "highpass=f=90:poles=2,afftdn=nf=-28:nt=w,equalizer=f=250:t=q:w=1.0:g=-2,equalizer=f=3200:t=q:w=1.2:g=2,"
         "deesser=i=0.3,acompressor=threshold=-21dB:ratio=2.6:attack=6:release=140:makeup=2", p])
    x = sf.read(p, dtype="float64")[0]
    f = int(0.015 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    i = int(round(v["at"] * SR))
    voice[i:i + len(x)] += x
    os.remove(p)
voice = voice[:int(DUR * SR)]
voice *= 10 ** (-16 / 20) / (np.sqrt(np.mean(voice[np.abs(voice) > 1e-4] ** 2)) + 1e-9)  # ~-16 dBFS RMS while speaking

# ---------------- music, ducked
p = os.path.join(OUT, "_m.wav")
run(["ffmpeg", "-y", "-v", "error", "-ss", str(e["music"]["start"]), "-t", str(DUR), "-i", src(os.path.splitext(e["music"]["file"])[0]),
     "-ac", "2", "-ar", str(SR), p])
m = sf.read(p, dtype="float64")[0]
os.remove(p)
m = np.pad(m, ((0, max(0, len(voice) - len(m))), (0, 0)))[:len(voice)]
env = np.abs(voice)
k = int(0.12 * SR)
env = np.convolve(env, np.ones(k) / k, mode="same")
speaking = np.clip(env / 0.02, 0, 1)
t = np.arange(len(voice)) / SR
last_line = e["voice"][-1]["at"] + e["voice"][-1]["b"] - e["voice"][-1]["a"]
base = np.where(t < last_line, 10 ** (-13 / 20), 10 ** (-4 / 20))
base = np.convolve(base, np.ones(int(0.4 * SR)) / int(0.4 * SR), mode="same")  # smooth swell after the last line
duck = 1 - 0.55 * speaking
gain = base * np.convolve(duck, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
gain[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
mix = m * gain[:, None] + voice[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.89)
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix, SR)
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9", "-ar", "48000", "-ac", "2",
     os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix ok")
