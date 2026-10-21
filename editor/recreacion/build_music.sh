#!/bin/sh
# Music bed for the recreation = the reference reel's own audio (client's request; commercial licence NOT verified).
# 0-9.267 s (one loop of the reel), then again from 0 like the reel's loop (detail cuts land on its beats),
# 20 ms crossfade at the seam, 0.5 s fade-out, -14 LUFS. Length = composition length (TOTAL frames / 30).
set -e
cd "$(dirname "$0")"
T=$(python3 -c "print(422/30)")
ffmpeg -v error -y -t 9.267 -i ../referencia/referencia.mp4 -vn -ac 2 -ar 48000 /tmp/_a1.wav
ffmpeg -v error -y -t 5 -i ../referencia/referencia.mp4 -vn -ac 2 -ar 48000 /tmp/_a2.wav
ffmpeg -v error -y -i /tmp/_a1.wav -i /tmp/_a2.wav -filter_complex "[0][1]acrossfade=d=0.02:c1=tri:c2=tri,atrim=0:$T,afade=t=out:st=$(python3 -c "print($T-0.5)"):d=0.5,loudnorm=I=-14:TP=-1:LRA=11" -ar 48000 ../video/public/recreacion/music.wav
