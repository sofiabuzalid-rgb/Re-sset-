"""
RE:SET media library — ingest Drive downloads.

Reads the JSON files the Google Drive connector saves for download_file_content ({content(base64), id, mimeType,
title}), writes the original bytes untouched to library/cache/<drive_id>__<title> (cache is gitignored: the
container is ephemeral, re-download from Drive when needed), verifies the size against the Drive inventory,
probes technical metadata (duration, resolution, orientation, fps, HDR, audio), makes a contact sheet
(library/sheets/<title>.jpg, 8 frames, HDR tone-mapped for viewing only) and a speech check (sherpa-onnx Whisper),
then upserts the entry in library/catalog.json with status "descargado — pendiente de revisión visual".

Usage: python3 scripts/library/ingest.py <tool-result.json> [...]
"""
import base64, csv, json, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
LIB = os.path.join(ROOT, "library")
CACHE = os.path.join(LIB, "cache")
SHEETS = os.path.join(LIB, "sheets")
CAT = os.path.join(LIB, "catalog.json")
ASR = os.environ.get("ASR_DIR", "/tmp/claude-0/-home-user-Re-sset-/1b75fe26-72bc-59d2-bf4f-563ba787541e/scratchpad/asr")
os.makedirs(CACHE, exist_ok=True)
os.makedirs(SHEETS, exist_ok=True)
TM = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"

inv = {r["drive_id"]: r for r in csv.DictReader(open(os.path.join(ROOT, "docs", "drive-inventario.csv")))}
cat = json.load(open(CAT)) if os.path.exists(CAT) else {}


def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", p],
                                  capture_output=True, text=True).stdout or "{}")
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in j.get("streams", []) if s.get("codec_type") == "audio"), None)
    if not v:
        return None
    w, h = int(v["width"]), int(v["height"])
    rot = 0
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    if abs(rot) == 90:
        w, h = h, w
    num, den = (v.get("avg_frame_rate") or "0/1").split("/")
    fps = round(float(num) / float(den), 2) if float(den) else 0
    dur = float(j.get("format", {}).get("duration") or v.get("duration") or 0)
    return {
        "duracion_s": round(dur, 2),
        "resolucion": f"{w}x{h}",
        "orientacion": "vertical" if h > w else ("horizontal" if w > h else "cuadrado"),
        "fps": fps,
        "codec": v.get("codec_name"),
        "hdr": v.get("color_transfer") in ("arib-std-b67", "smpte2084"),
        "audio": bool(a),
    }


def sheet(p, info, title):
    out = os.path.join(SHEETS, title.rsplit(".", 1)[0] + ".jpg")
    n = 8
    d = max(info["duracion_s"], 0.1)
    pre = TM + "," if info["hdr"] else ""
    fps = n / d
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", p, "-vf",
                    f"{pre}fps={fps},scale=180:-2,drawtext=text='%{{pts\\:hms}}':x=3:y=3:fontsize=13:fontcolor=yellow:box=1:boxcolor=black@0.6,tile={n}x1",
                    "-frames:v", "1", "-q:v", "4", out], check=False)
    return os.path.relpath(out, ROOT)


def speech(p, dur):
    if not os.path.exists(os.path.join(ASR, "asr.py")):
        return None
    wav = os.path.join(CACHE, "_tmp.wav")
    if subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", "16000", wav]).returncode:
        return None
    segs, t = [], 0.0
    while t < dur:
        segs.append(f"{t:.1f}-{min(dur, t + 10):.1f}")
        t += 10
    r = subprocess.run(["python3", "asr.py", wav] + segs, cwd=ASR, capture_output=True, text=True).stdout
    os.remove(wav)
    txt = " ".join(l.split("|", 1)[1].strip() for l in r.splitlines() if "|" in l)
    txt = " ".join(w for w in txt.split() if w.strip("[]()").lower() not in ("música", "silencio", "music"))
    return txt.strip()


for src in sys.argv[1:]:
    d = json.load(open(src))
    fid, title = d["id"], d["title"]
    data = base64.b64decode(d["content"])
    path = os.path.join(CACHE, f"{fid}__{title}")
    with open(path, "wb") as fh:
        fh.write(data)
    expected = inv.get(fid, {}).get("MB")
    e = cat.get(fid, {})
    e.update({
        "drive_id": fid,
        "archivo": title,
        "carpeta_drive": inv.get(fid, {}).get("carpeta", ""),
        "mime": d.get("mimeType"),
        "bytes": len(data),
        "verificado_tamano": expected is not None and abs(len(data) / 1e6 - float(expected)) < 0.06,
        "cache": os.path.relpath(path, ROOT),
    })
    info = probe(path) if d.get("mimeType", "").startswith("video") else None
    if info:
        e.update(info)
        e["hoja_contacto"] = sheet(path, info, title)
        if info["audio"]:
            e["voz_detectada"] = speech(path, info["duracion_s"])
    e.setdefault("estado", "descargado — pendiente de revisión visual")
    cat[fid] = e
    print(title, len(data), info and (info["duracion_s"], info["resolucion"], info["hdr"]), e.get("voz_detectada", "")[:60] if e.get("voz_detectada") else "")
json.dump(cat, open(CAT, "w"), ensure_ascii=False, indent=1)
