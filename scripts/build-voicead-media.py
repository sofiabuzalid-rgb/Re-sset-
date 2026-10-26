"""
Shared media builder for the RE:SET voice-led Meta ads (src/voicead/<ad>.json): Navidad en familia, Tu nueva pijama
favorita, Tu pijama de viaje.
- Shots: iPhone 720x1280 SDR -> 1080x1920 (lanczos + gentle sharpening), one warm, true-to-product grade, muted.
  A shot with "sync": k takes its in-point from voice segment k so lips match the voice; others are cutaways.
- Voice: the friend's real takes only (docs/reset-hoy/transcripts.json). Spectral denoise (floor -16 dB), high-pass,
  de-mud / presence EQ, de-ess, light compression, every segment levelled to the same loudness, 25 ms fades,
  segments are cut at word boundaries with breathing room so no consonant is clipped.
- Subtitles: literal words of each placed segment (Whisper word timings), grouped into <= 2-line blocks;
  only spelling and brand names are normalised (see FIX). Written to src/voicead/<ad>.subs.json.
- Music: licensed track named in the edit (or none), ducked -15 dB under the voice, faded at the end.
Final mix: -14 LUFS / -1 dBTP. Output: public/<ad>/<shot>.mp4, voice.wav, mix.wav
Usage: python3 scripts/build-voicead-media.py <ad> /folder/with/clips [shot ids...]
"""
import glob, json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view as swv

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
AD, SRC = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])
e = json.load(open(os.path.join(ROOT, "src", "voicead", f"{AD}.json")))
TR = json.load(open(os.path.join(ROOT, "docs", "reset-hoy", "transcripts.json")))
OUT = os.path.join(ROOT, "public", AD)
FPS, SR = e["fps"], 48000
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731
FIX = {"reset": "RE:SET", "Reset": "RE:SET", "piama": "pijama", "navidad": "Navidad", "navidad.": "Navidad.",
       "navidad,": "Navidad,", "jingibre": "jengibre"}


def src(n):
    return sorted(glob.glob(os.path.join(SRC, f"{n}.*")))[0]


GRADE = ("scale=1080:1920:flags=lanczos,"
         "eq=contrast=1.04:saturation=1.02:gamma=0.99,"
         "curves=all='0/0.02 0.25/0.235 0.5/0.5 0.75/0.765 1/0.985',"
         "colorbalance=rm=0.012:bm=-0.012:rh=0.006:bh=-0.006,"
         "unsharp=5:5:0.5:5:5:0.0")

# ---------------- shots
voice = e["voice"]
t = 0
for s in e["shots"]:
    s["from"] = t
    t += s["frames"]
    if "sync" in s:
        v = voice[s["sync"]]
        s["in"] = round(v["a"] + (s["from"] - v["at"]) / FPS, 3)
    if "src" not in s or (only and s["id"] not in only):
        continue
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in']:.3f}", "-i", src(s["src"]), "-an", "-vf", GRADE,
         "-frames:v", str(s["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         os.path.join(OUT, f"{s['id']}.mp4")])
    print(s["id"], s["src"], s["in"], s["frames"])
TOTAL = t
if only and "audio" not in only:
    sys.exit()

# ---------------- subtitles (literal words of the placed segments)
subs = []
WEAK = {"de", "del", "la", "el", "los", "las", "tu", "su", "que", "y", "a", "lo", "se", "con", "en", "por", "para", "una", "un", "es"}
for v in voice:
    # a word belongs to the segment when it ends inside it; "wfrom" overrides when Whisper's first timestamps drift
    words = [w for seg in TR[v["src"]] for w in seg["words"]]
    words = words[v["wfrom"]:] if "wfrom" in v else [w for w in words if w[1] > v["a"] + 0.02]
    words = [w for w in words if w[0] < v["b"] - 0.08]
    first, block = True, []
    for i, w in enumerate(words):
        block.append(w)
        txt = " ".join(FIX.get(x[2], x[2]) for x in block)
        nxt = words[i + 1] if i + 1 < len(words) else None
        nlen = len(txt) + 1 + len(nxt[2]) if nxt else 0
        brk = (nxt is None or (len(txt) > 18 and re.search(r"[,.?!]$", w[2])) or (nxt[0] - w[1] > 0.45)
               or (nlen > 40 and w[2].lower() not in WEAK))
        if brk:
            if first:
                txt = txt[0].upper() + txt[1:]
            a = max(v["at"] / FPS, v["at"] / FPS + block[0][0] - v["a"])
            b = v["at"] / FPS + (nxt[0] if nxt and nxt[0] - w[1] < 0.3 else w[1] + 0.15) - v["a"]
            subs.append({"from": round(a * FPS), "to": round(b * FPS), "text": txt.rstrip(".,")})
            first, block = False, []
json.dump(subs, open(os.path.join(ROOT, "src", "voicead", f"{AD}.subs.json"), "w"), indent=1, ensure_ascii=False)

# ---------------- voice
N, HOP = 2048, 512
WIN = np.hanning(N)
L = int(TOTAL / FPS * SR) + SR
vtrack, vmask = np.zeros(L), np.zeros(L)
cache = {}
for v in voice:
    if v["src"] not in cache:
        p = os.path.join(OUT, "_v.wav")
        run(["ffmpeg", "-y", "-v", "error", "-i", src(v["src"]), "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=90:poles=2", p])
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
        sf.write(p, ((y / np.maximum(nr, 1e-8))[N:N + len(x)]).astype("float32"), SR)
        chain = ("equalizer=f=220:t=q:w=1.0:g=-2.5,equalizer=f=500:t=q:w=1.2:g=-1.0,equalizer=f=3200:t=q:w=1.0:g=2.5,"
                 "equalizer=f=10000:t=h:w=0.7:g=1.5,deesser=i=0.3,"
                 "acompressor=threshold=-22dB:ratio=2.2:attack=8:release=160:makeup=2,alimiter=limit=0.9")
        p2 = os.path.join(OUT, "_v2.wav")
        run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", chain, "-ar", str(SR), "-ac", "1", p2])
        cache[v["src"]] = sf.read(p2, dtype="float64")[0]
        os.remove(p)
        os.remove(p2)
    x = cache[v["src"]]
    seg = x[int(v["a"] * SR):int(v["b"] * SR)].copy()
    fd = int(0.025 * SR)
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    seg *= 10 ** ((-19 - 20 * np.log10(np.sqrt(np.mean(seg[np.abs(seg) > 0.01] ** 2)) + 1e-9)) / 20)
    i = int(v["at"] / FPS * SR)
    vtrack[i:i + len(seg)] += seg
    vmask[i:i + len(seg)] = 1
end = int(TOTAL / FPS * SR)
sf.write(os.path.join(OUT, "voice.wav"), vtrack[:end].astype("float32"), SR)

# ---------------- music + mix
mix = np.stack([vtrack, vtrack], 1)
m = e.get("music")
if m:
    p = os.path.join(OUT, "_m.wav")
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(m["offset"]), "-i", os.path.join(SRC, m["file"]), "-ac", "2", "-ar", str(SR), p])
    mus = sf.read(p, dtype="float64")[0]
    os.remove(p)
    mus = np.pad(mus, ((0, max(0, L - len(mus))), (0, 0)))[:L]
    mus *= 10 ** ((-21 - 20 * np.log10(np.sqrt(np.mean(mus[:end] ** 2)) + 1e-9)) / 20)
    k = int(0.12 * SR)
    sm = np.convolve(vmask, np.ones(k) / k, mode="same")
    bridge = int(0.6 * SR)  # keep the music down through short pauses between her lines
    held = np.maximum.accumulate(np.where(sm > 0.01, np.arange(L), 0))
    sm = np.where((np.arange(L) - held < bridge) & (held > 0), 1.0, sm)
    gdb = np.convolve(-15 * sm, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same") + m.get("gain", 0)
    mus *= (10 ** (gdb / 20))[:, None]
    fi = int(0.3 * SR)
    mus[:fi] *= np.linspace(0, 1, fi)[:, None]
    mix = mix + mus
mix = mix[:end]
fo = int(1.2 * SR)
mix[-fo:] *= (np.linspace(1, 0, fo) ** 1.5)[:, None]
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true",
     "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("total", TOTAL, "frames", round(TOTAL / FPS, 2), "s;", len(subs), "subtitle blocks")
