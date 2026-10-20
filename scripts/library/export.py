"""
Export the RE:SET media library status (run after every batch):
  library/catalogo_maestro.csv  — one row per Drive file of the inventory: reviewed entries with full description,
                                  the rest with their real status (pendiente / no descargable por el conector).
  library/PROGRESO.md           — counts per status and campaign, batches done, what is left.
Usage: python3 scripts/library/export.py
"""
import collections, csv, json, os

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
LIB = os.path.join(ROOT, "library")
cat = json.load(open(os.path.join(LIB, "catalog.json")))
inv = list(csv.DictReader(open(os.path.join(ROOT, "docs", "drive-inventario.csv"))))
nd = {x["id"]: x for x in json.load(open(os.path.join(LIB, "no_descargables_conector.json")))}
COLS = ["archivo", "carpeta_drive", "drive_id", "estado", "campana", "descripcion", "producto", "colores", "accion",
        "locacion", "encuadre", "iluminacion", "calidad", "duracion_s", "orientacion", "resolucion", "fps", "hdr",
        "audio", "voz_detectada", "usos", "mejores_momentos", "notas", "hoja_contacto", "lote"]
rows = []
for r in inv:
    e = dict(cat.get(r["drive_id"], {}))
    if not e:
        e = {"archivo": r["archivo"], "carpeta_drive": r["carpeta"], "drive_id": r["drive_id"]}
        if r["duplicado"]:
            e["estado"] = "duplicado (no se revisa por separado)"
        elif r["drive_id"] in nd or float(r["MB"] or 0) > 10:
            e["estado"] = "NO DESCARGABLE por el conector (" + r["MB"] + " MB) — pendiente, no revisado"
        else:
            e["estado"] = "pendiente de descarga y revisión"
    e["usos"] = "; ".join(e["usos"]) if isinstance(e.get("usos"), list) else e.get("usos", "")
    rows.append([e.get(c, "") for c in COLS])
with open(os.path.join(LIB, "catalogo_maestro.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(COLS)
    w.writerows(sorted(rows, key=lambda x: (x[3], x[0])))
est = collections.Counter(r[3].split(" (")[0].split(" —")[0] for r in rows)
camp = collections.Counter(r[4] for r in rows if r[3] == "revisado visualmente")
lotes = sorted({e.get("lote") for e in cat.values() if e.get("lote")})
md = ["# Biblioteca audiovisual RE:SET — progreso", "",
      f"Archivos en el inventario de Drive: **{len(rows)}**", "", "## Estado", ""]
md += [f"- {k}: {v}" for k, v in est.most_common()]
md += ["", "## Revisados por campaña", ""] + [f"- {k}: {v}" for k, v in camp.most_common()]
md += ["", f"Lotes completados: {', '.join(lotes) or '—'}", "",
       "Ver `catalogo_maestro.csv` (catálogo completo) y `sheets/` (hojas de contacto de cada video revisado).", ""]
open(os.path.join(LIB, "PROGRESO.md"), "w").write("\n".join(md))
print("\n".join(md))
