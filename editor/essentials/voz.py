"""RE:SET · Essentials Buen Fin AD01 — pista de voz (nota de voz original de ella) + palabras con tiempos para subtítulos.

Fuente: Calle_Bosque_de_Pirules_4.m4a (38.4 s). La voz viene limpia (ruido de fondo −68 dB) pero saturada: 135 tramos
recortados. Cadena: reconstrucción de picos (declip.py, spline cúbica) → paso alto 75 Hz → EQ correctiva suave
(−2 dB a 250 Hz, +1.5 dB a 3 kHz) → de-esser → compresión 2.5:1 → limitador → −16 LUFS. Sin reducción de ruido (no hace
falta) y sin cambiar tono ni velocidad.
Edición: se usa todo lo que dice salvo "Además tenemos en(vío) gratis desde 1499 pesos" (no se entiende con claridad
y es una condición de compra que no está confirmada en ningún otro lado); el corte cae en silencio con cruce de 30 ms.
Uso: python3 editor/essentials/voz.py <nota.m4a> <whisper.json>
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
LEAD = 0.26  # puts her "15%" exactly on beat 34 (17.0 s) of the 120 BPM track
PARTS = [(0.62, 26.93), (30.88, 37.30)]  # source seconds; both edges sit in measured silence (envelope < −55 dB)
GAP = 0.25  # pause left where the envío sentence was
# spelling of what she says (Whisper's mistakes, confirmed by the brand name and the verified store addresses)
FIX = {"reset": "RE:SET", "Rised": "RE:SET", "buen": "Buen", "fin.": "Fin.", "fin": "Fin", "Perizur,": "Perisur,", "Steam": "Stim"}
HIGHLIGHT = {"essentials", "pijama", "pijamas", "re:set", "15%"}


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
        segs.append(np.zeros(int((LEAD if k == 0 else GAP) * SR)))
        segs.append(s)
        t += (b - a) + GAP
    v = np.concatenate(segs).astype(np.float32)
    chain = ",".join(["highpass=f=75", "equalizer=f=250:t=q:w=1.0:g=-2", "equalizer=f=3000:t=q:w=1.3:g=1.5", "deesser=i=0.3",
                      "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89:level=false",
                      "loudnorm=I=-16:TP=-1.5:LRA=7:linear=true"])
    out = ROOT / "editor/video/public/essentials"
    out.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", chain, "-ar", str(SR), "-c:a", "pcm_s16le",
                    str(out / "voz.wav")], input=v.tobytes(), check=True)

    words = []
    ws = json.load(open(asr))["words"]
    for i, w in enumerate(ws):
        for a, b, off in offs:
            if a <= w["start"] < b:
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
    dst = ROOT / "editor/video/src/essentials"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(dict(dur=round(len(v) / SR, 3), words=words), open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)
    print(f"voz: {len(v) / SR:.2f} s, {len(words)} palabras")
    print(" ".join(w["w"] for w in words))


if __name__ == "__main__":
    main()
