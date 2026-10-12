# RE:SET — Christmas Reel 🎄

A Christmas promo video for **RE:SET**, a pajama and loungewear brand. It's a 32-second vertical Reel (1080×1920, 30 fps) for Instagram Reels and TikTok, built with **React + [Remotion](https://www.remotion.dev/)**.

It uses real product footage: pajama sets folded into matching drawstring gift bags, then unwrapped. On top of that it adds beat-synced transitions, animated snowfall, festive effects and a synthesized holiday soundtrack.

## Quick start

```bash
npm install
npm run dev        # open Remotion Studio to preview and tweak
npm run build      # render → out/reset-christmas-reel.mp4
npm run still      # render a poster frame → out/poster.png
npm run audio      # (optional) regenerate the soundtrack, needs python3 + numpy
```

## Storyboard

Timing: 120 BPM, so 1 beat = 15 frames. Every scene length is a whole number of beats and every transition is exactly one beat, so **every cut lands on the music**.

| #  | Time   | Footage                             | On-screen copy (Spanish)                                   | Transition in        |
|----|--------|-------------------------------------|--------------------------------------------------|----------------------|
| 1  | 0.0 s  | Red Fair Isle set in its gift bag    | *Navidad Acogedora* · **RE:SET** · COLECCIÓN NAVIDEÑA | Cream flash          |
| 2  | 3.5 s  | Green gingerbread bag, tying the bow | *Esta Navidad* · **La comodidad viene de regalo** | Gift-ribbon sweep    |
| 3  | 6.0 s  | Green set unwrapped & unfolded       | *desata el lazo* · **Desenvuelve pura comodidad**       | Whip zoom            |
| 4  | 10.5 s | White holiday-print set reveal       | *estampados festivos* · **Para mañanas sin prisa** | Slide              |
| 5  | 14.5 s | Striped teddy pants being folded     | *dóblalo* · **Ropa de casa suave y cómoda**            | Clock wipe           |
| 6  | 17.0 s | Striped set packed into its bag      | *y guárdalo* · **Cada set en su bolsa de regalo**  | Whip zoom            |
| 7  | 19.5 s | Green tree-print top                 | *noches acogedoras* · **En casa, junto al árbol**        | Diagonal wipe        |
| 8  | 22.5 s | Gift-bag lineup                      | *el regalo* · **que sí van a usar**           | Gift-ribbon sweep    |
| 9  | 27.0 s | End card                             | *Feliz Navidad de* · **RE:SET** · PIJAMAS Y ROPA DE CASA · COMPRA LA COLECCIÓN · link en la bio | Golden bloom |

## Effects

- **Snowfall**: about 125 flakes in 3 depth layers (far, mid, foreground bokeh) that sway as they fall. It's deterministic, so every render is identical.
- **Bokeh fairy lights**: warm out-of-focus glows that drift and twinkle.
- **Twinkle stars**: 4-point sparkles around the logo and captions.
- **Fairy-light garland** on the end card, with chasing bulbs.
- **Ken Burns** push-in/pull-out on every clip, plus a warm candle-light color grade, vignette and film grain.
- **Custom transitions**: a red/green striped *gift ribbon* sweep, a *whip zoom* and a *golden bloom* dissolve. These are combined with Remotion's slide, wipe and clock-wipe.
- **Kinetic type**: the script line floats in, then the headline words pop in one per eighth note.

## Audio

`scripts/generate-audio.py` synthesizes all the audio from scratch with numpy, so there are no licensing issues:

- `jingle.wav`: the *Jingle Bells* chorus (public domain, J. L. Pierpont, 1857). Glockenspiel and electric-piano melody, pad chords, bass, sleigh bells, kick and claps, at 120 BPM.
- `whoosh.wav`: placed under every transition.
- `sparkle.wav`: a chime under each logo reveal.

To use a licensed music track instead, drop it in `public/audio/` and change the `<Audio>` source in `src/ChristmasReel.tsx`. If its tempo isn't 120 BPM, also change `BEAT` in `src/timeline.ts` so the cuts stay on the beat.

## Project layout

```
public/clips/         product footage (H.264, 1080×1920, trimmed from the iPhone .mov originals)
public/audio/         generated soundtrack + SFX
public/fonts/         Great Vibes, Playfair Display, Montserrat (SIL OFL, bundled for offline renders)
scripts/              audio synthesis
src/timeline.ts       ← edit scenes, trims, speeds, captions and transitions here
src/ChristmasReel.tsx main composition: TransitionSeries + global effect layers + audio
src/components/       Footage, Caption, Logo, Intro, EndCard, Snowfall, Bokeh, Sparkle, Garland, Overlays
src/transitions/      custom ribbon / whip / sparkleFade presentations
```

## Editing tips

- **Change copy**: edit the `caption` fields in `src/timeline.ts`. Use `\n` for a line break.
- **Change pacing**: change `durationInFrames` (keep it a multiple of `BEAT`), `from` (the start offset in seconds) and `playbackRate`.
- **Reorder scenes**: reorder the `scenes` array. Each scene's `enter` sets the transition used to cut into it.
- **Brand colors and fonts**: edit `src/theme.ts`.
- **Re-encode new footage** to match the existing clips:
  ```bash
  ffmpeg -i IMG_XXXX.mov -ss 0 -to 5 -an \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p" \
    -c:v libx264 -crf 21 -g 15 -movflags +faststart public/clips/new-clip.mp4
  ```

## Export notes

The render is H.264 / AAC in an MP4, at 1080×1920 and 30 fps. Instagram Reels and TikTok both accept this file as-is.

On-screen text is kept out of the top ~200 px and the bottom ~350 px, where the platform UI sits.
