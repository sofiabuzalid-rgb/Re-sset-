# RE:SET · BUEN FIN CDMX — helicóptero + tela + espectacular

## Lo que está listo
- **Espectacular** (`editor/video/src/buenfin/Espectacular.tsx`, composición `BUENFIN-ESPECTACULAR`, imagen `public/buenfin_cdmx/espectacular.png`, 1100×1800):
  logo RE:SET · EL BUEN FIN · 15% OFF · EN TODA LA TIENDA · fotos reales de tres pijamas (verde de galletas, esquí, roja nórdica) ·
  "Pijamas para todos tus momentos" · DESCUBRE LA COLECCIÓN. Verde profundo, marfil y el lima de la marca. Todo el texto editable en `COPY`.
- **Compositor** (`editor/buenfin/composite.py`): toma una escena con el espectacular en **verde croma** y coloca el diseño con
  perspectiva y seguimiento de cámara; la tela y el helicóptero lo tapan solos; conserva sombras y pliegues de la tela. Probado con una toma sintética.
- **Montaje final** (`editor/video/src/buenfin/Cdmx.tsx`): `RESET-BUENFIN-CDMX-CINEMATIC` (audio de la referencia, solo revisión) y
  `RESET-BUENFIN-CDMX-META-ADS` (afro house de Pixabay con el drop en la revelación). Cierre: "BUEN FIN · 15% OFF EN TODA LA TIENDA · VEN A CONOCERNOS".

## Lo que falta: la escena de la ciudad
No puedo generar aquí una escena fotorrealista (no hay generador de video en este entorno y las fuentes de fotos están bloqueadas).
La escena se genera con un generador de video (Higgsfield, Kling, Runway, Veo…) y aquí se compone.

### Línea de tiempo de la referencia (12.2 s, 136 BPM, un golpe = 0.44 s)
| Tiempo | Imagen | Audio |
|---|---|---|
| 0.0–1.0 | Cámara a nivel de calle, fija, mirando hacia arriba a la fachada a la derecha; la tela blanca termina de cubrir el espectacular; helicóptero pequeño arriba a la izquierda | entra la música (0.5 s) |
| 1.0–2.5 | Espectacular tapado, la tela cuelga con pliegues; taxis pasan abajo | sube la energía |
| 2.5–5.0 | El helicóptero tira: la tela se levanta desde la esquina superior y se pela hacia arriba y a la izquierda | crece |
| 5.0–5.8 | **Revelación**: el espectacular queda descubierto | pico de energía (5.3–5.8 s) |
| 5.8–9.5 | La tela vuela colgada del helicóptero hacia la izquierda y se aleja; el espectacular, completo y legible | se mantiene |
| 9.5–12.0 | Cierre con el espectacular a la vista (la referencia hace loop: la tela vuelve a cubrirlo) | baja al final |

### Prompt para generar la escena (vertical 9:16, 12–15 s)
> Cinematic, photorealistic, vertical 9:16 video, 12 seconds, locked-off camera at street level on Paseo de la Reforma, Mexico City,
> on a sunny clear afternoon. Looking up at a tall modern office building on the right side of the frame with a huge vertical billboard
> on its facade. Modern glass skyscrapers of Reforma (Torre Reforma, Torre BBVA style) in the background and the Ángel de la Independencia
> column visible far down the avenue, in its real position on the roundabout. Cars and taxis (Mexico City pink-and-white taxis) drive along
> the avenue at the bottom of the frame, trees along the median. At the start, the billboard is completely covered by a giant white fabric
> with heavy folds; a black helicopter hovers above, attached to the fabric with cables. From second 2.5 the helicopter lifts and pulls the
> fabric up and to the left; the fabric peels off from the top corner, ripples and flies away, fully uncovering the billboard by second 5.5,
> then the helicopter flies away to the left carrying the fabric. The billboard surface is a perfectly flat, uniform, matte chroma-key green
> (#00B140) panel with NO text, NO logos and NO images. Natural light, realistic shadows, real fabric physics, no camera shake.

Claves: **el espectacular debe ser verde croma liso, sin texto** (si la IA escribe algo encima, el diseño no se puede colocar limpio);
cámara fija o casi fija; que el espectacular quede completamente visible al menos 3 s; la tela blanca o crema (no verde).

### Cuando tengas la toma
1. Súbela al chat (o déjala en `editor/video/public/buenfin_cdmx/plate.mp4`).
2. `python3 editor/buenfin/composite.py plate.mp4 editor/video/public/buenfin_cdmx/espectacular.png editor/video/public/buenfin_cdmx/plate_comp.mp4`
   (si la detección de esquinas falla: `--corners x0,y0,x1,y1,x2,y2,x3,y3`).
3. Ajustar `CDMX.seconds` y, si la revelación cae en otro segundo, `CDMX_AUDIO` en `Cdmx.tsx`.
4. Render: `editor/outlet4/render.sh RESET-BUENFIN-CDMX-CINEMATIC RESET_BUENFIN_CDMX_CINEMATIC.mp4` y lo mismo con `-META-ADS`.

## Audio
- **Revisión:** audio de la referencia (`public/buenfin_cdmx/ref_audio.wav`, 0–11.4 s, sin el sonido final del teléfono). Sin licencia: no pautar.
- **Pauta:** "Afro House" (Pixabay, uso comercial permitido), con su drop alineado a la revelación.

## Ruta actual (sin video IA): foto + escena construida
- Foto de Reforma con el espectacular en verde croma y foto de un helicóptero, generadas con Canva (IDs de Canva `MAHZ0iJYqTc` y `MAHZ0o4erv4`).
- `editor/buenfin/heli_scene.py foto.png helicoptero.png espectacular_alto.png plate_comp.mp4` construye los 12 s:
  tela simulada con física, helicóptero con rotor girando y cables, sombra de la tela, cámara casi fija con empuje lento, grano.
  La tela se suelta a los 2.9 s y el panel queda libre a los 5.3 s (el script imprime la cobertura cada 0.5 s).
- Diseño en formato alto (`BUENFIN-ESPECTACULAR-ALTO`, 720×2400) para que entre en el panel de la foto sin deformarse.
- Límite: la foto es fija, así que los autos y los árboles no se mueven; solo se mueven el helicóptero, la tela y la cámara.
