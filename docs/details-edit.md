# RE:SET — "The Details Edit" (9:16, 44.8 s)

Product breakdown driven by the creator's voice-over (`AUDIO-2026-10-16-15-53-31.m4a`, 44.1 s; it replaces the earlier recordings entirely). Composition `DetailsEdit`.
Every shot starts on a word of the voice (`edit.json` → `"at": "fíjate#1"`), so the picture shows what the voice names.

## Material

| File | Product | What it documents | Used |
|---|---|---|---|
| IMG_1688 (18.8 s) | Cacao (brown) set, **short sleeve** + long pants | Notch collar, front buttons, placket macro (9–11 s), shirt lifted (7–8 s), pants elastic waist + leg swing (12–16 s), hem with piping (16–18 s) | Yes |
| IMG_1690 (20.8 s) | Olive set, laid flat on terrazzo | Buttons macro + finger (1–5 s), piping along the placket (5–6 s), sleeve (7–9 s), notch collar (10–12, 17–18 s), **RE:SET print inside the neck** (18–20 s) | Yes |
| IMG_1694 (18.3 s) | Pink set, **long sleeve** + long pants | Collar, buttons, shirt front lifted and released (3–6 s), sleeve (7–10 s), pants (12–16 s) | Yes |
| IMG_1695 (4.0 s) | Pink set + **RE:SET bag "WOMAN XS"** | Set with its bag | Yes |
| IMG_1699 (0.27 s) | — | 8 frames: **not usable** | No |
| IMG_1700 (22.3 s) | Blue set, **long sleeve** + long pants with **drawstring** | Sleeve lifted (1–3 s), placket handled (5–12 s), collar, pants + drawstring + leg swing (14–21 s) | Yes |
| IMG_1687 (7.3 s) | Pink / beige short-sleeve tops with **ruched** shoulders, blue top | Cuffed short sleeve, ruching | Yes |
| IMG_1533 (part b) | Beige top with ruched sleeve | Ruched sleeve | Yes (design detail, colour) |
| IMG_1701 | — | **Not received** | — |

All sources are iPhone HDR (HLG). They are tone-mapped to SDR BT.709 (Hable, no desaturation, gamma 1.12), with no channel or saturation changes.

## Transcript (exact; faster-whisper small, checked word by word with a second pass)

"Hay detalles en una pijama que a veces no notas hasta que ya la ves de cerca. Por ejemplo, fíjate en el cuello. Tiene esta abertura con solapas que le da un estilo mucho más arreglado. La parte de enfrente lleva botones y me encanta cómo se ve la caída de la tela. También tenemos en diferentes versiones, por ejemplo, manga corta, manga larga y con distintos cortes de pantalón para que puedas elegir el conjunto que más te guste. Y algo que quiero enseñarte es esto. Los acabados, los botones, las mangas y cada pequeño detalle del diseño, porque una pijama no solamente se trata del estampado, del color, sino también importa muchísimo cómo está hecha y cómo te queda. Así que, ¿cuál de estos conjuntos es más tu estilo? Descubre tu favorito en RE:SET."

- Fixed from context (the model misheard): "sus lapas" → **solapas**, "ya ha" → **lleva**, "callada" → **caída**.
- Kept because both passes hear them, although the script doesn't have them: "hasta que **ya** la ves de cerca" and "tenemos **en** diferentes versiones".

Only pauses between sentences were shortened, to 0.3 s. No words were cut.

## Word → picture

| Voice | Shot |
|---|---|
| Hay detalles en una pijama / que a veces no notas | Cacao set (general) → pink set (general) |
| hasta la ves de cerca | Button macro, olive |
| Por ejemplo, fíjate en el cuello | Hand on the cacao collar |
| abertura / con solapas / estilo / arreglado | Match cut between collars: olive → pink → blue → olive · **CUELLO CON SOLAPAS** |
| La parte de enfrente lleva botones | Cacao placket macro → finger on olive buttons · **BOTONES FRONTALES** |
| me encanta cómo se ve / la caída de la tela | Blue placket → pink shirt front lifted and released → cacao pant leg swinging · **LA CAÍDA DE LA TELA** |
| manga corta, manga larga | Cacao short sleeve → split screen **MANGA CORTA / MANGA LARGA** (cacao / blue) |
| distintos cortes de pantalón / para que puedas elegir | Cacao pants → blue pants with drawstring → pink pants (full length) |
| el conjunto que más te guste | Pink set with its RE:SET bag |
| Y algo que quiero enseñarte es esto | RE:SET print inside the neck |
| los acabados, los botones, las mangas | Placket piping → cacao buttons → cuffed sleeve · **LOS ACABADOS** |
| cada pequeño detalle del diseño | Ruched shoulder → ruched sleeve · **DETALLES DEL DISEÑO** |
| porque una pijama | Pant hem with piping |
| no solamente se trata del estampado, del color | Colour run: cacao, pink, blue, olive, beige (no names, since the voice names none) |
| cómo está hecha | Hand over placket and buttons |
| y cómo te queda | Blue set, buttoned. **There is no worn footage**, so this is a general product shot. A worn shot is needed to really show the fit. |
| ¿Cuál de estos conjuntos es más tu estilo? | Three full sets side by side · **¿CUÁL ES MÁS TU ESTILO?** |
| Descubre tu favorito en RE:SET. | Pink set behind DESCUBRE TU + logo + *Your RE:SET, your way.* |

The pants all look full length in the footage. "Distintos cortes" is shown as three different pants (wide cuffed, drawstring, elastic). No pant length is labelled.

## Audio

- **Voice**: spectral noise reduction, then 80 Hz HP, −2.5 dB @250 Hz, +2 dB @3.4 kHz, +1.5 dB @9 kHz, de-ess, 2.6:1 compression, limiter, and 20 ms fades.
- **Music**: an original instrumental (no samples or third-party material, OK for ads), chic editorial pop at 112 BPM in D major, ducked −15 dB under the voice, with a resolve under the logo. Mix at −14.5 LUFS.

## Type

Labels: Bebas Neue (logotype face). Subtitles and copy: Montserrat in place of Gotham. One serif line in Playfair Display Italic in place of Miller Text (not in the repo). Subtitles are in a dark pill at y≈1310 px. Labels are top-left in caps with a lime rule.

## Rebuild

```bash
python3 scripts/build-details-media.py <folder with 1687/1688/1690/1694/1695/1700/1533.mov and vo3.m4a>   # unchanged shots are cached
npx remotion render src/index.ts DetailsEdit out/RESET_TheDetailsEdit_1080x1920.mp4 --crf=16 --audio-codec=aac --audio-bitrate=256k
```
