"""RE:SET · OUTLET 25% OFF (4 anuncios) — voz real de los clips (sonido directo de la cámara) + palabras con tiempos.

Solo 4099/4100/4101/4105 tienen diálogo útil (4087 tiene de fondo una conversación privada: no se usa; los demás solo ambiente).
4099 es una toma fallida de 4100 ("No, ya otra vez"): de 4099 solo se usa la primera frase (AD02).
Cadena por clip (completo, para que el audio y los labios sigan sincronizados): mezcla a mono → paso alto 85 Hz → reducción de ruido
ligera (FFT) → EQ suave (−2.5 dB 250 Hz, +2 dB 3 kHz) → de-esser → compresión 2.5:1 → limitador → −16 LUFS (iguala los clips).
Uso: python3 editor/outlet25/voz.py <carpeta_de_uploads>
Escribe editor/video/public/outlet25/v<clip>.wav y editor/video/src/outlet25/voz.json ({clip: [{w, s, e}]} en segundos del clip).
"""
import glob, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASR = Path(sys.argv[2]) if len(sys.argv) > 2 else None
CLIPS = ["4099", "4100", "4101", "4105"]
# what she says (Whisper's spelling fixed; "Pilla" at 4105 0.72 s is "Pijamas" said fast, in context)
FIX = {"Reset": "RE:SET", "villamas": "pijamas", "Pilla": "Pijamas", "Outlet": "outlet", "%": "%"}
CHAIN = ",".join([
    "pan=mono|c0=0.5*c0+0.5*c1", "highpass=f=85", "afftdn=nr=10:nf=-55:tn=1",
    "equalizer=f=250:t=q:w=1.0:g=-2.5", "equalizer=f=3000:t=q:w=1.3:g=2", "deesser=i=0.3",
    "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=2", "alimiter=limit=0.89:level=false",
    "loudnorm=I=-16:TP=-1.5:LRA=7",
])


def main():
    up = Path(sys.argv[1])
    out = ROOT / "editor/video/public/outlet25"
    words = {}
    for c in CLIPS:
        src = glob.glob(str(up / f"*IMG_{c}.mov"))[0]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-af", CHAIN, "-ar", "48000", "-c:a", "pcm_s16le", str(out / f"v{c}.wav")], check=True)
        if ASR:
            ws = json.load(open(ASR / f"a{c}.json"))["words"]
            merged = []
            for w in ws:
                t = FIX.get(w["word"], w["word"])
                if t == "%" and merged:
                    merged[-1]["w"] += "%"
                    merged[-1]["e"] = w["end"]
                    continue
                merged.append(dict(w=t, s=w["start"], e=w["end"]))
            words[c] = merged
        print("voz", c)
    if ASR:
        dst = ROOT / "editor/video/src/outlet25"
        dst.mkdir(parents=True, exist_ok=True)
        json.dump(words, open(dst / "voz.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
