# RE:SET · SOFT WINTER × BUEN FIN — AD03

**Archivo:** `editor/video/out/RESET_SOFT_WINTER_BUENFIN_AD03.mp4` · composición `RESET-SOFT-WINTER-BUENFIN-AD03`.
1080×1920, 9:16, 30 fps, H.264 High, AAC 48 kHz, 32.0 s, subtítulos integrados.
Proyecto (`editor/video/src/softwinter26/`): `SoftWinter.tsx` (línea de tiempo + audio) · `Footage.tsx` (video, disolvencias, paneles) ·
`Subtitles.tsx` · `Graphics.tsx` (tipografía en movimiento y Buen Fin) · `copy.ts` (todos los textos de campaña) · `voz.json`.

## Antes de pautar
- **Promoción:** no puedo confirmar vigencia ni que aplique a Soft Winter; ella dice "este Buen Fin tenemos 15% de descuento en la tienda".
- **Tela gruesa, textura suave, calientitas, bolsita de viaje:** son afirmaciones de ella en la nota de voz; se usan tal cual y nada más.
  La bolsita sí se ve en los videos (IMG_2694–2698). No se agregaron materiales ni propiedades térmicas.
- **Quitado:** la frase inicial ("Ya estás listo para el frío de diciembre…": el gancho es gráfico), "y lo mejor también hay para niños"
  (no hay tomas de niños), el envío gratis desde $1,499 (condición no confirmada) y el cierre "Prepárate para diciembre…" (duración).
- IMG_2691 venía dos veces (mismo archivo); se usó una.

## Diferente de AD01 y AD02
Disolvencias suaves con desenfoque (sin barridos, destellos ni grano), empujes lentos, una sola rampa de velocidad, paneles de color en
arco sobre fondo avena, tipografía serif itálica y sans Manrope en avena/cacao, subtítulos sin caja con subrayado suave en las palabras
clave que ella dice, reveal editorial del 15% sobre fondo avena con tres modelos en arco.

## Material (verticales, HDR de iPhone → SDR)
| Clip | Qué tiene |
|---|---|
| IMG_2691 | Ella con los conjuntos gris azulado con moño (varios en gancho) frente a la pared RE:SET |
| IMG_2692 | Conjunto salvia: 3.4–5.6 s acercamientos al tejido y la marca; 6.7–10 s conjunto completo frente a la pared RE:SET |
| IMG_2693 | Conjunto gris claro: 1.6–3.9 s detalle del cuello; 5.4–7 s ella con el conjunto |
| IMG_2694 / 2695 | Bolsitas de viaje en el perchero |
| IMG_2696 | Bolsitas sobre una silla |
| IMG_2697 / 2698 | Bolsitas con estampado RE:SET sobre la mesa |
| The_Fit_Pilates_3_2.m4a | **La voz** (los videos no tienen sonido) |

## Transcripción literal usada
| Anuncio | Nota | Frase |
|---|---|---|
| 2.83 s | 4.94 s | Te presentamos nuestra Soft Winter, una colección pensada para los días más fríos del año. |
| 7.87 s | 9.98 s | Lo que las hace especiales es su tela más gruesa, su textura suave y lo calientitas que son, perfectas para dormir cómodo y disfrutar esos días de invierno en casa. |
| 16.99 s | 19.10 s | Tenemos diferentes modelos de manga larga, colores súper lindos. |
| 20.28 s | 24.10 s | Además vienen con su práctica bolsita de viaje para llevarlas contigo a donde vayas. |
| 24.32 s | 28.14 s | Y aprovecha porque este Buen Fin tenemos 15% de descuento en la tienda. |
| 28.29 s | 35.84 s | Visítanos en Avenida Stim 39 o en Perisur. |
Cortes en silencio medido: 4.835 (−78 dB), 21.825 (−63), 23.83 (−65), 31.565 (−70), 35.60 (−64), 38.55 (−71); cruces de 30 ms.

## Montaje
| Tiempo | Imagen | Voz | Gráfico (campaña) |
|---|---|---|---|
| 0–1.2 | IMG_2692 4.3 s · tejido salvia con la marca (acento musical) | — | **Llegó la temporada…** |
| 1.2–2.5 | IMG_2692 8.6 s · conjunto completo frente a RE:SET | — | **…de no querer salir de tu pijama.** |
| 2.5–7.9 | 2691 / 2693 / 2691 · ella con los conjuntos (disolvencias) | Te presentamos nuestra Soft Winter… | **SOFT WINTER BY RE:SET** (2.5–4.7 s) · **BUEN FIN · 15% OFF** (2.7–6.6 s) |
| 7.9–13.3 | 2693 (rampa) · 2692 tejido · 2692 tejido · 2693 cuello | …tela más gruesa, su textura suave… calientitas… | |
| 13.3–16.8 | 2691 · 2692 conjunto, más lento | …perfectas para dormir cómodo… en casa. | **Tu momento favorito del día empieza aquí.** |
| 16.8–20 | paneles en arco: gris azulado · salvia · gris claro | Tenemos diferentes modelos… colores súper lindos. | |
| 20–24.2 | bolsitas: perchero · silla · mesa con estampado RE:SET | Además vienen con su práctica bolsita de viaje… | |
| 24.2–26 | ella con el conjunto gris | Y aprovecha porque este Buen Fin tenemos… | |
| 26–28.6 | fondo avena, tres modelos en arco | …15% de descuento en la tienda. | **BUEN FIN RE:SET · 15% OFF · EN TODA LA TIENDA** (en su "15%") |
| 28.3–32 | conjunto salvia frente a RE:SET | Visítanos en Avenida Stim 39 o en Perisur. | logo · **Encuentra tu favorita en RE:SET.** · **BUEN FIN · 15% OFF EN TODA LA TIENDA** · Visítanos en Av. Stim 39 · Perisur |

## Audio
- **Voz** (`editor/softwinter26/voz.py`): limpia (ruido −66 dB), saturada en 88 tramos reconstruidos (`editor/essentials/declip.py`);
  paso alto 75 Hz, EQ suave, de-esser, compresión 2.5:1, limitador, −16 LUFS. Una sola fuente (los videos no tienen audio): sin eco ni duplicación.
- **Música** (`editor/softwinter26/music.py`): **original, compuesta en código para RE:SET — sin licencias de terceros, apta para pauta**.
  Cozy pop moderno 120 BPM en Re♭: bombo en 1, caja suave en 3, hats con swing, piano eléctrico, pluck y pad. Acento en el cuadro 0,
  título en el golpe 5, sección más abierta en "…en casa", subida y golpe en su "15%" (26.0 s), cierre en 31 s. Baja al 13 % bajo su voz.
- Mezcla: −14.4 LUFS integrado, pico −2.1 dBTP.

## Revisión técnica
1080×1920, 30 fps, H.264 High yuv420p, AAC 48 kHz, 32.0 s; decodifica completo; sin cuadros negros, congelados ni silencios. La mezcla final
se transcribe completa y en orden (el reconocedor escribe "Visita nos" y "Perizur"; el subtítulo dice "Visítanos" y "Perisur").

## Regenerar
```
node editor/whisper/transcribe.mjs <The_Fit_Pilates_3_2.m4a> voz_asr.json es
python3 editor/softwinter26/voz.py <The_Fit_Pilates_3_2.m4a> voz_asr.json
python3 editor/softwinter26/music.py
editor/outlet4/render.sh RESET-SOFT-WINTER-BUENFIN-AD03 RESET_SOFT_WINTER_BUENFIN_AD03.mp4
```
