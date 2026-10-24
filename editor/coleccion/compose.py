"""RE:SET New Collection — compone cada tramo recortado sobre un fondo de estudio (sin volver a correr la IA).

Uso: python3 editor/coleccion/compose.py [nombre ...]   (por defecto, todos los de editor/coleccion/matte/)
Fondo: gris claro cálido con luz suave centrada arriba (como un ciclorama de estudio), sombra de la modelo
directamente detrás (desenfoque amplio, desplazamiento mínimo, 13 %). La prenda y la piel no se tocan.
"""
import subprocess, sys
from pathlib import Path
import cv2
import numpy as np

HERE = Path(__file__).parent
OUT = HERE.parent / "video/public/coleccion"
W, H, FPS = 1080, 1920, 30

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W * 0.5) / (W * 0.9)) ** 2 + ((yy - H * 0.38) / (H * 0.75)) ** 2)
light = np.clip(1 - r, 0, 1) ** 1.6  # 1 at the hot spot, 0 at the corners
BG = (np.array([226, 229, 232], np.float32)[None, None] * (1 - light[..., None]) + np.array([245, 246, 247], np.float32)[None, None] * light[..., None])  # BGR, warm


def frames(path, gray=False):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "gray" if gray else "bgr24", "-"], stdout=subprocess.PIPE)
    size = W * H * (1 if gray else 3)
    while True:
        b = p.stdout.read(size)
        if len(b) < size:
            return
        yield np.frombuffer(b, np.uint8).reshape((H, W) if gray else (H, W, 3))


def compose(name):
    m = HERE / "matte" / name
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-g", "1",
                            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", str(OUT / f"{name}.mp4")], stdin=subprocess.PIPE)
    for fg, a in zip(frames(f"{m}.fg.mp4"), frames(f"{m}.alpha.mp4", gray=True)):
        a = a.astype(np.float32) / 255
        sh = cv2.GaussianBlur(np.roll(np.roll(a, 10, 0), 12, 1), (0, 0), 45)
        bg = BG * (1 - 0.13 * sh[..., None])
        o = fg.astype(np.float32) * a[..., None] + bg * (1 - a[..., None])
        enc.stdin.write(o.clip(0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    print("ok", name)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or sorted({p.name.split(".")[0] for p in (HERE / "matte").glob("*.alpha.mp4")})
    for n in names:
        compose(n)
