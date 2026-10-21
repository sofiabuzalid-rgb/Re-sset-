"""RE:SET — Anuncio 01 "El regalo que sí van a usar". Builds the voice track + edit.json for Remotion.

Only the protagonist's real phrases (RESET HOY clips, Whisper word times). Every cut point sits in a natural silence;
her pace is never changed. B-roll is anchored to her words. Subtitles are her exact words (Whisper spelling fixed
only where a second recogniser / the brand confirms it: "AirBizit"/"Reiset" -> RE:SET, "venza" -> dense, "piama" -> pijama).
"""
import json, subprocess
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
SRC = HERE.parent.parent / "library/cache/resethoy"
ASR = HERE.parent.parent / "library/resethoy_asr"
PUB = HERE.parent / "video/public/regalo01"
FPS, SR = 30, 48000

FIX = {"AirBizit": "RE:SET", "Reiset": "RE:SET", "reset.": "RE:SET.", "venza": "dense", "piama": "pijama", "navidad.": "Navidad.", "navidad,": "Navidad,"}
KEY = {"regalar", "Navidad", "Navidad.", "Navidad,", "RE:SET", "RE:SET.", "familia.", "cómoda.", "cómodos", "tiempo", "una", "vez", "matching"}

# voice pieces: (clip, first words, last words) — located by text in the Whisper words, so indices never drift
PIECES = [
    ("8931", "Les tengo", "esta navidad."),            # Les tengo una idea buenísima, por si no saben qué regalar esta Navidad.
    ("8944", "Por favor", "de AirBizit"),             # Por favor quiero que vean estas pijamas de RE:SET (said in one breath: no clean cut before "quiero")
    ("8947", "Aparte lo", "súper cómoda."),           # Aparte lo padre es que ... porque está súper cómoda.
    ("8946", "Imagínate que", "tu familia."),         # Imagínate que lo puedes combinar con toda tu familia.
    ("8946", "y todos", "esta Navidad."),             # y todos van a estar matching y súper cómodos esta Navidad.
    ("8949", "si todavía", "las mías."),              # si todavía no saben qué regalar esta Navidad, dense una vuelta por RE:SET porque yo ya tengo las mías.
]
END_CARD = 1.1  # s of sign-off after her last word


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


for k, (n, pa, pb) in enumerate(PIECES):
    ws = json.load(open(ASR / f"IMG_{n}.json"))["words"]
    a, b = find(ws, pa), find(ws, pb, last=True)
    x = load(n)
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
        st, en = warp(max(w["start"], s0)) + t, warp(min(w["end"], e0)) + t
        words_out.append({"w": txt, "s": round(st, 3), "e": round(en, 3), "key": txt.strip(".,") in {q.strip(".,") for q in KEY}, "piece": k, "br": txt[-1] in ".,?"})
    dur = len(seg) / SR
    print(f"P{k} IMG_{n} {s0:.2f}-{e0:.2f} cuts={[(round(a_,2),round(b_,2)) for a_,b_ in zip([k_[1] for k_ in keep[:-1]],[k_[0] for k_ in keep[1:]])]}  out {t:.2f}-{t + dur:.2f}  «{' '.join(FIX.get(w['word'], w['word']) for w in sel)}»")
    t += dur

voice = np.concatenate(pieces + [np.zeros(int(END_CARD * SR), np.float32)]).astype(np.float32)
PUB.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-af", "highpass=f=90,afftdn=nf=-28,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser,acompressor=threshold=-21dB:ratio=3:attack=6:release=90,loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", "48000", "-ac", "2", PUB / "voice.wav"], input=voice.tobytes(), check=True)

# piece start times on the output timeline, for anchoring shots to words
starts, acc = [], 0.0
for p in pieces:
    starts.append(acc)
    acc += len(p) / SR
json.dump({"fps": FPS, "total": int(round((acc + END_CARD) * FPS)), "pieceStarts": [round(s, 3) for s in starts], "voiceEnd": round(acc, 3), "words": words_out},
          open(HERE.parent / "video/src/regalo01/timing.json", "w"), indent=1, ensure_ascii=False)
print("total", round(acc + END_CARD, 2), "s")
