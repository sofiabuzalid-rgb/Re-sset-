# RE:SET · BUEN FIN 15% EN TODA LA TIENDA — 4 anuncios para pauta

| Archivo (`editor/video/out/`) | Composición | Duración | Ángulo |
|---|---|---|---|
| `RESET_BUENFIN15_AD01_LLEGO_EL_BUEN_FIN.mp4` | `RESET-BUENFIN15-AD01-LLEGO-EL-BUEN-FIN` | 18.1 s | ¡Llegó el Buen Fin! Pijamas navideñas para toda la familia |
| `RESET_BUENFIN15_AD02_ESSENTIALS.mp4` | `RESET-BUENFIN15-AD02-ESSENTIALS` | 19.1 s | Essentials sin voz: textos cortos que dicen lo que se ve + precios |
| `RESET_BUENFIN15_AD03_SOFT_WINTER.mp4` | `RESET-BUENFIN15-AD03-SOFT-WINTER` | 21.4 s | Soft Winter con su bolsita de viaje |
| `RESET_BUENFIN15_AD04_REGALOS.mp4` | `RESET-BUENFIN15-AD04-REGALOS` | 17.7 s | Adelanta tus regalos |

1080×1920, 30 fps, H.264, AAC, subtítulos integrados. Proyecto: `editor/video/src/bf15/` (`engine.tsx` componentes, `ads.tsx` los cuatro
anuncios y sus textos). Voz: `editor/bf15/voz.py`; música: `editor/bf15/music.py`.

## Lo que se ve (v2: dirección clara, primero PIJAMAS)
Jerarquía fija en los cuatro, desde el cuadro 0 hasta el cierre:
1. Arriba, enorme: **PIJAMAS** y debajo la colección (NAVIDEÑAS / ESSENTIALS / SOFT WINTER / PARA REGALAR · RE:SET).
2. Al centro: la pijama (cada anuncio abre con una pijama que se reconoce como pijama; Soft Winter ya no abre con bolsas sino con el conjunto
   salvia y los conjuntos gris azulado de las tomas de Soft Winter que ya habías mandado; Regalos abre con ella levantando la pijama roja).
3. Abajo, una franja: cartel oficial del Buen Fin + **15% OFF EN TODA LA TIENDA** (late cuando ella dice "15%").
Cierre: PIJAMAS + colección, cartel, 15% OFF EN TODA LA TIENDA, CTA y "Av. Stim 39 · Perisur". Todo en la zona visible de TikTok/Reels/Stories.

## Voz (real, de sus notas de voz del Buen Fin; los videos de esta tanda no traen voz)
| Anuncio | Nota | Segundos | Frase |
|---|---|---|---|
| 01 | The_Fit_Pilates_2_2 | 1.08–12.93 | ¿Quieres adelantarte a tus regalos de Navidad y aprovechar un súper descuento? Este Buen Fin es el momento. En RE:SET tenemos 15% de descuento en toda la tienda, incluyendo nuestra colección de pijamas navideñas para toda la familia. |
| 03 | The_Fit_Pilates_3_2 | 4.84–9.87 | Te presentamos nuestra Soft Winter, una colección pensada para los días más fríos del año. |
| 03 | The_Fit_Pilates_3_2 | 23.83–31.57 | Además vienen con su práctica bolsita de viaje para llevarlas contigo a donde vayas. Y aprovecha porque este Buen Fin tenemos 15% de descuento en la tienda. |
| 03 | The_Fit_Pilates_3_2 | 38.51–42.87 | Prepárate para diciembre con la Soft Winter de RE:SET y aprovecha el Buen Fin. |
| 04 | The_Fit_Pilates_2_2 | 21.62–28.49 | Desde los clásicos tonos rojos hasta diseños llenos de color, con detalles cuidados, acabados de calidad y opciones perfectas para regalar. |
| 04 | The_Fit_Pilates_2_2 | 37.53–43.30 | Este Buen Fin adelanta tus regalos, combina a toda la familia y aprovecha el 15% OFF en RE:SET. |
Cortes en silencios medidos (−51 a −81 dB). No se usa: "esta pijama puede ser tuya por solo 999 pesos" (es el precio sin descuento, contradice
el 15%), el envío gratis (no confirmado) ni "Sí, para todos".

## AD02 · Essentials (rehecho, sin voz)
Sus notas describen una Essential de botones que no es la que se ve, así que no lleva voz. Textos (uno a la vez, abajo, sobre lo que muestra la toma):
0–2.5 s ella con el conjunto café: "Pijamas Essentials de RE:SET" · 2.5–5 s detalle del top: "Mira cada detalle" · 5–8 s perchero de
colores: "Muchos colores para elegir" · 8–11 s el conjunto café: "Conjunto completo: top y pantalón" · 11–14 s conjunto azul:
"Adulto: $999 → $849 / Niños: $699 → $594" (precios que ella da en la nota de Essentials) · 14–16 s ella voltea: "Encuentra tu favorita" ·
cierre "Ven por tus Essentials". Cartel y 15% OFF EN TODA LA TIENDA todo el tiempo.

## Imagen
Esta tanda: IMG_2681 (bolsas RE:SET sobre la mesa), IMG_2688 (pijamas navideñas en el perchero y sobre la silla), IMG_2700 (bolsitas y pijamas).
Repetidos de entregas anteriores (mismo archivo, se reutilizó la conversión): IMG_2675/2676/2678/2679 (Essentials), IMG_2683 (Grinch),
IMG_2697/2698 (bolsitas Soft Winter), b857feca (showroom). IMG_2681 venía dos veces.
**No usados:** los dos "copy_…" (traen música de otro reel, textos "COMING SOON / GET READY" y metadatos de Dreamina).

## Música
Cuatro pistas **originales compuestas en código para RE:SET** (energética 124 BPM, pop 118, juguetona 112, pop 120): sin licencias de
terceros, aptas para pauta. Bajan al 12 % bajo su voz y suben en los huecos. Mezclas: −13.0 a −14.2 LUFS.

## Revisión
Decodifican completos; sin cuadros negros, congelados ni silencios; las cuatro mezclas se transcriben completas.

## Antes de pautar
- El 15% en toda la tienda y los precios ($999 → $849, $699 → $594) salen de lo que ella dice: confirma que siguen vigentes.
- La pijama del Grinch es un personaje con licencia; si RE:SET no la tiene, Meta puede rechazar AD01/AD04.
- El cartel es el logo oficial del Buen Fin: confirma que RE:SET está registrado como participante.
