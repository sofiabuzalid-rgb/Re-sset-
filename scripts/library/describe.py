"""
Apply visual review notes to library/catalog.json.
Input: a JSON file {archivo_o_drive_id: {campos...}}. Marks each entry estado="revisado visualmente" and stamps the
lote (batch). Fields used across the catalog:
  descripcion, producto, colores, accion, locacion, encuadre, iluminacion, calidad (1-5 + nota),
  campana (Navidad | NFL | Pijamas y productos | Bazares | Hanukkah | Tienda | General),
  usos (anuncio 15-30s | reel organico | video de producto | campana de venta | b-roll), mejores_momentos, notas.
Usage: python3 scripts/library/describe.py notes.json <lote>
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
CAT = os.path.join(ROOT, "library", "catalog.json")
cat = json.load(open(CAT))
notes = json.load(open(sys.argv[1]))
lote = sys.argv[2]
by_name = {}
for k, e in cat.items():
    by_name.setdefault(e["archivo"], []).append(k)
for key, fields in notes.items():
    ids = [key] if key in cat else by_name.get(key, [])
    if not ids:
        print("NO ENCONTRADO", key)
        continue
    for i in ids:
        cat[i].update(fields)
        cat[i]["estado"] = "revisado visualmente"
        cat[i]["lote"] = lote
json.dump(cat, open(CAT, "w"), ensure_ascii=False, indent=1)
print(sum(1 for e in cat.values() if e.get("estado") == "revisado visualmente"), "revisados de", len(cat))
