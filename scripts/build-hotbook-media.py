"""
"ASÍ VIVIMOS HOTBOOK BAZAR" — RE:SET event recap media.
- Shots: iPhone HLG HDR (10-bit BT.2020) tone-mapped to SDR BT.709 (hable), one shared warm editorial grade
  (lifted shadows, soft contrast, a touch of warmth, gentle sharpening) so every clip matches, native 1080x1920, muted.
  A shot with "xf" gets xf extra frames before its in-point so it can dissolve in over the previous one.
  Reds and greens (the Christmas prints) are pulled back a little so the cut stays in cream / pink / blue / beige.
- Music is built separately by scripts/build-hotbook-music.py (or set edit.json "music" to null for a silent master,
  or drop a supplied track in public/hotbook/ and name it there).
Output: public/hotbook/<shot>.mp4
Usage: python3 scripts/build-hotbook-media.py /folder/with/originals
"""
import glob, json, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "hotbook")
e = json.load(open(os.path.join(ROOT, "src", "hotbook", "edit.json")))
FPS = e["fps"]
os.makedirs(OUT, exist_ok=True)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731


def src(n):
    c = sorted(glob.glob(os.path.join(SRC, f"*{n}.mov")) + glob.glob(os.path.join(SRC, f"*{n}.MOV")), key=os.path.getsize)
    return c[-1]


TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = ("eq=gamma=1.08:contrast=1.02:saturation=1.03:brightness=0.01,"
         "curves=all='0/0.035 0.5/0.52 1/0.98',"
         "colorbalance=rs=0.02:gs=0.005:bs=-0.012:rm=0.012:bm=-0.012:rh=0.01:bh=-0.006,"
         "huesaturation=saturation=-0.22:colors=r,huesaturation=saturation=-0.18:colors=g,"
         "unsharp=5:5:0.45:5:5:0.0")

# ---------------- shots
TOTAL = 0
for s in e["shots"]:
    TOTAL += s["frames"]
    if "photo" in s:
        continue
    xf = s.get("xf", 0)
    vf = f"{TONEMAP},{GRADE},scale=1080:1920:flags=lanczos,format=yuv420p"
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['in'] - xf / FPS:.3f}", "-i", src(s["src"]), "-an", "-vf", vf,
         "-frames:v", str(s["frames"] + xf), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", os.path.join(OUT, f"{s['id']}.mp4")])
print("total", TOTAL, "frames")
