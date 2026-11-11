"""RE:SET · Buen Fin 15% — cuatro pistas originales compuestas en código (de RE:SET: sin licencias de terceros, aptas para pauta).
Emocionantes y alegres, una personalidad por anuncio; bajan solas bajo su voz en el render.
Uso: python3 editor/bf15/music.py → editor/video/public/bf15/m_ad0X.wav
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/bf15"
for n in ("t_ad01", "t_ad02", "t_ad03", "t_ad04"):
    M.GAINS[n] = {"kick": 0.95, "drums": 2.3, "music": 2.5, "fx": 0.85}
M.groove("t_ad01", 124, 50, [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], [48, 45, 41, 43], "energetic")
M.groove("t_ad02", 118, 50, [[65, 69, 72, 76], [62, 65, 69, 72], [60, 64, 67, 71], [67, 71, 74, 77]], [41, 38, 36, 43], "pop")
M.groove("t_ad03", 112, 46, [[67, 71, 74, 78], [64, 67, 71, 74], [60, 64, 67, 71], [62, 66, 69, 73]], [43, 40, 36, 38], "playful")
M.groove("t_ad04", 120, 50, [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]], [38, 35, 43, 45], "pop")
