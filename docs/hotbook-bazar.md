# RE:SET — Customer testimonial "HOTBOOK BAZAR" (9:16, 19.0 s)

Composition `BazarFind`. Voice: customer recording `AUDIO-2026-10-17-17-00-25.m4a`, word for word as scripted (faster-whisper check).

| Out | Voice | Shot |
|---|---|---|
| 0.0–2.7 | Este fin de semana fui a HOTBOOK BAZAR | IMG_1783: crowd walking past the bazaar stands |
| 2.7–3.4 | y me encontré con | IMG_1795: the RE:SET shelves |
| 3.4–4.4 | RE:SET. | IMG_1792: the stand, RE:SET bags on the table |
| 4.4–5.9 | Me encantaron sus pijamas, | IMG_1810: her hands on the pajamas |
| 5.9–6.6 | los colores, | IMG_1800: lilac / navy close-up |
| 6.6–7.4 | los detalles | IMG_1792: RE:SET logo bags close |
| 7.4–9.0 | y lo cómodas que se ven. | IMG_1804: she holds a set (WOMAN XS) against her |
| 9.0–10.4 | Me llevé una | IMG_1801: the pink pajama being packed |
| 10.4–11.3 | y ahora entiendo perfecto por qué | IMG_1813: her pink RE:SET bag (WOMAN SMALL) |
| 11.3–12.0 | (pause) | IMG_1764: shelves |
| 12.0–13.6 | es de esas cosas que te hacen querer | IMG_1804: holding the bag |
| 13.6–15.6 | llegar a tu casa, bañarte | IMG_1813: walking off with the bag, looks back |
| 15.6–18.0 | y ponértela inmediatamente. | IMG_1802: soft pink fabric close-up (same pink set, packed at the stand; that one is a kids size) |
| 18.0–19.0 | — | End card: "Tu nueva parte favorita de llegar a casa." · RE:SET logo · @re.setmx |

Not used: IMG_1794 and parts of 1800/1792 (Grinch print, a licensed character), IMG_1798 and the start of 1801 (other brands' tees), the white-hoodie shopper in 1801 (not the customer).
There is no shot of the customer herself walking through the bazaar, so the opening uses the bazaar crowd (IMG_1783).

Picture: HLG tone-mapped to SDR BT.709 without desaturation, +1.5 % warmth, faint warm vignette. Audio: noise reduction, EQ and soft compression on her voice, plus an original cozy lo-fi track (no samples) ducked −14 dB under it. −14.2 LUFS.

Rebuild: `python3 scripts/build-bazar-media.py <folder with the .mov files and vo.m4a>` then `npx remotion render src/index.ts BazarFind out/RESET_HotbookBazar_1080x1920.mp4 --crf=16 --audio-codec=aac --audio-bitrate=256k`
