#!/usr/bin/env bash
# Render every campaign ad on the minimal text system as <original name>_FINAL_MINIMAL.mp4 and check each file.
set -euo pipefail
cd "$(dirname "$0")/.."
B=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
while read -r comp name; do
  out="out/${name}_FINAL_MINIMAL.mp4"
  npx remotion render "$comp" "$out" --browser-executable="$B" --log=error
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
  res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of csv=p=0 "$out")
  aud=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$out")
  lufs=$(ffmpeg -i "$out" -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep -o "I: *-\?[0-9.]* LUFS" | head -1)
  black=$(ffmpeg -i "$out" -vf blackdetect=d=0.1 -an -f null - 2>&1 | grep -c black_start || true)
  ffmpeg -v error -i "$out" -f null - && ok=decodes || ok=DECODE_ERROR
  echo "RENDERED $out | $dur s | $res | $aud | $lufs | black=$black | $ok"
done <<'LIST'
BuenFin15CreativeEdit RESET_BUENFIN_15_UGC_CREATIVE_EDIT
BuenFin15Ad02 RESET_BUENFIN_15_AD02_NO_LO_DEJES_PARA_DICIEMBRE
FootballOutletAd01 RESET_FOOTBALL_OUTLET_AD01
FootballOutletAd02 RESET_FOOTBALL_OUTLET_AD02
InvitacionesBuenFin reset-buen-fin
ChristmasAtHome reset-christmas-at-home
NavidadEnFamilia reset-navidad-en-familia
PijamaFavorita reset-pijama-favorita
PijamaDeViaje reset-pijama-de-viaje
HotbookBazar reset-hotbook-bazar
LIST
echo ALL_DONE
