// Real RE:SET catalogue items used in the collage.
// To swap a product: drop its transparent cutout in assets/cutouts, run
// `python3 tools/make_stickers.py assets/cutouts public/stickers`, then edit the entry below.
// x / y = sticker centre on the 1080x1920 canvas, h = displayed height in px,
// rot = resting rotation (deg), enter = frame the sticker starts appearing.

export type Product = {
  name: string;
  url: string;
  sticker: string; // file in public/stickers
  aspect: number; // sticker width / height
  x: number;
  y: number;
  h: number;
  rot: number;
  enter: number;
};

export const PRODUCTS: Product[] = [
  // top row
  {
    name: 'Soft Winter Latte Women',
    url: 'https://resetwear.com.mx/products/soft-winter-latte-women',
    sticker: 'soft-winter-latte-women.png',
    aspect: 516 / 1160,
    x: 180,
    y: 655,
    h: 470,
    rot: -5,
    enter: 10,
  },
  {
    name: 'Petal Essential Button Set For Her',
    url: 'https://resetwear.com.mx/products/petal-button-set-for-her',
    sticker: 'petal-button-set-for-her.png',
    aspect: 924 / 1160,
    x: 545,
    y: 615,
    h: 540,
    rot: 0,
    enter: 4,
  },
  {
    name: 'Gray Button Set For Her',
    url: 'https://resetwear.com.mx/products/mist-button-set-for-her',
    sticker: 'mist-button-set-for-her.png',
    aspect: 944 / 1160,
    x: 905,
    y: 668,
    h: 380,
    rot: 6,
    enter: 16,
  },
  // bottom row (appears after the "plan" is sent)
  {
    name: 'Soft Winter Blush Women',
    url: 'https://resetwear.com.mx/products/soft-winter-blush-women',
    sticker: 'soft-winter-blush-women.png',
    aspect: 839 / 1160,
    x: 200,
    y: 1390,
    h: 400,
    rot: -6,
    enter: 94,
  },
  {
    name: 'Shine Pink Women Pantalón Manga Corta',
    url: 'https://resetwear.com.mx/products/shine-pink-women-pantalon-manga-corta',
    sticker: 'shine-pink-women-pantalon-manga-corta.png',
    aspect: 499 / 1160,
    x: 482,
    y: 1405,
    h: 390,
    rot: 3,
    enter: 100,
  },
  {
    name: 'Black-Button Set For Her',
    url: 'https://resetwear.com.mx/products/black-button-set-for-her',
    sticker: 'black-button-set-for-her.png',
    aspect: 907 / 1160,
    x: 815,
    y: 1375,
    h: 540,
    rot: 4,
    enter: 106,
  },
];
