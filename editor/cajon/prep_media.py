"""SDR, colour-matched intermediates of the four RE:SET drawer clips for the Remotion project.
HLG HDR -> BT.709 SDR (hable tonemap), then per-clip white balance so the white drawer reads the same clean white
in every shot (measured on bright near-neutral pixels), plus a light +4% contrast/saturation. All-intra for exact seeks."""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).parent
OUT = HERE.parent / "video" / "public" / "cajon"
OUT.mkdir(parents=True, exist_ok=True)
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
TARGET = np.array([243.0, 241.0, 238.0])  # clean white, a hair warm so it never looks grey
PROBE = {"2122": 3.3, "2123": 5.0, "2124": 0.4, "2125": 6.6}  # a frame with lots of drawer white

for n, t in PROBE.items():
    png = HERE / f"an/wb_{n}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", HERE / f"src/IMG_{n}.mov", "-frames:v", "1", "-vf", TM, png], check=True)
    a = np.array(Image.open(png).convert("RGB")).astype(float)
    L, sat = a.mean(2), a.max(2) - a.min(2)
    white = a[(L > np.percentile(L, 85)) & (sat < 40)].mean(0)
    g = TARGET / white
    print(n, "white", white.round(1), "gains", g.round(3))
    vf = f"{TM},colorchannelmixer=rr={g[0]:.4f}:gg={g[1]:.4f}:bb={g[2]:.4f},eq=contrast=1.04:saturation=1.04,format=yuv420p"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", HERE / f"src/IMG_{n}.mov", "-an", "-vf", vf, "-c:v", "libx264", "-crf", "12", "-g", "1",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", OUT / f"IMG_{n}.mp4"], check=True)
