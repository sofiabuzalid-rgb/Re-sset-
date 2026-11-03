"""RE:SET · Teaser "la mejor temporada" — voz real del cuarto video (showroom), solo las frases útiles.

Fuente: el canal derecho del video (su voz llega 6 dB más fuerte que en el izquierdo; mismo ruido de tienda).
Limpieza: paso alto/bajo → RNNoise (voz, 70 % húmedo: sin sonido robótico) → FFT ligero → nivel igual por frase
(−16 LUFS cada una) → EQ (menos "caja" a 250 Hz, presencia a 3 kHz) → de-esser → compresión → limitador.
Cada frase se ubica por texto en las palabras de Whisper y se corta en el silencio medido en la envolvente (nunca a media
palabra). No se cambia tono ni velocidad.
Uso: python3 editor/teaser/voz.py <video4> <whisper.json>
Escribe editor/video/public/teaser/voz_<id>.wav y editor/video/src/teaser/voz.json (palabras con tiempos relativos a cada frase).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RNN = ROOT / "editor/campana/rnnoise_speech.rnnn"
SR = 48000
# (id, primeras palabras, últimas palabras) en el orden del video
PHRASES = [
    ("felices", "Muy felices", "del año."),                   # Muy felices de que ya empezó la mejor temporada del año.
    ("navidad", "Tenemos aquí", "de Navidad"),                # Tenemos aquí las de Navidad
    ("calientitas", "tenemos estas", "muchísimo"),             # tenemos estas calientitas que les han gustado muchísimo
    ("regalo", "es como", "perfecto."),                        # es como el regalo perfecto.
    ("esperamos", "los esperamos.", "los esperamos."),         # los esperamos.
]
# cuts measured on the envelope where Whisper's word edges are loose (seconds in the source)
START = {}
END = {"felices": 4.18, "calientitas": 33.02}  # "año" ends ~3.87 s, "Tenemos…" at 4.25 s; "muchísimo" ends 32.98, "también" starts 33.05
# spelling: Whisper heard "yo empezó"; she says "ya empezó"
FIX = {"yo": "ya"}


def load(path):
    af = f"pan=mono|c0=c1,highpass=f=90,lowpass=f=11000,arnndn=m={RNN}:mix=0.7,afftdn=nr=6:nf=-42:tn=1"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af", af, "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def env_db(x, hop=0.01):
    h = int(SR * hop)
    n = len(x) // h
    return 20 * np.log10(np.sqrt((x[: n * h].reshape(n, h) ** 2).mean(1) + 1e-12))


def find(ws, phrase, last=False, start=0):
    toks = [t.lower().strip(".,") for t in phrase.split()]
    for i in range(start, len(ws) - len(toks) + 1):
        if [w["word"].lower().strip(".,") for w in ws[i:i + len(toks)]] == toks:
            return i + (len(toks) - 1 if last else 0)
    raise SystemExit(f"no encontré: {phrase}")


def bounds(db, ws, a, b, n_sec):
    """start in the quietest spot before the first word, end at the first 80 ms of quiet after the last one"""
    sel = ws[a:b + 1]
    speech = np.percentile(db[int(sel[0]["start"] * 100):max(int(sel[-1]["end"] * 100), int(sel[0]["start"] * 100) + 5)], 90)
    thr = speech - 20
    prev_end = ws[a - 1]["end"] if a > 0 else 0.0
    nxt = ws[b + 1]["start"] if b + 1 < len(ws) else n_sec
    lo, hi = int(max(prev_end, sel[0]["start"] - 0.35) * 100), int((sel[0]["start"] + 0.05) * 100)
    s = (lo + int(np.argmin(db[lo:hi]))) / 100 if hi > lo else sel[0]["start"]
    j = int(max(sel[-1]["end"], sel[-1]["start"] + 0.25) * 100)
    lim = int(min(nxt + 0.3, n_sec) * 100)
    while j < lim and not (db[j:j + 8] < thr).all():
        j += 1
    return s, min(j / 100 + 0.1, n_sec)


def main():
    video, asr = sys.argv[1], sys.argv[2]
    ws = json.load(open(asr))["words"]
    x = load(video)
    db = env_db(x)
    out_dir = ROOT / "editor/video/public/teaser"
    out_dir.mkdir(parents=True, exist_ok=True)
    meta = {}
    for pid, pa, pb in PHRASES:
        a = find(ws, pa)
        b = find(ws, pb, last=True, start=a)
        s, e = bounds(db, ws, a, b, len(x) / SR)
        s, e = START.get(pid, s), END.get(pid, e)
        seg = x[int(s * SR):int(e * SR)].copy()
        f, g = int(0.02 * SR), int((0.03 if pid == "calientitas" else 0.07) * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-g:] *= np.linspace(1, 0, g)
        tmp = out_dir / f"_raw_{pid}.f32"
        seg.astype(np.float32).tofile(tmp)
        chain = ",".join([
            "loudnorm=I=-16:TP=-2:LRA=7:linear=true",
            "equalizer=f=250:t=q:w=1.0:g=-3.5", "equalizer=f=3000:t=q:w=1.2:g=3", "highshelf=f=8000:g=2",
            "deesser=i=0.4", "acompressor=threshold=-22dB:ratio=3:attack=6:release=110:makeup=2.5", "alimiter=limit=0.89",
        ])
        wav = out_dir / f"voz_{pid}.wav"
        # two passes: loudnorm needs the whole phrase; pad a little silence so it measures cleanly
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp), "-af", f"apad=pad_dur=0.3,{chain},atrim=0:{e - s:.3f}",
                        "-ar", str(SR), str(wav)], check=True)
        tmp.unlink()
        words = [dict(w=FIX.get(w["word"], w["word"]), s=round(max(w["start"] - s, 0), 3), e=round(min(max(w["end"], w["start"] + 0.12), e) - s, 3)) for w in ws[a:b + 1]]
        if words[-1]["w"][-1] not in ".,?!":
            words[-1]["w"] += "."
        meta[pid] = dict(src=f"teaser/voz_{pid}.wav", dur=round(e - s, 3), clip_from=round(s, 3), words=words)
        print(f"{pid}: {s:.2f}-{e:.2f} ({e - s:.2f}s)  " + " ".join(w["w"] for w in words))
    dst = ROOT / "editor/video/src/teaser"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(meta, open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
