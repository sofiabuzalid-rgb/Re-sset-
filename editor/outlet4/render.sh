#!/usr/bin/env bash
# Render + QC de un anuncio OUTLET 25% OFF.  Uso: editor/outlet4/render.sh <CompositionId> <archivo_salida.mp4>
# Usa public-lean/ (hardlinks de outlet4, fonts y brand) para que el bundle no copie todo public/ (5+ GB).
set -euo pipefail
cd "$(dirname "$0")/../video"
ID=$1
OUT=out/$2
TMP=out/_$ID.mp4
mkdir -p public-lean out
for d in outlet4 fonts brand; do rm -rf -- "public-lean/$d"; cp -al "public/$d" "public-lean/$d"; done
npx remotion render src/index.ts "$ID" "$TMP" --public-dir=public-lean --codec=h264 --crf=15 --audio-codec=aac --audio-bitrate=256k \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --concurrency=4 --log=error
ffmpeg -v error -y -i "$TMP" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "alimiter=limit=0.84,loudnorm=I=-14:TP=-1.5" -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
rm "$TMP"
echo "== QC $OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact=p=0 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' '
ffmpeg -v error -i "$OUT" -f null - && echo "decodifica completo: OK"
echo "tramos negros: $(ffmpeg -hide_banner -i "$OUT" -vf "blackdetect=d=0.05:pix_th=0.06" -an -f null - 2>&1 | grep -c black_start || true)"
echo "congelados >0.6 s: $(ffmpeg -hide_banner -i "$OUT" -vf "freezedetect=n=0.002:d=0.6" -an -f null - 2>&1 | grep -o "freeze_start: [0-9.]*" | tr '\n' ' ' || true)"
echo "silencios >0.5 s: $(ffmpeg -hide_banner -i "$OUT" -af "silencedetect=n=-45dB:d=0.5" -vn -f null - 2>&1 | grep -o "silence_start: [0-9.]*" | tr '\n' ' ' || true)"
