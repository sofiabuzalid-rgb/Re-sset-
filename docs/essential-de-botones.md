# RE:SET — "Essential de Botones" · Meta Ads (Reels / Stories)

> **Update — studio voice-over.** The on-camera audio was replaced by the voice-over `The_Face_Method_4.m4a`.
> Script: *"Es una belleza esta pijama, es la Essential de Botones, tiene su cuello V, manga larga, jareta para que te acomode,
> el pantalón es abierto, esta pijama puede ser tuya por solo $999 pesos. ¿Qué esperas para llevarte la tuya?"*
> Phrase timings live in `src/essential/voiceover.json`; cuts, tags and subtitles are derived from them (`src/essential/timeline.ts`).
> Voice processing (`scripts/build-essential-voice.py`): noise profile learned from the file's silent tail → spectral noise reduction
> (max 18 dB, no artefacts) → EQ (−2 dB @250 Hz, +2.5 dB @3.2 kHz, air shelf) → de-ess → compression → post-expander → **−14 LUFS / −1 dBTP**.
> Measured: voice +8.5 dB louder, room tone between phrases −3.4 dB, voice-to-background separation 23 → 35 dB. Final length 16.2 s.
> The sections below describe the first cut (on-camera audio); the visual system and QC procedure are unchanged.

**Concept:** *Los detalles que importan.* The real narration drives the edit. Each feature is shown
up close and labelled at the moment it is said. The pajama is always the protagonist.

Source: `PIJAMA_VIDEO_EDITABLE.MOV`, the original iPhone clip: 1080×1920 (HEVC, rotated), 30 fps, 18.63 s, stereo audio.
Note: the clip received is **not** 512×910; it is the full-resolution original, and it is used as-is (no upscaling).

## 1. Transcription (verbatim, original order)

| Source time | Text |
|---|---|
| 0.00–2.05 | "(Es)ta pijama es la Essential de Botones." *(the first syllable is clipped in the original recording)* |
| 2.20–2.95 | "Es una belleza." |
| 3.00–4.65 | "Tiene su cuello en V," |
| 4.65–5.65 | "manga larga," |
| 5.65–7.05 | *(pause; the board is turned to show the pants)* |
| 7.10–8.70 | "jareta para que te acomode," |
| 8.90–10.00 | "el pantalón es abierto," |
| 10.00–11.90 | "que a mucha gente le gusta, el pantalón abierto," |
| 12.35–15.85 | "y esta pijama puede ser tuya por solo $999 pesos." |
| 16.05–18.05 | "¿Qué esperas para llevarte la tuya?" |

### Features mentioned → where they are visible

| Feature (verbatim) | Visible in source | Hand gesture |
|---|---|---|
| Cuello en V | 3.3–4.6 s, collar and lapels | points at the collar 3.5–4.0 s |
| Manga larga | 4.6–5.6 s, left sleeve | holds the cuff 4.9–5.6 s |
| Jareta | 7.0–8.6 s, waistband | points at the drawstring 7.0–8.2 s |
| Pantalón abierto | 8.5–10.5 s, leg | pulls the leg open 8.5–10.0 s |

Not mentioned, so **not labelled**: fabric/composition, colour name, sizes.
The price ($999) is spoken by the presenter. It appears **only in the subtitle**; no price graphic was added. Confirm it is current before running the ad.

## 2. Edit / storyboard (output, 30 fps, 15.9 s)

| Out | Source audio | Picture | On-screen |
|---|---|---|---|
| 0.00–0.77 | 2.20–2.97 "Es una belleza." | Full top, tight framing | Product title card *RE:SET · Essential de Botones* + subtitle |
| 0.77–2.83 | 0.00–2.05 "Esta pijama es la Essential de Botones." | Full top, slow push-in | title + subtitle |
| 2.83–4.50 | 3.00–4.65 "Tiene su cuello en V," | Push in to the collar (×1.6) as the hand points | frame + tag **Cuello en V** |
| 4.50–5.50 | 4.65–5.65 "manga larga," | Same take, glide down to the cuff | frame + tag **Manga larga** |
| 5.50–7.17 | 7.10–8.73 "jareta para que te acomode." | Hard cut to the pants, push in to the drawstring | frame + tag **Cintura con jareta** |
| 7.17–8.33 | 8.87–10.03 "El pantalón es abierto." | Whole leg, hands opening it | tag **Pantalón abierto** |
| 8.33–11.87 | 12.33–15.87 "Y esta pijama puede ser tuya por solo $999 pesos." | Full set (J-cut: picture from 13.7 s, slowed to 0.69×, to skip the board turning) | subtitle only |
| 11.87–13.90 | 16.03–18.07 "¿Qué esperas para llevarte la tuya?" | Full set continues | subtitle only |
| 13.90–15.90 | no voice | Full set, wider | End card: **RE:SET LOUNGEWEAR** + **Descubre la colección** |

Removed: the 1.4 s pause with the board turning, the repetition "que a mucha gente le gusta, el pantalón abierto", and a short pause before the closing question.

## 3. Visual system

- **Type:** Manrope (SemiBold 600) for everything; tabular sizes: subtitle 46 px, tag 36 px, title 56 px, kicker 24 px with 0.32em tracking.
- **Wordmark:** typeset in Oswald Light with 0.42em tracking to echo the logo printed on the bags. **Replace it with the official logo file when available.**
- **Colour:** ink `#1E1A17`, cream `#F5F1EB`, paper `#EFE9E1`, dark glass `rgba(24,20,18,.58)`. No gold, no gradients on text.
- **Focus frame:** 2 px cream rectangle, 6 px radius. It settles onto the detail in 9 frames and follows the camera move.
- **Tag:** dark glass, 1.5 px light border, 12 px radius, small square bullet. At most one tag on screen at a time.
- **Subtitles:** one line, white on a dark rounded plate, bottom edge at y = 1235 px.
- **Safe zones:** all text sits between y ≈ 290 and 1250 px and x ≥ 60 px, which is clear of the Reels/Stories UI.
- **Motion:** eased 6–12 frame fades/slides only. No 3D, no particles, no transitions other than cuts motivated by the movement.

## 4. Audio

- **Voice:** the original is kept. It is cut with 12 ms fades (no clicks), then gets an 85 Hz high-pass, light FFT noise reduction, gentle compression and two-pass loudnorm. Result: **−16 LUFS**, peak −4.5 dBFS.
- **Music:** **not included.** No commercially licensed track was available. The project has a ready slot:
  1. Put the licensed file in `public/audio/`, e.g. `public/audio/music.mp3`.
  2. Render with `npx remotion render src/index.ts EssentialDeBotones out/final.mp4 --props='{"musicSrc":"audio/music.mp3","musicUnderVoice":0.12,"musicInGaps":0.28}'`.

     The music is automatically ducked under the voice (≈ −18 dB) and comes up slightly on the end card.

## 5. Rebuild

```bash
python3 scripts/build-essential-media.py /path/to/PIJAMA_VIDEO_EDITABLE.MOV   # video intermediate + cleaned voice
npx remotion render src/index.ts EssentialDeBotones out/essential.mp4 --crf=16
ffmpeg -i out/essential.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -crf 16 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy -movflags +faststart out/RESET_Essential-de-Botones_1080x1920.mp4
```

The cut list lives in `src/essential/edit.json`. Camera moves, subtitles and tags are in `src/essential/timeline.ts`.
