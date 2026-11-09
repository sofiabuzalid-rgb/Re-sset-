"""RE:SET · Venta sorpresa Buen Fin (2 anuncios) — voz real de los clips (sonido directo) + palabras con tiempos.

Clips con frases útiles: 4127b (de pie frente a la mercancía), 4129/4130/4132/4134 (sentada en la cama rodeada de bolsas),
4137/4138 (acostada sobre las bolsas). 4135/4139/4131/4128/4127a: sin frase útil o incompleta. 4129 termina en un error
("Ven a Avenidas Team… no, no") y 4137 se corta a media frase: de ellos solo se usan frases completas.
Cadena por clip (completo, para mantener la sincronía con los labios): mono → reconstrucción de picos saturados
(editor/essentials/declip.py) → paso alto 85 Hz → reducción de ruido ligera → EQ suave → de-esser → compresión 2.5:1 →
limitador → −16 LUFS (iguala los clips).
Uso: python3 editor/sorpresa/voz.py <uploads> <carpeta_whisper>
"""
import glob, json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "essentials"))
from declip import declip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000
CLIPS = {"4127b": "c9264262-IMG_4127", "4129": "4305f9ee-IMG_4129", "4130": "9da13d4c-IMG_4130", "4134": "ff6b6e2c-IMG_4134", "4138": "ef1ae08c-IMG_4138"}
# what she says: Whisper's spelling fixed. 4138 3.5 s "Compilla/Con pillamos" = "Con pijamas" (re-checked in isolation);
# "Avenida Steam/Avenidas Team" = Avenida Stim (the store's street, verified in earlier campaigns)
FIX = {"Reset": "RE:SET", "reset": "RE:SET", "reset?": "RE:SET?", "Compilla": "Con", "más": "pijamas", "Steam": "Stim", "Avenidas": "Avenida",
       "Team": "Stim", "buen": "Buen", "fin": "Fin", "fin.": "Fin.", "Baja.": "baja.", "Correle": "Córrele", "avenida": "Avenida"}
CHAIN = ",".join(["highpass=f=85", "afftdn=nr=8:nf=-55:tn=1", "equalizer=f=250:t=q:w=1.0:g=-2.5", "equalizer=f=3000:t=q:w=1.3:g=2",
                  "deesser=i=0.3", "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89:level=false",
                  "loudnorm=I=-16:TP=-1.5:LRA=7"])


def main():
    up, asr = Path(sys.argv[1]), Path(sys.argv[2])
    out = ROOT / "editor/video/public/sorpresa"
    words = {}
    for c, f in CLIPS.items():
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(up / f"{f}.mov"), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, np.float32).copy()
        y, runs = declip(x)
        y = (y / (np.abs(y).max() * 1.05)).astype(np.float32)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", CHAIN, "-ar", str(SR), "-c:a", "pcm_s16le", str(out / f"v{c}.wav")],
                       input=y.tobytes(), check=True)
        ws = json.load(open(asr / f"a{c}.json"))["words"]
        merged = []
        for i, w in enumerate(ws):
            t = w["word"]
            if c == "4138" and t == "más" and i > 0 and ws[i - 1]["word"] == "Compilla":
                t = "pijamas"
            elif t == "más":
                t = "más"
            else:
                t = FIX.get(t, t)
            if t == "%" and merged:
                merged[-1]["w"] += "%"
                merged[-1]["e"] = w["end"]
                continue
            merged.append(dict(w=t, s=w["start"], e=w["end"]))
        if c == "4129" and merged and merged[0]["w"] == "Te":  # it's a question: "¿Te gustan las pijamas …?"
            merged[0]["w"] = "¿Te"
        words[c] = merged
        print(c, "picos reconstruidos:", runs)
    dst = ROOT / "editor/video/src/sorpresa"
    dst.mkdir(parents=True, exist_ok=True)
    json.dump(words, open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
