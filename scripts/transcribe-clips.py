"""Literal Spanish transcription (Whisper small, CTranslate2 int8, local) with word timecodes and a speech map,
for any folder of clips. Clips already in the output file are skipped.
Usage: python3 -I scripts/transcribe-clips.py <clips dir> <whisper model dir> <out.json>
"""
import glob, json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

SRC, MODEL, OUT = sys.argv[1:4]
tr = json.load(open(OUT)) if os.path.exists(OUT) else {}
m = WhisperModel(MODEL, device="cpu", compute_type="int8")
for p in sorted(glob.glob(os.path.join(SRC, "IMG_*"))):
    name = os.path.basename(p).rsplit(".", 1)[0]
    if name in tr:
        continue
    pcm = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                                       capture_output=True, check=True).stdout, np.float32)
    # speech map: 50 ms frames above -40 dBFS, gaps under 0.3 s bridged
    n = 800
    on = [20 * np.log10(np.sqrt(np.mean(pcm[i:i + n] ** 2)) + 1e-9) > -40 for i in range(0, len(pcm) - n, n)]
    spans, a = [], None
    for k, v in enumerate(on + [False]):
        if v and a is None:
            a = k
        if not v and a is not None:
            if spans and a * 0.05 - spans[-1][1] < 0.3:
                spans[-1][1] = round(k * 0.05, 2)
            else:
                spans.append([round(a * 0.05, 2), round(k * 0.05, 2)])
            a = None
    segs, _ = m.transcribe(pcm, language="es", beam_size=5, word_timestamps=True, condition_on_previous_text=False)
    tr[name] = {"dur": round(len(pcm) / 16000, 2), "speech": [s for s in spans if s[1] - s[0] >= 0.25],
                "segments": [{"a": round(s.start, 2), "b": round(s.end, 2), "text": s.text.strip(),
                              "words": [[round(w.start, 2), round(w.end, 2), w.word.strip()] for w in s.words]} for s in segs]}
    json.dump(tr, open(OUT, "w"), indent=1, ensure_ascii=False)
    print(name, tr[name]["speech"][:8])
    for s in tr[name]["segments"]:
        print(f"   [{s['a']:.2f}-{s['b']:.2f}] {s['text']}")
