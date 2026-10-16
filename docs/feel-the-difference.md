# RE:SET — "Feel the Difference" · Meta Ads (9:16)

32.5 s ad. It explains the material and the colours in the presenter's own voice. Composition `FeelTheDifference`.
Source: IMG_1533 in two parts: **b** (14.1 s, material close-ups) and **a** (19.1 s, colours on the rack). Both are 1080×1920 iPhone **HDR (HLG)**, tone-mapped to SDR BT.709.

## Transcript (faster-whisper small, corrected by hand; raw output in `src/feel/transcript.json`)

**Part b:** "¿Sabes qué? Esta tela es súper suavecita y tiene un terminado como con sensación de algodón. Esta tela es una maravilla porque aparte de ser atemporal, la puedes meter a la lavadora y a la secadora y no le…" *(the recording cuts off here)*

**Part a:** "…usando mi pijama desde hace 5 años con la misma tela. La tenemos en color Dune, en Petal, en Cacao, en color Lagoon, color Eucalipto, negro, gris y verde. ¿Qué esperas para venir por la tuya?"

- **Material**: no fabric name or composition is mentioned. Properties stated: *súper suavecita*, *terminado como con sensación de algodón*, *atemporal*, *la puedes meter a la lavadora y a la secadora*, and her *5 años con la misma tela*. Only these appear as claims.
- **Colours** (8): Dune, Petal, Cacao, Lagoon, Eucalipto, Negro, Gris, Verde. Each name was checked against the image: at the moment she says it, she is touching that garment.
  - ⚠ Spelling to confirm: she pronounces "dun", "pétal" and "lagún". I wrote the commercial names as **DUNE / PETAL / LAGOON**.
- Removed: "¿Sabes qué?", the truncated "y no le…" and a 0.65 s pause. The colour section is cut into word chunks, with each shot synced to its own audio. The 1.5 s pause after "Cacao" and the shorter pauses were removed.

## Structure

| Out | What | Text |
|---|---|---|
| 0–2.0 | Hand pressing the fabric, slow push-in, music only | **LA DIFERENCIA ESTÁ EN CÓMO SE SIENTE.** |
| 2.0–14.2 | Her voice explains the fabric over hands, close-ups and macro crops of the real garment | Claims 01–04 (only what she says) + subtitles |
| 14.2–18.2 | "…usando mi pijama desde hace 5 años con la misma tela." | Claim 05 |
| 18.2–27.8 | The colours, each garment while she names it | "DISPONIBLE EN 8 COLORES", a progress bar, chip with a swatch sampled from the garment + name + 01/08 |
| 27.8–29.9 | "¿Qué esperas para venir por la tuya?" | **¿CUÁL ES TU COLOR?** |
| 29.9–32.5 | Rack with every colour | ENCUENTRA TU + logo + 8 swatches + **DESCUBRE LA COLECCIÓN** |

## Picture and colour

HLG to SDR conversion: Hable tone-mapping without desaturation, gamma 1.12, contrast 1.03. No channel or saturation changes. Swatches are the median of a lit patch on each garment, taken from the tone-mapped frame.

## Audio

- **Voice**: spectral noise reduction per file, then 80 Hz high-pass, −2.5 dB @250 Hz, +2.5 dB @3.4 kHz, +1.5 dB @9 kHz, soft de-ess, 2.8:1 compression, limiter, and 15 ms fades on every cut.
- **Music**: an original instrumental (`scripts/build-feel-media.py`; no samples or third-party material), clean fashion pop at 120 BPM in A major. It is ducked −15 dB under the voice (−12 dB under the colours, so it lifts a little), with a soft tick on each colour and a resolve under the end card. Mix at −14.6 LUFS.
- To use a licensed track, add it in place of the synthesized `music` in the script. Ducking is applied automatically.

## Subtitles

Every spoken word is subtitled, with phrases of 2 lines max. Each word brightens as it is spoken. Key words (properties, colour names) are in Bold and brand lime. The subtitle sits in a dark pill at y≈1300 px, separate from the claims, which are top-left in caps.

## Rebuild

```bash
python3 scripts/build-feel-media.py <folder with a.mov (19.1 s) and b.mov (14.1 s)>
npx remotion render src/index.ts FeelTheDifference out/RESET_FeelTheDifference_1080x1920.mp4 --crf=16 --audio-codec=aac --audio-bitrate=256k
```
