# Recreación "outfit of the day" — RE:SET

## 1. Análisis técnico del original

**Fuente:** reel de @elaya_mx, grabado en pantalla en 1170×2532 a 60 fps.
- Dura 9.27 s y vuelve a empezar (loop).
- Se excluye la interfaz de Instagram, la barra de estado y el centro de control que aparece en 10.1 s.
- Cortes medidos fotograma a fotograma por diferencia de luminancia.
- Tempo medido con librosa.

| Segundo | Imagen | Movimiento de modelo / cámara | Texto y animación | Música (117.5 BPM, un beat cada 0.51 s) |
|---|---|---|---|---|
| 0.0–0.3 | Pared beige vacía | Cámara fija | "outfit / of the / day": serif redonda, rosa #F6D7E3, centrada, ~190 px; líneas a 31 / 45 / 59 % del alto | Beat en 0.07 |
| 0.3–1.2 | Ella entra por la izquierda: teléfono en la oreja, bolso, termo | Paneo de cámara siguiéndola | El título deriva hacia la derecha con la pared y sale del cuadro en 1.2 s | Beats en 0.56 y 1.02 |
| 1.2–5.3 | **Plano "general"** (cabeza a muslo): de pie, hablando por teléfono, gira la cabeza | Cámara en mano, casi fija | — | Tramo más fuerte (−14 dB RMS) en 1–3 s |
| 5.30–5.55 | **Acercamiento rápido en cámara** 1.0 → ~1.6× | Sin corte | — | Termina sobre el beat de 5.57 |
| 5.55–7.78 | **Plano medio**: bebe del termo (mano a la cara) | Acercamiento lento de ~+8 % | 6.0 s: "elaya_mx"; 7.3 s: "95% bambú". Cápsulas pequeñas, cursivas, gris claro, que aparecen de golpe | Beats en 6.15, 6.69 y 7.22 |
| 7.78 | **Corte seco** | — | 7.78 s: "extra soft" | Sobre el beat de 7.73 |
| 7.78–9.27 | **Plano corto**: perfil de 3/4 que gira a frente; la mano toca la tela del short | En mano | Las 3 etiquetas se quedan hasta el final | Beats en 8.24 y 8.75; loop |

- **Color:** paleta cálida y neutra, luz suave y frontal, contraste bajo, sin grano ni viñeta.
- **Final:** sin pantalla final, sin CTA y sin logo, salvo el nombre de la marca en una etiqueta.

## 2. Material real de RE:SET elegido

**IMG_8492** (Michelle, conjunto taupe de manga larga, frente a la pared lisa con el letrero RE:SET) como toma principal, más **IMG_8491** (misma modelo, mismo conjunto) para el plano final.

**Por qué:**
- **8492 tiene la misma estructura que la referencia:** empieza con la pared vacía, ella entra a cuadro, posa, mira a cámara y se lleva la mano al pelo. Ese gesto es el equivalente real a "beber del termo".
- **8491 (3.4–4.9 s):** ella tira del cordón de la prenda, que es el equivalente real a "la mano toca la tela".
- **Fondo:** neutro y limpio, luz pareja, cuerpo completo, gestos espontáneos.

**Limitaciones del material** (en la carpeta no hay ninguna toma de modelo con pijama de camisa y shorts):
- **Prenda:** el conjunto es de manga larga con pantalón, no camisa y short.
- **Pared:** es gris clara, no beige. No la recoloreo, para no alterar el color real del producto.
- **Resolución:** los clips son 720×1280 y la modelo está lejos. Para el encuadre de la referencia hace falta zoom digital de 1.5–2.0×. Escalé los clips con lanczos y un enfoque suave, pero la imagen es más suave que en el original.
- **Entrada:** ella entra por la **derecha**, no por la izquierda. No invertí la imagen, porque el letrero RE:SET saldría al revés.

## 3. Recreación (Remotion: `editor/video/src/recreacion/`)

| Segundo | RE:SET | Correspondencia con la referencia |
|---|---|---|
| 0.0–0.5 | Pared lisa (8492 a 0.1 s, zoom 1.52 que deja el letrero fuera de cuadro) con "outfit / of the / day" en Fraunces 900 SOFT, rosa #F6D7E3, 228 px, líneas a 505 / 775 / 1045 px | Título sobre la pared vacía |
| 0.3–1.2 | Ella entra desde la derecha; paneo digital que la sigue (origen x de 88 % a 15 %) | Título que deriva y sale por la derecha en 1.2 s |
| 1.2–5.3 | Cabeza a muslo: mira el conjunto, se acomoda, mira a cámara | Plano "general" |
| 5.30–5.55 | Acercamiento rápido 1.52 → 1.85× en 8 fotogramas (ease-out) | Acercamiento rápido sobre el beat |
| 5.55–7.78 | Plano medio: sonríe, mano al pelo, gira el pelo | Gesto de mano a la cara |
| 6.0 / 7.3 s | Etiquetas "RE:SET" (centro del pecho) y "manga larga" (manga) | "elaya_mx" y "95% bambú" |
| 7.78 | Corte seco a 8491: plano corto, manos en el cordón; etiqueta "cordón ajustable" | "extra soft" con el corte |
| 7.78–9.27 | Sonríe, ladea la cabeza; las 3 etiquetas se quedan, colocadas sobre la prenda | Plano final |

- **Etiquetas:** solo características **visibles** de la prenda. No hay composición de tejido verificada en el material, así que no uso "95% bambú" ni afirmaciones de suavidad.
- **Música:** el MP4 lleva una pista AAC muda. La canción original no tiene licencia comprobada. Cuando haya una pista autorizada de ~117 BPM, basta con poner `MUSIC` en `config.ts`; los cortes ya están en los tiempos de beat de la referencia.
- **Elementos editables:** todo lo que se puede cambiar (vídeos, textos, colores, tipografías, música, logo y etiquetas) está en `config.ts`.
