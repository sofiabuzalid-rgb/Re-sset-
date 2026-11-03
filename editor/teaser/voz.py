"""RE:SET · Teaser "la mejor temporada" — voz real del cuarto video (showroom), solo las frases útiles.

Cada frase se localiza por texto en las palabras de Whisper (editor/whisper/transcribe.mjs) y se corta en el silencio
más cercano (nunca a media palabra). No se cambia tono ni velocidad. Limpieza: paso alto → RNNoise (voz) → FFT ligero;
mezcla: EQ, de-esser, compresión suave, −14 LUFS (la normalización final la hace el render).
Uso: python3 editor/teaser/voz.py <video4> <whisper.json>
Escribe editor/video/public/teaser/voz_<n>.wav y editor/video/src/teaser/voz.json (palabras con tiempos relativos a cada frase).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RNN = ROOT / "editor/campana/rnnoise_speech.rnnn"
SR = 48000
# (id, primeras palabras, últimas palabras) — frases elegidas por lo que comunican: temporada y regalo
PHRASES = [("temporada", "la mejor", "del año."), ("regalo", "es como", "perfecto.")]
# "empezó" and "la" run together: re-transcribing from 2.13 s keeps "la", from 2.145 s drops it
START = {"temporada": 2.13}
# "año" ends ~3.87 s; the next sentence ("Tenemos…") starts at 4.25 s (envelope), Whisper put it at 4.50
END = {"temporada": 4.18}


def load(path):
    af = f"highpass=f=80,arnndn=m={RNN}:mix=0.85,afftdn=nr=8:nf=-40:tn=1"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-af", af, "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def env_db(x, hop=0.005):
    h = int(SR * hop)
    n = len(x) // h
    return 20 * np.log10(np.sqrt((x[: n * h].reshape(n, h) ** 2).mean(1) + 1e-12))


def find(ws, phrase, last=False, start=0):
    toks = phrase.split()
    for i in range(start, len(ws) - len(toks) + 1):
        if [w["word"].lower() for w in ws[i:i + len(toks)]] == [t.lower() for t in toks]:
            return i + (len(toks) - 1 if last else 0)
    raise SystemExit(f"no encontré: {phrase}")


def main():
    video, asr = sys.argv[1], sys.argv[2]
    ws = json.load(open(asr))["words"]
    x = load(video)
    db = env_db(x)
    H = 200  # frames per second of the envelope
    out_dir = ROOT / "editor/video/public/teaser"
    out_dir.mkdir(parents=True, exist_ok=True)
    meta = {}
    for pid, pa, pb in PHRASES:
        a = find(ws, pa)
        b = find(ws, pb, last=True, start=a)
        sel = ws[a:b + 1]
        speech = np.percentile(db[int(sel[0]["start"] * H):int(sel[-1]["end"] * H)], 90)
        thr = speech - 28
        prev_end = ws[a - 1]["end"] if a > 0 else 0.0
        nxt = ws[b + 1]["start"] if b + 1 < len(ws) else len(x) / SR
        # start: the quietest point between the previous word and this one (whisper boundaries are loose)
        lo, hi = int(max(prev_end - 0.1, 0) * H), int((sel[0]["start"] + 0.06) * H)
        s_i = lo + int(np.argmin(db[lo:hi])) if hi > lo else int(sel[0]["start"] * H)
        # end: after the last word, first point below threshold (+ breath tail), before the next word
        j = int(sel[-1]["end"] * H)
        lim = int((nxt - 0.03) * H)
        while j < lim and db[j] > thr:
            j += 1
        e = min(j / H + 0.12, nxt - 0.02)
        s = START.get(pid, s_i / H)
        e = END.get(pid, e)
        seg = x[int(s * SR):int(e * SR)].copy()
        f = int(0.025 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        g = int(0.06 * SR)
        seg[-g:] *= np.linspace(1, 0, g)
        v = seg[np.abs(seg) > 0.004]
        seg = seg / (np.sqrt(np.mean(v ** 2)) + 1e-9) * 0.08
        chain = ",".join(["highpass=f=95", "equalizer=f=250:t=q:w=1.1:g=-3", "equalizer=f=3500:t=q:w=1.3:g=2.5", "highshelf=f=9000:g=1.5",
                          "deesser=i=0.35", "acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89"])
        wav = out_dir / f"voz_{pid}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", chain, "-ar", str(SR), str(wav)],
                       input=seg.astype(np.float32).tobytes(), check=True)
        words = [dict(w=w["word"], s=round(max(w["start"] - s, 0), 3), e=round(min(w["end"], e) - s, 3)) for w in sel]
        meta[pid] = dict(src=f"teaser/voz_{pid}.wav", dur=round(len(seg) / SR, 3), clip_from=round(s, 3), words=words)
        print(f"{pid}: {s:.2f}-{e:.2f} ({e - s:.2f}s)  " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in words))
    dst = ROOT / "editor/video/src/teaser"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(meta, open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
