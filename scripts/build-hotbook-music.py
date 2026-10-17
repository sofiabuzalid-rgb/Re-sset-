"""
"ASÍ VIVIMOS HOTBOOK BAZAR" — ORIGINAL music (written here, no third-party material).
Bright, feminine indie-pop at 120 BPM in G major (Gmaj9 – Bm7 – Em7 – Cmaj9), played on sampled instruments from the
FluidR3 General MIDI soundfont (MIT licence): Rhodes comping, clean muted guitar, fingered bass, string pad,
vibraphone hook with a glockenspiel sparkle, acoustic kit with claps, shaker and tambourine.
Form follows the edit (bar = 60 frames): groove from frame 0 for the hook, full band from bar 2, breakdown for the
human moments (bars 7–8), snare build (bar 9), drop on "Un fin de semana muy RE:SET" (bar 10), Gmaj9 ring-out on the close.
Music and drums are rendered as separate stems so the music can be gently side-chained to the kick.
Requires: fluidsynth + fluid-soundfont-gm (apt), mido, numpy, soundfile (pip).
Output: public/hotbook/music.wav
Usage: python3 scripts/build-hotbook-music.py
"""
import json, os, re, subprocess
import mido, numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "hotbook")
e = json.load(open(os.path.join(ROOT, "src", "hotbook", "edit.json")))
FPS, BPM, SR = e["fps"], e["bpm"], 48000
TOTAL = sum(s["frames"] for s in e["shots"])
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TPB = 480
rng = np.random.default_rng(821)
run = lambda c: subprocess.run(c, check=True)  # noqa: E731

NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "A": 9, "Bb": 10, "B": 11}
nn = lambda n: 12 * (int(n[-1]) + 1) + NOTE[n[:-1]]  # noqa: E731

# ---------------------------------------------------------------- score
# events: (channel, beat, midi note, beats long, velocity)
ev = {"music": [], "drums": []}
PROG = {0: 4, 1: 27, 2: 33, 3: 48, 4: 11, 5: 9}  # rhodes, clean gtr, fingered bass, strings, vibes, glock


def n(ch, beat, note, dur, vel, human=True):
    if human:
        beat += rng.normal(0, 0.008)
        vel += int(rng.integers(-6, 7))
    ev["drums" if ch == 9 else "music"].append((ch, max(0.0, beat), nn(note) if isinstance(note, str) else note, dur, int(np.clip(vel, 1, 127))))


VOX = [["D4", "F#4", "A4", "B4"], ["D4", "F#4", "A4", "B4"], ["D4", "E4", "G4", "B4"], ["E4", "G4", "B4", "D5"]]
ROOTS = ["G2", "B1", "E2", "C2"]
FIFTH = ["D3", "F#2", "B2", "G2"]
GTR = [["B4", "D5"], ["A4", "D5"], ["G4", "B4"], ["G4", "B4"]]
HOOK = [
    [(0, "B5", 1), (1, "A5", 0.5), (1.5, "B5", 0.5), (2, "D6", 1), (3.5, "B5", 0.5)],
    [(0, "A5", 1.5), (1.5, "F#5", 0.5), (2, "A5", 1), (3, "D5", 1)],
    [(0, "G5", 1), (1, "F#5", 0.5), (1.5, "G5", 0.5), (2, "B5", 1), (3.5, "G5", 0.5)],
    [(0, "E5", 1.5), (1.5, "D5", 0.5), (2, "E5", 1), (3, "G5", 1)],
]
COMP = [(0, 0.4), (0.75, 0.25), (1.5, 0.4), (2.5, 0.25), (3, 0.4), (3.5, 0.25)]
KICK, SNARE, CLAP, HAT, OHAT, CRASH, SHAKER, TAMB = 36, 38, 39, 42, 46, 49, 82, 54

fb = lambda fr: fr // 60  # noqa: E731  bar of a frame (bar = 60 frames at 120 BPM)
BRK, BUILD, DROP, END = fb(420), fb(540), fb(600), fb(720)
for b in range(END):
    b0 = 4 * b
    c = b % 4
    brk = BRK <= b < BUILD
    full = b >= 2 and not brk and b != BUILD
    # strings pad, always under; up front in the breakdown
    for note in VOX[c]:
        n(3, b0, nn(note) - 12, 3.95, 72 if brk else 50)
    # rhodes
    if brk or b == BUILD:
        for note in VOX[c]:
            n(0, b0, note, 1.9, 70)
            n(0, b0 + 2, note, 1.9, 60)
    else:
        for at, d in COMP:
            for note in VOX[c]:
                n(0, b0 + at, note, d, 76 if at in (0, 1.5, 3) else 64)
    # bass
    if b >= 1 and not brk:
        pat = [(0, ROOTS[c], 0.45, 96), (0.75, ROOTS[c], 0.2, 70), (1.5, FIFTH[c], 0.4, 84), (2, ROOTS[c], 0.45, 92),
               (2.75, nn(ROOTS[c]) + 12, 0.2, 72), (3.5, FIFTH[c], 0.4, 82)]
        for at, note, d, v in pat:
            n(2, b0 + at, note, d, v)
    elif brk:
        n(2, b0, ROOTS[c], 3.8, 78)
    # muted guitar 8ths
    if full:
        for k in range(8):
            for note in GTR[c]:
                n(1, b0 + k / 2, note, 0.18, 70 if k % 2 else 52)
    # hook
    if full or b >= DROP:
        for at, note, d in HOOK[c]:
            n(4, b0 + at, note, d, 96)
            if b >= DROP:
                n(5, b0 + at, nn(note) + 12, d, 54)
    elif brk:
        for at, note, d in HOOK[c][:3]:
            n(4, b0 + at, note, d, 74)
    # drums
    if brk:
        for k in range(8):
            n(9, b0 + k / 2, SHAKER, 0.1, 62 if k % 2 else 44)
        continue
    if b == BUILD:
        for k in range(4):
            n(9, b0 + k, KICK, 0.2, 80)
        for k in range(16):  # 16th snare build, crescendo
            n(9, b0 + k / 4, SNARE, 0.1, 40 + int(k * 4.5), human=False)
        continue
    for k in range(4):
        n(9, b0 + k, KICK, 0.2, 104 if k in (0, 2) else 96)
    for k in (1, 3):
        n(9, b0 + k, CLAP, 0.2, 92)
        n(9, b0 + k, SNARE, 0.2, 50)
    for k in range(8):
        n(9, b0 + k / 2, HAT, 0.1, 70 if k % 2 else 50)
    for k in range(16):
        n(9, b0 + k / 4, SHAKER, 0.08, 50 if k % 2 else 34)
    if full or b >= DROP:
        for k in range(4):
            n(9, b0 + k + 0.5, OHAT, 0.2, 58)
        n(9, b0 + 1, TAMB, 0.2, 52)
        n(9, b0 + 3, TAMB, 0.2, 52)
    if b in (0, 2, DROP):
        n(9, b0, CRASH, 2, 92 if b else 70)
# close: Gmaj9 rings out
b0 = 4 * END
for note in ["G2", "D3", "B3", "F#4", "A4", "D5"]:
    n(0, b0, note, 6, 72)
for note in VOX[0]:
    n(3, b0, nn(note) - 12, 6, 64)
n(2, b0, "G1", 4, 90)
n(4, b0, "B5", 3, 80)
n(5, b0 + 0.5, "D6", 3, 50)
n(9, b0, KICK, 0.3, 96)
n(9, b0, CRASH, 4, 84)


def write_mid(events, path):
    mid = mido.MidiFile(ticks_per_beat=TPB)
    tr = mido.MidiTrack()
    mid.tracks.append(tr)
    tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM), time=0))
    msgs = []
    for ch, p in PROG.items():
        msgs.append((0, 0, mido.Message("program_change", channel=ch, program=p)))
        msgs.append((0, 0, mido.Message("control_change", channel=ch, control=91, value=70 if ch in (0, 3, 4, 5) else 30)))
    msgs.append((0, 0, mido.Message("control_change", channel=9, control=91, value=25)))
    for ch, beat, note, dur, vel in events:
        t0 = int(beat * TPB)
        msgs.append((t0, 2, mido.Message("note_on", channel=ch, note=note, velocity=vel)))
        msgs.append((t0 + max(1, int(dur * TPB)), 1, mido.Message("note_off", channel=ch, note=note, velocity=0)))
    msgs.sort(key=lambda m: (m[0], m[1]))
    last = 0
    for t, _, m in msgs:
        tr.append(m.copy(time=t - last))
        last = t
    mid.save(path)


stems = {}
for k in ("music", "drums"):
    mp, wp = os.path.join(OUT, f"_{k}.mid"), os.path.join(OUT, f"_{k}.wav")
    write_mid(ev[k], mp)
    run(["fluidsynth", "-ni", "-q", "-g", "0.5", "-r", str(SR), "-F", wp, SF2, mp])
    stems[k] = sf.read(wp, dtype="float64")[0]
    os.remove(mp)
    os.remove(wp)

L = max(len(s) for s in stems.values())
mus, dr = (np.pad(stems[k], ((0, L - len(stems[k])), (0, 0))) for k in ("music", "drums"))
# side-chain: dip the music ~3.5 dB on every kick, recovering over ~180 ms
duck = np.ones(L)
kicks = [beat for ch, beat, note, _, _ in ev["drums"] if note == KICK]
tt = np.arange(int(0.25 * SR)) / SR
shape = 1 - (1 - 10 ** (-3.5 / 20)) * np.exp(-tt / 0.09) * np.minimum(1, tt / 0.004 + 0.3)
for beat in kicks:
    i = int(beat * 60 / BPM * SR)
    j = min(L, i + len(shape))
    duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
mix = mus * duck[:, None] * 1.0 + dr * 0.85
end = int(TOTAL / FPS * SR)
mix = mix[:end]
fo = int(1.6 * SR)
mix[-fo:] *= (np.linspace(1, 0, fo) ** 1.5)[:, None]
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, mix.astype("float32"), SR)
master = "highpass=f=30,equalizer=f=250:t=q:w=1.0:g=-1.5,equalizer=f=11000:t=h:w=0.7:g=2,acompressor=threshold=-18dB:ratio=2:attack=15:release=200:makeup=1.5"
pre2 = os.path.join(OUT, "_pre2.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", master, pre2])
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre2, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
run(["ffmpeg", "-y", "-v", "error", "-i", pre2, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true", "-ar", "48000", "-ac", "2", os.path.join(OUT, "music.wav")])
for f in (pre, pre2):
    os.remove(f)
print("music", TOTAL / FPS, "s")
