"""
RE:SET media library — ingest Drive photo downloads (HEIC/JPG/PNG/WEBP).
Same contract as ingest.py: original bytes go untouched to library/cache/<drive_id>__<title>; a small preview
(library/sheets/photos/<title>.jpg, long side 480 px, EXIF-rotated) is made for review; resolution/orientation are
recorded and the entry is upserted in library/catalog.json as "descargado — pendiente de revisión visual".
Usage: python3 scripts/library/ingest_photos.py <tool-result.json> [...]
"""
import base64, csv, io, json, os, sys
from PIL import Image, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
LIB = os.path.join(ROOT, "library")
CACHE = os.path.join(LIB, "cache")
PREV = os.path.join(LIB, "sheets", "photos")
CAT = os.path.join(LIB, "catalog.json")
os.makedirs(CACHE, exist_ok=True)
os.makedirs(PREV, exist_ok=True)
inv = {r["drive_id"]: r for r in csv.DictReader(open(os.path.join(ROOT, "docs", "drive-inventario.csv")))}
cat = json.load(open(CAT)) if os.path.exists(CAT) else {}
for src in sys.argv[1:]:
    d = json.load(open(src))
    fid, title = d["id"], d["title"]
    data = base64.b64decode(d["content"])
    path = os.path.join(CACHE, f"{fid}__{title}")
    open(path, "wb").write(data)
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    w, h = im.size
    pv = im.convert("RGB")
    pv.thumbnail((480, 480))
    out = os.path.join(PREV, title.rsplit(".", 1)[0] + ".jpg")
    pv.save(out, quality=80)
    e = cat.get(fid, {})
    e.update({"drive_id": fid, "archivo": title, "carpeta_drive": inv.get(fid, {}).get("carpeta", ""), "mime": d.get("mimeType"),
              "bytes": len(data), "verificado_tamano": abs(len(data) / 1e6 - float(inv.get(fid, {}).get("MB", -1))) < 0.06,
              "origen_revision": "descarga Drive", "cache": os.path.relpath(path, ROOT), "tipo": "foto",
              "resolucion": f"{w}x{h}", "orientacion": "vertical" if h > w else ("horizontal" if w > h else "cuadrado"),
              "hoja_contacto": os.path.relpath(out, ROOT)})
    e.setdefault("estado", "descargado — pendiente de revisión visual")
    cat[fid] = e
    print(title, len(data), f"{w}x{h}")
json.dump(cat, open(CAT, "w"), ensure_ascii=False, indent=1)
