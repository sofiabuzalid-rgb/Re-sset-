# Estado del proyecto RE:SET (leer primero; no repetir trabajo)

## Hecho y reutilizable
- **Material RESET HOY:** analizado completo (117 de 119 clips; IMG_8945 e IMG_8954 pesan más de 10 MB y no se pueden descargar). No volver a analizarlo.
  - **Inventario y utilidad:** `library/AUDITORIA_RESET_HOY.md` (lo genera `editor/campana/inventario.py` a partir de `editor/campana/tech_metrics.json`).
  - **Transcripciones palabra a palabra:** `library/resethoy_asr/IMG_*.json`.
  - **Clips en caché (720×1280):** `library/cache/resethoy/`.
- **Mejores frases, hooks y timecodes:** `editor/campana/ENTREGA_CAMPANA.md`.
- **Investigación de mercado:** `library/INVESTIGACION_MERCADO_2026.md`. No repetirla.
- **Kit Remotion reutilizable:** `editor/video/src/campana/shared.tsx`.
  - Incluye tomas con disolvencia, nieve con seguimiento, subtítulos, precios, tiendas, música con ducking, grano y viñeta.
  - Cada anuncio tiene su `config.ts` y su `Ad.tsx`.
- **Voz:** `editor/campana/voz.py <ad>` (RNNoise + EQ + compresión, −14 LUFS).
- **Medios:** `editor/campana/prep.py <ad>` (balance de blancos, 1080×1920).
- **Render con control de calidad:** `editor/campana/render.sh <Comp> <salida.mp4>`.

## Anuncios terminados
| Comp | MP4 (`editor/video/out/`) |
|---|---|
| C01-NavidadEnFamilia | RESET_01_NavidadEnFamilia_1080x1920.mp4 |
| C02-ChristmasAtHome | RESET_02_ChristmasAtHome_1080x1920.mp4 |
| C03-TuNuevaPijamaFavorita | RESET_03_TuNuevaPijamaFavorita_1080x1920.mp4 |
| C04-TuPijamaDeViaje | RESET_04_TuPijamaDeViaje_1080x1920.mp4 |

| Reel-NuevoModelo3Tonos | RESET_Reel_NuevoModelo3Tonos_1080x1920.mp4 (19.8 s, sin voz; clips IMG_25xx de uploads → public/tonos; tonos 01 salvia · 02 malva · 03 gris) |

Anuncios anteriores: Regalo01 y su Pauta, NavidadMeta (precios), OlivoMeta y CajonNavidad.

## Pendiente (depende de la marca)
- Confirmar los precios $699 / $999; la web muestra $549 / $799.
- Confirmar la bolsita del set azul marino.
- Confirmar el kiosco de Perisur.
- Conseguir música con licencia para pauta, una pista por anuncio. Va en `MUSIC.src` de cada `config.ts`.
- Riesgo de propiedad intelectual: Grinch y Elf.

## Reglas del cliente
- Solo voz y tomas reales.
- Nunca usar "Christmas Wonderland".
- La marca se escribe RE:SET.
- Drive es de solo lectura.
