#!/usr/bin/env bash
# Pone el audio del reel de referencia tal cual (sin normalizar ni comprimir) sobre el render de RESET-CHRISTMAS-MEMORIES-NN.
# render.sh normaliza el audio y aplasta la pausa antes del golpe; aquí se reemplaza por el original idéntico.
# Uso (desde editor/video): CONC=3 bash ../outlet4/render.sh RESET-CHRISTMAS-MEMORIES-01 RESET_CHRISTMAS_MEMORIES_01.mp4 && bash ../memories/mux.sh 01
set -euo pipefail
cd "$(dirname "$0")/../video/out"
n=$1
ffmpeg -v error -y -i RESET_CHRISTMAS_MEMORIES_$n.mp4 -an -c:v copy -movflags +faststart RESET_CHRISTMAS_MEMORIES_${n}_SIN_AUDIO.mp4
ffmpeg -v error -y -i RESET_CHRISTMAS_MEMORIES_${n}_SIN_AUDIO.mp4 -i ../public/memories/ref_audio.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart RESET_CHRISTMAS_MEMORIES_$n.mp4
