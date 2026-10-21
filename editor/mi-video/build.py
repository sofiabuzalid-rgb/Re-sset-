"""Build the draft edit of Michelle's Soft Winter clips following editor/estilo.md.

1. Picks three real phrases by Whisper word index (no invented lines).
2. Removes every silence > 0.3 s inside them (energy VAD, keeps 60 ms of air each side).
3. Snaps cuts to frames, writes the cleaned voice track and ../video/src/edit.json
   (segments + word-by-word captions on the output timeline).
"""
import json, subprocess
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
PUB = HERE.parent / "video" / "public"
FPS, SR = 30, 48000
MAX_SIL, PAD = 0.30, 0.06

# Whisper spelling fixes, verified earlier against the clips (brand on the store wall, product name)
FIX = {"reset": "RE:SET", "SoftWinter,": "Soft Winter", "SoftWinter": "Soft Winter", "plaleando": "planeando"}
DROP = {("8495", "a")}  # Whisper hallucinated "a" after "planeando"
KEY = {"pijama", "cómoda", "linda", "RE:SET", "Soft Winter", "calidad", "colección", "bolsita", "viaje"}

# (clip, first word, last word, shot) — shot follows estilo.md: general -> medio -> corto
PHRASES = [
    ("8480", "Si", "SoftWinter,", "general"),
    ("8488", "y", "colección", "medio"),
    ("8495", "Y", "viaje", "corto"),
]


def load(n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", HERE / f"src/IMG_{n}.mp4", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def words_between(n, a, b):
    ws = json.load(open(HERE / f"w{n}.json"))["words"]
    i = next(k for k, w in enumerate(ws) if w["word"] == a and (n != "8488" or w["start"] > 5.5))
    j = next(k for k in range(i, len(ws)) if ws[k]["word"].strip(",.") == b.strip(",."))
    return ws[i : j + 1]


def env_db(x, hop=0.01):
    h = int(SR * hop)
    e = np.array([np.sqrt(np.mean(x[k : k + h] ** 2) + 1e-12) for k in range(0, len(x) - h, h)])
    return 20 * np.log10(e)


segs, words_out, t_out = [], [], 0
for n, a, b, shot in PHRASES:
    x = load(n)
    ws = words_between(n, a, b)
    db = env_db(x)
    speech = np.percentile(db[int(ws[0]["start"] * 100) : int(ws[-1]["end"] * 100)], 90)
    thr = speech - 28  # quieter than this = silence
    # phrase bounds: from first-word onset to last-word tail, snapped to where the energy really starts/ends
    allw = json.load(open(HERE / f"w{n}.json"))["words"]
    prv = [w for w in allw if w["start"] < ws[0]["start"] - 0.01]
    if prv:  # start at the energy valley after the previous (unused) word, so its tail never leaks in
        lo, hi = int((ws[0]["start"] - 0.3) * 100), int((ws[0]["start"] + 0.04) * 100)
        k = lo + int(np.argmin(db[lo:hi]))
        while db[k] < thr and k < hi:  # walk forward to the real voice onset
            k += 1
        s0 = k / 100 - PAD
    else:
        s0 = ws[0]["start"] - 0.15
        while db[int(s0 * 100)] < thr and s0 < ws[0]["start"]:
            s0 += 0.01
    allw = json.load(open(HERE / f"w{n}.json"))["words"]
    nxt = [w for w in allw if w["start"] > ws[-1]["start"] + 0.01]
    if nxt:  # end at the energy valley before the next (unused) word, so none of it leaks in
        lo, hi = int((ws[-1]["end"] - 0.12) * 100), int((nxt[0]["start"] + 0.06) * 100)
        e0 = (lo + int(np.argmin(db[lo:hi]))) / 100
    else:
        e0 = ws[-1]["end"] + 0.15
    s0 = s0 - PAD
    # silences > MAX_SIL inside the phrase
    quiet = db[int(s0 * 100) : int(e0 * 100)] < thr
    cuts, k = [], 0
    while k < len(quiet):
        if quiet[k]:
            m = k
            while m < len(quiet) and quiet[m]:
                m += 1
            if (m - k) / 100 > MAX_SIL:
                cuts.append((s0 + k / 100 + PAD, s0 + m / 100 - PAD))
            k = m
        else:
            k += 1
    keep, cur = [], s0
    for c0, c1 in cuts:
        keep.append((cur, c0))
        cur = c1
    keep.append((cur, e0))
    for w in ws:  # a word never runs across a removed silence (Whisper stretches the last word of a breath group)
        for c0, c1 in cuts:
            if w["start"] < c0 < w["end"]:
                w["end"] = c0
    # drop kept pieces that hold no word of the phrase (breaths, the onset of the next unused word)
    keep = [(q0, q1) for q0, q1 in keep if any(min(w["end"], q1) - max(w["start"], q0) > 0.05 for w in ws)]
    for i, (k0, k1) in enumerate(keep):
        f0, f1 = round(k0 * FPS), int(k1 * FPS)  # floor the out-point: never a frame of the next word
        segs.append({"clip": n, "shot": shot, "from": t_out, "in": f0, "frames": f1 - f0, "part": i})
        for w in ws:
            if (n, w["word"]) in DROP:
                continue
            # a word belongs to the kept piece it overlaps most (Whisper word ends are loose)
            ov = [max(0, min(w["end"], q1) - max(w["start"], q0)) for q0, q1 in keep]
            if max(ov) > 0 and ov.index(max(ov)) == i:
                st = max(w["start"], k0) - f0 / FPS + t_out / FPS
                en = min(w["end"], k1) - f0 / FPS + t_out / FPS
                words_out.append({"w": FIX.get(w["word"], w["word"]).strip(".,"), "s": round(st, 3), "e": round(en, 3), "key": FIX.get(w["word"], w["word"]).strip(".,") in KEY, "br": w["word"][-1] in ",.", "phrase": PHRASES.index((n, a, b, shot))})
        t_out += f1 - f0
    print(n, shot, f"{s0:.2f}-{e0:.2f}", "silencios cortados:", [(round(c0, 2), round(c1, 2)) for c0, c1 in cuts])

# voice track: same frame-exact pieces, 8 ms fades at every cut, cleaned and normalised
pieces = []
for s in segs:
    x = load(s["clip"])[int(s["in"] / FPS * SR) : int((s["in"] + s["frames"]) / FPS * SR)].copy()
    f = int(0.008 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    pieces.append(x)
v = np.concatenate(pieces).astype(np.float32)
PUB.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-af", "highpass=f=80,afftdn=nf=-30,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1:g=2,deesser,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1:LRA=7",
                "-ar", "48000", "-ac", "2", PUB / "voice.wav"], input=v.tobytes(), check=True)
for n in {s["clip"] for s in segs}:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", HERE / f"src/IMG_{n}.mp4", "-an", "-c:v", "libx264", "-crf", "14", "-g", "1", "-pix_fmt", "yuv420p", PUB / f"IMG_{n}.mp4"], check=True)
total = t_out
json.dump({"fps": FPS, "total": total, "segs": segs, "words": words_out}, open(HERE.parent / "video/src/edit.json", "w"), indent=1, ensure_ascii=False)
print("total", total, "frames =", round(total / FPS, 2), "s ·", len(segs), "segmentos ·", len(words_out), "palabras")
