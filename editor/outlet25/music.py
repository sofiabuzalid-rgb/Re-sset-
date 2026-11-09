"""RE:SET · OUTLET 25% OFF — cuatro pistas originales compuestas en código (de RE:SET: sin licencias de terceros, aptas para pauta).
Música de fondo sencilla, una personalidad por anuncio; baja sola bajo la voz en el render.
  AD01 pop limpio 116 BPM · AD02 juguetona 112 BPM · AD03 pop brillante 120 BPM · AD04 suave editorial 96 BPM
Uso: python3 editor/outlet25/music.py → editor/video/public/outlet25/m_ad0X.wav
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/outlet25"
for n, g in [("m_ad01", {"kick": 0.8, "drums": 2.2, "music": 2.6, "fx": 0.9}), ("m_ad02", {"kick": 0.8, "drums": 2.2, "music": 2.6, "fx": 0.9}),
             ("m_ad03", {"kick": 0.8, "drums": 2.2, "music": 2.6, "fx": 0.9}), ("m_ad04", {"kick": 0.6, "drums": 1.4, "music": 2.8, "fx": 0.9})]:
    M.GAINS[n] = g

M.groove("m_ad01", 116, 50, [[65, 69, 72, 76], [62, 65, 69, 72], [60, 64, 67, 71], [67, 71, 74, 77]], [41, 38, 36, 43], "pop")
M.groove("m_ad02", 112, 42, [[67, 71, 74, 78], [64, 67, 71, 74], [60, 64, 67, 71], [62, 66, 69, 73]], [43, 40, 36, 38], "playful")
M.groove("m_ad03", 120, 48, [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]], [38, 35, 43, 45], "pop")
M.groove("m_ad04", 96, 42, [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]], [45, 41, 43, 40], "editorial")
