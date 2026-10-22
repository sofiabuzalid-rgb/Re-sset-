"""
CHRISTMAS AT HOME — ORIGINAL score + final mix (no carols, no third-party material).
Warm cinematic Christmas in D major on a 120 BPM grid (bar = 2 s = 60 frames), sampled instruments from the
FluidR3 General MIDI soundfont (MIT licence): felt grand piano arpeggios, string ensemble, cello, harp glissandi,
pizzicato pulse, a French-horn swell and a single celesta colour per section (no sleigh bells).
Harmony: D – Bm7 – Gmaj7 – Gm6 (the minor-plagal "Christmas" colour) – D/F# – Em7 – A7sus – A7.
Form follows the edit: hook swell (bars 0–1), cozy pulse (2–4), voice bed (5–9, ducked -13 dB under her),
full theme (10–12), dominant build (13), Dmaj9 resolution on the CTA (14) and ring-out.
Final mix = voice.wav (from build-xmashome-media.py) + score, -14 LUFS / -1 dBTP.
Requires: fluidsynth + fluid-soundfont-gm (apt), mido, numpy, soundfile (pip).
Output: public/xmashome/music.wav (score only), public/xmashome/mix.wav
Usage: python3 scripts/build-xmashome-music.py
"""
import json, os, re, subprocess
import mido, numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "xmashome")
e = json.load(open(os.path.join(ROOT, "src", "xmashome", "edit.json")))
FPS, BPM, SR = e["fps"], e["bpm"], 48000
TOTAL = sum(s["frames"] for s in e["shots"])
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TPB = 480
rng = np.random.default_rng(8945)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731

NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "Bb": 10, "B": 11}
nn = lambda n: 12 * (int(n[-1]) + 1) + NOTE[n[:-1]]  # noqa: E731
PROG = {0: 0, 1: 48, 2: 42, 3: 46, 4: 45, 5: 60, 6: 8, 7: 43}  # piano, strings, cello, harp, pizz, horn, celesta, contrabass
ev = []


def n(ch, beat, note, dur, vel, human=True):
    if human:
        beat += rng.normal(0, 0.006)
        vel += int(rng.integers(-5, 6))
    ev.append((ch, max(0.0, beat), nn(note) if isinstance(note, str) else note, dur, int(np.clip(vel, 1, 127))))


CH = [["D3", "A3", "E4", "F#4"], ["B2", "F#3", "A3", "D4"], ["G2", "D3", "F#3", "B3"], ["G2", "D3", "E3", "Bb3"],
      ["F#2", "D3", "A3", "D4"], ["E2", "B2", "D3", "G3"], ["A2", "E3", "G3", "D4"], ["A2", "E3", "G3", "C#4"]]
BASS = ["D2", "B1", "G1", "G1", "F#1", "E2", "A1", "A1"]
ARP = [["D4", "A4", "E5", "F#5"], ["B3", "F#4", "A4", "D5"], ["G3", "D4", "F#4", "B4"], ["G3", "D4", "E4", "Bb4"],
       ["F#3", "D4", "A4", "D5"], ["E3", "B3", "D4", "G4"], ["A3", "E4", "G4", "D5"], ["A3", "E4", "G4", "C#5"]]
MEL = [[(0, "F#5", 1.5), (1.5, "E5", .5), (2, "D5", 1), (3, "A4", 1)],
       [(0, "B4", 1), (1, "C#5", .5), (1.5, "D5", .5), (2, "F#5", 2)],
       [(0, "G5", 1.5), (1.5, "F#5", .5), (2, "E5", 1), (3, "D5", 1)],
       [(0, "E5", 2), (2, "D5", 1), (3, "Bb4", 1)],
       [(0, "A4", 1), (1, "D5", 1), (2, "F#5", 1), (3, "A5", 1)],
       [(0, "G5", 1.5), (1.5, "F#5", .5), (2, "E5", 2)],
       [(0, "D5", 2), (2, "E5", 1), (3, "C#5", 1)],
       [(0, "E5", 2), (2, "C#5", 1), (3, "A4", 1)]]


def gliss(beat, lo="D4", hi="A6", dur=0.9, vel=60):
    scale = [0, 2, 4, 7, 9]  # pentatonic harp sweep
    notes = [m for m in range(nn(lo), nn(hi) + 1) if (m - 2) % 12 in scale]
    for k, m in enumerate(notes):
        n(3, beat + dur * k / len(notes), m, 1.5, vel + k, human=False)


fb = lambda fr: fr // 60  # noqa: E731
VO0, VO1 = fb(294), fb(594)  # bars under the voice
FULL, BUILD, RES = fb(594), 13, 14
for b in range(RES):
    b0, c = 4 * b, b % 8
    voice = VO0 <= b < VO1
    # strings, always; cello doubles the bass line outside the voice
    for note in CH[c]:
        n(1, b0, note, 3.95, 46 if voice else (60 if b < FULL else 72))
    n(7, b0, BASS[c], 3.9, 60 if voice else 78)
    if not voice and b >= 2:
        n(2, b0, nn(BASS[c]) + 12, 1.9, 66)
        n(2, b0 + 2, nn(CH[c][1]), 1.9, 60)
    # piano arpeggio in 8ths (quarters under the voice)
    for k in range(8):
        if voice and k % 2:
            continue
        n(0, b0 + k / 2, ARP[c][[0, 1, 2, 3, 2, 1, 2, 3][k]], 0.9, (40 if voice else 52) + (8 if k == 0 else 0))
    # pizzicato pulse
    if 2 <= b < VO0 or FULL <= b:
        for k in range(4):
            n(4, b0 + k, ARP[c][k % 2], 0.4, 58 if k % 2 else 70)
    # theme
    if b >= FULL:
        for at, note, d in MEL[c]:
            n(0, b0 + at, nn(note), d, 80)
            n(1, b0 + at, nn(note) - 12, d, 58)
    if b == BUILD:
        n(5, b0, "A3", 3.9, 70)
        n(5, b0, "E4", 3.9, 64)
gliss(0, vel=56)
n(6, 0.02, "A6", 1.5, 52)
n(6, 4 * 2, "F#6", 1.5, 44)
gliss(4 * RES - 1, lo="A3", hi="D6", dur=1.0, vel=62)
# resolution: Dmaj9 tutti on the CTA, rings out
b0 = 4 * RES
for note in ["D2", "A2", "D3", "F#3", "A3", "C#4", "E4"]:
    n(1, b0, note, 9, 74)
for note in ["D3", "A3", "E4", "F#4", "A4", "C#5"]:
    n(0, b0 + 0.04 * rng.random(), note, 7, 66)
n(7, b0, "D2", 8, 80)
n(5, b0, "F#4", 6, 62)
n(5, b0, "A3", 6, 58)
n(6, b0 + 1, "E6", 2, 46)
n(6, b0 + 1.5, "A6", 2, 40)

mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack()
mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM), time=0))
msgs = []
for ch, p in PROG.items():
    msgs.append((0, 0, mido.Message("program_change", channel=ch, program=p)))
    msgs.append((0, 0, mido.Message("control_change", channel=ch, control=91, value=85)))
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
run(["fluidsynth", "-ni", "-q", "-g", "0.45", "-r", str(SR), "-F", wp, SF2, mp])
mus = sf.read(wp, dtype="float64")[0]
os.remove(mp)
os.remove(wp)

end = int(TOTAL / FPS * SR)
mus = np.pad(mus, ((0, max(0, end - len(mus))), (0, 0)))[:end]
fo = int(2.0 * SR)
mus[-fo:] *= (np.linspace(1, 0, fo) ** 1.5)[:, None]
mus *= 10 ** ((-20 - 20 * np.log10(np.sqrt(np.mean(mus ** 2)) + 1e-9)) / 20)
sf.write(os.path.join(OUT, "music.wav"), mus.astype("float32"), SR)

# ---------------- mix: voice on top, score ducked under it
vo = e["voice"]
voice = sf.read(os.path.join(OUT, "voice.wav"), dtype="float64")[0]
vtrack = np.zeros(end)
i = int(vo["at"] / FPS * SR)
vtrack[i:i + len(voice)] = voice[: end - i]
gdb = np.zeros(end)
gdb[i - int(0.3 * SR):i + len(voice) + int(0.2 * SR)] = -13.0
k = int(0.35 * SR)
gdb = np.convolve(gdb, np.ones(k) / k, mode="same")
mix = mus * (10 ** (gdb / 20))[:, None] + vtrack[:, None]
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "mix.wav")])
os.remove(pre)
print("mix", TOTAL / FPS, "s")
