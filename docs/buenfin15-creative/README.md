# RE:SET Buen Fin 15% OFF — UGC creative edit (editorial kinetic typography)

Clips: IMG_4417, 4418, 4419, 4422, 4423 (Ilana, iPhone HLG HDR tone-mapped to SDR). References: two TikTok screen
recordings (big mixed sans/serif type, short word captions mid-frame, cream "video window" pages with a serif headline).
Full literal transcripts with word timecodes: `transcripts.json` (Whisper small, local).

## What Ilana says
- IMG_4417 0.00–3.58 — "Tres razones para comprar tu pijama este Buen Fin en RE:SET." (Whisper: "en receta")
- IMG_4418 0.00–4.45 — "Uno. Hay 15% de descuento en toda la nueva colección." (she holds a BUEN FIN 15% sign)
- IMG_4419 0.00–9.15 — "Razón 2. Todas las pijamas de fut(bol) las encuentras en outlet y tienen 25% de descuento, todas, en toda la colección."
- IMG_4422 0.30–4.45 — "Tres. Tenemos tallas para toda la familia. Hombre, mujer y niño."
- IMG_4423 0.00–2.85 — "…esto antes del rush de diciembre. Apúrate." (clip starts mid-sentence; Whisper heard "Ros" for "rush")

## Used (source in–out → timeline frames @30 fps)
| Voice | Source | Timeline |
|---|---|---|
| "Tres razones para comprar tu pijama este Buen Fin en RE:SET." | IMG_4417 0.00–3.62 | 0–109 |
| "Uno. Hay 15% de descuento en toda la nueva colección." | IMG_4418 0.00–4.50 | 112–247 |
| "Tenemos tallas para toda la familia. Hombre, mujer y niño." | IMG_4422 0.72–4.55 (spoken "Tres." trimmed) | 258–373 |
| "antes del rush de diciembre. ¡Apúrate!" | IMG_4423 0.32–2.90 | 380–457 |
Silent frames held still: IMG_4418 @4.75 s (reveal window), IMG_4419 @9.50 s (CTA, RE:SET wall).

## Not used, on purpose
- IMG_4419 audio: it is the football OUTLET 25% offer, which must not be mixed with Buen Fin 15%. Its "razón 2" is
  therefore dropped; tallas becomes Nº 2 and "antes del rush de diciembre" Nº 3 (on-screen labels only).
- The "esto" fragment at the start of IMG_4423.

Music: original, FluidSynth + FluidR3 GM soundfont (MIT) — `scripts/build-voicead-music.py src/buenfin15creative/buenfin15-creative.json playful`.
Sound design: two soft whooshes (window in, reveal) and two pops (numeral, ¡Apúrate!), synthesized in `build-voicead-media.py`.
