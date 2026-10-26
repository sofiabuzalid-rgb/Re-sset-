#!/usr/bin/env bash
# PICK YOUR COLOR — recorte BiRefNet de las tomas de modelo (clip, entrada s, duración s) → editor/pyc/matte/<nombre>.{fg,alpha}.mp4
set -e
cd "$(dirname "$0")/../.."
M=${1:?ruta al modelo BiRefNet .onnx}
O=editor/pyc/matte; mkdir -p $O
while read -r name clip at dur; do
  [ -f "$O/$name.alpha.mp4" ] || python3 editor/coleccion/matte.py "$M" "$clip" "$at" "$dur" "$O/$name"
done <<'LIST'
blush-front 2550 0.0 1.95
sage-front 2515 0.4 2.2
grey-front 2573 0.2 2.6
blush-arms 2551 2.0 2.0
sage-front2 2513 0.4 1.8
grey-cord 2572 0.0 1.6
LIST
echo DONE
