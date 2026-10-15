# RE:SET — Mini Lookbook (Reel / ads, 9:16)

The 43 s fitting-room clip (`v1c044g50000db8itv7og65rqs0jimkg.mp4`, 576×1024, 30 fps) cut down to a **14.5 s** editorial Reel. Model in the sage loungewear set in front of the pink curtain.

## Edit (output timeline, 30 fps, every cut on a beat at 120 BPM)

| Out | Source | Shot | Section |
|---|---|---|---|
| 0.0–2.0 | 0.95–2.95 | Steps out smiling to camera, turn + hair flip. Full set from frame 1 | Hook: **YOUR EVERYDAY RE:SET** |
| 2.0–3.5 | 5.10–6.60 | Hand in hair, smile, settles the hem | Product |
| 3.5–5.0 | 31.00–32.50 | Adjusts the top, looks up smiling | Product |
| 5.0–7.0 | 35.40–37.40 | Front, to camera, hands in pockets | Product |
| 7.0–8.0 | 6.90–7.90 | Side view, glance over the shoulder | Movement |
| 8.0–9.0 | 23.20–24.20 | Back view | Movement |
| 9.0–10.5 | 12.45–13.95 | Steps out smiling, spins: the fabric moves and falls | Movement |
| 10.5–13.0 | 40.83–43.33 | Walks out, hair flip, ends facing camera | Close |
| 13.0–14.5 | last frame held (slow push) | Official white logo + **TIME TO BE YOU** | Close |

Removed: curtain-only frames (10.4–11.6 s is a white-out on the curtain), the slow parts of the repeated entrances (each kept entrance is cut to its best second), looking down while adjusting (17.9–22 s, 28–31 s), repeated hair flips, the walk-offs behind the curtain.

## Picture

One grade for all shots (exposure is consistent across the clip): warm cast trimmed slightly (R ×0.97, B ×1.035), contrast 1.06, small lift, saturation 0.97 so skin and the set keep their real colour. Light temporal denoise, Lanczos upscale ×1.875 to 1080×1920 with mild sharpening. No stabilisation (handheld movement is natural and minor). No AI detail. The upscale adds no native detail.

Finishing: 2.5 % push-in per shot and a faint vignette. Plain cuts only.

## Type and brand

- Montserrat as the stand-in for **Gotham** (commercial). Add licensed Gotham files and `Gotham` is first in the font stack.
- Official logo: `public/brand/reset-logo-white.png`.
- Two texts only, both at the top (y 268–520 px, clear of the Instagram UI and of the face).

## Audio

The original audio (background noise and handling, no dialogue) is removed entirely. No subtitles.
Music is an **original** instrumental synthesised in `scripts/build-lookbook-media.py` (no samples, no third-party material), so it is safe for paid ads: soft fashion pop, 120 BPM, F major (Fmaj7–Am7–Dm7–Bbmaj7), electric piano, sub bass, kick/snap/shaker, which enter fully at 2.0 s. A pluck line enters at 7.0 s, and it resolves on Fmaj9 at 13.0 s under the logo. −14 LUFS.
To use a licensed track instead, replace `public/lookbook/music.wav` (14.5 s, beat grid starting at 0.0 s, 120 BPM).

## Rebuild

```bash
python3 scripts/build-lookbook-media.py /path/to/v1c044g50000db8itv7og65rqs0jimkg.mp4   # graded shots + music
npx remotion render src/index.ts MiniLookbook out/RESET_MiniLookbook_1080x1920.mp4 --crf=16 --audio-codec=aac --audio-bitrate=256k
```
