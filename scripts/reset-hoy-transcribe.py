"""RESET HOY — literal transcription of every clip with speech (Whisper small, CTranslate2 int8, local, Spanish),
with word-level timecodes. Only clips not yet in transcripts.json are processed.
Output: docs/reset-hoy/transcripts.json (+ transcripts.md for reading)
Usage: python3 -I scripts/reset-hoy-transcribe.py /folder/with/clips /path/to/whisper-model
"""
import glob, json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

SRC, MODEL = sys.argv[1], sys.argv[2]
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "reset-hoy")
inv = json.load(open(os.path.join(D, "inventory.json")))
out_p = os.path.join(D, "transcripts.json")
tr = json.load(open(out_p)) if os.path.exists(out_p) else {}
m = WhisperModel(MODEL, device="cpu", compute_type="int8")
for name, v in sorted(inv.items()):
    if name in tr or v.get("speech_s", 0) < 0.6:
        continue
    p = glob.glob(os.path.join(SRC, name + ".*"))[0]
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.float32), language="es", beam_size=5, word_timestamps=True, vad_filter=False,
                           condition_on_previous_text=False)
    tr[name] = [{"a": round(s.start, 2), "b": round(s.end, 2), "text": s.text.strip(),
                 "words": [[round(w.start, 2), round(w.end, 2), w.word.strip()] for w in s.words]} for s in segs]
    json.dump(tr, open(out_p, "w"), indent=1, ensure_ascii=False)
    print(name, " | ".join(f"[{s['a']}-{s['b']}] {s['text']}" for s in tr[name]), flush=True)
with open(os.path.join(D, "transcripts.md"), "w") as f:
    f.write("# RESET HOY — transcripciones literales (Whisper small, revisar nombres propios)\n\n")
    for name in sorted(tr):
        f.write(f"## {name}\n" + "".join(f"- `{s['a']:.2f}–{s['b']:.2f}` {s['text']}\n" for s in tr[name]) + "\n")
