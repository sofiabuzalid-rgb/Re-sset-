"""RE:SET · Christmas × Buen Fin AD02 — música original compuesta en código (de RE:SET: sin licencias de terceros, apta para pauta).

Pop navideño moderno, 120 BPM (golpe = 0.5 s = 15 cuadros), Si♭ mayor. Nada de villancicos: groove de pop con cascabeles
discretos (semicorcheas muy suaves) y un motivo de glockenspiel. Secciones en golpes (= Navidad.tsx):
  0      golpe + crash, groove completo desde el primer cuadro (el gancho no espera)
  13     su primer "15%" (6.5 s): impacto
  24–39  variedad de modelos: entra el glockenspiel
  39–53  su descripción (19.5–26.5 s): medio tiempo, piano eléctrico, más cálido
  57–61  subida → 61 (30.5 s, "Este Buen Fin…"): reveal, sección con más energía; 69: stab en su segundo "15%"
  35.6 s acento final sobre "…en RE:SET."; cola hasta 74
La música baja sola bajo cada palabra en el render.
Uso: python3 editor/navidad/music.py → editor/video/public/navidad/musica.wav
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/navidad"
M.GAINS["navidad"] = {"kick": 0.85, "drums": 2.2, "music": 2.6, "fx": 0.9}
BEATS = 74  # 37 s
PROG = [[58, 62, 65, 69], [55, 58, 62, 65], [51, 55, 58, 62], [53, 57, 60, 63]]  # B♭maj7 Gm7 E♭maj7 F7
ROOTS = [46, 43, 39, 41]
MOTIF = [77, 74, 70, 74, 72, 69, 65, 69]  # glockenspiel line, one note per beat


def sleigh():
    """soft sleigh-bell hit: band-passed jingle noise with a fast decay"""
    n = int(M.SR * 0.12)
    t = M.T(n)
    nz = M.filt(M.noise(n), "bp", [6000, 12000])
    tone = sum(np.sin(2 * np.pi * f * t) for f in (5200, 6900, 8400)) * 0.08
    return (nz + tone) * np.exp(-t / 0.035)


def main():
    m = M.Mix(BEATS * 0.5 + 1.2, 120)
    kicks = []
    m.add("fx", M.impact(), beat=0, gain=0.7)
    m.add("drums", M.crash(1.0), beat=0, gain=0.22)
    for b in range(BEATS):
        bar = b // 4
        ch, rt, q = PROG[bar % 4], ROOTS[bar % 4], b % 4
        warm = 39 <= b < 53        # 19.5–26.5 s: half-time, warmer (her description)
        build = 57 <= b < 61       # riser into the Buen Fin reveal
        big = 61 <= b < 71         # reveal + CTA
        if b >= 71:
            continue
        if build:
            m.add("kick", M.kick(0.12, 150, 55, 0.8), beat=b, gain=0.55)
            m.add("kick", M.kick(0.12, 150, 55, 0.8), beat=b + 0.5, gain=0.45)
            m.add("drums", M.snap(), beat=b + 0.25, gain=0.2)
            m.add("drums", M.snap(), beat=b + 0.75, gain=0.25)
            continue
        if warm:
            if q == 0:
                m.add("kick", M.kick(0.26, 130, 48, 0.8), beat=b, gain=0.7)
                kicks.append(b)
                m.add("music", M.epiano(ch, 1.9), beat=b, gain=0.32)
            if q == 2:
                m.add("drums", M.snap(), beat=b, gain=0.35)
            m.add("music", M.bass(rt, 0.45, lp=380, saw_mix=0.2, tau=0.5), beat=b, gain=0.4)
        else:
            if q in (0, 2) or big:
                m.add("kick", M.kick(0.22), beat=b, gain=0.9 if big else 0.78)
                kicks.append(b)
            m.add("music", M.bass(rt + (12 if q % 2 else 0), 0.21, lp=650), beat=b + 0.5, gain=0.44)
            m.add("music", M.pluck(ch[(q + 1) % 4] + 12, 0.11, bright=5200, tau=0.1), beat=b + 0.25, gain=0.17, pan=-0.2)
            m.add("music", M.pluck(ch[(q + 2) % 4] + 12, 0.11, bright=5200, tau=0.1), beat=b + 0.75, gain=0.12, pan=0.2)
            if b >= 24:
                m.add("music", M.musicbox(MOTIF[b % 8]), beat=b, gain=0.13, pan=0.25)
            if big:
                m.add("music", M.supersaw([n + 12 for n in ch[:3]], 0.14, tau=0.08, lp_hi=5400), beat=b + 0.5, gain=0.2, pan=0.15)
            if q in (1, 3):
                m.add("drums", M.clap(0.12, 1700), beat=b, gain=0.42)
                m.add("drums", M.snap(), beat=b, gain=0.18, pan=0.2)
        for s16 in (0, 0.25, 0.5, 0.75):
            if warm and s16 in (0.25, 0.75):
                continue
            m.add("drums", sleigh(), beat=b + s16, gain=(0.08 if s16 % 0.5 else 0.12) * (1.3 if big else 0.9 if warm else 1.0), pan=0.35)
        if q == 0:
            m.add("music", M.pad(ch, 2.0, lp=1700 if warm else 2400), beat=b, gain=0.2 if warm else 0.17)
    m.add("fx", M.impact(), beat=13, gain=0.55)            # her first "15%"
    m.add("drums", M.crash(0.9), beat=13, gain=0.18)
    m.add("fx", M.riser(2.0, 400, 8000), beat=57, gain=0.55)
    m.add("fx", M.impact(), beat=61, gain=0.9)             # "Este Buen Fin…": reveal
    m.add("drums", M.crash(1.4), beat=61, gain=0.32)
    m.add("music", M.supersaw([58, 62, 65, 70], 0.3, tau=0.2, lp_hi=6000), beat=69, gain=0.3)  # her second "15%"
    m.add("fx", M.impact(), sec=35.6, gain=0.85)           # on "…en RE:SET."
    m.add("drums", M.crash(1.6), sec=35.6, gain=0.28)
    m.add("music", M.pad([46, 58, 62, 65, 70], 1.6, lp=2600), sec=35.6, gain=0.35)
    m.add("music", M.musicbox(82), sec=35.6, gain=0.3)
    m.add("music", M.musicbox(77), sec=35.85, gain=0.22)
    m.add("music", M.bass(46, 1.0, lp=400, saw_mix=0.3, tau=0.7), sec=35.6, gain=0.5)
    M.write("musica.wav", m.render(kicks, duck=0.45, verb_send=0.28, name="navidad", tail_fade=0.6))


if __name__ == "__main__":
    main()
