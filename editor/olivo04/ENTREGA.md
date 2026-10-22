# RE:SET — Meta Ads "Tu nueva pijama favorita" (conjunto básico verde olivo)

**Archivo final:** `editor/video/out/RESET_PijamaFavorita_Olivo_1080x1920.mp4`

| Formato | Duración | Audio | Proyecto editable | Voz limpia |
|---|---|---|---|---|
| 1080×1920, 9:16, 30 fps, H.264 | 23.0 s | AAC 256 kbps, −13.9 LUFS, pico −2.8 dBFS | composición `OlivoMeta` (`editor/video/src/olivo04/`) | `editor/olivo04/voz_original_limpia.wav` |

- **Voz:** solo la voz real de ella. Se reconstruye con `python3 editor/olivo04/build.py`.
- **Tratamiento de audio (v2):**
  1. **Ruido:** reducción con RNNoise (red neuronal entrenada para voz) sobre cada clip completo, seguida de una pasada FFT ligera para el siseo restante.
  2. **EQ:** −3 dB a 250 Hz para quitar el sonido encajonado de la habitación, +2.5 dB a 3.5 kHz para presencia y una subida suave arriba de 9 kHz.
  3. **Dinámica:** de-esser, compresión suave 2.5:1, limitador de picos y nivelación a −14 LUFS.
  4. **Pausas:** las pausas muertas dentro de una frase se acortan, sin cambiar el tono ni la velocidad de su voz.
- **v2:** se cortó "¿Le gusta o no le gusta?". De 9049 se queda solo "¿Qué opina?".
- **Cortes de voz:** caen en pausas naturales y no se modifica el tono ni la velocidad de ella.
- **Música:** no lleva. No hay ninguna pista autorizada para publicidad, y en 9050 suena música ambiental que no se usa. Falta agregar una pista con licencia, mezclada bajo la voz.

## Transcripción de los 8 clips

Revisados completos con dos reconocedores, Whisper y Sherpa.

| Clip | Lo que se escucha | Uso |
|---|---|---|
| IMG_9047 | "Por favor vean este modelo de pijama, está súper padre, el color está increíble y aparte no saben la calidad y lo cómodo que está." | ✅ Hook y presentación |
| IMG_9048 | "Aparte es el color de la temporada, verde militar. Por favor, lo tienen que [¿adquirir?] ya." | ✅ Hasta "verde militar." El final no se entiende con claridad y se dejó fuera |
| IMG_9049 | "¿Qué opina? ¿Le gusta o no le gusta? Pero me quito los tenis." | ✅ Solo "¿Qué opina?" (v2) |
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
| 4 · Deseo | 8.5–13.6 s | "Aparte es el color de la temporada, verde militar." · "¿Qué opina?" | Ella modelando, el escote y una pausa de 1 s bailando |
| 5 · CTA | 13.6–23.0 s | "Tiene que correr al RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur." | Ella a cámara. Cierre con RE:SET, "Tu próxima pijama favorita.", "Encuéntrala en Perisur, Av. Stim 39 o en línea." y resetwear.com.mx |

## Clips con timecodes

| Salida | Clip | Entrada → salida en el clip | Plano |
|---|---|---|---|
| 00:00.00–00:03.44 | IMG_9047 | 0.17–3.61 s | hook |
| 00:03.44–00:04.44 | IMG_9050 | 0.00–1.00 s | silueta |
| 00:04.44–00:06.22 | IMG_9049 | 0.00–1.78 s | color |
| 00:06.22–00:07.27 | IMG_9052 | 0.00–1.05 s | lazo |
| 00:07.27–00:07.64 | IMG_9051 | 2.00–2.37 s | caida |
| 00:07.64–00:08.52 | IMG_9051 | 4.30–5.18 s | mueve |
| 00:08.52–00:11.99 | IMG_9048 | 0.07–3.53 s | temporada |
| 00:11.99–00:12.65 | IMG_9049 | 0.70–1.36 s | opina |
| 00:12.65–00:13.65 | IMG_9051 | 4.90–5.90 s | baila |
| 00:13.65–00:18.35 | IMG_9054 | 0.43–5.13 s | tiendas |
| 00:18.35–00:22.93 | IMG_9051 | 0.00–1.38 s (al 30 %) | cierre |

## Notas

- **Escote:** el brief dice "escote redondo", pero en el material se ve **cuello en V** (sobre todo en 9049). La etiqueta dice lo que se ve.
- **Color:** ella lo llama "verde militar" y el subtítulo respeta sus palabras. No se alteró el tono del color.
- **Afirmaciones:** "la calidad" y "lo cómodo que está" son opiniones suyas, dichas por ella. No se agregaron propiedades de tela ni de composición.
- **Duración: 23.0 s**, por debajo del objetivo de 25–30 s, porque se cortó la pregunta. Con una pista licenciada se puede alargar a 25–28 s con más tomas de ella.
