# RE:SET — Christmas Reel 🎄

A premium Christmas promo for **RE:SET**, a pajama and loungewear brand. It's a 21-second vertical Reel (1080×1920, 30 fps) for Instagram Reels and TikTok, built with **React + [Remotion](https://www.remotion.dev/)**. All on-screen text is in Spanish.

## Quick start

```bash
npm install
npm run dev        # Remotion Studio: live preview & tweaking
npm run build      # render → out/reset-christmas-reel.mp4
npm run audio      # (optional) regenerate music + SFX (python3 + numpy)
```

## Storyboard

Music: *Carol of the Bells* in 3/4 at 180 BPM. 1 bar = 1 s = 30 frames, and every cut lands on a bar or a beat.

| Time      | What happens |
|-----------|--------------|
| 0.0–1.7 s | **HOOK: the screen is a gift.** Red foil wrapping paper, gold satin ribbons, a bow and a *"Para ti — de RE:SET"* tag, with the headline **"TIENES UN REGALO · Ábrelo..."**. The bow wobbles on the beat, the ribbons are pulled off and the paper tears open down the middle, with light pouring out. |
| 1.6–4.0 s | Montage of the gift bags, one per beat: **"ESTA NAVIDAD · ¿Qué hay dentro?"**. Celesta and pizzicato tension, timpani roll and a swell. |
| 4.0 s     | **DROP.** A golden lens flare as the pajamas unfold: **"NAVIDAD 2026 · Pijamas navideñas"**. |
| 6.0 s     | White print set reveal with a speed ramp: **"ESTAMPADOS · que enamoran"** |
| 8.0 s     | Triptych of 3 prints with gold dividers: **"DÉJALO EN COMENTARIOS · ¿Cuál es tu favorita?"** (asks viewers to comment) |
| 10.0 s    | Footage shown as a framed print on red velvet: **"LISTA PARA REGALAR · con su propia bolsa de regalo"** |
| 12.0 s    | Gift lineup: **"EL REGALO QUE · sí van a usar"** |
| 14.0 s    | **"HECHAS PARA · noches de película"** |
| 16–21 s   | **End card.** "FELIZ NAVIDAD", the gold-foil **RE:SET** logo, "PIJAMAS & ROPA DE CASA", a **COMPRA AHORA** button and "link en la bio". A gold confetti burst lands on the final major chord. |

## Design system

- **Typography.** Headlines are *Playfair Display Italic* in a gold-foil gradient with a moving shine; each line rises out of an invisible mask. Kickers are wide-tracked *Montserrat* small caps between thin gold rules. Supporting lines use *Cinzel*, and the gift tag uses *Great Vibes*. All fonts are bundled under the SIL OFL license.
- **Palette.** Deep wine and cranberry, pine green, cream, and metallic gold (see `goldFoil()` in `src/theme.ts`).
- **Finishing.** Golden lens flares and film light-leaks on key cuts, a soft camera push on each downbeat, snow, bokeh, a warm grade, vignette and fine grain.

## Audio

`scripts/generate-audio.py` synthesizes everything with numpy (no samples, no licensing issues):

- `music.wav`: a cinematic **Carol of the Bells**. The melody is *Shchedryk* by M. Leontovych (1916), which is public domain. It's arranged for celesta, pizzicato, spiccato and legato strings, a formant "aah" choir, taiko, snare, toms, shaker and sleigh bells. Everything goes through a synthetic convolution reverb with mastering EQ, and it ends on a bright G-major chord.
- `rip.wav` (paper tear), `whoosh.wav`, `shimmer.wav` and `sparkle.wav`: sound effects.

You can swap in a licensed or trending track via `audio/music.wav` in `src/ChristmasReel.tsx`. For best results, pick one whose drop hits at 4.0 s.

## Editing

- **Scenes, copy, speed ramps, layouts (`full` / `triptych` / `framed`) and transitions**: `src/timeline.ts`
- **Hook**: `src/components/GiftWrap.tsx` and the "¿Qué hay dentro?" block in `src/ChristmasReel.tsx`
- **End card**: `src/components/EndCard.tsx`
- **Type system**: `src/components/LuxText.tsx`. **Colors and fonts**: `src/theme.ts`

On-screen text stays out of the top ~200 px and the bottom ~350 px, where the platform UI sits.
