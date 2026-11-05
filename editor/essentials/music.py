"""RE:SET · Essentials Buen Fin AD01 — música original compuesta en código (de RE:SET: sin licencias de terceros, apta para pauta).

Fashion pop limpio, 120 BPM (golpe = 0.5 s = 15 cuadros), Fa mayor, brillante y femenino. Secciones en golpes (= Essentials.tsx):
  0      arranca de inmediato: golpe + groove completo desde el primer segundo (el gancho no espera)
  0–34   groove ligero bajo su voz: bombo en 1 y 3, palmas en 2 y 4, hats, bajo con rebote, pluck, pad
  34     "15%": impacto + crash, entra la segunda parte con más brillo (stabs en contratiempo)
  61–66  respiro antes del cierre (solo palmas, pad, filtro)
  66.5   acento final con el CTA ("…ven por tus favoritas.") y cola del acorde hasta 69
La música baja sola bajo cada palabra en el render (Essentials.tsx).
Uso: python3 editor/essentials/music.py → editor/video/public/essentials/musica.wav
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/essentials"
M.GAINS["essentials"] = {"kick": 0.85, "drums": 2.3, "music": 2.5, "fx": 0.9}
BEATS = 69
PROG = [[65, 69, 72, 76], [62, 65, 69, 72], [60, 64, 67, 71], [67, 70, 74, 77]]  # Fmaj7 Dm7 Cmaj7 Gm7
ROOTS = [41, 38, 36, 43]


def main():
    m = M.Mix(BEATS * 0.5 + 1.2, 120)
    kicks = []
    m.add("fx", M.impact(), beat=0, gain=0.55)
    for b in range(BEATS):
        bar = b // 4
        ch, rt, q = PROG[bar % 4], ROOTS[bar % 4], b % 4
        brk = 61 <= b < 66
        end = b >= 66
        if not brk and not end:
            if q in (0, 2):
                m.add("kick", M.kick(0.22), beat=b, gain=0.8 if b < 34 else 0.9)
                kicks.append(b)
            m.add("drums", M.hat(0.03, 7500), beat=b + 0.5, gain=0.18 if b < 34 else 0.24, pan=0.25)
            m.add("music", M.bass(rt + (12 if q % 2 else 0), 0.21, lp=650), beat=b + 0.5, gain=0.42)
            m.add("music", M.pluck(ch[(q + 1) % 4] + 12, 0.11, bright=5000, tau=0.1), beat=b + 0.25, gain=0.18, pan=-0.2)
            if b >= 34:
                m.add("music", M.supersaw([n + 12 for n in ch[:3]], 0.14, tau=0.08, lp_hi=5200), beat=b + 0.5, gain=0.16, pan=0.15)
                m.add("drums", M.shaker(), beat=b + 0.75, gain=0.12, pan=-0.3)
        if q in (1, 3) and not end:
            m.add("drums", M.clap(0.12, 1700), beat=b, gain=0.42)
        if q == 0 and not end:
            m.add("music", M.pad(ch, 2.0, lp=1400 if brk else 2200), beat=b, gain=0.18)
    m.add("fx", M.riser(1.5, 400, 7000), beat=31, gain=0.45)
    m.add("fx", M.impact(), beat=34, gain=0.8)
    m.add("drums", M.crash(1.2), beat=34, gain=0.3)
    m.add("fx", M.riser(1.0, 500, 6000), beat=64.5, gain=0.35)
    # final accent on the CTA
    m.add("fx", M.impact(), beat=66.5, gain=0.85)
    m.add("drums", M.crash(1.6), beat=66.5, gain=0.3)
    m.add("music", M.pad([53, 60, 65, 69, 72], 2.6, lp=2600), beat=66.5, gain=0.35)
    m.add("music", M.pluck(77, 0.5, bright=6000, tau=0.5), beat=66.5, gain=0.25)
    m.add("music", M.bass(41, 1.2, lp=400, saw_mix=0.3, tau=0.8), beat=66.5, gain=0.5)
    M.write("musica.wav", m.render(kicks, duck=0.45, verb_send=0.25, name="essentials", tail_fade=0.8))


if __name__ == "__main__":
    main()
