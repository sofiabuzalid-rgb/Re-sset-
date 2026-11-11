# RE:SET · THE MEMORIES WE WEAR — entrega

## Versión vigente: mismo concepto que el reel de referencia, sin texto, con su audio
| Archivo | Composición | Pijama |
|---|---|---|
| `out/RESET_CHRISTMAS_MEMORIES_01.mp4` (+ `_SIN_AUDIO`) | `RESET-CHRISTMAS-MEMORIES-01` | roja y blanca, líneas vino |
| `out/RESET_CHRISTMAS_MEMORIES_02.mp4` (+ `_SIN_AUDIO`) | `RESET-CHRISTMAS-MEMORIES-02` | verde, líneas verde pino |
Variante lista: `RESET-CHRISTMAS-MEMORIES-03-GRINCH`. Código: `src/memories/RefFilm.tsx`.

**Audio:** la canción del reel de referencia completa y sin tocar, de su primera nota (0 s) a donde el reel termina y
se repite (10.19 s), tomada de la segunda grabación de pantalla (la primera empezaba 0.55 s tarde y se cortaba a los 8.4 s).
No se normaliza ni se comprime (`mux.sh` la pone idéntica: correlación 1.0, desfase 0 ms; −11.3 LUFS, como suena en el reel).

**Tiempos (sobre la canción, pulso 0.48 s = 125 BPM):** 0–5.58 s pared crema, la pijama fija, dos líneas verticales desde el
primer cuadro; la línea de arriba cae en el golpe de 1.65 s y la de abajo en el de 3.08 s; casi silencio 4.6–5.4 s; a los
5.58 s entra el golpe y el fondo cambia en cada corchea, como en el reel de referencia (19 cortes, 5.58 → 9.90 s, cada uno a
≤ 13 ms de su corchea). El último se queda hasta el final. Sin texto ni logo.

**Licencia:** el audio es de otra cuenta. **No sirve para pauta.** Orgánico: subir `_SIN_AUDIO` y elegir ese audio dentro de
Instagram ("Usar audio"). Anuncios: otra música con licencia.

## Hanukkah
`out/RESET_HANUKKAH_MEMORIES.mp4` (+ `_SIN_AUDIO`), composición `RESET-HANUKKAH-MEMORIES`: mismo concepto, misma canción y
mismos tiempos; la pijama es el top azul marino y blanco a rayas con ositos (foto en gancho, sin recortar: la tarjeta toma la
proporción de la foto); líneas azul marino; 19 mundos de Hanukkah (menorás, mesa, sufganiyot, regalo, ventana con la familia
al final). No se usó la foto del libro de rezos abierto (texto sagrado y nombre de la editorial). Las fotos de ambiente
tampoco tienen licencia confirmada.

## Versión anterior (editorial con textos y música original) — descartada por el cliente
Composiciones `RESET-CHRISTMAS-MEMORIES-EDITORIAL-*` (`src/memories/films.tsx`, música `editor/memories/music.py`).

### Detalle de la versión editorial

| Archivo | Composición | Duración | Pijama |
|---|---|---|---|
| `out/RESET_CHRISTMAS_MEMORIES_01.mp4` | `RESET-CHRISTMAS-MEMORIES-01` | 18.7 s | roja y blanca |
| `out/RESET_CHRISTMAS_MEMORIES_02.mp4` | `RESET-CHRISTMAS-MEMORIES-02` | 16.0 s | verde |

Variantes listas para renderizar (mismo guion, otra pijama): `-01-VERDE`, `-01-GRINCH`, `-02-ROJA`, `-02-GRINCH`.
Otra pijama nueva: agregar la foto a `PRODUCTS` en `src/memories/Memories.tsx` y una composición en `Root.tsx`.

## Mecánica (del reel de referencia, analizado cuadro por cuadro)
La muestra nunca se mueve; líneas finas entran y arman una retícula a su alrededor; luego el mundo detrás cambia al ritmo
(en la referencia, un corte cada corchea entre 5.0 y 8.4 s) y se cierra en la pared limpia. Aquí la muestra es la foto real de
la pijama, sin recorte ni retoque, como impresión fotográfica ("recuerdo"), en el mismo lugar y tamaño en todos los cuadros.

## 01 · 90 BPM (un compás = 80 cuadros)
0–2.7 s PIJAMAS / PARA LOS MOMENTOS QUE IMPORTAN. / RE:SET CHRISTMAS, líneas que arman la retícula ·
2.7 cena "Las cenas en familia." · 5.3 árbol "Decorar el árbol juntos." · 8 baile + foto antigua "Los recuerdos que se quedan." ·
10.7 calle nevada "La magia de diciembre." + ráfaga de cuatro mundos (uno por corchea) · 13.3 pared crema, líneas vino:
"NO SON SOLO PIJAMAS." → 16 "SON MOMENTOS" + logo → "Descubre la colección navideña."

## 02 · vals 72 BPM (un compás = 75 cuadros)
0–2.5 s ¿Y SI ESTA / PIJAMA / SE CONVIERTE EN UN RECUERDO? · árbol · cena · mañana de Navidad (escalera) · baile, con
fundidos largos y sin texto · 12.5 pared crema, líneas verde pino: PIJAMAS + logo · HECHAS PARA COMPARTIR MOMENTOS.

## Música
Original, compuesta en código (`editor/memories/music.py`): piano, cuerdas, campanillas; RE:SET es dueña. Sin licencias de terceros.

## Pendiente antes de pautar
- **Fotos de ambiente:** son las referencias que mandó el cliente; no hay licencia comercial confirmada. Reemplazar por fotos
  propias o con licencia (mismo nombre en `public/memories/bg_*.jpg`) o confirmar derechos.
- No había foto de "noche de películas": en 01 va "Decorar el árbol juntos." y en 02 la mañana de Navidad.
- No llegó la pijama azul con ositos; la tercera variante usa la pijama crema de adulto (licencia del personaje por confirmar).
- Llegó un solo video de referencia (el brief menciona dos).
- No se usó la foto del niño leyendo con perros: el libro muestra la marca de otra tienda.
