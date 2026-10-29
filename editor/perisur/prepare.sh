#!/usr/bin/env bash
# Converts the RE:SET Perisur clips to SDR 1080×1920 for the Remotion project (media is not committed).
# Usage: prepare.sh <dir with the IMG_*.mov clips from the shoot>
# iPhone HLG (arib-std-b67) → BT.709 SDR with a hable tonemap; IMG_2272 is already SDR and skips the tonemap.
set -euo pipefail
SRC=$(cd "$1" && pwd)
cd "$(dirname "$0")/../video"
O=public/perisur
mkdir -p $O
TM="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
GRADE="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.03:saturation=1.02,format=yuv420p"
# segment used in the edit (seconds); the whole clip is kept when the range is omitted
declare -A RANGE=( [2314]="0 3.5" [2272]="3 6.2" [2255]="2.6 5.8" [2254]="5 6.4" [3084]="1 2.4" [2250]="0 4.9" [2317]="3.5 5.6" [2252]="0 1.3" [2315]="5.5 7" )
declare -A HDR=( [2272]=0 )
for n in "${!RANGE[@]}"; do
  read -r s e <<< "${RANGE[$n]}"
  vf="$GRADE"
  [ "${HDR[$n]:-1}" = 1 ] && vf="$TM,$GRADE"
  ffmpeg -v error -y -ss "$s" -to "$e" -i "$SRC/IMG_$n.mov" -an -vf "$vf" -r 30 -c:v libx264 -crf 15 -g 30 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 "$O/IMG_$n.mp4"
done
echo "prepared ${#RANGE[@]} clips in $O"
