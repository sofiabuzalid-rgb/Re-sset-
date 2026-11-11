"""RE:SET · Buen Fin 15% (4 anuncios) — su voz real de las notas de voz del Buen Fin + palabras con tiempos para subtítulos.

Los clips de video de esta tanda no tienen voz útil (los IMG_ son mudos; los dos "copy_" traen música de otro reel), así que la voz sale
de sus notas de voz donde ella anuncia el 15% en toda la tienda:
  xmas = The_Fit_Pilates_2_2.m4a (pijamas navideñas) · ess = Calle_Bosque_de_Pirules_4.m4a (Essentials) ·
  face = The_Face_Method_4.m4a (la Essential de botones) · sw = The_Fit_Pilates_3_2.m4a (Soft Winter, bolsita de viaje)
Cada nota completa: mono → reconstrucción de picos saturados (editor/essentials/declip.py) → paso alto 80 Hz → reducción de ruido ligera
→ EQ suave → de-esser → compresión 2.5:1 → limitador → −16 LUFS (todas al mismo nivel). Los cortes (en ads.tsx) caen en silencios medidos.
Uso: python3 editor/bf15/voz.py <uploads> <carpeta_whisper con m_<id>.json>
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "essentials"))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
MEMOS = {"xmas": "d4fe0f34-The_Fit_Pilates_2_2", "ess": "08e473e2-Calle_Bosque_de_Pirules_4", "face": "6c806222-The_Face_Method_4", "sw": "a418732a-The_Fit_Pilates_3_2"}
FIX = {"Reset": "RE:SET", "Reset.": "RE:SET.", "Rised": "RE:SET", "buen": "Buen", "fin": "Fin", "fin.": "Fin.", "navidad": "Navidad", "navidad.": "Navidad.",
       "Botones,": "botones,", "B,": "V,", "off": "OFF", "soft": "Soft", "winter": "Winter", "color": "color,"}
CHAIN = ",".join(["highpass=f=80", "afftdn=nr=8:nf=-55:tn=1", "equalizer=f=250:t=q:w=1.0:g=-2", "equalizer=f=3000:t=q:w=1.3:g=1.5", "deesser=i=0.3",
                  "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89:level=false", "loudnorm=I=-16:TP=-1.5:LRA=7"])


def main():
    up, asr = Path(sys.argv[1]), Path(sys.argv[2])
    out = ROOT / "editor/video/public/bf15"
    words = {}
    for k, f in MEMOS.items():
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(up / f"{f}.m4a"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        y, runs = declip(np.frombuffer(raw, np.float32).copy())
        y = (y / (np.abs(y).max() * 1.05)).astype(np.float32)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", CHAIN, "-ar", str(SR), "-c:a", "pcm_s16le", str(out / f"m_{k}.wav")],
                       input=y.tobytes(), check=True)
        merged = []
        for w in json.load(open(asr / f"m_{k}.json"))["words"]:
            t = FIX.get(w["word"], w["word"])
            if t == "%" and merged:
                merged[-1]["w"] += "%"
                merged[-1]["e"] = w["end"]
                continue
            merged.append(dict(w=t, s=w["start"], e=w["end"]))
        words[k] = merged
        print(k, "picos reconstruidos:", runs)
    dst = ROOT / "editor/video/src/bf15"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(words, open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
