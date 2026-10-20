# Biblioteca audiovisual RE:SET

Este es un inventario permanente del Drive de RE:SET (carpeta "Trabajo Resset" y sus subcarpetas).

Reglas:
- Los originales de Drive **no se modifican, no se renombran y no se borran**.
- Todo lo de esta carpeta es una copia local o una nota.

## Archivos

| Archivo | Qué es |
|---|---|
| `catalogo_maestro.csv` | **Catálogo maestro.** Una fila por archivo del inventario de Drive (267). Columnas: nombre exacto, carpeta e ID de Drive, estado real, campaña, descripción visual, producto, colores, acción, locación, encuadre, iluminación, calidad (1–5), duración, orientación, resolución, fps, HDR, audio, voz detectada, usos recomendados, mejores momentos y notas (riesgos de PI o autorización). |
| `MEJORES_USOS.md` | Selección curada por uso: anuncios de 15–30 s, reels, video de producto, campañas de venta, material a evitar y huecos. |
| `PROGRESO.md` | Conteo por estado y por campaña; lotes completados. |
| `catalog.json` | Fuente de datos del catálogo (solo archivos descargados), indexada por ID de Drive. |
| `notas/lote-XX.json` | Notas de revisión visual de cada lote (01–17). |
| `no_descargables_conector.json` | Videos que el conector de Drive no deja descargar. **No están revisados.** |
| `sheets/*.jpg` | Hojas de contacto de cada video (8 cuadros con tiempo; HDR convertido a SDR). |
| `sheets/photos/*.jpg` | Vista previa de cada foto (480 px). |
| `cache/` | Copias byte a byte de los originales, por ID de Drive. Está en `.gitignore`, así que no se sube al repositorio y desaparece con el contenedor. |

## Estados posibles

- **revisado visualmente:** el contenido fue visto y descrito; no se clasificó por el nombre.
- **NO DESCARGABLE por el conector (X MB) — pendiente, no revisado:** el límite real del conector es de unos 6 MB. Estos archivos no se han visto.
- **duplicado:** tiene el mismo tamaño en bytes que otro archivo ya revisado.
- **documento de texto:** PDF, Doc o Sheet; queda fuera del alcance audiovisual.

## Cómo continuar

1. **Videos grandes pendientes.** Hay que conseguirlos por otra vía:
   - subirlos al chat;
   - compartir una versión comprimida;
   - dividirlos en Drive.
   
   Luego se ingieren con `--local`, que verifica el tamaño exacto en bytes contra el inventario:
   `python3 scripts/library/ingest.py --local <drive_id> <archivo>`
2. **Fotos o videos de 6 MB o menos.** Se descargan con el conector de Drive, de 2 a 3 a la vez, y se ingieren con:
   - fotos: `python3 scripts/library/ingest_photos.py <resultado.json>`
   - videos: `python3 scripts/library/ingest.py <resultado.json>`
3. **Revisión visual.** Se escriben las notas en `notas/lote-NN.json` y se aplican con:
   `python3 scripts/library/describe.py notas/lote-NN.json lote-NN`
4. **Exportar y guardar.** Se ejecuta `python3 scripts/library/export.py` y se hace commit.

Campañas usadas: Navidad, NFL, Pijamas y productos, Bazares, Hanukkah, Tienda, General.
