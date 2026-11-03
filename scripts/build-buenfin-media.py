"""
INVITACIONES BUEN FIN — product-window clips. Each product in src/buenfin/buenfin.json is cut from its source
(4 s from "in"), HDR (HLG) tone-mapped to SDR when needed, cropped to the 3:4 arch window, placed by "y"
(0 = top of the frame, 1 = bottom), graded like the rest of the RE:SET ads, 900x1200, muted.
Output: public/buenfin/clip-<id>.mp4
Usage: python3 scripts/build-buenfin-media.py /folder/with/clips [/another/folder ...]
"""
import glob, json, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
e = json.load(open(os.path.join(ROOT, "src", "buenfin", "buenfin.json")))
OUT = os.path.join(ROOT, "public", "buenfin")
TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
GRADE = ("scale=900:1200:flags=lanczos,eq=contrast=1.04:saturation=1.03:gamma=0.99,"
         "curves=all='0/0.02 0.25/0.235 0.5/0.5 0.75/0.765 1/0.985',colorbalance=rm=0.012:bm=-0.012,unsharp=5:5:0.5:5:5:0.0")


def src(name):
    hits = [p for d in sys.argv[1:] for p in glob.glob(os.path.join(d, f"*{name}.*"))]
    return sorted(hits, key=os.path.getsize)[-1]


for p in e["products"]:
    s = src(p["src"])
    trc = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer",
                          "-of", "csv=p=0", s], capture_output=True, text=True).stdout.strip()
    # crop a 3:4 window from the (auto-rotated) portrait frame; "y" places it in the spare height (0 top, 1 bottom)
    crop = f"crop=iw:iw*4/3:0:(ih-iw*4/3)*{p['y']}"
    vf = (TONEMAP if "arib-std-b67" in trc else "") + crop + "," + GRADE
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(p["in"]), "-i", s, "-an", "-t", "4", "-vf", vf, "-r", "30",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", os.path.join(OUT, f"clip-{p['id']}.mp4")], check=True)
    print(p["id"], p["src"], trc or "sdr")
