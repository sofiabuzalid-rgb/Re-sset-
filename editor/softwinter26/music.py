"""RE:SET · Soft Winter × Buen Fin AD03 — música original compuesta en código (de RE:SET: sin licencias de terceros, apta para pauta).

Cozy pop moderno: 120 BPM con sensación de medio tiempo (bombo en 1, caja suave en 3), piano eléctrico cálido, bajo redondo,
hats con swing, un motivo de pluck y pad aterciopelado. Re♭ mayor/ Si♭ menor: cálido, femenino, sin melancolía.
Golpes (= SoftWinter.tsx):
  0      acento + groove completo desde el primer cuadro
  5      2.5 s: título SOFT WINTER (golpe + campanita)
  26–33  13–16.5 s ("…dormir cómodo… en casa"): se abre, más espacio
  48–52  subida → 52 (26.0 s): su "15%", reveal del Buen Fin, sección con más energía
  56     28.0 s: CTA; 62 acento final, cola hasta 64
Uso: python3 editor/softwinter26/music.py → editor/video/public/softwinter26/musica.wav
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "outlet4"))
import music as M  # noqa: E402

M.OUT = Path(__file__).resolve().parents[1] / "video/public/softwinter26"
M.GAINS["softwinter26"] = {"kick": 0.9, "drums": 2.0, "music": 2.7, "fx": 0.85}
BEATS = 64  # 32 s
PROG = [[61, 65, 68, 72], [58, 61, 65, 68], [54, 58, 61, 65], [56, 60, 63, 67]]  # D♭maj7 B♭m7 G♭maj7 A♭(add9)
ROOTS = [37, 34, 30, 32]
HOOK = [80, 77, 75, 72, 73, 75, 77, 75]


def main():
    m = M.Mix(BEATS * 0.5 + 1.0, 120)
    kicks = []
    m.add("fx", M.impact(), beat=0, gain=0.5)
    for b in range(BEATS):
        bar = b // 4
        ch, rt, q = PROG[bar % 4], ROOTS[bar % 4], b % 4
        airy = 26 <= b < 33
        build = 48 <= b < 52
        lift = b >= 52
        if b >= 62:
            continue
        if build:
            for s in (0, 0.5):
                m.add("kick", M.kick(0.14, 140, 50, 0.7), beat=b + s, gain=0.5 + 0.06 * (b - 48))
            m.add("drums", M.snap(), beat=b + 0.75, gain=0.25)
            continue
        if q == 0 or (lift and q == 2) or (not airy and q == 2 and bar % 2):
            m.add("kick", M.kick(0.26, 130, 46, 0.85), beat=b, gain=0.85 if lift else 0.75)
            kicks.append(b)
        if q == 2:
            m.add("drums", M.snare(0.14), beat=b, gain=0.32)
            m.add("drums", M.snap(), beat=b, gain=0.22, pan=0.15)
        for s8 in (0.5,) if airy else (0.0, 0.5):
            swing = 0.06 if s8 == 0.5 else 0
            m.add("drums", M.hat(0.03, 8200), beat=b + s8 + swing, gain=0.13 if s8 == 0 else 0.18, pan=0.25)
        if not airy:
            m.add("music", M.bass(rt + 12, 0.4, lp=420, saw_mix=0.25, tau=0.35), beat=b, gain=0.42)
        if q in (0, 2):
            m.add("music", M.epiano(ch, 0.9), beat=b + (0.5 if q == 2 else 0), gain=0.3)
        if b >= 8 and not airy:
            m.add("music", M.pluck(HOOK[b % 8], 0.18, bright=4200, tau=0.16), beat=b + 0.25, gain=0.14, pan=-0.2)
        if lift:
            m.add("music", M.pluck(HOOK[(b + 3) % 8] + 12, 0.1, bright=5600, tau=0.1), beat=b + 0.75, gain=0.1, pan=0.25)
        if q == 0:
            m.add("music", M.pad(ch, 2.0, lp=1300 if airy else 1900), beat=b, gain=0.22 if airy else 0.16)
    m.add("music", M.musicbox(80), beat=5, gain=0.25)
    m.add("music", M.musicbox(85), beat=5.5, gain=0.18)
    m.add("fx", M.riser(2.0, 300, 7000), beat=48, gain=0.5)
    m.add("fx", M.impact(), beat=52, gain=0.85)
    m.add("drums", M.crash(1.3), beat=52, gain=0.26)
    m.add("music", M.musicbox(77), beat=56, gain=0.2)
    m.add("fx", M.impact(), beat=62, gain=0.6)
    m.add("music", M.pad([37, 49, 61, 65, 68, 72], 1.6, lp=2200), beat=62, gain=0.38)
    m.add("music", M.epiano([61, 65, 68, 72], 1.4), beat=62, gain=0.35)
    M.write("musica.wav", m.render(kicks, duck=0.4, verb_send=0.32, name="softwinter26", tail_fade=0.6))


if __name__ == "__main__":
    main()
