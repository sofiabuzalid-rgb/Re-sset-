#!/usr/bin/env bash
# Render + QC de un anuncio de la campaña.  Uso: editor/campana/render.sh <CompositionId> <archivo_salida.mp4>
set -euo pipefail
cd "$(dirname "$0")/../video"
ID=$1; OUT=out/$2; TMP=out/_$ID.mp4
npx remotion render src/index.ts "$ID" "$TMP" --codec=h264 --crf=15 --audio-codec=aac --audio-bitrate=256k \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --concurrency=4 --log=error
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$TMP" | grep -q .; then AUD=(-af "alimiter=limit=0.84,loudnorm=I=-14:TP=-1.5" -c:a aac -b:a 256k -ar 48000); else AUD=(-an); fi
ffmpeg -v error -y -i "$TMP" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  "${AUD[@]}" -movflags +faststart "$OUT"
rm "$TMP"
# silent compositions (no voice/music yet): add a silent AAC track so every platform accepts the file
if ! ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT" | grep -q .; then
  ffmpeg -v error -y -i "$OUT" -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT.tmp.mp4" && mv "$OUT.tmp.mp4" "$OUT"
fi
echo "== QC $OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact=p=0 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' '
ffmpeg -v error -i "$OUT" -f null - && echo "decodifica completo: OK"
B=$(ffmpeg -hide_banner -i "$OUT" -vf "blackdetect=d=0.05:pix_th=0.06" -an -f null - 2>&1 | grep -c black_start || true); echo "tramos negros: $B"
# inteligibilidad en celular: banda telefónica 300–3400 Hz + Whisper
ffmpeg -v error -y -i "$OUT" -vn -ac 1 -ar 16000 -af "highpass=f=300,lowpass=f=3400" /tmp/claude-0/-home-user-Re-sset-/1b75fe26-72bc-59d2-bf4f-563ba787541e/scratchpad/qc_phone.wav
echo -n "Whisper (simulación celular): "; node ../whisper/transcribe.mjs /tmp/claude-0/-home-user-Re-sset-/1b75fe26-72bc-59d2-bf4f-563ba787541e/scratchpad/qc_phone.wav /tmp/claude-0/-home-user-Re-sset-/1b75fe26-72bc-59d2-bf4f-563ba787541e/scratchpad/qc_phone.json es 2>/dev/null | head -1
