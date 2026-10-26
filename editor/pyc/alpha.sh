#!/usr/bin/env bash
# fg + alpha (editor/pyc/matte) → editor/video/public/pyc/<nombre>.webm, VP9 con canal alfa, para OffthreadVideo transparent.
set -e
cd "$(dirname "$0")/../.."
mkdir -p editor/video/public/pyc
for a in editor/pyc/matte/*.alpha.mp4; do
  n=$(basename "$a" .alpha.mp4); out=editor/video/public/pyc/$n.webm
  [ -f "$out" ] && [ "$out" -nt "$a" ] && continue
  ffmpeg -v error -y -i editor/pyc/matte/$n.fg.mp4 -i "$a" -filter_complex "[1:v]format=gray[a];[0:v][a]alphamerge,format=yuva420p" \
    -c:v libvpx-vp9 -pix_fmt yuva420p -crf 16 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -auto-alt-ref 0 "$out"
  echo "ok $n"
done
