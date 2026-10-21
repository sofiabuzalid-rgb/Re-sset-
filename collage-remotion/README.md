# RE:SET · Collage editorial (Remotion)

Recreación del collage de referencia con productos reales de resetwear.com.mx.
1080×1920 · 30 fps · 7 s · H.264.

## Productos usados (fotos originales del catálogo, solo se quitó el fondo)

| Posición | Producto | URL |
|---|---|---|
| Arriba izq. | Soft Winter Latte Women | https://resetwear.com.mx/products/soft-winter-latte-women |
| Arriba centro (protagonista) | Petal Essential Button Set For Her | https://resetwear.com.mx/products/petal-button-set-for-her |
| Arriba der. | Gray Button Set For Her | https://resetwear.com.mx/products/mist-button-set-for-her |
| Abajo izq. | Soft Winter Blush Women | https://resetwear.com.mx/products/soft-winter-blush-women |
| Abajo centro | Shine Pink Women Pantalón Manga Corta | https://resetwear.com.mx/products/shine-pink-women-pantalon-manga-corta |
| Abajo der. (protagonista) | Black-Button Set For Her | https://resetwear.com.mx/products/black-button-set-for-her |

Corazones y destellos son gráficos decorativos (`src/Decor.tsx`), no productos.

## Estructura

- `assets/originals/` fotos tal cual se descargaron del catálogo
- `assets/cutouts/` recortes PNG transparentes (BiRefNet, sin retoque del producto)
- `public/stickers/` stickers con contorno blanco (generados con `tools/make_stickers.py`)
- `public/bg-linen.jpg` fondo de sábana (procedural, `tools/make_background.py`)
- `public/music.wav` música original sintetizada (`tools/make_music.py`), libre para uso comercial
- `public/reset-logo.svg` logotipo oficial (del PDF de marca)
- `src/products.ts` posición, tamaño, rotación y frame de entrada de cada producto
- `src/ResetCollage.tsx` animación (timeline en frames en la constante `T`)

## Cambiar un producto

1. Pon el recorte PNG transparente en `assets/cutouts/`.
2. `python3 tools/make_stickers.py assets/cutouts public/stickers`
3. Edita la entrada en `src/products.ts` (archivo, nombre, URL, aspect = ancho/alto del sticker).

## Comandos

```
npm install
npm run studio     # editor visual
npm run render     # out/reset-collage.mp4
```
