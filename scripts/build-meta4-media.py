"""
RE:SET — 4 Meta Ads (src/meta4/a1..a4.json) — media.
Sources: "u:NAME" = original uploaded to the chat (/root/.claude/uploads/...), "d:FILE" = Drive original in
library/cache (byte-identical copy, see library/README.md). Only visually reviewed material is referenced.
- Video: iPhone HLG -> SDR BT.709 (hable tone-map) when HDR; cover-crop to 1080x1920 (cx/cy = crop centre 0..1);
  gentle natural grade; muted (music only). 720p sources are upscaled with lanczos + light sharpening.
- Photo: HEIC/JPG -> 1080x1920 cover crop JPG (EXIF-rotated).
- Split shots: the right-hand source is rendered as <id>r.mp4.
Usage: python3 scripts/build-meta4-media.py a1 [a2 ...]
"""
import json, os, subprocess, sys
from PIL import Image, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
ROOT = os.path.join(os.path.dirname(__file__), "..")
UP = "/root/.claude/uploads/1b75fe26-72bc-59d2-bf4f-563ba787541e"
CACHE = os.path.join(ROOT, "library", "cache")
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE = "eq=gamma=1.05:contrast=1.04:saturation=1.05,unsharp=5:5:0.35:5:5:0"


def resolve(ref):
    kind, name = ref.split(":", 1)
    if kind == "u":
        hits = sorted(f for f in os.listdir(UP) if f.split("-", 1)[-1].rsplit(".", 1)[0] == name)
        if not hits:
            sys.exit(f"no upload {name}")
        return os.path.join(UP, hits[0])
    hits = [f for f in os.listdir(CACHE) if f.endswith("__" + name)]
    if not hits:
        sys.exit(f"no cache {name}")
    return os.path.join(CACHE, hits[0])


def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", p],
                                  capture_output=True, text=True).stdout)
    v = [s for s in j["streams"] if s["codec_type"] == "video"][0]
    w, h = v["width"], v["height"]
    rot = 0
    for sd in v.get("side_data_list", []):
        rot = int(sd.get("rotation", 0) or 0) or rot
    if abs(rot) == 90:
        w, h = h, w
    return w, h, v.get("color_transfer") in ("arib-std-b67", "smpte2084")


def cover(w, h, cx, cy):
    s = "scale=-2:1920:flags=lanczos" if w / h > 1080 / 1920 else "scale=1080:-2:flags=lanczos"
    return f"{s},crop=1080:1920:(iw-1080)*{cx}:(ih-1920)*{cy}"


def video(src, t_in, frames, out, cx=0.5, cy=0.5, speed=1.0):
    w, h, hdr = probe(src)
    vf = ([TM] if hdr else []) + [f"setpts=PTS/{speed}", cover(w, h, cx, cy), GRADE]
    if h < 1500:
        vf.append("unsharp=3:3:0.3")
    return subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(t_in), "-i", src, "-an", "-vf", ",".join(vf) + ",format=yuv420p",
                             "-frames:v", str(frames), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
                             "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out])


def photo(src, out, cx=0.5, cy=0.5, fit="cover", bg="#FFFFFF"):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if fit == "contain":  # packshot: centred on its own background colour
        s = min(980 / im.width, 1500 / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        c = Image.new("RGB", (1080, 1920), bg)
        c.paste(im, ((1080 - im.width) // 2, (1920 - im.height) // 2 - 60))
        c.save(out, quality=94)
        return
    s = max(1080 / im.width, 1920 / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - 1080) * cx, (im.height - 1920) * cy
    im.crop((round(x), round(y), round(x) + 1080, round(y) + 1920)).save(out, quality=94)


for ad in sys.argv[1:]:
    e = json.load(open(os.path.join(ROOT, "src", "meta4", f"{ad}.json")))
    out = os.path.join(ROOT, "public", "meta4", ad)
    os.makedirs(out, exist_ok=True)
    procs = []
    for s in e["shots"]:
        src = resolve(s["src"])
        if src.lower().endswith((".heic", ".jpg", ".jpeg", ".png")):
            photo(src, os.path.join(out, f"{s['id']}.jpg"), s.get("cx", 0.5), s.get("cy", 0.5), s.get("fit", "cover"), s.get("bg", "#FFFFFF"))
            continue
        procs.append(video(src, s["in"], s["frames"], os.path.join(out, f"{s['id']}.mp4"), s.get("cx", 0.5), s.get("cy", 0.5), s.get("speed", 1.0)))
        if "right" in s:
            r = s["right"]
            procs.append(video(resolve(r["src"]), r["in"], s["frames"], os.path.join(out, f"{s['id']}r.mp4"), r.get("cx", 0.5), r.get("cy", 0.5)))
        while len(procs) >= 6:
            procs.pop(0).wait()
    for p in procs:
        p.wait()
    print(ad, sum(s["frames"] for s in e["shots"]), "frames")
