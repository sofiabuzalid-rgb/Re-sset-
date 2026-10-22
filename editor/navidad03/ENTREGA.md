# RE:SET — Meta Ads Navidad: "Esta Navidad, todos tienen una pijama favorita"

**Archivo final:** `editor/video/out/RESET_Navidad_MetaAds_1080x1920.mp4`

| Formato | Duración | Audio | Proyecto editable |
|---|---|---|---|
| 1080×1920, 9:16, 30 fps, H.264 | 33.6 s | AAC 256 kbps, −14.4 LUFS, pico −2.9 dBFS | composición `NavidadMeta` (`editor/video/src/navidad03/`) |

- **Voz:** solo la voz real de ella. Se reconstruye con `python3 editor/navidad03/build.py`.
- **Tratamiento de audio:**
  - paso alto de 90 Hz;
  - reducción de ruido;
  - EQ moderada (−2 dB a 220 Hz, +2.5 dB a 3.2 kHz);
  - de-esser;
  - compresión suave 3:1;
  - nivelación entre clips;
  - fundidos de 12 ms en cada corte.
- **Cortes de voz:** caen en pausas naturales, nunca a media palabra, y no se modifica el tono ni el ritmo de ella.
- **Música:** no lleva. En el Drive no hay ninguna pista con licencia, salvo "Christmas Wonderland", que está descartada. Falta agregar una pista autorizada con ducking bajo la voz.

## Transcripción literal de los clips

Se escucharon completos los 10 clips entregados (además de 8935, 8937, 8942 y 8964). Se usaron dos reconocedores, Whisper y Sherpa.

| Clip | Lo que se escucha | ¿Se usa? |
|---|---|---|
| IMG_8931 | "Les tengo una idea buenísima, por si no saben qué regalar esta Navidad." | ✅ Hook |
| IMG_8944 | "Por favor quiero que vean estas pijamas de RE:SET y lo mejor de todo es que lo puedes combinar con toda tu familia." | ✅ |
| IMG_8946 | "Imagínate que lo puedes combinar con toda tu familia. Tú te pones esta, tu hijo o tu hermano se pone a lo mejor la verde, la blanca se la puede poner tu esposo y todos van a estar matching y súper cómodos esta Navidad." | ✅ Desde "Tú te pones esta" (lo anterior repetía lo dicho en 8944) |
| IMG_8949 | "Así que en serio, si todavía no saben qué regalar esta Navidad, dense una vuelta por RE:SET porque yo ya tengo las mías." | ✅ Cierre |
| IMG_8943 | Plática detrás de cámara ("y todo el mundo que están viendo ahí…"), entrecortada | ❌ Se usa solo la imagen |
| IMG_8964 | Plática detrás de cámara ("Y ya, es de la vez. Primero le voy a hacer de aquí.") | ❌ Se usa solo la imagen |
| IMG_8952 | Sin diálogo (un "¡Buenas!" lejano) | ❌ |
| IMG_8933, 8934, 8935, 8936, 8937, 8942, 8953 | Sin voz | Solo imagen (8952 y 8953 no se usan) |

- **"de RE:SET":** Whisper oye "AirBizit" y "Reiset", pero el segundo reconocedor confirma "pijamas de RE:SET".
- **"dense":** Whisper oye "venza", pero ella dice "dense".
- **"las mías":** el final de 8949 se oye ambiguo ("las mías" / "las mismas"). Se subtitula "las mías", que es lo que tiene sentido.

## Narrativa usada (subtítulos = palabras exactas)

| Bloque | Tiempo | Voz | Texto en pantalla (gráfico, nunca atribuido a ella) |
|---|---|---|---|
| 1 · Hook | 0–5.5 s | "Les tengo una idea buenísima, por si no saben qué regalar esta Navidad." | "¿Todavía no sabes qué pijamas van a usar esta Navidad?" |
| 2 · Producto | 5.5–11.3 s | "Por favor quiero que vean estas pijamas de RE:SET y lo mejor de todo es que lo puedes combinar con toda tu familia." | Chip "Pijamas navideñas RE:SET" |
| 3 · Modelos | 11.3–18.2 s | "Tú te pones esta, tu hijo o tu hermano se pone a lo mejor la verde, la blanca se la puede poner tu esposo" | Etiquetas "Modelo rojo / verde / claro", sincronizadas con lo que ella nombra |
| 4 · Deseo | 18.2–23.5 s | "y todos van a estar matching y súper cómodos esta Navidad." (+ 1.6 s sin voz) | "Haz que esta Navidad también se viva en pijama" |
| 5 · Decisión | 23.5–29.5 s | "Así que en serio, si todavía no saben qué regalar esta Navidad, dense una vuelta por RE:SET porque yo ya tengo las mías." | — |
| 6 · CTA | 29.5–33.6 s | — | Logo RE:SET, "Descubre nuestra colección de Navidad" y botón "Compra tus favoritas" |

## Clips con timecodes

| Salida | Clip | Entrada → salida en el clip | Plano |
|---|---|---|---|
| 00:00.00–00:02.84 | IMG_8931 | 0.37–3.21 s | hook |
| 00:02.84–00:05.50 | IMG_8943 | 4.30–6.96 s | look |
| 00:05.50–00:06.87 | IMG_8944 | 0.30–1.67 s | presenta |
| 00:06.87–00:08.37 | IMG_8933 | 0.60–2.10 s | conjunto |
| 00:08.37–00:09.79 | IMG_8944 | 3.17–4.59 s | mejor |
| 00:09.79–00:11.33 | IMG_8964 | 3.00–4.54 s | modelos |
| 00:11.33–00:12.13 | IMG_8946 | 2.93–3.73 s | tu |
| 00:12.13–00:13.37 | IMG_8934 | 0.50–1.74 s | roja |
| 00:13.37–00:13.99 | IMG_8946 | 4.97–5.59 s | verde-sync |
| 00:13.99–00:15.85 | IMG_8964 | 4.60–6.46 s | verde |
| 00:15.85–00:18.19 | IMG_8946 | 7.45–9.79 s | blanca |
| 00:18.19–00:20.15 | IMG_8964 | 6.00–7.96 s | todos |
| 00:20.15–00:21.87 | IMG_8935 | 0.20–1.92 s | comoda |
| 00:21.87–00:22.67 | IMG_8936 | 2.20–3.00 s | estira |
| 00:22.67–00:23.47 | IMG_8937 | 1.00–1.80 s | descansa |
| 00:23.47–00:26.56 | IMG_8949 | 0.03–3.13 s | cierre |
| 00:26.56–00:27.86 | IMG_8943 | 1.30–2.60 s | vuelta |
| 00:27.86–00:29.50 | IMG_8949 | 4.43–6.07 s | mias |
| 00:29.50–00:33.50 | IMG_8964 | 6.80–10.80 s | cta |

## Notas

- **Duración: 33.6 s, por debajo del objetivo de 40–45 s.** En los 10 clips solo hay unos 28 s de diálogo útil. Llegar a 40 s sin música obligaría a meter silencios largos, así que se priorizó un anuncio sin huecos. Con una pista licenciada se pueden añadir 6–10 s de b-roll con música.
- **Calidad de imagen:** las fuentes son 720×1280. Se escalaron a 1080×1920 con lanczos y los zooms se limitaron a 1.3× para que no pierdan nitidez.
- **Propiedad intelectual:**
  - El modelo blanco o claro lleva al **Grinch** y se ve en varias tomas.
  - El verde tiene un duende parecido al de **Elf on the Shelf**.
  - Las bolsas de 8952 y 8953 llevan un muñeco tipo **Olaf**, por eso no se usan.
  - Confírmalo antes de pautar.
- **Afirmaciones:** no se mencionan tallas, precios, disponibilidad ni propiedades que ella no dijo.
