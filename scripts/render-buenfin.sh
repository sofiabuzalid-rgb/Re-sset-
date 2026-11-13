#!/usr/bin/env bash
# Render the Buen Fin ads (official Buen Fin badge + word-by-word captions) at high quality and check each file.
set -euo pipefail
cd "$(dirname "$0")/.."
B=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
while read -r comp name; do
  [ $# -gt 0 ] && [[ " $* " != *" $comp "* ]] && continue  # optional: only the compositions named on the command line
  out="out/${name}.mp4"
  npx remotion render "$comp" "$out" --browser-executable="$B" --image-format=png --crf=14 --x264-preset=slow \
    --color-space=bt709 --audio-codec=aac --audio-bitrate=320k --log=error </dev/null
  info=$(ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of csv=p=0 "$out" | tr '\n' ' ')
  lufs=$(ffmpeg -i "$out" -af ebur128 -f null - </dev/null 2>&1 | grep -A3 Summary | grep -o "I: *-\?[0-9.]* LUFS" | head -1)
  black=$(ffmpeg -i "$out" -vf blackdetect=d=0.1 -an -f null - </dev/null 2>&1 | grep -c black_start || true)
  ffmpeg -v error -i "$out" -f null - </dev/null && ok=decodes || ok=DECODE_ERROR
  echo "RENDERED $out | $info | $lufs | black=$black | $ok"
done <<'LIST'
BuenFinIlanaPremium RESET_BUENFIN_ILANA_PREMIUM_FINAL
BuenFin15Ad02 RESET_BUENFIN_15_AD02_NO_LO_DEJES_PARA_DICIEMBRE_FINAL
BuenFin15CreativeEdit RESET_BUENFIN_15_UGC_CREATIVE_EDIT_FINAL
InvitacionesBuenFin reset-buen-fin_FINAL
LIST
echo ALL_DONE
