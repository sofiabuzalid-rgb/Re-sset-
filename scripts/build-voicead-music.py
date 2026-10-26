"""
ORIGINAL music beds for the RE:SET voice ads (no third-party material), rendered with FluidSynth + FluidR3 GM (MIT).
Presets, each its own sonic identity:
  fashion — 116 BPM, A minor (Am9–Fmaj7–Cmaj7–G6): muted guitar chops, Rhodes, round synth bass, four-on-the-floor
            with claps, open hats and shaker; fresh and modern, built to sit under a voice.
  travel  — 124 BPM, D major (D–A/C#–Bm7–G): strummed acoustic guitar, bright piano stabs, finger snaps, tambourine,
            bouncy bass; light and on the move.
Both have a one-bar lift into the end card and a short final chord. Length follows the ad's edit.
Output: public/<ad>/music.wav  ·  Usage: python3 scripts/build-voicead-music.py <ad> <preset>
"""
import json, os, subprocess, sys
import mido
import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
AD, PRESET = sys.argv[1], sys.argv[2]
e = json.load(open(os.path.join(ROOT, "src", "voicead", f"{AD}.json")))
OUT = os.path.join(ROOT, "public", AD)
os.makedirs(OUT, exist_ok=True)
FPS, SR, TPB = e["fps"], 48000, 480
TOTAL = sum(s["frames"] for s in e["shots"])
END_AT = TOTAL - e["shots"][-1]["frames"]  # first frame of the end card
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
rng = np.random.default_rng(len(AD))
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "Bb": 10, "B": 11}
nn = lambda n: 12 * (int(n[-1]) + 1) + NOTE[n[:-1]]  # noqa: E731
P = {
    "fashion": dict(bpm=116, prog={0: 4, 1: 28, 2: 38, 3: 89},  # rhodes, muted gtr, synth bass, warm pad
                    chords=[["A3", "C4", "E4", "G4", "B4"], ["A3", "C4", "E4", "F4"], ["G3", "B3", "C4", "E4"], ["G3", "B3", "D4", "E4"]],
                    bass=["A1", "F1", "C2", "G1"]),
    "travel": dict(bpm=124, prog={0: 0, 1: 25, 2: 33, 3: 48},  # piano, steel gtr, finger bass, strings
                   chords=[["D3", "A3", "D4", "F#4"], ["C#3", "A3", "E4", "A4"], ["B2", "F#3", "D4", "A4"], ["G2", "D3", "G3", "B3"]],
                   bass=["D2", "C#2", "B1", "G1"]),
}[PRESET]
BEAT = 60 / P["bpm"]
ev = []


def n(ch, beat, note, dur, vel, human=True):
    if human:
        beat += rng.normal(0, 0.006)
        vel += int(rng.integers(-5, 6))
    ev.append((ch, max(0.0, beat), nn(note) if isinstance(note, str) else note, dur, int(np.clip(vel, 1, 127))))


bars = int(np.ceil(END_AT / FPS / (4 * BEAT)))
end_beat = END_AT / FPS / BEAT
for b in range(bars):
    b0 = 4 * b
    c = b % 4
    ch, root = P["chords"][c], P["bass"][c]
    lift = b == bars - 1
    n(3, b0, nn(ch[0]) - 12, 3.9, 44)
    for note in ch[1:]:
        n(3, b0, note, 3.9, 40)
    if PRESET == "fashion":
        for at, d in ((0, 0.3), (0.75, 0.2), (1.5, 0.3), (2.5, 0.2), (3.0, 0.3)):
            for note in ch:
                n(0, b0 + at, note, d, 62)
        for k in range(8):
            n(1, b0 + k / 2 + 0.25, ch[(k % 3) + 1], 0.12, 58)
        for at, d, o in ((0, 0.4, 0), (0.75, 0.2, 12), (1.5, 0.4, 0), (2.5, 0.2, 12), (3, 0.4, 0), (3.5, 0.3, 7)):
            n(2, b0 + at, nn(root) + o, d, 92)
    else:
        for k, d in enumerate((1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)):  # strum pattern D DU UDU
            at = [0, 1, 1.5, 2.5, 3, 3.5][min(k, 5)] if k < 6 else None
            if at is None:
                continue
            for j, note in enumerate(ch if k % 2 == 0 else ch[::-1]):
                n(1, b0 + at + j * 0.012, note, 0.45, 64 if k % 2 == 0 else 48, human=False)
        for at in (0.5, 2.0, 3.5):
            for note in ch[1:]:
                n(0, b0 + at, nn(note) + 12, 0.25, 54)
        for at, d, o in ((0, 0.45, 0), (1, 0.4, 0), (1.5, 0.3, 7), (2, 0.45, 0), (3, 0.4, 12), (3.5, 0.3, 7)):
            n(2, b0 + at, nn(root) + o, d, 88)
    # drums (GM channel 10)
    for k in range(4):
        n(9, b0 + k, 36, 0.2, 96 if b else 70)
    for k in (1, 3):
        n(9, b0 + k, 39 if PRESET == "fashion" else 39, 0.2, 84)
    for k in range(8):
        n(9, b0 + k / 2, 42 if k % 2 == 0 else 46 if PRESET == "fashion" else 42, 0.1, 50 if k % 2 else 40)
        n(9, b0 + k / 2 + 0.25, 82 if PRESET == "fashion" else 54, 0.08, 40)
    if lift:
        for k in range(8):
            n(9, b0 + 2 + k / 4, 38, 0.1, 50 + 6 * k, human=False)
    if b == 0:
        n(9, b0, 49, 2, 70)
# final chord on the end card
fin = P["chords"][0]
for note in fin:
    n(0, end_beat, note, 6, 74)
    n(3, end_beat, note, 6, 60)
n(2, end_beat, P["bass"][0], 4, 96)
n(9, end_beat, 36, 0.3, 100)
n(9, end_beat, 49, 4, 86)

mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack()
mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(P["bpm"]), time=0))
msgs = []
for ch, p in P["prog"].items():
    msgs.append((0, 0, mido.Message("program_change", channel=ch, program=p)))
    msgs.append((0, 0, mido.Message("control_change", channel=ch, control=91, value=55)))
for ch, beat, note, dur, vel in ev:
    t0 = int(beat * TPB)
    msgs.append((t0, 2, mido.Message("note_on", channel=ch, note=note, velocity=vel)))
    msgs.append((t0 + max(1, int(dur * TPB)), 1, mido.Message("note_off", channel=ch, note=note, velocity=0)))
msgs.sort(key=lambda m: (m[0], m[1]))
last = 0
for t, _, m in msgs:
    tr.append(m.copy(time=t - last))
    last = t
mp, wp = os.path.join(OUT, "_m.mid"), os.path.join(OUT, "_m.wav")
mid.save(mp)
subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.5", "-r", str(SR), "-F", wp, SF2, mp], check=True)
x = sf.read(wp, dtype="float64")[0]
os.remove(mp)
os.remove(wp)
end = int(TOTAL / FPS * SR)
x = np.pad(x, ((0, max(0, end - len(x))), (0, 0)))[:end]
x = np.tanh(x / np.max(np.abs(x)) * 1.2) / np.tanh(1.2)
sf.write(os.path.join(OUT, "music.wav"), x.astype("float32"), SR)
print(PRESET, round(TOTAL / FPS, 2), "s, end card at", round(END_AT / FPS, 2), "s")
