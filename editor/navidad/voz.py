"""RE:SET · Christmas × Buen Fin AD02 — pista de voz (nota de voz original de ella) + palabras con tiempos para subtítulos.

Fuente: Calle_Bosque_de_Pirules_5_2.m4a (41.2 s). La voz viene limpia (ruido de fondo −64 dB) pero saturada: 299 tramos
recortados. Cadena: reconstrucción de picos (declip.py, spline cúbica) → paso alto 75 Hz → EQ correctiva suave
(−2 dB a 250 Hz, +1.5 dB a 3 kHz) → de-esser → compresión 2.5:1 → limitador → −16 LUFS. Sin reducción de ruido (no hace
falta) y sin cambiar tono ni velocidad.
Edición: se usa todo lo que dice salvo "Además, tenemos en(vío) gratis en compras desde 1499" (no se entiende con claridad
y es una condición de compra no confirmada) y "en Plaza Stim Bosques" (dentro de la frase de sucursales: queda "Visítanos en
Avenida Stim 39 o en Perisur."). Todos los cortes caen en silencio medido (< −60 dB) con cruce de 30 ms.
Uso: python3 editor/navidad/voz.py <nota.m4a> <whisper.json>
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "essentials"))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
LEAD = 0.30  # puts her "15%" exactly on beat 14 (7.0 s) of the 120 BPM track
PARTS = [(0.62, 28.19), (31.90, 33.96), (35.10, 40.80)]  # source seconds; every edge sits in measured silence
GAPS = [0.22, 0.18]  # pause where the envío sentence was / the comma pause before "o en Perisur"
# spelling of what she says (Whisper's mistakes, confirmed by the brand name and the verified store addresses)
FIX = {"Reset": "RE:SET", "buen": "Buen", "fin": "Fin", "Steam": "Stim", "39": "39"}
HIGHLIGHT = {"pijamas", "navideñas", "navidad", "re:set", "15%"}


def main():
    src, asr = sys.argv[1], sys.argv[2]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    y, runs = declip(x)
    y = y / (np.abs(y).max() * 1.05)
    print(f"picos reconstruidos: {runs} tramos")
    segs, offs, t = [], [], LEAD
    xf = int(0.03 * SR)
    for k, (a, b) in enumerate(PARTS):
        s = y[int(a * SR):int(b * SR)].copy()
        s[:xf] *= np.linspace(0, 1, xf)
        s[-xf:] *= np.linspace(1, 0, xf)
        offs.append((a, b, t - a))
        gap = LEAD if k == 0 else GAPS[k - 1]
        if k:
            t += gap
        offs[-1] = (a, b, t - a)
        segs.append(np.zeros(int(gap * SR)))
        segs.append(s)
        t += b - a
    v = np.concatenate(segs).astype(np.float32)
    chain = ",".join(["highpass=f=75", "equalizer=f=250:t=q:w=1.0:g=-2", "equalizer=f=3000:t=q:w=1.3:g=1.5", "deesser=i=0.3",
                      "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89:level=false",
                      "loudnorm=I=-16:TP=-1.5:LRA=7:linear=true"])
    out = ROOT / "editor/video/public/navidad"
    out.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", chain, "-ar", str(SR), "-c:a", "pcm_s16le",
                    str(out / "voz.wav")], input=v.tobytes(), check=True)

    words = []
    ws = json.load(open(asr))["words"]
    for i, w in enumerate(ws):
        for a, b, off in offs:
            if a <= (w["start"] + w["end"]) / 2 < b:  # by the word's midpoint: a word cut at the seam isn't subtitled
                txt = FIX.get(w["word"], w["word"])
                if txt == "%" and words:  # "15" "%" → "15%"
                    words[-1]["w"] += "%"
                    words[-1]["e"] = round(w["end"] + off, 3)
                    words[-1]["hl"] = True
                    break
                words.append(dict(w=txt, s=round(w["start"] + off, 3), e=round(min(w["end"], b) + off, 3), hl=txt.lower().strip("¿?,.") in HIGHLIGHT))
                break
    # sentence ends → one subtitle block per sentence
    for w in words:
        w["end_sentence"] = w["w"][-1] in ".?"
    dst = ROOT / "editor/video/src/navidad"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(dict(dur=round(len(v) / SR, 3), words=words), open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)
    print(f"voz: {len(v) / SR:.2f} s, {len(words)} palabras")
    print(" ".join(w["w"] for w in words))


if __name__ == "__main__":
    main()
