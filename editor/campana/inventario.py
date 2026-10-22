"""RE:SET — auditoría completa de RESET HOY → library/AUDITORIA_RESET_HOY.md
Técnico (duración, resolución, nivel de audio, nitidez Laplaciana, brillo) medido sobre los clips en library/cache/resethoy;
descripción visual y utilidad comercial anotadas a mano tras revisar cada clip cuadro a cuadro; diálogo = Whisper (+ Sherpa en dudas)."""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TECH = json.load(open(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent / "tech_metrics.json"))  # métricas técnicas (OpenCV + ffmpeg volumedetect)
ASR = ROOT / "library/resethoy_asr"

# producto, tipo de toma / acciones, categoría (A-H), utilidad (A = usar, B = apoyo, C = descartar), timecodes útiles
N = "Navidad roja nórdica"; G = "Navidad verde gingerbread"; W = "Navidad blanca (Grinch)"; M = "Básica azul marino + bolsita"; O = "Básica verde olivo"
NOTE = {
 "8928": (N, "Sentada en cama con bolsas de regalo; toma cortada", "F", "C", "0–1"),
 "8931": (N, "A cámara, plano medio en cama; pijamas dobladas delante", "G", "A", "0.4–5.9"),
 "8932": (N, "Acostada riendo a carcajadas", "B", "B", "0.2–2.0"),
 "8933": (N, "Acostada cuerpo completo en cama", "B", "A", "0.5–4.0"),
 "8934": (N, "Primer plano del estampado de renos", "E", "A", "0.3–4.5"),
 "8935": (N, "Rostro, acostada sonriendo, brazos arriba", "B", "A", "0–3.5"),
 "8936": (N, "Se estira en cama, plano cerrado (final desenfocado)", "B", "B", "1.5–4.5"),
 "8937": (N, "Acostada vista desde los pies", "B", "B", "0.5–4.0"),
 "8938": (N, "Manos estirando la tela (diálogo de producción)", "E", "B", "0–4"),
 "8939": (N, "Detalle de pierna/pantalón", "E", "B", "0–4"),
 "8940": (N, "Detalle de puño y botones", "E", "B", "0–3"),
 "8941": (N, "Primer plano de renos y copos", "E", "A", "0.3–4.5"),
 "8942": (N, "Acostada con brazo sobre la cara", "B", "B", "0–2.4"),
 "8943": (N, "De pie en la cama: giro, cabello en movimiento, cuerpo completo", "B", "A", "1.2–6.9"),
 "8944": (N, "A cámara presentando las pijamas; modelos sobre la cama", "A", "A", "0.3–6.1"),
 "8946": (N + " / " + G + " / " + W, "A cámara; levanta la verde y la blanca mientras las nombra", "A", "A", "0.4–13.5"),
 "8947": (N, "A cámara: «no es la típica pijama…»", "B", "A", "3.7–10.6"),
 "8948": (N, "A cámara, cierre alterno «De verdad…»", "H", "B", "0–7.5"),
 "8949": (N, "A cámara, cierre «Así que en serio…»", "H", "A", "0–6.1"),
 "8950": (W, "Sostiene la blanca; pregunta por la bolsita", "A", "B", "0–6"),
 "8951": (W + " / " + G, "Dobla pijamas sobre la cama", "A", "B", "1–10"),
 "8952": (G + " / " + W, "Bolsa de regalo con muñeco tipo Olaf", "F", "C", "riesgo IP"),
 "8953": (N, "Bolsa con muñeco tipo Olaf", "F", "C", "riesgo IP"),
 "8955": (G, "Sentada con la verde en el regazo", "A", "B", "0–3"),
 "8956": (G, "Dobla la verde", "A", "B", "2–10"),
 "8957": (G, "La verde extendida/doblada, vista cenital", "E", "A", "1–9"),
 "8958": (W, "Levanta la blanca", "A", "B", "0.3–2"),
 "8959": (G + " / " + W, "Dobla verde y blanca", "A", "B", "2–8"),
 "8960": (G + " / " + W, "Verde y blanca juntas sobre la cama", "E", "B", "0–5"),
 "8961": (N + " + sets", "Acostada entre los tres modelos, cenital", "A", "A", "0–5"),
 "8962": (N + " + sets", "Acostada entre los sets (diálogo de producción)", "A", "B", "0–12"),
 "8963": (N, "«¿Pero de qué color?» (producción)", "F", "C", "—"),
 "8964": (N + " + sets", "Acostada entre sets, avienta la almohada, ríe", "A", "A", "3–10.8"),
 "8970": (M, "Cenital, bolsita en el regazo (1 s)", "D", "C", "—"),
 "8971": (M, "Sentada con la bolsita, mira hacia abajo", "D", "B", "0–10"),
 "8972": (M, "Manos: detalle de la bolsita con cordón (final movido)", "D", "A", "0–4.5"),
 "8973": (M, "A cámara con la bolsita: «Está demasiado práctica…»", "D", "A", "0.4–8.0"),
 "8974": (M, "A cámara con la bolsita: «Está súper cómoda y súper práctica…»", "D", "A", "0.3–7.0"),
 "8975": (M, "Abre la maleta", "D", "B", "0–1.4"),
 "8976": (M, "Mete la bolsita en la maleta (primer plano con etiqueta)", "D", "A", "0–6"),
 "8977": (M, "Cierra la maleta y se sienta", "D", "B", "2.5–6"),
 "8978": (M + " / " + O, "Mete también el set olivo en la maleta", "D", "B", "0–5"),
 "8979": (M, "Cierra la maleta", "D", "B", "0.5–3.5"),
 "8980": (M, "Sentada junto a la maleta", "D", "B", "0–2.2"),
 "8981": (M, "Camina jalando la maleta, de espaldas", "D", "A", "0–3.5"),
 "8982": (M, "De pie con la maleta: «…te llevas para todos lados…»", "D", "A", "0.5–3.6"),
 "8983": (M, "«Pero qué hacía» (producción)", "F", "C", "—"),
 "8984": (M, "De pie con la maleta, toma alterna de 8982", "D", "B", "0.3–4.0"),
 "8985": (M, "Sale del clóset: «Es broma, no me fui…» (toma 1)", "H", "B", "1.2–7.4"),
 "8986": (M, "Sale del clóset (toma 2), plano amplio", "H", "B", "1.7–10"),
 "8987": (M, "Sale del clóset (toma 3): «…porque yo lo estoy amando»", "H", "A", "1.4–9.1"),
 "8988": (M, "Sale del clóset (toma 4): «…así que vayan»", "H", "B", "1–7.9"),
 "8989": (N, "Sofá, sentada", "B", "B", "0–2"),
 "8990": (N, "Sofá con taza (diálogo de producción)", "B", "B", "0–8"),
 "8991": (N, "Recostada en el sofá", "B", "B", "0–6"),
 "8992": (N, "Sofá (producción)", "B", "C", "—"),
 "8993": (N, "Sofá, plano medio leyendo/descansando", "B", "A", "0–12"),
 "8994": (N, "Detalle del estampado en el sofá", "E", "B", "0–4"),
 "8995": (N, "Sofá (1 s)", "B", "C", "—"),
 "8996": (N, "Tapete fuera de foco", "F", "C", "—"),
 "8997": (N, "Acostada en el sofá, plano amplio", "B", "B", "0–4"),
 "8998": (N, "Acostada en el sofá", "B", "B", "0–5"),
 "8999": (N, "Acostada en el sofá", "B", "B", "0–3"),
 "9001": (N, "Sofá", "B", "B", "0–2"),
 "9002": (N, "Juega con las piernas en el sofá («¡Ay!»)", "B", "B", "0–5"),
 "9003": (N, "Sofá («¡Ahh!»)", "B", "B", "0–3"),
 "9004": (N, "Patadita en el sofá (1 s)", "B", "C", "—"),
 "9005": (N, "Balcón, sentada con taza, plano amplio", "B", "A", "0–3"),
 "9006": (N, "Balcón, café, plano amplio (11 s)", "B", "A", "0–11"),
 "9007": (N, "Balcón (1 s)", "B", "C", "—"),
 "9008": (N, "Balcón: camina con taza, estampado cerca", "B", "A", "0–7"),
 "9009": (N, "Balcón, toma café", "B", "A", "0–4"),
 "9010": (N, "Balcón, se estira", "B", "A", "2.5–6"),
 "9011": (N, "Balcón («¡Ay, yo!»)", "B", "B", "0–4"),
 "9012": (N, "Balcón", "B", "B", "0–4"),
 "9013": (N, "Terraza, sofá gris con flores", "B", "B", "0–7"),
 "9014": (N, "A cámara: sucursales (toma 1)", "H", "B", "0.4–9.0"),
 "9015": (N, "A cámara: sucursales (toma 2, más completa)", "H", "A", "0.4–12.4"),
 "9016": (N, "Terraza, se estira", "B", "B", "0–5"),
 "9017": (N, "Balcón, recargada, baila", "B", "A", "0–2"),
 "9018": (N, "Contraluz: «no se transparenta nada»", "E", "B", "1.5–5.8"),
 "9019": (N, "Camina, detalle", "E", "B", "0–5"),
 "9020": (N, "Camina hacia cámara en el balcón", "B", "A", "3–8"),
 "9021": (N, "Camina; de piernas a torso", "E", "A", "0–4"),
 "9022": (N, "Detalle copo y renos en el pecho", "E", "A", "1–8"),
 "9023": (N, "De espaldas, cabello, balcón", "B", "B", "0–6"),
 "9025": (G, "Sofá oscuro, cuerpo completo, ventana", "B", "A", "0–4"),
 "9026": (G, "Recostada en el sofá", "B", "B", "0–5"),
 "9027": (G, "Recostada en el sofá", "B", "B", "0–4"),
 "9028": (G, "Sofá (2 s)", "B", "B", "0–2"),
 "9029": (G, "Detalle de piernas: gingerbread y bastones", "E", "A", "0–4"),
 "9030": (G, "Sofá (1 s)", "B", "C", "—"),
 "9031": (G, "Sentada frente a libreros", "B", "B", "0–5"),
 "9032": (G, "(1 s)", "B", "C", "—"),
 "9033": (G, "Sofá", "B", "B", "0–3"),
 "9034": (G, "Sofá", "B", "B", "0–3"),
 "9035": (G, "Se estira en el sofá, cuerpo completo", "B", "A", "0–3"),
 "9036": (G, "Lee un libro en el sofá", "B", "A", "0–8"),
 "9037": (G, "(1 s)", "B", "C", "—"),
 "9038": (G, "Lee, plano cerrado", "B", "A", "0–2"),
 "9039": (G, "Lee, plano medio", "B", "A", "0–7"),
 "9040": (G, "Lee", "B", "B", "0–6"),
 "9041": (G, "Lee (2 s)", "B", "B", "0–2"),
 "9042": (G, "Ríe leyendo", "B", "B", "0–2"),
 "9043": (G, "Detalle del libro y la manga", "E", "B", "0–3"),
 "9044": (G, "Detalle del libro", "E", "B", "0–3"),
 "9045": (G, "Camina hacia los libreros", "B", "A", "0–6"),
 "9046": (G, "De espaldas en los libreros", "B", "B", "0–4"),
 "9047": (O, "A cámara, cuerpo completo: «Por favor vean este modelo…»", "C", "A", "0.1–9.0"),
 "9048": (O, "A cámara: «…color de la temporada, verde militar»", "C", "A", "0–3.5"),
 "9049": (O, "Del escote al cuerpo completo; «¿Qué opina?»", "C", "A", "0–2.7"),
 "9050": (O, "Manos en la cadera, cuerpo completo (música ambiental)", "C", "A", "0–1.1"),
 "9051": (O, "Baila; detalle de cintura; cuerpo completo", "C", "A", "0–6.3"),
 "9052": (O, "Detalle del lazo en la cintura", "E", "A", "0–1.1"),
 "9053": (O, "A cámara: sucursales (otra persona al fondo)", "H", "B", "0.4–4.7"),
 "9054": (O, "A cámara: sucursales", "H", "A", "0.4–5.2"),
 "9055": (O, "Toma fallida «…otra vez»", "F", "C", "—"),
}
CAT = {"A": "Navidad — conjuntos familiares", "B": "Navidad — lifestyle, casa, descanso", "C": "Básicas — modelaje, diseño, comodidad", "D": "Básicas — bolsita y viaje", "E": "Primeros planos y detalles", "F": "B-roll / descartes", "G": "Frases de apertura", "H": "Frases de cierre"}


def audio_q(t, has_voice):
    if not has_voice:
        return "sin voz"
    return "buena" if t["max_db"] > -14 and t["mean_db"] > -36 else "aceptable" if t["mean_db"] > -45 else "baja (lejos del micro)"


def vis_q(t):
    return "nítida" if t["sharp"] > 120 else "aceptable" if t["sharp"] > 45 else "suave/movida"


rows = []
for n in sorted(TECH):
    t = TECH[n]
    a = json.load(open(ASR / f"IMG_{n}.json"))
    txt = a["text"].strip()
    voice = txt and txt != "(sin voz)" and not txt.startswith("jaja")
    prod, shot, cat, util, tc = NOTE[n]
    rows.append(f"| IMG_{n} | {t['dur']:.1f} s | 720×1280 · vertical | {prod} | {shot} | {txt if voice else ('risa' if txt.startswith('jaja') else '—')} | {audio_q(t, voice)} | {vis_q(t)} | {cat} | **{util}** | {tc} |")

L = ["# Auditoría completa — RESET HOY", "",
     "- **Carpeta:** 300 archivos. Hay duplicados: el mismo IMG subido 2–5 veces, en .MP4 y .mov, que se detectaron por nombre y duración.",
     "- **Clips únicos:** 119.",
     "- **Analizados:** 117. **IMG_8945 (11.7 MB) e IMG_8954 (13 MB) no se pudieron descargar**, porque el conector de Drive solo acepta archivos de hasta 10 MB.",
     "- **Formato:** todos los clips son verticales, 720×1280, 30 fps y SDR.",
     "- **Método:**",
     "  - **Audio:** se transcribió todo con Whisper; las frases dudosas se verificaron con un segundo reconocedor (Sherpa).",
     "  - **Imagen:** se revisaron 8–10 cuadros por clip.",
     "  - **Técnico:** el nivel de audio se midió con volumedetect, la nitidez con la varianza Laplaciana y el brillo como la media de luma.",
     "- **Utilidad comercial:** **A** = usar · **B** = apoyo o alternativa · **C** = descartar (toma fallida, riesgo de PI o sin valor).",
     "- **Categorías:** " + " · ".join(f"**{k}** {v}" for k, v in CAT.items()), "",
     "| Archivo | Duración | Formato | Producto / color | Toma y acciones | Diálogo (literal) | Audio | Imagen | Cat. | Útil | Timecodes aprovechables (s) |",
     "|---|---|---|---|---|---|---|---|---|---|---|"] + rows
Path(ROOT / "library/AUDITORIA_RESET_HOY.md").write_text("\n".join(L) + "\n")
print(len(rows), "filas")
