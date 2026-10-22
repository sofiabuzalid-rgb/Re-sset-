# RE:SET — Meta Ads "Tu nueva pijama favorita" (conjunto básico verde olivo)

**Archivo final:** `editor/video/out/RESET_PijamaFavorita_Olivo_1080x1920.mp4`

| Formato | Duración | Audio | Proyecto editable | Voz limpia |
|---|---|---|---|---|
| 1080×1920, 9:16, 30 fps, H.264 | 25.2 s | AAC 256 kbps, −14.0 LUFS, pico −2.9 dBFS | composición `OlivoMeta` (`editor/video/src/olivo04/`) | `editor/olivo04/voz_original_limpia.wav` |

- **Voz:** solo la voz real de ella. Se reconstruye con `python3 editor/olivo04/build.py`.
- **Tratamiento de audio:**
  - paso alto de 90 Hz;
  - reducción de ruido;
  - EQ moderada;
  - de-esser;
  - compresión suave 3:1;
  - nivelación entre clips;
  - fundidos cortos;
  - limitador.
- **Cortes de voz:** caen en pausas naturales y no se modifica el tono ni la velocidad de ella.
- **Música:** no lleva. No hay ninguna pista autorizada para publicidad, y en 9050 suena música ambiental que no se usa. Falta agregar una pista con licencia, mezclada bajo la voz.

## Transcripción de los 8 clips

Revisados completos con dos reconocedores, Whisper y Sherpa.

| Clip | Lo que se escucha | Uso |
|---|---|---|
| IMG_9047 | "Por favor vean este modelo de pijama, está súper padre, el color está increíble y aparte no saben la calidad y lo cómodo que está." | ✅ Hook y presentación |
| IMG_9048 | "Aparte es el color de la temporada, verde militar. Por favor, lo tienen que [¿adquirir?] ya." | ✅ Hasta "verde militar." El final no se entiende con claridad y se dejó fuera |
| IMG_9049 | "¿Qué opina? ¿Le gusta o no le gusta? Pero me quito los tenis." | ✅ Las dos preguntas |
| IMG_9050 | Sin voz (música ambiental) | Solo imagen |
| IMG_9051 | Sin voz | Solo imagen |
| IMG_9052 | Sonido breve, ininteligible | Solo imagen (lazo de la cintura) |
| IMG_9053 | "Corran a RE:SET a nuestras dos sucursales, una Avenida Stim y otra en Perisur." | No se usa: dice lo mismo que 9054 y al fondo pasa otra persona |
| IMG_9054 | "Tiene que correr al RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur." | ✅ CTA hablado |

- **"aparte":** Whisper oye "a partir de", pero el segundo reconocedor confirma "aparte".
- **"al RE:SET":** Whisper oye "el", el segundo reconocedor oye "al". Se subtitula "al".
- **"Stim":** se escribe como en tu CTA (Whisper oye "Steam").

## Estructura

| Bloque | Tiempo | Voz | Imagen / gráfico |
|---|---|---|---|
| 1 · Hook | 0–3.5 s | "Por favor vean este modelo de pijama," | Ella en movimiento, conjunto completo. Texto gráfico: "¿Una pijama tan bonita que no te la quieres quitar?" (no se le atribuye) |
| 2 · Presentación | 3.5–4.5 s | "está súper padre," | Silueta completa, manos en la cadera |
| 3 · Detalles | 4.5–9 s | "el color está increíble, y aparte no saben la calidad y lo cómodo que está." | Etiquetas MANGA CORTA, CUELLO EN V, LAZO EN LA CINTURA y PANTALÓN LARGO, cada una sobre su plano |
| 4 · Deseo | 9–15.8 s | "Aparte es el color de la temporada, verde militar." · "¿Qué opina? ¿Le gusta o no le gusta?" | Ella modelando, del escote al plano completo, y una pausa de 1 s bailando |
| 5 · CTA | 15.8–25.2 s | "Tiene que correr al RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur." | Ella a cámara. Cierre con RE:SET, "Tu próxima pijama favorita.", "Encuéntrala en Perisur, Av. Stim 39 o en línea." y resetwear.com.mx |

## Clips con timecodes

| Salida | Clip | Entrada → salida en el clip | Plano |
|---|---|---|---|
| 00:00.00–00:03.51 | IMG_9047 | 0.10–3.61 s | hook |
| 00:03.51–00:04.51 | IMG_9050 | 0.00–1.00 s | silueta |
| 00:04.51–00:06.29 | IMG_9049 | 0.00–1.78 s | color |
| 00:06.29–00:07.34 | IMG_9052 | 0.00–1.05 s | lazo |
| 00:07.34–00:07.99 | IMG_9051 | 2.00–2.65 s | caida |
| 00:07.99–00:08.97 | IMG_9051 | 4.30–5.28 s | mueve |
| 00:08.97–00:12.73 | IMG_9048 | 0.03–3.80 s | temporada |
| 00:12.73–00:14.77 | IMG_9049 | 0.70–2.74 s | opina |
| 00:14.77–00:15.77 | IMG_9051 | 4.90–5.90 s | baila |
| 00:15.77–00:20.57 | IMG_9054 | 0.40–5.20 s | tiendas |
| 00:20.57–00:25.17 | IMG_9051 | 0.00–1.38 s (al 30 %) | cierre |

## Notas

- **Escote:** el brief dice "escote redondo", pero en el material se ve **cuello en V** (sobre todo en 9049). La etiqueta dice lo que se ve.
- **Color:** ella lo llama "verde militar" y el subtítulo respeta sus palabras. No se alteró el tono del color.
- **Afirmaciones:** "la calidad" y "lo cómodo que está" son opiniones suyas, dichas por ella. No se agregaron propiedades de tela ni de composición.
- **Duración:** sin música, el material da para 25.2 s. Con una pista licenciada se puede alargar a ~28 s con más tomas de ella.
