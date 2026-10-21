# estilo.md — guía de edición sacada del vídeo de referencia

## Fuente
- **Vídeo:** `editor/referencia/referencia.mp4`, una grabación de pantalla de iPhone (1170×2532, 60 fps) de un reel de Instagram de **@elaya_mx**, "OOTD: ELAYA".
- **Duración:** el reel dura **9.27 s**; en 9.27 vuelve a empezar (loop). Lo demás es la interfaz de Instagram y el centro de control: se ignora.
- **Conversión de medidas:** el reel ocupa la pantalla de y≈195 a y≈2275 (2080 px de alto). Las medidas en px de este documento ya están convertidas al lienzo **1080×1920** (factor 0.923). [SUPOSICIÓN] El borde superior exacto del reel está tapado por la barra de estado; el error es de ±20 px.
- **Material extraído:**
  - Fotogramas a 2/s en `referencia/frames/` y hojas de contacto en `hoja.jpg` y `hoja5fps.jpg`.
  - Detección de cortes por diferencia de luminancia, fotograma a fotograma, en `ydif.txt`.
  - Audio en `audio.wav`.

## 1. Estructura y ritmo de cortes
| Tiempo | Plano | Cámara | Paso al siguiente |
|---|---|---|---|
| 0.00–0.50 | Pared beige vacía y título "outfit of the day"; ella entra por la izquierda en 0.3 s | Fija | — |
| 0.50–5.30 | **Plano general**: cuerpo entero, hablando por teléfono, bolso y vaso | Cámara en mano. Paneo a la izquierda siguiéndola (0.5–1.3 s), después casi fija con deriva de ±10 px | **Acercamiento rápido en cámara**: de 1.0× a ≈1.6× en 0.25 s (5.30–5.55), sin corte |
| 5.55–7.78 | **Plano medio** (de muslo a cabeza), bebiendo del vaso | En mano, se acerca muy despacio (≈1.6× → 1.75×) | **Corte seco en 7.78 s, sobre el beat de 7.73** (≈1 fotograma después) |
| 7.78–9.27 | **Plano medio corto** (cadera a cabeza), perfil de 3/4 y luego de frente, la mano toca la tela | En mano, ligero giro | Loop al inicio |

- **Número de planos:** 3 encuadres, 1 corte seco y 1 acercamiento rápido en cámara.
- **Duración media de plano:** ≈3.1 s. Los planos van de más corto a más largo en distancia: general → medio → corto. El último plano es el más corto (1.5 s).
- **Cortes:** se cortan **sobre el beat** (±2 fotogramas).
- **Sin aceleraciones ni ralentizaciones.** [SUPOSICIÓN] El acercamiento de 5.3 s se hizo en cámara, porque la nitidez no baja como baja en un zoom digital.

## 2. Subtítulos
- **La referencia no tiene voz ni subtítulos.** Su audio es solo música (Whisper no detecta habla).
- [SUPOSICIÓN] Para mi vídeo, que sí tiene voz, adapto el lenguaje gráfico de sus etiquetas (sección 3), para que los subtítulos se vean de la misma familia:
  - **Fuente:** sans-serif en cursiva. SF Pro Italic en el original; uso **Montserrat Italic 500** como sustituto.
  - **Tamaño:** 58 px.
  - **Caja:** cápsula gris claro `#E9E9E9` al 90 %, radio 14 px, padding de 10×26 px, texto `#1A1A1A`.
  - **Posición:** centro horizontal, y = 1180 px (centro de la caja). Queda en el tercio inferior pero por encima de la zona de interfaz de Reels (los últimos 340 px).
  - **Bloques:** **1 a 3 palabras**. Se corta en pausa natural o al llegar a 18 caracteres.
  - **Animación:** aparece en 4 fotogramas (opacidad 0 → 1 y escala 0.92 → 1, curva *ease-out*). La palabra que se está diciendo pasa a peso 700, sincronizada palabra a palabra.
  - **Palabra destacada:** el producto o el beneficio (por ejemplo, "pijama", "cómoda") lleva la cápsula en rosa `#F6D7E3`, el color del título.

## 3. Textos en pantalla
| Texto | Entra | Sale | Estilo | Posición (lienzo 1080×1920) |
|---|---|---|---|---|
| "outfit / of the / day" (3 líneas) | 0.00 (ya visible) | 0.5–1.2 s: sale por la derecha acompañando el paneo de la cámara | Serif *soft display* muy redonda, minúsculas. [SUPOSICIÓN] Cooper Black o similar. Color `#F6D7E3`, sin sombra ni contorno | Centrado. Líneas en y≈509, 790 y 1100 (parte de arriba de la letra). Altura de "outfit" ≈150 px, lo que da un **tamaño de fuente de ≈190 px**. Interlineado ≈280 px (1.45). Ancho de bloque ≈700 px |
| "elaya_mx" | ≈6.0 s | Final | Cápsula gris claro, cursiva | Centro de la camisa, y≈1000 en el plano medio |
| "95% bambú" | ≈7.3 s | Final | Igual: cápsula de **235×57 px**, cursiva **≈34 px**, texto oscuro | Sobre el pecho, y≈540–597, x≈510–745 |
| "extra soft" | 7.78 s (con el corte) | Final | Igual | Sobre el short, y≈1308–1363 |

- **Las etiquetas parecen ancladas a la prenda,** como etiquetas de producto. Aparecen de golpe, sin animación visible, con unos **0.5 s** entre una y otra. [SUPOSICIÓN] Son los stickers de texto nativos de Instagram.
- **Máximo 3 etiquetas a la vez,** cada una de 1 a 2 palabras.
- **Sin logo y sin llamada a la acción** en el vídeo. El nombre de la marca va solo en la etiqueta "elaya_mx".

## 4. B-roll
- **No hay b-roll ni inserciones de detalle.** Todo es la misma persona, en la misma pared y con la misma luz, en tres distancias de plano.
- **Atrezo** que da vida al plano: teléfono, vaso rosa y bolso acolchado.

## 5. Transiciones
- **Corte seco** sobre el beat: 1.
- **Acercamiento rápido en cámara** de 0.25 s como transición entre el general y el medio: 1.
- **Sin** fundidos, barridos digitales, destellos ni desenfoque de movimiento añadido.

## 6. Zooms
- Acercamiento rápido de **1.0× → 1.6× en 0.25 s** en 5.30 s (en cámara).
- Acercamiento lento de **≈+8 % en 2.2 s** (5.55–7.78).
- Los demás planos sin zoom digital.
- **Para replicarlo en Remotion,** si el material no lo trae:
  - Acercamiento rápido digital de 1.0 → 1.25 en 8 fotogramas, curva `bezier(0.16,1,0.3,1)`.
  - Acercamiento lento de 1.0 → 1.06 a lo largo del plano.
  - Límite de **1.35×**, para no perder nitidez a 1080 p.

## 7. Color e imagen
- **Paleta:** pared beige cálida `#B29581`, ropa blanca con estampado de moños rosa, título rosa `#F6D7E3`. Contraste bajo y tonos cálidos.
- **Luz:** suave y frontal, sin sombras duras, de día.
- **Grano:** sin grano añadido. Sin viñeta.

## 8. Sonido
- **Solo música.** Sin voz, sin efectos de sonido y sin sonido ambiente.
- **Tempo:** **117.5 BPM**, un beat cada 0.51 s. Beats en 0.07, 0.56, 1.02, 1.49 … 7.73, 8.24 y 8.75 s.
- **Sincronía con el beat:** el corte (7.78 s) cae sobre el beat de 7.73. El acercamiento rápido (5.30–5.55 s) termina sobre el beat de 5.57.
- **Volumen:** **-14.0 LUFS** integrados, pico de -0.3 dBFS.
- **Curva de nivel:** más fuerte en 1–3 s (-14 dB RMS) y baja a ≈-24 dB RMS de 5 s en adelante. [SUPOSICIÓN] Es la propia estructura de la canción, no un ducking.
- **Tipo de música:** [SUPOSICIÓN] pop o R&B suave con voz de la canción, centroide espectral de ≈2 kHz. No identifiqué la canción.
- **Cuando mi vídeo tenga voz,** queda **voz delante y música debajo**:
  - Música a -20 dB con ducking de la voz.
  - Volumen total -14 LUFS.

## 9. Reglas para editar con este estilo
1. **Duración:** 9–15 s, con 3 a 5 planos que avanzan de general a medio y luego a corto.
2. **Cortes:** siempre sobre el beat de la música (±2 fotogramas). Plano medio de 1.5 a 3 s; el primero puede durar hasta 5 s.
3. **Gancho:** frase corta en serif redonda rosa, centrada, en los primeros 0.5 s, que sale con el movimiento del plano.
4. **Beneficios:** en cápsulas cursivas pequeñas sobre la prenda. Escalonadas cada 0.5 s, con un máximo de 3 en pantalla.
5. **Transiciones:** sin efectos digitales; solo cortes secos y, como mucho, un acercamiento rápido.
6. **Cierre:** el último plano es el más cercano y muestra la tela o el detalle.

## Correcciones aprobadas
(Aquí añado cada corrección tuya que te guste, para que se quede.)
