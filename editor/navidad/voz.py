"""RE:SET · Christmas × Buen Fin AD02 — pista de voz (nota de voz original de ella) + palabras con tiempos para subtítulos.

Fuente: The_Fit_Pilates_2_2.m4a (44.7 s; reemplaza la nota anterior). La voz viene limpia (ruido de fondo −91 dB) pero
saturada: 495 tramos recortados. Cadena: reconstrucción de picos (declip.py, spline cúbica) → paso alto 75 Hz → EQ correctiva suave
(−2 dB a 250 Hz, +1.5 dB a 3 kHz) → de-esser → compresión 2.5:1 → limitador → −16 LUFS. Sin reducción de ruido (no hace
falta) y sin cambiar tono ni velocidad.
Edición: se usa todo lo que dice salvo "Sí, para todos." (repite "para toda la familia"), "Además, tenemos en(vío) gratis en
compras desde $1,499 pesos" (no se entiende con claridad y es una condición de compra no confirmada) y "en plaza Stim Bosques"
(queda "Visítanos en Avenida Stim 39, y en Perisur."). Todos los cortes caen en silencio medido (≤ −58 dB) con cruce de 30 ms.
Uso: python3 editor/navidad/voz.py <nota.m4a> <whisper.json>
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "essentials"))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
LEAD = 0.16  # puts her first "15%" exactly on beat 13 (6.5 s) of the 120 BPM track
# source seconds; every edge is the measured minimum of the envelope (dB in comments)
PARTS = [(1.08, 12.925), (14.24, 28.49), (32.58, 35.03), (36.45, 43.30)]  # −69 | −69…−58 | −66…−76 | −66…−66 | −66…−73
GAPS = [0.22, 0.25, 0.15]  # where "Sí, para todos." was / where the envío sentence was / the comma pause after "39,"
# spelling of what she says (Whisper's mistakes, confirmed by the brand name and the verified store addresses)
FIX = {"Reset": "RE:SET", "Reset.": "RE:SET.", "buen": "Buen", "fin": "Fin", "Steam": "Stim", "navidad": "Navidad", "navidad.": "Navidad.", "color": "color,"}
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
    for i in range(len(words) - 1):  # "Peri" "Sur." → "Perisur."
        if words[i]["w"] == "Peri" and words[i + 1]["w"].startswith("Sur"):
            words[i:i + 2] = [{**words[i], "w": "Perisur" + words[i + 1]["w"][3:], "e": words[i + 1]["e"]}]
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
