# RE:SET — "Soft Winter" · Meta Ads (Reels / Stories / feed vertical)

One narrative built from six original clips. The logo appears only at the end.

## Material analysis

| File | Length | Content | Audio | Used |
|---|---|---|---|---|
| IMG_8483 | 31.0 s | Creator talks to camera outside (0–9 s), then walks away from camera through the mall | Voice 0–9 s; 29.8–31 s is a truncated phrase | Hook 0.05–8.98 s |
| IMG_8484 | 5.0 s | Walks into the RE:SET store (storefront sign) | Ambience only | 0.45–3.85 s |
| IMG_8488 | 18.3 s | In store, presents the collection at the racks | Voice 1.1–16.8 s | 0.35–10.32, 11.38–13.36, 13.84–16.80 s |
| IMG_8490 | 8.7 s | Poses in the set, RE:SET wall | Near silence | 1.1–2.2, 4.3–5.3 s |
| IMG_8491 | 9.2 s | Poses in the set, RE:SET wall | Near silence | 2.1–3.2 s |
| IMG_8493 | 14.8 s | Poses in the set, RE:SET wall | Near silence | 2.0–3.3, 9.4–10.6 s |

Removed: 8483 walk-away section (20 s, no dialogue) and the truncated "y ahora sí aquí las…" (cut off by the end of the recording); in 8488 a 1.1 s silence and a 0.5 s pause; the 8483 exclamation after "Soft Winter" (unintelligible, so not subtitled or kept).

## Transcription (as used, in order)

1. "Si eres como yo, que te encanta estar en pijama, pero te es súper difícil encontrar un modelo que sea cómodo y bonito, tienes que conocer RE:SET y su nuevo modelo Soft Winter." *(IMG_8483)*
2. "Y bueno, de este lado, aquí están todos los modelos. Por favor, quiero que los vean. Y de verdad, no están dimensionando la calidad de esta nueva colección." *(IMG_8488)*
3. "¡Por favor, hay de niño!" *(IMG_8488; to confirm)*
4. "Pero bueno, no se preocupen, que yo me la voy a probar por ustedes." *(IMG_8488)*

To confirm by ear: "tienes que conocer" (sounds close to "te es que conocer"), "Y bueno" at the start of line 2, and "¡Por favor, hay de niño!" (it may contain "de niño" twice).

## Edit (output timeline, 34.9 s, 30 fps)

| Out | Shot | Audio | Why |
|---|---|---|---|
| 0.00–8.93 | 8483, direct to camera | Voice | Hook: the problem plus the brand promise in the first seconds |
| 8.93–12.33 | 8484, walking into the store | Ambience | Visual bridge: "tienes que conocer RE:SET", so we go there |
| 12.33–13.10 | 8488, walking to the racks | Ambience → J-cut into the voice | Continuity of movement |
| 13.10–17.33 | 8488, at the racks | Voice | "aquí están todos los modelos…" |
| 17.33–22.30 | 8488, closer framing (×1.12) | Voice | Change of framing between sentences, so no jump cut |
| 22.30–24.28 | 8488 | Voice | Authentic reaction: "¡Por favor, hay de niño!" |
| 24.28–27.24 | 8488, closer framing (×1.12) | Voice | "…yo me la voy a probar por ustedes" (hides the 0.5 s pause) |
| 27.24–32.94 | 8493 → 8490 → 8491 → 8493 → 8490 | Room tone | Payoff: we see her wearing it. Cuts on her turns and arm/hair movement |
| 32.67–34.94 | Logo card (dissolve 8 frames) | Fade out | Official logo on White U, fade in → 1.6 s hold → fade out |

## Colour

Measured on neutral pixels per clip. All sources are slightly warm (B/G ≈ 0.95), which is kept.
- 8483 (exterior, shade) was darker: gamma 0.90 and a slight lift.
- 8488 had a red cast from the pink store walls (R/G 1.032): red trimmed −2.2 %, gamma 0.93.
- The wall shots needed only a small contrast correction.
- No saturation boost. Light temporal denoise, then a Lanczos upscale with mild sharpening.

## Audio

- **Voice:** spectral noise reduction per clip (noise profile = quietest 12 % of that clip), then EQ (−2 dB @250 Hz, +2.5 dB @3.2 kHz, air), de-ess, compression and a limiter.
- **Levels:** both voices matched to the same level (measured −13.5 / −13.0 dB p90). Ambience at about −42 dB RMS.
- **Edits:** 12 ms fades on every edit.
- **Master:** −14.3 LUFS, peak −4 dBFS.
- **No music:** no commercially licensed track was available. 27.2–34.9 s (poses + logo) carries only room tone.

## Technical

- **Resolution:** the sources are **720×1280**; output is 1080×1920 (×1.5 Lanczos). This adds no real detail.
- **Master:** `out/RESET_SoftWinter_1080x1920.mp4`, H.264 High, CRF 17 (~13 Mbps), yuv420p BT.709, AAC 48 kHz 256 kb/s, 1048 frames, 0 black frames.
- **Delivery copy:** `..._envio.mp4`, 6.2 Mbps 2-pass, 28 MB.

## Rebuild

```bash
python3 scripts/build-softwinter-media.py /folder/with/IMG_84xx.MP4   # graded 1080x1920 intermediates + mix.wav
npx remotion render src/index.ts SoftWinter out/sw.mp4 --crf=16
```

The cuts, grade and subtitles live in `src/softwinter/edit.json`. To add music, mix it into `mix.wav`, or add an `<Audio>` in `SoftWinterAd.tsx`.
