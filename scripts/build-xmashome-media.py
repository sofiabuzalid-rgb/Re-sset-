"""
CHRISTMAS AT HOME — RE:SET Meta Ads media.
- Shots: iPhone 720x1280 SDR, upscaled to 1080x1920 (lanczos + gentle sharpening), one warm cinematic grade
  (soft S-curve, warm mids, highlights kept clean; pajama greens and reds untouched in hue), muted.
- Window shots: snow VFX composite (scripts/xmashome_vfx.py). The whole source clip is tracked so the glass polygon,
  drawn on the frame at 1.0 s, follows the camera; snow only where the exterior key is set behind that glass.
- Voice: IMG_8945 (the friend presenting the print) — spectral denoise (floor -16 dB), high-pass, de-mud and presence EQ,
  de-ess, light compression, levelled; 20 ms fades, no inner cuts. Output: voice.wav placed on the edit timeline.
Output: public/xmashome/<shot>.mp4, public/xmashome/voice.wav
Usage: python3 scripts/build-xmashome-media.py /folder/with/originals
"""
import glob, json, os, subprocess, sys
import cv2
import numpy as np
import soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

sys.path.insert(0, os.path.dirname(__file__))
import xmashome_vfx as V  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "xmashome")
e = json.load(open(os.path.join(ROOT, "src", "xmashome", "edit.json")))
FPS, SR = e["fps"], 48000
REF = 1.0  # window polygons are drawn on the frame at this source time
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731
only = set(sys.argv[2:])


def src(n):
    c = sorted(glob.glob(os.path.join(SRC, f"*{n}.mp4")) + glob.glob(os.path.join(SRC, f"*{n}.mov")) +
               glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)
    return c[-1]


GRADE = ("scale=1080:1920:flags=lanczos,"
         "eq=contrast=1.04:saturation=1.03:gamma=0.98,"
         "curves=all='0/0.02 0.25/0.22 0.5/0.5 0.75/0.78 1/0.98',"
         "colorbalance=rs=0.01:bs=-0.01:rm=0.025:gm=0.005:bm=-0.025:rh=0.01:bh=-0.01,"
         "unsharp=5:5:0.55:5:5:0.0")


def decode(path, ss=None, n=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", f"{ss:.3f}"] if ss is not None else []) + ["-i", path, "-an", "-vf", GRADE, "-r", "30"]
    cmd += (["-frames:v", str(n)] if n else []) + ["-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, V.H, V.W, 3)


def encode(frames, path):
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{V.W}x{V.H}", "-r", "30",
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-g", "15",
                          "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", path], stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close()
    p.wait()


for s in e["shots"]:
    if "src" not in s or (only and s["id"] not in only):
        continue
    xf = s.get("xf", 0)
    n = s["frames"] + xf
    start = s["in"] - xf / FPS
    out = os.path.join(OUT, f"{s['id']}.mp4")
    if "window" not in s:
        encode(decode(src(s["src"]), start, n), out)
        print(s["id"], n)
        continue
    allf = decode(src(s["src"]))
    path = V.track(allf)
    path -= path[min(len(path) - 1, round(REF * FPS))]
    i0 = round(start * FPS)
    snow = V.Snow(s["seed"], n)
    res = []
    for k in range(n):
        f = allf[min(i0 + k, len(allf) - 1)]
        sh = path[min(i0 + k, len(path) - 1)]
        m = V.key(f, s["window"], sh)
        res.append(V.composite(f, m, snow.render(k + 40, sh)))
    encode(res, out)
    print(s["id"], n, "snow")

# ---------------- voice
if not only or "voice" in only:
    vo = e["voice"]
    N, HOP = 2048, 512
    WIN = np.hanning(N)
    p = os.path.join(OUT, "_v.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", src(vo["src"]), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=90:poles=2", p])
    x = sf.read(p, dtype="float64")[0]
    pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
    S = np.fft.rfft(np.array([pad[i:i + N] * WIN for i in range(0, len(pad) - N, HOP)]), axis=1)
    mag = np.abs(S)
    en = mag.sum(1)
    noise = np.mean(mag[en <= np.percentile(en, 12)] ** 2, 0)
    snr = np.maximum(mag ** 2 / (1.5 * noise) - 1, 0)
    g = swv(np.pad(snr / (snr + 1), ((3, 3), (2, 2)), mode="edge"), (7, 5)).mean(axis=(-1, -2))
    fr = np.fft.irfft(S * np.maximum(g, 10 ** (-16 / 20)), axis=1) * WIN
    y = np.zeros(len(fr) * HOP + N)
    nr = np.zeros_like(y)
    for k, f in enumerate(fr):
        y[k * HOP:k * HOP + N] += f
        nr[k * HOP:k * HOP + N] += WIN ** 2
    x = (y / np.maximum(nr, 1e-8))[N:N + len(x)]
    sf.write(p, x.astype("float32"), SR)
    chain = ("equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=500:t=q:w=1.2:g=-1.0,equalizer=f=3200:t=q:w=1.0:g=2.5,"
             "equalizer=f=10000:t=h:w=0.7:g=1.5,deesser=i=0.3,"
             "acompressor=threshold=-22dB:ratio=2.2:attack=8:release=160:makeup=2,alimiter=limit=0.9")
    p2 = os.path.join(OUT, "_v2.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", chain, "-ar", str(SR), "-ac", "1", p2])
    x = sf.read(p2, dtype="float64")[0]
    seg = x[int(vo["a"] * SR):int(vo["b"] * SR)].copy()
    fd = int(0.02 * SR)
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    seg *= 10 ** ((-19 - 20 * np.log10(np.sqrt(np.mean(seg[np.abs(seg) > 0.01] ** 2)) + 1e-9)) / 20)
    sf.write(os.path.join(OUT, "voice.wav"), seg.astype("float32"), SR)
    for f in (p, p2):
        os.remove(f)
    print("voice", vo["b"] - vo["a"], "s")
