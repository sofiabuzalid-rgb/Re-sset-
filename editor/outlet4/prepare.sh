#!/usr/bin/env bash
# Recreates editor/video/public/outlet4 (media is not committed).
# Usage: prepare.sh <dir with the original .MOV clips: IMG_2979…IMG_2995, IMG_2838, IMG_2847> <afro_house.mp3> <reference_reel.mov (AD2 audio)>
# iPhone HLG HDR → BT.709 SDR (hable tonemap), 1080×1920, 30 fps, all-intra so Remotion seeks are frame-exact.
set -euo pipefail
SRC=$(cd "$1" && pwd)
AFRO=$(cd "$(dirname "$2")" && pwd)/$(basename "$2")
REEL=$(cd "$(dirname "$3")" && pwd)/$(basename "$3")
cd "$(dirname "$0")/../video"
O=public/outlet4
mkdir -p $O/audio
TM="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
for f in "$SRC"/IMG_*.[mM][oO][vV]; do
  n=$(basename "${f%.*}")
  ffmpeg -v error -y -i "$f" -an -vf "$TM,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.03:saturation=1.03,format=yuv420p" \
    -r 30 -c:v libx264 -crf 14 -g 1 -color_primaries bt709 -color_trc bt709 -colorspace bt709 "$O/$n.mp4"
done
# outlet navideño + NFL already prepared for earlier campaigns
for n in 2839 2840 2842 2846 2848 2851 2852 2857 2861 2862 2863 2865 2866; do ln -f public/outlet/IMG_$n.mp4 $O/; done
for n in 2037 2038 2039 2040; do ln -f public/promo/IMG_$n.mp4 $O/; done
cp -f "$AFRO" $O/audio/afrohouse.mp3
ffmpeg -v error -y -i "$REEL" -vn -ac 2 -ar 48000 $O/audio/ad2_ref.wav
python3 ../outlet4/music.py
