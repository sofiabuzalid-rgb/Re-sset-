# RE:SET — Christmas Reel 🎄

A high-energy Christmas promo for **RE:SET**, a pajama and loungewear brand. It's a 24-second vertical Reel (1080×1920, 30 fps) for Instagram Reels and TikTok, built with **React + [Remotion](https://www.remotion.dev/)**. All on-screen text is in Spanish.

## Quick start

```bash
npm install
npm run dev        # Remotion Studio: live preview & tweaking
npm run build      # render → out/reset-christmas-reel.mp4
npm run audio      # (optional) regenerate music + SFX (python3 + numpy)
```

## Structure (150 BPM: 1 beat = 12 frames, 1 bar = 48 frames, every cut on the beat)

| Time       | What happens |
|------------|--------------|
| 0.0–3.2 s  | **HOOK.** "¿QUÉ HAY DENTRO? 👀" slams in on frame 0 over a gift bag, followed by a rapid one-beat montage of the other bags. The text shakes harder as a snare roll and riser build up. |
| 3.2 s      | **DROP.** The bag is unwrapped: "¡SORPRESA!" over a spinning sunburst, a confetti and emoji burst, camera shake and a white flash. |
| 4.8 s      | "¡son PIJAMAS NAVIDEÑAS! 🎄" |
| 6.4 s      | White print set reveal with a speed ramp: "estampados SÚPER FESTIVOS ✨" |
| 9.6 s      | "comodidad NIVEL: SOFÁ 🛋️" |
| 11.2 s     | "...y viene en su BOLSITA 🎁" |
| 12.8 s     | "¡lista para REGALAR! 🎀" |
| 14.4 s     | "combina con TU ÁRBOL 🎄" |
| 16.0 s     | Gift lineup: "el regalo que SÍ VAN A USAR 😍", then "¿CUÁL ELIGES? 👇" (asks viewers to comment) |
| 19.2–24 s  | **End card.** "¡feliz navidad con RE:SET", a bouncing "¡PIDE LA TUYA! 🎁" button, "link en la bio 👆", fairy lights, and a confetti burst on the final hit. |

## What makes it feel produced

- **Speed ramps.** Each scene is built from segments, and every segment plays its own slice of the clip at its own speed: fast through the boring part, slower on the reveal. See `segments` in `src/timeline.ts`.
- **Hard cuts with motion.** Every cut is on the beat and gets an entry move: punch-in, whip pan, slide-up or spin, each with motion blur and a whoosh.
- **Camera rig.** The picture bumps on every kick and shakes on the drop and the final hit.
- **Sticker captions.** Luckiest Guy font with a thick outline and a hard drop shadow. Words spring in one after another with a little tilt and wobble on the beat, and each caption plays a pop sound.
- **Effects.** Confetti and emoji bursts, a comic sunburst behind "¡SORPRESA!", snowfall, fairy-light garland, soft drifting lights, sparkles, a punchy warm grade, vignette and film grain.

## Audio

`scripts/generate-audio.py` synthesizes everything with numpy, so there are no licensing issues:

- `music.wav`: a dance-pop *Jingle Bells* (public domain, 1857) at 150 BPM. It has a 2-bar hook build-up (impact, teaser, snare roll, riser), then a drop with four-on-the-floor kick, claps, a bouncy octave bass with sidechain pump, off-beat chord stabs, a bright lead with glockenspiel, and sleigh bells. It ends on a final button hit.
- `whoosh.wav`, `pop.wav`, `sparkle.wav`, `impact.wav`: sound effects placed on cuts and captions.

You can use a trending or licensed track instead by swapping `audio/music.wav` in `src/ChristmasReel.tsx`. For best results, pick a 150 BPM track with a drop about 3.2 s in.

## Editing

- **Copy, timing, speed ramps and transitions**: `src/timeline.ts`. Keep each `start` on a multiple of `BEAT`.
- **Hook text**: `src/components/HookTitle.tsx`. **End card**: `src/components/EndCard.tsx`.
- **Colors and fonts**: `src/theme.ts`. The fonts are bundled in `public/fonts` (SIL OFL). Emoji use the system color-emoji font.

## Layout

```
public/clips/   trimmed H.264 1080×1920 product footage
public/audio/   generated music + SFX
public/fonts/   Luckiest Guy, Playfair Display, Montserrat, Great Vibes
src/timeline.ts           scenes, captions, speed ramps, beat grid
src/ChristmasReel.tsx     composition: camera rig, scenes, overlays, audio
src/components/           Footage, StickerText, HookTitle, Confetti, Starburst, EndCard, Snowfall, ...
```

On-screen text stays out of the top ~200 px and the bottom ~350 px, where the platform UI sits.
