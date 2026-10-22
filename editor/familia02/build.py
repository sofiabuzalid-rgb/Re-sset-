"""RE:SET — Anuncio 02 "Navidad en familia". Builds the voice track + timing.json for Remotion (same method as regalo01/build.py).

Only the protagonist's real phrases (RESET HOY clips, Whisper word times). Every cut point sits in a natural silence;
her pace is never changed. B-roll is anchored to her words. Subtitles are her exact words (Whisper spelling fixed
only where a second recogniser / the brand confirms it: "AirBizit"/"Reiset" -> RE:SET, "venza" -> dense, "piama" -> pijama).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
SRC = HERE.parent.parent / "library/cache/resethoy"
ASR = HERE.parent.parent / "library/resethoy_asr"
PUB = HERE.parent / "video/public/familia02"
FPS, SR = 30, 48000

FIX = {"AirBizit": "RE:SET", "Reiset": "RE:SET", "reset.": "RE:SET.", "venza": "dense", "piama": "pijama", "navidad.": "Navidad.", "navidad,": "Navidad,", "si,": "sí,"}
KEY = {"regalar", "Navidad", "Navidad.", "Navidad,", "RE:SET", "RE:SET.", "familia.", "cómoda.", "cómodos", "tiempo", "una", "vez", "matching"}

# voice pieces: (clip, first words, last words) located by text; a (clip, start s, end s, label) piece is a non-speech moment (her real laugh)
PIECES = [
    ("8944", "y lo mejor", "tu familia."),             # (y) lo mejor — "y lo" is one breath, no clean cut before "lo" de todo es que lo puedes combinar con toda tu familia.
    ("8946", "Tú te", "esta Navidad."),               # Tú te pones esta, tu hijo o tu hermano ... y todos van a estar matching y súper cómodos esta Navidad.
    ("8932", 0.25, 1.9, "risa"),                       # her laugh, lying among the sets
    ("8948", "De verdad,", "por reset."),             # De verdad, si no saben aún qué regalar, dense una vuelta, sí o sí, por RE:SET.
    ("8948", "Yo ya", "las mías."),                   # Yo ya tengo las mías.
]
END_CARD = 2.2
SUF = ""


def load(n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC / f"IMG_{n}.MP4", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def env_db(x, hop=0.01):
    h = int(SR * hop)
    n = len(x) // h
    e = np.sqrt((x[: n * h].reshape(n, h) ** 2).mean(1) + 1e-12)
    return 20 * np.log10(e)


pieces, words_out, t = [], [], 0.0
def find(ws, phrase, last=False):
    toks = phrase.split()
    hits = [i for i in range(len(ws) - len(toks) + 1) if [w["word"] for w in ws[i : i + len(toks)]] == toks]
    assert hits, phrase
    return hits[0] + (len(toks) - 1 if last else 0)


for k, (n, pa, pb, *_) in enumerate(PIECES):
    x = load(n)
    if isinstance(pa, float):  # non-speech piece: taken as is, a bit softer than her voice
        seg = x[int(pa * SR) : int(pb * SR)].copy()
        seg /= np.sqrt(np.mean(seg[np.abs(seg) > 0.01] ** 2) + 1e-9) / 0.05
        f = int(0.05 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        pieces.append(seg)
        print(f"P{k} IMG_{n} {pa:.2f}-{pb:.2f} (risa)  out {t:.2f}-{t + len(seg) / SR:.2f}")
        t += len(seg) / SR
        continue
    ws = json.load(open(ASR / f"IMG_{n}.json"))["words"]
    a, b = find(ws, pa), find(ws, pb, last=True)
    db = env_db(x)
    sel = ws[a : b + 1]
    speech = np.percentile(db[int(sel[0]["start"] * 100) : int(sel[-1]["end"] * 100)], 90)
    thr = speech - 30
    prev_end = ws[a - 1]["end"] if a > 0 else 0.0
    nxt_start = ws[b + 1]["start"] if b + 1 < len(ws) else len(x) / SR
    # start: walk back from the first word to where the voice really begins (never into the previous word)
    i = int(sel[0]["start"] * 100)
    while i > int(prev_end * 100) + 3 and db[i - 1] > thr:
        i -= 1
    s0 = max(prev_end + 0.03, i / 100 - 0.08)
    # end: the last frame above threshold inside the last word (Whisper stretches final words), plus a breath
    j = int(min(sel[-1]["end"] + 0.25, nxt_start - 0.05) * 100)
    while j > int(sel[-1]["start"] * 100) and db[j] < thr:
        j -= 1
    e0 = min(j / 100 + 0.14, nxt_start - 0.04)
    f0, f1 = round(s0 * FPS), int(e0 * FPS)
    s0, e0 = f0 / FPS, f1 / FPS
    # dead air inside the phrase (> 0.4 s below threshold) shrinks to 0.2 s; her words keep their own speed
    keep, cur, q = [], s0, int(s0 * 100)
    while q < int(e0 * 100):
        if db[q] < thr:
            r = q
            while r < int(e0 * 100) and db[r] < thr:
                r += 1
            if (r - q) / 100 > 0.4 and q / 100 > s0 + 0.1 and r / 100 < e0 - 0.1:
                keep.append((cur, q / 100 + 0.1))
                cur = r / 100 - 0.1
            q = r
        else:
            q += 1
    keep.append((cur, e0))
    parts = []
    for u0, u1 in keep:
        pc = x[int(u0 * SR) : int(u1 * SR)].copy()
        g = int(0.008 * SR)
        pc[:g] *= np.linspace(0, 1, g)
        pc[-g:] *= np.linspace(1, 0, g)
        parts.append(pc)
    seg = np.concatenate(parts)

    def warp(tt):  # source time -> time inside the trimmed piece
        acc = 0.0
        for u0, u1 in keep:
            if tt < u0:
                return acc
            if tt <= u1:
                return acc + tt - u0
            acc += u1 - u0
        return acc

    seg /= np.sqrt(np.mean(seg[np.abs(seg) > 0.01] ** 2) + 1e-9) / 0.08  # match speech level across clips
    f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f:] *= np.linspace(1, 0, f)
    pieces.append(seg)
    for wi, w in enumerate(sel):
        txt = FIX.get(w["word"], w["word"])
        if txt == "que" and wi + 1 < len(sel) and sel[wi + 1]["word"].startswith("regalar"):
            txt = "qué"  # interrogative: "por si no saben qué regalar"
        if txt == "si" and wi + 1 < len(sel) and sel[wi + 1]["word"] == "o":
            txt = "sí"  # "sí o sí"
        if wi == 0:
            txt = txt[0].upper() + txt[1:]  # each piece reads as its own sentence
        st, en = warp(max(w["start"], s0)) + t, warp(min(w["end"], e0)) + t
        words_out.append({"w": txt, "s": round(st, 3), "e": round(en, 3), "key": txt.strip(".,") in {q.strip(".,") for q in KEY}, "piece": k, "br": txt[-1] in ".,?"})
    dur = len(seg) / SR
    print(f"P{k} IMG_{n} {s0:.2f}-{e0:.2f} cuts={[(round(a_,2),round(b_,2)) for a_,b_ in zip([k_[1] for k_ in keep[:-1]],[k_[0] for k_ in keep[1:]])]}  out {t:.2f}-{t + dur:.2f}  «{' '.join(FIX.get(w['word'], w['word']) for w in sel)}»")
    t += dur

# the "y" before "lo mejor" is swallowed by the cut (both recognisers hear "Lo mejor…"): subtitles show what is heard
if words_out[0]["w"] == "Y":
    words_out.pop(0)
    words_out[0]["w"] = "Lo"
voice = np.concatenate(pieces + [np.zeros(int(END_CARD * SR), np.float32)]).astype(np.float32)
PUB.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-af", "highpass=f=90,afftdn=nf=-28,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser,acompressor=threshold=-21dB:ratio=3:attack=6:release=90,loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", "48000", "-ac", "2", PUB / f"voice{SUF}.wav"], input=voice.tobytes(), check=True)

# piece start times on the output timeline, for anchoring shots to words
starts, acc = [], 0.0
for p in pieces:
    starts.append(acc)
    acc += len(p) / SR
json.dump({"fps": FPS, "total": int(round((acc + END_CARD) * FPS)), "pieceStarts": [round(s, 3) for s in starts], "voiceEnd": round(acc, 3), "words": words_out},
          open(HERE.parent / "video/src/familia02/timing.json", "w"), indent=1, ensure_ascii=False)
print("total", round(acc + END_CARD, 2), "s")
