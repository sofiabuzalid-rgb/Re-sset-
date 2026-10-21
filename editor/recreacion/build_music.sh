#!/bin/sh
# Music bed = the reference reel's own audio, ONE pass only (0-9.267 s, never looped) — client's request;
# its commercial licence is NOT verified. 20 ms fade-in, 0.1 s fade-out, -14 LUFS.
set -e
cd "$(dirname "$0")"
ffmpeg -v error -y -t 9.267 -i ../referencia/referencia.mp4 -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.02,afade=t=out:st=9.167:d=0.1,loudnorm=I=-14:TP=-1:LRA=11" -ar 48000 ../video/public/recreacion/music.wav
