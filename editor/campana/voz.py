"""RE:SET — campaña de 4 Meta Ads: pista de voz + tiempos de palabra para cada anuncio.

Solo su voz real (clips de RESET HOY). Cada pieza se localiza por texto en las palabras de Whisper, se corta en silencios
naturales (nunca a media palabra) y no se altera tono ni velocidad. Cadena de audio:
  por clip completo: paso alto 80 Hz → RNNoise (modelo de voz, 88 % húmedo) → FFT ligero para el siseo residual
  por pieza: nivelación por RMS de voz, fundidos de 15 ms
  mezcla: EQ correctiva (−3 dB 250 Hz, +2.5 dB 3.5 kHz, aire 9 kHz) → de-esser → compresión 2.5:1 → limitador → −14 LUFS

Uso: python3 editor/campana/voz.py <familia|casa|favorita|viaje>
Escribe editor/video/public/campana/<ad>/voice.wav (+ ambient.wav si hay sonido real de escena) y editor/video/src/campana/<ad>/timing.json
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
SRC = ROOT / "library/cache/resethoy"
ASR = ROOT / "library/resethoy_asr"
RNN = HERE / "rnnoise_speech.rnnn"  # RNNoise, modelo "sh" de richardpl/arnndn-models
FPS, SR = 30, 48000

# grafía: lo que Whisper escribe mal y un segundo reconocedor (Sherpa) o la marca confirman
FIX = {"AirBizit": "RE:SET", "Reiset": "RE:SET", "reset": "RE:SET", "reset.": "RE:SET.", "venza": "dense", "piama": "pijama", "piyamas": "pijamas",
       "piamas": "pijamas", "navidad.": "Navidad.", "navidad,": "Navidad,", "navidad": "Navidad", "Steam,": "Stim,", "Steam": "Stim", "Stim.": "Stim.",
       "Estás": "Está", "super": "súper", "Peri": "Peri", "Perísur": "Perisur"}

# piezas: ("t", clip, primeras palabras, últimas palabras) | ("m", clip, ini, fin, [(palabra, ini, fin)]) | ("gap", seg) | ("amb", clip, ini, fin, ganancia)
SPECS = {
    "familia": dict(
        pieces=[
            ("t", "8946", "Imagínate que", "tu familia."),   # Imagínate que lo puedes combinar con toda tu familia.
            ("t", "8944", "Por favor", "de AirBizit"),       # Por favor quiero que vean estas pijamas de RE:SET
            ("t", "8946", "Tú te", "esta Navidad."),         # Tú te pones esta, … y todos van a estar matching y súper cómodos esta Navidad.
            ("t", "8949", "Así que", "las mías."),           # Así que en serio, si todavía no saben qué regalar esta Navidad, dense una vuelta por RE:SET porque yo ya tengo las mías.
        ],
        end=4.2,
    ),
    "casa": dict(
        pieces=[
            ("amb", "9039", 0.0, 4.2, 0.5),                  # sonido real: páginas del libro (apertura sin voz, hook gráfico)
            ("t", "8947", "Aparte lo", "súper cómoda."),     # Aparte lo padre es que a pesar de que tenga el estampado de Navidad, no es la típica pijama … súper cómoda.
            ("t", "9015", "hay dos", "ya mismo."),           # hay dos sucursales para que las puedas adquirir ya mismo.
            ("t", "9015", "Hay una", "ya mismo."),           # Hay una en Perisur y otra en Avenida Stim, así que ve por ellas ya mismo.
        ],
        end=4.0,
    ),
    "favorita": dict(
        pieces=[
            ("t", "9047", "por favor", "que está"),          # Por favor vean este modelo de pijama, está súper padre, el color está increíble y aparte no saben la calidad y lo cómodo que está.
            ("t", "9048", "Aparte es", "verde militar."),    # Aparte es el color de la temporada, verde militar.
            ("m", "9049", 0.70, 1.36, [("¿Qué", 0.78, 0.92), ("opina?", 0.92, 1.15)]),  # Whisper no fecha 9049; tiempos por envolvente + Sherpa
            ("gap", 0.8),
            ("t", "9054", "Tiene que", "y Perisur."),        # Tiene que correr al RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur.
        ],
        commas={(0, "pijama"), (0, "padre"), (0, "increíble"), (1, "temporada")},
        end=4.2,
    ),
    "viaje": dict(
        pieces=[
            ("t", "8974", "Estás super", "tú quieras."),     # Está súper cómoda y súper práctica para que la puedas llevar en cualquier parte cuando te vayas de viaje, en tu maleta, en tu bolsa de mano, donde tú quieras.
            ("t", "8982", "literales de", "todo junto."),    # literales de esas cosas que te llevas para todos lados porque ya tienes todo junto.
            ("gap", 0.9),                                     # she walks out with the suitcase…
            ("t", "8987", "es broma", "estoy amando"),       # Es broma, no me fui, pero nada, les quería decir que esta pijama es de RE:SET y tienen que correr por la suya porque yo la estoy amando.
        ],
        end=3.8,
    ),
}


def load(n, clean=True):
    af = f"highpass=f=80,arnndn=m={RNN}:mix=0.88,afftdn=nr=8:nf=-40:tn=1" if clean else "highpass=f=60"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC / f"IMG_{n}.MP4", "-ac", "1", "-af", af, "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def env_db(x, hop=0.01):
    h = int(SR * hop)
    n = len(x) // h
    return 20 * np.log10(np.sqrt((x[: n * h].reshape(n, h) ** 2).mean(1) + 1e-12))


def find(ws, phrase, last=False, start=0):
    toks = phrase.split()
    hits = [i for i in range(start, len(ws) - len(toks) + 1) if [w["word"] for w in ws[i : i + len(toks)]] == toks]
    assert hits, phrase
    return hits[0] + (len(toks) - 1 if last else 0)


def fade(seg, ms=15):
    f = int(ms / 1000 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f:] *= np.linspace(1, 0, f)
    return seg


def level(seg, target=0.08):
    v = seg[np.abs(seg) > 0.004]
    return seg / (np.sqrt(np.mean(v**2)) + 1e-9) * target if len(v) else seg


def speech_piece(n, pa, pb):
    """locate by text, cut in the silence just before / after, shrink dead air > 0.4 s inside the phrase"""
    ws = json.load(open(ASR / f"IMG_{n}.json"))["words"]
    a = find(ws, pa)
    b = find(ws, pb, last=True, start=a)
    x = load(n)
    db = env_db(x)
    sel = ws[a : b + 1]
    speech = np.percentile(db[int(sel[0]["start"] * 100) : int(sel[-1]["end"] * 100)], 90)
    thr = speech - 30
    prev_end = ws[a - 1]["end"] if a > 0 else 0.0
    nxt_start = ws[b + 1]["start"] if b + 1 < len(ws) else len(x) / SR
    i = int(sel[0]["start"] * 100)
    while i > int(prev_end * 100) + 3 and db[i - 1] > thr:
        i -= 1
    s0 = max(prev_end + 0.03, i / 100 - 0.08)
    j = int(min(sel[-1]["end"] + 0.25, nxt_start - 0.05) * 100)
    while j > int(sel[-1]["start"] * 100) and db[j] < thr:
        j -= 1
    e0 = min(j / 100 + 0.14, nxt_start - 0.04)
    s0, e0 = round(s0 * FPS) / FPS, int(e0 * FPS) / FPS
    keep, cur, q = [], s0, int(s0 * 100)
    while q < int(e0 * 100):
        if db[q] < thr:
            r = q
            while r < int(e0 * 100) and db[r] < thr:
                r += 1
            if (r - q) / 100 > 0.4 and q / 100 > s0 + 0.1 and r / 100 < e0 - 0.1:
                keep.append((cur, q / 100 + 0.1))
                cur = r / 100 - 0.1
            q = r
        else:
            q += 1
    keep.append((cur, e0))
    seg = np.concatenate([fade(x[int(u0 * SR) : int(u1 * SR)].copy(), 8) for u0, u1 in keep])

    def warp(tt):
        acc = 0.0
        for u0, u1 in keep:
            if tt < u0:
                return acc
            if tt <= u1:
                return acc + tt - u0
            acc += u1 - u0
        return acc

    words = [(w["word"], warp(max(w["start"], s0)), warp(min(w["end"], e0))) for w in sel]
    return fade(level(seg)), words, s0, keep


def build(ad):
    spec = SPECS[ad]
    voice, amb, words, starts, srcs, t = [], [], [], [], [], 0.0
    for k, p in enumerate(spec["pieces"]):
        starts.append(round(t, 3))
        if p[0] == "gap":
            seg = np.zeros(int(p[1] * SR), np.float32)
            voice.append(seg); amb.append(seg.copy()); srcs.append(None)
        elif p[0] == "amb":  # real scene sound, kept on its own track (mixed under the voice, never over it)
            _, n, a, b, g = p
            x = load(n, clean=False)[int(a * SR) : int(b * SR)]
            seg = fade(level(x, 0.02) * g, 120)
            amb.append(seg); voice.append(np.zeros_like(seg)); srcs.append(a)
        elif p[0] == "m":
            _, n, a, b, ws = p
            seg = fade(level(load(n)[int(a * SR) : int(b * SR)]), 20)
            voice.append(seg); amb.append(np.zeros_like(seg)); srcs.append(a)
            words += [dict(w=txt, s=round(t + s - a, 3), e=round(t + e - a, 3), piece=k) for txt, s, e in ws]
        else:
            _, n, pa, pb = p
            seg, ws, s0, keep = speech_piece(n, pa, pb)
            voice.append(seg); amb.append(np.zeros_like(seg)); srcs.append(round(s0, 3))
            words += [dict(w=FIX.get(txt, txt), s=round(t + s, 3), e=round(t + e, 3), piece=k) for txt, s, e in ws]
            cuts = [(round(a_, 2), round(b_, 2)) for a_, b_ in zip([q[1] for q in keep[:-1]], [q[0] for q in keep[1:]])]
            print(f"P{k} IMG_{n} {s0:.2f}-{keep[-1][1]:.2f} cortes={cuts} → {t:.2f}-{t + len(seg) / SR:.2f}")
        t += len(seg) / SR

    # literal corrections confirmed by the second recogniser
    W = words
    for i in range(len(W) - 2):
        if [w["w"] for w in W[i : i + 3]] == ["a", "partir", "de"]:  # "aparte" (Sherpa)
            W[i : i + 3] = [{**W[i], "w": "aparte", "e": W[i + 2]["e"]}]
            break
    for i in range(len(W) - 1):
        if W[i]["w"] == "el" and W[i + 1]["w"] == "RE:SET" and ad == "favorita":
            W[i]["w"] = "al"  # Sherpa: "correr al reset"
        if W[i]["w"] == "en" and W[i + 1]["w"] == "Avenida" and ad == "favorita":
            W.insert(i + 1, {**W[i + 1], "w": "la", "s": round(W[i + 1]["s"] - 0.08, 3), "e": W[i + 1]["s"]})
        if W[i]["w"] == "que" and W[i + 1]["w"].startswith("regalar"):
            W[i]["w"] = "qué"
        if W[i]["w"] == "si" and W[i + 1]["w"] == "o":
            W[i]["w"] = "sí"
    if ad == "viaje":  # 8987: both recognisers "Es broma, no me fui, pero nada [n]os quería decirles que esta pijama …"; her other takes (8986, 8988) say "nos"
        k87 = [k for k, p in enumerate(spec["pieces"]) if p[1] == "8987"][0]
        for w in W:
            if w["piece"] == k87:
                w["w"] = {"este": "esta", "os": "nos", "broma": "broma,", "fui": "fui,", "nada": "nada,"}.get(w["w"], w["w"])
    for i, w in enumerate(W):  # 8982: "literales de" (Whisper, Sherpa) / "literal es esas" (Whisper, band-limited): she says "Literal, es de esas…"
        if w["w"].lower() == "literales" and ad == "viaje":
            mid = round((w["s"] + w["e"]) / 2, 3)
            W[i : i + 1] = [{**w, "w": "Literal,", "e": mid}, {**w, "w": "es", "s": mid}]
            break
    for i in range(len(W) - 1):  # "Peri" "Sur" → "Perisur"
        if W[i]["w"] == "Peri" and W[i + 1]["w"].startswith("Sur"):
            W[i : i + 2] = [{**W[i], "w": "Perisur", "e": W[i + 1]["e"]}]
            break
    for w in W:
        if (w["piece"], w["w"]) in spec.get("commas", set()):
            w["w"] += ","
    for i, w in enumerate(W):  # every piece ends a sentence
        if (i + 1 == len(W) or W[i + 1]["piece"] != w["piece"]) and w["w"][-1] not in ".,?":
            w["w"] += "."
    # sentence case per piece, punctuation-driven breaks for subtitles
    seen = set()
    for w in W:
        if w["piece"] not in seen:
            seen.add(w["piece"])
            w["w"] = w["w"][0].upper() + w["w"][1:] if w["w"][0] != "¿" else w["w"]
        w["br"] = w["w"][-1] in ".,?"

    out = ROOT / "editor/video/public/campana" / ad
    out.mkdir(parents=True, exist_ok=True)
    total = t + spec["end"]
    v = np.concatenate(voice + [np.zeros(int(spec["end"] * SR), np.float32)])
    chain = ",".join([
        "highpass=f=95", "equalizer=f=250:t=q:w=1.1:g=-3", "equalizer=f=3500:t=q:w=1.3:g=2.5", "highshelf=f=9000:g=1.5", "lowpass=f=15000",
        "deesser=i=0.35", "acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=2", "acompressor=threshold=-12dB:ratio=6:attack=2:release=60",
        "loudnorm=I=-14:TP=-1.5:LRA=6",
    ])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", chain, "-ar", "48000", "-ac", "2", out / "voice.wav"], input=v.astype(np.float32).tobytes(), check=True)
    has_amb = any(p[0] == "amb" for p in spec["pieces"])
    if has_amb:
        a = np.concatenate(amb + [np.zeros(int(spec["end"] * SR), np.float32)])
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "highpass=f=120,lowpass=f=12000,afftdn=nr=10:nf=-45", "-ar", "48000", "-ac", "2", out / "ambient.wav"], input=a.astype(np.float32).tobytes(), check=True)
    tj = ROOT / "editor/video/src/campana" / ad / "timing.json"
    tj.parent.mkdir(parents=True, exist_ok=True)
    voice_end = max(w["e"] for w in W) + 0.25
    json.dump(dict(fps=FPS, total=int(round(total * FPS)), pieceStarts=starts, pieceSrc=srcs, voiceEnd=round(t, 3), lastWord=round(voice_end, 3), ambient=has_amb, words=W),
              open(tj, "w"), indent=1, ensure_ascii=False)
    print(f"{ad}: {total:.2f} s · {' '.join(w['w'] for w in W)}")


if __name__ == "__main__":
    for ad in sys.argv[1:] or SPECS:
        build(ad)
