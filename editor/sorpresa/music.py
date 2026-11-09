"""RE:SET · Venta sorpresa Buen Fin — dos pistas originales compuestas en código (de RE:SET: sin licencias de terceros, aptas para pauta).
  AD01 juguetona/optimista 112 BPM (acompaña su explicación) · AD02 enérgica 120 BPM: el compás 2 empieza exacto en 2.0 s, donde se
  revelan los precios (en el render se suma un swipe suave como acento).
Uso: python3 editor/sorpresa/music.py → editor/video/public/sorpresa/m_ad0X.wav
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/sorpresa"
M.GAINS["m_ad01"] = {"kick": 0.8, "drums": 2.2, "music": 2.6, "fx": 0.9}
M.GAINS["m_ad02"] = {"kick": 1.0, "drums": 2.4, "music": 2.4, "fx": 0.8}
M.groove("m_ad01", 112, 48, [[64, 68, 71, 75], [61, 64, 68, 71], [57, 61, 64, 68], [59, 63, 66, 69]], [40, 37, 45, 47], "playful")
M.groove("m_ad02", 120, 36, [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], [48, 45, 41, 43], "energetic")
