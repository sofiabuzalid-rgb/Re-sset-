"""
Prepares the media for the "Essential de Botones" ad from the ORIGINAL iPhone clip.

1. public/essential/source.mp4 : full-resolution 1080x1920 H.264 intermediate (CRF 12, no audio,
   auto-rotated, no scaling, no colour changes) so Remotion can seek frame-accurately.
2. public/essential/voice.wav  : the edited voice track. Segments from src/essential/edit.json are
   cut with 12 ms fades (no clicks), concatenated, then cleaned and levelled:
   high-pass 85 Hz, gentle FFT noise reduction, light compression, two-pass loudnorm to -16 LUFS / -1.5 dBTP.

Usage: python3 scripts/build-essential-media.py /path/to/PIJAMA_VIDEO_EDITABLE.MOV
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "public", "essential")
edit = json.load(open(os.path.join(ROOT, "src", "essential", "edit.json")))
fps = edit["fps"]
os.makedirs(OUT, exist_ok=True)


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


# 1 — video intermediate
run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-an", "-vf", "fps=30,format=yuv420p", "-c:v", "libx264",
     "-preset", "slow", "-crf", "12", "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709",
     "-colorspace", "bt709", "-movflags", "+faststart", os.path.join(OUT, "source.mp4")])

# 2 — voice edit
parts, labels = [], []
for i, s in enumerate(edit["voice"]):
    a, b = s["a"] / fps, s["b"] / fps
    d = b - a
    parts.append(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.4f}:d=0.012[s{i}]")
    labels.append(f"[s{i}]")
graph = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=0:a=1[cat]"
clean = "highpass=f=85,afftdn=nf=-38:nr=10:tn=1,acompressor=threshold=-24dB:ratio=2.2:attack=10:release=150:makeup=1.5"
raw = os.path.join(OUT, "voice-raw.wav")
run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex", graph + f";[cat]{clean}[out]", "-map", "[out]",
     "-ac", "1", "-ar", "48000", raw])

# two-pass loudness normalisation
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", probe, re.S).group(0))
ln = (f"loudnorm=I=-16:TP=-1.5:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", ln, "-ar", "48000", "-ac", "2", os.path.join(OUT, "voice.wav")])
os.remove(raw)
print("voice frames:", sum(s["b"] - s["a"] for s in edit["voice"]))
