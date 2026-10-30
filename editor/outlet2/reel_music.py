"""Builds the second-wave soundtracks from the audio of the reference reel the client sent (Owen's Black Friday screen recording).
Beat grid fitted on the music (140.02 BPM, beat 0 at 3.274 s of the recording, drop on beat 5). Each track = intro (beats 0-5)
+ the 8-beat groove (beats 5-13) repeated N times + the natural ending (beats 13-23), joined with 12 ms crossfades.
NOT licensed for paid media: it is the reel's own audio. Usage: python3 reel_music.py <reference.wav>"""
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

B, T0 = 0.42852, 3.274
OUT = Path(__file__).resolve().parent.parent / "video" / "public" / "outlet4" / "audio"
sr, x = wavfile.read(sys.argv[1])
x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
at = lambda b: int(round((T0 + b * B) * sr))
XF = int(0.012 * sr)


def join(parts):
    out = parts[0].copy()
    ramp = np.linspace(0, 1, XF)[:, None]
    for p in parts[1:]:
        out[-XF:] = out[-XF:] * (1 - ramp) + p[:XF] * ramp
        out = np.concatenate([out, p[XF:]])
    return out


for n in range(1, 6):
    parts = [x[at(0):at(5) + XF]] + [x[at(5):at(13) + XF] for _ in range(n)] + [x[at(13):at(23)]]
    y = join(parts)
    y *= 10 ** (-1 / 20) / (np.abs(y).max() + 1e-9)
    wavfile.write(OUT / f"reel3_n{n}.wav", sr, (y * 32767).astype(np.int16))
    print(f"reel3_n{n}.wav {len(y) / sr:.2f}s = {5 + 8 * n + 10} beats")
