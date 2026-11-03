"""RE:SET · Teaser "la mejor temporada" — música original compuesta en código (de RE:SET, sin licencias de terceros).

120 BPM (un golpe = 0.5 s = 15 cuadros), Re menor. Secciones en golpes, iguales a src/teaser/Teaser.tsx:
  0–3    gancho: golpe grave + flash, caja de música misteriosa, tic de reloj
  3–12   showroom: pulso suave, pad Dm–B♭–F–C (la voz va encima; la música baja bajo cada palabra en el render)
  12–20  inventario: se construye — bombo a negras, palmas, hats a semicorcheas, stabs, subida hacia el golpe 20
  20–26  pijamas festivas: medio tiempo, piano eléctrico cálido y caja de música
  26–30  cierre: golpe final y cola del pad
Uso: python3 editor/teaser/music.py → editor/video/public/teaser/musica.wav
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/teaser"
M.GAINS["teaser"] = {"kick": 0.8, "drums": 1.8, "music": 2.8, "fx": 1.0}
BEATS = 30
D, F, A, Bb, C, E, G = 50, 53, 57, 58, 60, 52, 55  # D3 …


def main():
    m = M.Mix(BEATS * 0.5 + 0.8, 120)
    kicks = []
    prog = [[D, F, A], [Bb - 12, D, F], [F - 12, A - 12, C], [C - 12, E, G]]  # Dm  B♭  F  C (one per bar)
    # 0–3 hook: impact + sub, music box motif, ticking
    m.add("fx", M.impact(), beat=0, gain=0.9)
    m.add("music", M.pad([D - 12, A - 12, D], 1.6, lp=700), beat=0, gain=0.5)
    for b, n in [(0.5, 74), (1.5, 77), (2.0, 81), (2.5, 76)]:
        m.add("music", M.musicbox(n), beat=b, gain=0.32, pan=0.3 if b % 1 else -0.3)
    for k in range(6):
        m.add("drums", M.hat(0.02, 9000), beat=k * 0.5, gain=0.12, pan=0.4)
    # 3–12 showroom: soft pulse
    for bar in range(3):
        b0 = 3 + bar * 4
        ch = prog[bar % 4]
        m.add("music", M.pad([n for n in ch], 2.0 + 0.4, lp=1500), beat=b0, gain=0.42)
        m.add("music", M.bass(ch[0] - 12 if ch[0] > 52 else ch[0], 1.8, lp=300, saw_mix=0.2, tau=0.9), beat=b0, gain=0.35)
        for k in range(4):
            if b0 + k < 12:
                m.add("kick", M.kick(0.18, 120, 48, 0.6), beat=b0 + k, gain=0.55)
                kicks.append(b0 + k)
                m.add("drums", M.hat(0.03, 8000), beat=b0 + k + 0.5, gain=0.16, pan=0.3)
        m.add("music", M.musicbox([74, 77, 81, 79][bar % 4]), beat=b0 + 1.5, gain=0.2, pan=-0.25)
    # 12–20 inventory: build
    for bar in range(2):
        b0 = 12 + bar * 4
        ch = prog[(bar + 3) % 4]
        m.add("music", M.pad(ch, 2.0, lp=2000 + bar * 1500), beat=b0, gain=0.4)
        for k in range(4):
            m.add("kick", M.kick(0.2, 160, 50, 1.0), beat=b0 + k, gain=0.9)
            kicks.append(b0 + k)
            m.add("music", M.bass(ch[0] - 12 if ch[0] > 52 else ch[0], 0.22, lp=500, tau=0.15), beat=b0 + k + 0.5, gain=0.45)
            m.add("music", M.supersaw([n + 12 for n in ch], 0.12, tau=0.08, lp_hi=4500), beat=b0 + k + 0.5, gain=0.35)
            for h in range(4):
                m.add("drums", M.hat(0.025, 8500), beat=b0 + k + h * 0.25, gain=0.1 + 0.05 * (h % 2) + 0.04 * bar, pan=0.35)
        for k in (1, 3):
            m.add("drums", M.clap(), beat=b0 + k, gain=0.5)
    m.add("fx", M.riser(2.0, 300, 7000), beat=16, gain=0.8)
    # 20 drop: impact + crash, 20–26 festive half-time, warm
    m.add("fx", M.impact(), beat=20, gain=1.0)
    m.add("drums", M.crash(1.4), beat=20, gain=0.35)
    warm = [[Bb - 12, D, F, A], [F - 12, A - 12, C, E], [G - 12, Bb - 12, D, F], [A - 12, C + 1 - 12, E, G]]  # B♭maj7 Fmaj7 Gm7 A7
    for k, ch in enumerate(warm[:3]):
        b0 = 20 + k * 2
        m.add("music", M.epiano(ch, 1.0), beat=b0, gain=0.55)
        m.add("music", M.pad(ch, 1.0 + 0.4, lp=1800), beat=b0, gain=0.25)
        m.add("music", M.bass(ch[0] - 12 if ch[0] > 52 else ch[0], 0.9, lp=280, saw_mix=0.15, tau=0.8), beat=b0, gain=0.4)
        m.add("kick", M.kick(0.22, 140, 48, 0.8), beat=b0, gain=0.7)
        kicks.append(b0)
        m.add("drums", M.snap(), beat=b0 + 1, gain=0.35)
    for b, n in [(20.5, 81), (21.0, 79), (21.5, 77), (22.5, 76), (23.0, 77), (23.5, 81), (24.5, 86), (25.0, 81)]:
        m.add("music", M.musicbox(n), beat=b, gain=0.26, pan=0.2)
    m.add("fx", M.riser(1.0, 400, 5000), beat=24, gain=0.4)
    # 26 final hit and tail (A7 → Dm)
    m.add("fx", M.impact(), beat=26, gain=0.9)
    m.add("music", M.pad([D - 12, A - 12, D, F, A], 3.4, lp=1300), beat=26, gain=0.5)
    m.add("music", M.musicbox(74), beat=26, gain=0.3)
    m.add("music", M.musicbox(81), beat=27, gain=0.22)
    M.write("musica.wav", m.render(kicks, duck=0.35, verb_send=0.35, name="teaser", tail_fade=1.0))


if __name__ == "__main__":
    main()
