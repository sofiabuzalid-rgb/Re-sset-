"""
RE:SET — EL REGALO PERFECTO (Christmas family ad, creator-led) — media + audio.
Edit decision list: src/regalo/edit.json. Voice: only her real words (IMG_8502/8503/8495/8504).
- Video layers: iPhone HLG -> SDR BT.709 (hable), cover-crop to 1080x1920 with per-layer zoom/centre, gentle grade.
- Voice: only her real words, cut at the EDL in/out points.
  Clean-up per source: high-pass, FFT denoise (store hum/air), mud cut, presence lift, de-ess, gentle compression,
  then both sources matched to the same loudness; 8 ms fades at every cut.
- Music: e["music"] == "original-soft" -> a quiet ORIGINAL bed (numpy) ducked under her voice; otherwise voice only.
  The client rejected "Christmas Wonderland" (Artlist): never use it again. Final mix -14 LUFS / -1 dBTP.
Usage: python3 scripts/build-xmatch-media.py
"""
import importlib.util, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "regalo")
os.makedirs(OUT, exist_ok=True)
e = json.load(open(os.path.join(ROOT, "src", "regalo", "edit.json")))
FPS, SR = e["fps"], 48000
spec = importlib.util.spec_from_file_location("m4", os.path.join(ROOT, "scripts", "build-meta4-media.py"))
m4 = importlib.util.module_from_spec(spec)
sys.argv = [sys.argv[0]]
spec.loader.exec_module(m4)  # reuse resolve()/probe() (no ads passed -> builds nothing)
syn = importlib.util.spec_from_file_location("mu", os.path.join(ROOT, "scripts", "build-meta4-music.py"))
mu = importlib.util.module_from_spec(syn)
syn.loader.exec_module(mu)
TM = m4.TM
GRADE = "eq=gamma=1.04:contrast=1.03:saturation=1.06,colorbalance=rm=0.012:bm=-0.01,unsharp=5:5:0.3:5:5:0"

# ---------------- video layers
procs = []
jobs = []
for l in e["layers"]:  # a "grid" layer (2x2 of four real clips) is rendered as four full-frame clips <id>a..d
    if "grid" in l:
        jobs += [dict(l, src=g, id=l["id"] + "abcd"[k], **{"in": l["ins"][k]}) for k, g in enumerate(l["grid"])]
    else:
        jobs.append(l)
for l in jobs:
    src = m4.resolve(l["src"])
    w, h, hdr = m4.probe(src)
    z, cx, cy = l.get("zoom", 1.0), l.get("cx", 0.5), l.get("cy", 0.5)
    W, H = (round(1080 * z / 2) * 2, round(1920 * z / 2) * 2)
    sc = f"scale=-2:{H}:flags=lanczos" if w / h > 1080 / 1920 else f"scale={W}:-2:flags=lanczos"
    vf = ([TM] if hdr else []) + [sc, f"crop=1080:1920:(iw-1080)*{cx}:(ih-1920)*{cy}", GRADE, "format=yuv420p"]
    procs.append(subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-ss", str(l["in"]), "-i", src, "-an", "-vf", ",".join(vf),
                                   "-frames:v", str(l["frames"]), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14",
                                   "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                                   os.path.join(OUT, f"{l['id']}.mp4")]))
    while len(procs) >= 6:
        procs.pop(0).wait()
for p in procs:
    p.wait()

# ---------------- voice
CHAIN = ("highpass=f=85:poles=2,afftdn=nr=14:nf=-32:tn=1,equalizer=f=220:t=q:w=1.1:g=-2.5,"
         "equalizer=f=3300:t=q:w=1.0:g=2.2,equalizer=f=9000:t=h:w=1:g=1.0,deesser=i=0.35,"
         "acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=2,lowpass=f=15500")
clean = {}
for ref in sorted({v["src"] for v in e["voice"]}):
    tmp = os.path.join(OUT, f"_v_{ref[2:]}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", m4.resolve(ref), "-vn", "-ac", "1", "-ar", str(SR), "-af", CHAIN, tmp], check=True)
    a, _ = sf.read(tmp, dtype="float64")
    os.remove(tmp)
    clean[ref] = a
# loudness match between the two recordings: equal RMS over speech-only samples
def speech_rms(a):
    hop = int(0.02 * SR)
    r = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    return np.sqrt(np.mean(r[r > np.percentile(r, 60)] ** 2))
ref_rms = np.mean([speech_rms(a) for a in clean.values()])
for k in clean:
    clean[k] *= ref_rms / speech_rms(clean[k])
TOTAL = e["total"]
L = int(TOTAL / FPS * SR) + SR
voice = np.zeros(L)
fd = int(0.008 * SR)
for v in e["voice"]:
    a = clean[v["src"]]
    i0 = int(round(v["in"] * SR))
    n = int(round(v["frames"] / FPS * SR))
    seg = a[i0:i0 + n].copy()
    seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    j = int(round(v["from"] / FPS * SR))
    voice[j:j + len(seg)] += seg
voice /= np.max(np.abs(voice)) / 0.7

# ---------------- music: ORIGINAL soft bed (numpy, no samples). The "Christmas Wonderland" track must NOT be used.
music = np.zeros(L)
if e.get("music") == "original-soft":
    BPM = 92
    B = 60 / BPM
    mx = mu.Mix(TOTAL, tail=1.0)
    CH = [["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["C3", "E3", "G3", "A#3"]]
    ARP = [["A4", "C5", "E5", "C5"], ["F4", "A4", "D5", "A4"], ["D4", "F4", "A4", "F4"], ["E4", "G4", "C5", "G4"]]
    for b in range(int(TOTAL / FPS / (4 * B)) + 1):
        t0, c = b * 4 * B, b % 4
        mx.put("mu", mu.pad(mu.chord(CH[c]), 4 * B, 0.18), t0)
        mx.put("ba", mu.bass(mu.hz(CH[c][0]) / 2, 4 * B * 0.9, 0.25), t0)
        for k in range(8):
            mx.put("mu", mu.piano(mu.hz(ARP[c][k % 4]), 0.16 if k % 2 == 0 else 0.1, 0.9), t0 + k * B / 2)
        for k in range(4):
            mx.put("dr", mu.sleigh(0.35), t0 + k * B + B / 2)
    for l in e["layers"]:
        if "grid" in l:
            for k, n in enumerate(["C6", "E6", "A6"]):
                mx.put("fx", mu.bell(mu.hz(n), 0.1, 0.6), l["from"] / FPS + k * 0.07)
    music = mx.b["dr"] * 0.6 + mx.b["mu"] + mx.b["ba"] + mx.b["fx"]
    ir_n = int(1.6 * SR)
    ir = np.random.default_rng(3).standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.4)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << (len(music) + ir_n).bit_length()
    music = music + 0.25 * np.fft.irfft(np.fft.rfft(music, size) * np.fft.rfft(ir, size), size)[: len(music)]
    music = np.pad(music, (0, max(0, L - len(music))))[:L]
    music /= np.max(np.abs(music))
    fo = int(1.2 * SR)
    end_i = int(TOTAL / FPS * SR)
    music[end_i - fo:end_i] *= np.linspace(1, 0, fo)
# sidechain duck from the voice envelope: music ~ -15 dB under speech, back up in gaps / end card
hop = int(0.01 * SR)
env = np.array([np.sqrt(np.mean(voice[i:i + hop] ** 2)) for i in range(0, L, hop)])
on = (env > 0.02).astype(float)
k = int(0.25 / 0.01)
on = np.convolve(on, np.ones(k) / k, "same") > 0.05
g = np.where(on, 10 ** (-24 / 20), 10 ** (-9 / 20))
sm = np.zeros_like(g)
for i in range(len(g)):  # attack 30 ms / release 250 ms
    prev = sm[i - 1] if i else g[0]
    sm[i] = prev + (g[i] - prev) * (0.33 if g[i] < prev else 0.04)
gain = np.repeat(sm, hop)[:L]
mix = voice + music[:L] * gain * 0.55
end = int(TOTAL / FPS * SR)
mix = mix[:end]
fo = int(0.6 * SR)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
pre = os.path.join(OUT, "_pre.wav")
sf.write(pre, np.stack([mix, mix], 1).astype("float32"), SR)
pr = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=8:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", pr, re.S).group(0))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=8:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true", "-ar", "48000", os.path.join(OUT, "mix.wav")], check=True)
os.remove(pre)
sf.write(os.path.join(OUT, "_voice_only.wav"), voice[:end].astype("float32"), SR)
print("regalo", len(e["layers"]), "layers,", TOTAL / FPS, "s")
