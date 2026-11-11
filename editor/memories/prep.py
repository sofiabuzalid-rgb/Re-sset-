"""RE:SET · The Memories We Wear — prepara las fotos que mandó el cliente en public/memories/.

Productos (fotos oficiales con modelo; se usan íntegras dentro de la tarjeta, sin recorte ni retoque):
  p_roja   pijama navideña roja y blanca (renos y copos)
  p_verde  pijama verde con jengibre, bastones y regalos
  p_grinch pijama crema adulto con personajes (licencia por confirmar)
Ambientes (referencias de inspiración; licencia para pauta NO confirmada):
  se recortan solo los íconos de Instagram que traían dos capturas (pasillo, escalera).
La foto del niño leyendo con perros no se usa: el libro muestra la marca de otra tienda.
Uso: python3 editor/memories/prep.py <carpeta_de_subidas>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "editor/video/public/memories"
FILES = {
    "p_roja": ("eadd677b-image.webp", None),
    "p_verde": ("9203ebdd-image.webp", None),
    "p_grinch": ("9af5877c-image.webp", None),
    "bg_bokeh": ("8bf41539-image.jpg", None),
    "bg_cena": ("59216f95-image.jpg", None),
    "bg_decorar": ("d162148b-image.jpg", None),
    "bg_baile": ("84e42b77-image.jpg", None),
    "bg_foto": ("0f2a61aa-image.jpg", None),
    "bg_pasillo": ("e30add8f-image.jpg", (60, 0, 1040, 1551)),   # quita el ícono de silencio (abajo a la derecha)
    "bg_escalera": ("ecf3fa40-image.jpg", (60, 0, 800, 1200)),  # quita el ícono de volumen
    "bg_nina": ("29bf988f-image.jpg", None),
    "bg_calle": ("3a739803-image.jpg", None),
}


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (f, box) in FILES.items():
        im = Image.open(src / f).convert("RGB")
        if box:
            im = im.crop(box)
        im.save(OUT / f"{name}.jpg", quality=94)
        print(name, im.size)
    rng = np.random.default_rng(7)
    for k in range(4):  # film grain tiles (neutral grey, alpha carries the grain)
        g = rng.normal(0, 1, (512, 512))
        a = np.clip(np.abs(g) * 60, 0, 255).astype(np.uint8)
        c = np.where(g > 0, 255, 0).astype(np.uint8)
        Image.fromarray(np.dstack([c, c, c, a]), "RGBA").save(OUT / f"grain{k}.png")


if __name__ == "__main__":
    main()
