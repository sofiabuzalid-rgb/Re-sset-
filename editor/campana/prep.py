"""RE:SET — campaña: clips de RESET HOY → editor/video/public/campana/media/IMG_xxxx.mp4 (1080×1920, 30 fps, todo intra).

Corrección por clip, conservadora para no tocar los estampados:
  balance de blancos: ganancias R/B estimadas sobre píxeles claros y poco saturados (paredes, sábanas), aplicadas al 60 %
  y limitadas a ±8 %; exposición: gamma suave solo si el clip está oscuro. Escalado lanczos 720→1080 + enfoque leve.
Las tomas de tienda (IMG_20xx, HLG) ya vienen convertidas a SDR en public/navidad03 y se reutilizan tal cual.
"""
import shutil, subprocess, sys
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "library/cache/resethoy"
OUT = ROOT / "editor/video/public/campana/media"
CLIPS = {
    "familia": "8946 8944 8949 8943 8934 8941 8961 8957 8935 8933",
    "casa": "9039 9025 8993 8998 9009 9006 9008 9010 9022 9029 9035 9036 9045 9020 9015 8947 9017 9005",
    "favorita": "9047 9048 9049 9050 9051 9052 9054",
    "viaje": "8974 8973 8972 8976 8975 8977 8979 8981 8982 8987 8971 8980 8984",
}
RACK = "2041 2044 2052 2053"


def gains(path):
    cap = cv2.VideoCapture(str(path))
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    px = []
    for k in np.linspace(0.1, 0.9, 6):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(n * k))
        ok, f = cap.read()
        if not ok:
            continue
        f = f.reshape(-1, 3).astype(np.float32)
        lum = f.mean(1)
        sat = f.max(1) - f.min(1)
        sel = f[(lum > np.percentile(lum, 70)) & (sat < 0.12 * lum + 6) & (lum < 245)]
        if len(sel) > 500:
            px.append(sel.mean(0))
    if not px:
        return 1.0, 1.0, 128
    b, g, r = np.mean(px, 0)
    k = lambda c: float(np.clip(1 + 0.6 * (g / c - 1), 0.92, 1.08))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n // 2)
    ok, f = cap.read()
    return k(r), k(b), float(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).mean()) if ok else 128


def prep(n):
    out = OUT / f"IMG_{n}.mp4"
    if out.exists():
        return
    src = SRC / f"IMG_{n}.MP4"
    rg, bg, luma = gains(src)
    gamma = 1.08 if luma < 90 else 1.0
    vf = (f"colorchannelmixer=rr={rg:.4f}:bb={bg:.4f},eq=gamma={gamma}:contrast=1.03:saturation=1.03,"
          "scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "fast", "-crf", "15", "-g", "1",
                    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", out], check=True)
    print(f"IMG_{n}  R×{rg:.3f} B×{bg:.3f} γ{gamma}")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for r in RACK.split():
        shutil.copy(ROOT / f"editor/video/public/navidad03/IMG_{r}.mp4", OUT / f"IMG_{r}.mp4")
    todo = sorted({c for ad in (sys.argv[1:] or CLIPS) for c in CLIPS[ad].split()})
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(6) as ex:
        list(ex.map(prep, todo))
