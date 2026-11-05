"""RE:SET · Christmas × Buen Fin AD02 — música original compuesta en código (de RE:SET: sin licencias de terceros, apta para pauta).

Pop navideño moderno, 120 BPM (golpe = 0.5 s = 15 cuadros), Si♭ mayor. Nada de villancicos: groove de pop con cascabeles
discretos (semicorcheas muy suaves) y un motivo de glockenspiel. Secciones en golpes (= Navidad.tsx):
  0      golpe inicial + groove completo desde el primer cuadro
  14     su "15%" (7.0 s): impacto
  14–62  groove bajo su voz; más brillo desde el golpe 26 (variedad de modelos)
  60–63  subida → 63 (31.5 s, "Este Buen Fin…"): reveal del Buen Fin, sección con más energía
  72     acento final con la última palabra; cola hasta 74
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
BEATS = 74
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
    m.add("fx", M.impact(), beat=0, gain=0.6)
    for b in range(BEATS):
        bar = b // 4
        ch, rt, q = PROG[bar % 4], ROOTS[bar % 4], b % 4
        build = 60 <= b < 63
        big = 63 <= b < 72
        if b >= 72:
            continue
        if not build:
            if q in (0, 2) or big:
                m.add("kick", M.kick(0.22), beat=b, gain=0.85 if big else 0.75)
                kicks.append(b)
            m.add("music", M.bass(rt + (12 if q % 2 else 0), 0.21, lp=650), beat=b + 0.5, gain=0.42)
            m.add("music", M.pluck(ch[(q + 1) % 4] + 12, 0.11, bright=5200, tau=0.1), beat=b + 0.25, gain=0.17, pan=-0.2)
            if b >= 26:
                m.add("music", M.musicbox(MOTIF[b % 8]), beat=b, gain=0.12, pan=0.25)
            if big:
                m.add("music", M.supersaw([n + 12 for n in ch[:3]], 0.14, tau=0.08, lp_hi=5200), beat=b + 0.5, gain=0.18, pan=0.15)
        if q in (1, 3):
            m.add("drums", M.clap(0.12, 1700), beat=b, gain=0.4)
        for s16 in (0, 0.25, 0.5, 0.75):
            m.add("drums", sleigh(), beat=b + s16, gain=(0.08 if s16 % 0.5 else 0.12) * (1.3 if big else 1.0), pan=0.35)
        if q == 0:
            m.add("music", M.pad(ch, 2.0, lp=1500 if build else 2300), beat=b, gain=0.18)
    m.add("fx", M.impact(), beat=14, gain=0.6)
    m.add("drums", M.crash(1.0), beat=14, gain=0.2)
    m.add("fx", M.riser(1.5, 400, 7000), beat=60, gain=0.5)
    m.add("fx", M.impact(), beat=63, gain=0.85)
    m.add("drums", M.crash(1.4), beat=63, gain=0.3)
    # final accent
    m.add("fx", M.impact(), beat=72, gain=0.8)
    m.add("music", M.pad([46, 58, 62, 65, 70], 1.6, lp=2600), beat=72, gain=0.35)
    m.add("music", M.musicbox(82), beat=72, gain=0.3)
    m.add("music", M.bass(46, 1.0, lp=400, saw_mix=0.3, tau=0.7), beat=72, gain=0.5)
    M.write("musica.wav", m.render(kicks, duck=0.45, verb_send=0.28, name="navidad", tail_fade=0.7))


if __name__ == "__main__":
    main()
