"""RE:SET · Soft Winter × Buen Fin AD03 — pista de voz (nota de voz original de ella) + palabras con tiempos para subtítulos.

Fuente: The_Fit_Pilates_3_2.m4a (43.5 s). Limpia (ruido −66 dB) pero saturada en 88 tramos: se reconstruyen (declip.py) y luego
paso alto 75 Hz, EQ suave, de-esser, compresión 2.5:1, limitador, −16 LUFS. Tono y velocidad intactos.
Edición (todas las frases son suyas, cortadas en silencio medido de −63 a −78 dB, cruce de 30 ms):
  usa  "Te presentamos nuestra Soft Winter, … días de invierno en casa. Tenemos diferentes modelos de manga larga, colores súper lindos"
       "Además vienen con su práctica bolsita de viaje … Y aprovecha porque este Buen Fin tenemos 15% de descuento en la tienda."
       "Visítanos en Avenida Stim 39 o en Perisur."
  quita la frase inicial ("Ya estás listo para el frío de diciembre…": el gancho es gráfico), "y lo mejor también hay para niños"
       (no hay tomas de niños), el envío gratis (fuera del 15%) y el cierre "Prepárate para diciembre…" (duración).
Uso: python3 editor/softwinter26/voz.py <nota.m4a> <whisper.json>
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "essentials"))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
LEAD = 2.72  # the voice enters under the SOFT WINTER title; puts her "15%" exactly on beat 52 (26.0 s) of the 120 BPM track
# source seconds; every edge is the measured minimum of the envelope
PARTS = [(4.835, 21.825), (23.83, 31.565), (35.60, 38.55)]  # −78…−63 | −65…−70 | −64…−71
GAPS = [0.30, 0.30]
# spelling of what she says (Whisper's mistakes, confirmed by the brand name and the verified store addresses)
FIX = {"Reset": "RE:SET", "buen": "Buen", "fin": "Fin", "Steam": "Stim", "avenida": "Avenida", "super": "súper", "lindos": "lindos.", "PeriSour.": "Perisur."}
HIGHLIGHT = {"soft", "winter", "winter,", "tela", "textura", "suave", "calientitas", "bolsita", "15%"}


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
    out = ROOT / "editor/video/public/softwinter26"
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
    for i in range(len(words) - 1):  # "Visita" "nos" → "Visítanos"
        if words[i]["w"] == "Visita" and words[i + 1]["w"] == "nos":
            words[i:i + 2] = [{**words[i], "w": "Visítanos", "e": words[i + 1]["e"]}]
            break
    # sentence ends → one subtitle block per sentence
    for w in words:
        w["end_sentence"] = w["w"][-1] in ".?"
    dst = ROOT / "editor/video/src/softwinter26"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(dict(dur=round(len(v) / SR, 3), words=words), open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)
    print(f"voz: {len(v) / SR:.2f} s, {len(words)} palabras")
    print(" ".join(w["w"] for w in words))


if __name__ == "__main__":
    main()
