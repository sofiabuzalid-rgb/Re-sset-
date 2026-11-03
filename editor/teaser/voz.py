"""RE:SET · Teaser "la mejor temporada" — voz real del cuarto video (showroom), solo las frases útiles.

Fuente: el canal derecho del video (su voz llega 6 dB más fuerte que en el izquierdo; mismo ruido de tienda).
Limpieza: filtros de zumbido eléctrico (183/363/540/717 Hz…, más fuerte que su voz en esa banda) → reducción espectral con
el perfil de ruido de las pausas de esta misma grabación → RNNoise 80 % → entre palabras el fondo baja 12 dB → EQ suave
(sin realzar agudos), de-esser, compresión 2:1 sin subir el piso de ruido → mismo nivel de voz en cada frase.
Cada frase se ubica por texto en las palabras de Whisper y se corta en el silencio medido en la envolvente (nunca a media
palabra). No se cambia tono ni velocidad.
Uso: python3 editor/teaser/voz.py <video4> <whisper.json>
Escribe editor/video/public/teaser/voz_<id>.wav y editor/video/src/teaser/voz.json (palabras con tiempos relativos a cada frase).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import noisereduce as nr
import scipy.signal as ss

ROOT = Path(__file__).resolve().parents[2]
RNN = ROOT / "editor/campana/rnnoise_speech.rnnn"
SR = 48000
import os
PROP, RMIX, GPRE = float(os.environ.get("PROP", 0.75)), float(os.environ.get("RMIX", 0.8)), float(os.environ.get("GPRE", 0.18))
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


def ff(x, af):
    y = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", af, "-f", "f32le", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    y = np.frombuffer(y, np.float32).astype(np.float64)
    return np.pad(y, (0, max(0, len(x) - len(y))))[:len(x)]


def load(path, words=None):
    """right channel → de-hum (the shop's mains buzz: 183/363/540/717 Hz… is louder than her voice in that band)
    → spectral gating with a noise profile taken from the pauses of this same recording → RNNoise (strength picked so all five phrases still transcribe word-for-word)"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af", "pan=mono|c0=c1,highpass=f=90,lowpass=f=9000", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    f, p = ss.welch(x, SR, nperseg=SR * 2)
    d = 10 * np.log10(p + 1e-20)
    for c in [55.5, 183, 363, 540.5, 717, 897, 1077, 1257]:  # find each harmonic's exact peak, notch it twice
        k = (f > c - 5) & (f < c + 5)
        fc = f[np.where(k)[0][np.argmax(d[k])]]
        for _ in range(2):
            b, a = ss.iirnotch(fc, Q=fc / 4.0, fs=SR)
            x = ss.filtfilt(b, a, x)
    if words:
        quiet = np.ones(len(x), bool)
        for w in words:
            quiet[max(0, int((w["start"] - 0.12) * SR)):int((w["end"] + 0.15) * SR)] = False
        x = nr.reduce_noise(y=x, sr=SR, y_noise=x[quiet], stationary=True, prop_decrease=PROP, n_fft=2048, time_mask_smooth_ms=50, freq_mask_smooth_hz=250)
    x = ff(x, f"arnndn=m={RNN}:mix={RMIX}")
    return x.astype(np.float32)


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
    x = load(video, ws)
    db = env_db(x)
    out_dir = ROOT / "editor/video/public/teaser"
    out_dir.mkdir(parents=True, exist_ok=True)
    meta = {}
    for pid, pa, pb in PHRASES:
        a = find(ws, pa)
        b = find(ws, pb, last=True, start=a)
        s, e = bounds(db, ws, a, b, len(x) / SR)
        s, e = START.get(pid, s), END.get(pid, e)
        seg = x[int(s * SR):int(e * SR)].astype(np.float64)
        # between words the room is turned down 12 dB (smooth 40 ms ramps), so no noise bed is pumped up later
        gate = np.full(len(seg), 0.25)
        for w in ws[a:b + 1]:
            gate[max(0, int((w["start"] - s - GPRE) * SR)):int((max(w["end"], w["start"] + 0.12) - s + 0.14) * SR)] = 1.0
        k = int(0.04 * SR)
        gate = np.convolve(gate, np.ones(k) / k, mode="same")
        seg *= gate
        f, g = int(0.02 * SR), int((0.03 if pid == "calientitas" else 0.07) * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-g:] *= np.linspace(1, 0, g)
        chain = ",".join([
            "equalizer=f=220:t=q:w=1.0:g=-2.5", "equalizer=f=2600:t=q:w=1.4:g=1.5", "lowpass=f=8500",
            "deesser=i=0.3", "acompressor=threshold=-20dB:ratio=2:attack=10:release=150:makeup=1",
        ])
        y = ff(seg, chain)
        v = y[np.abs(y) > np.abs(y).max() * 0.05]
        y = y / (np.sqrt(np.mean(v ** 2)) + 1e-9) * 0.15  # same speech level for every phrase
        y = 0.9 * np.tanh(y / 0.9)  # soft limiter: no hard clipping
        wav = out_dir / f"voz_{pid}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(wav)],
                       input=y.astype(np.float32).tobytes(), check=True)
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
