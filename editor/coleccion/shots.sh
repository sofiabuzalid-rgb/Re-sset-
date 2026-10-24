#!/usr/bin/env bash
# Tramos del reel (nombre, clip, entrada s, duración s) → editor/coleccion/matte/<nombre>.{fg,alpha}.mp4 (BiRefNet), luego compose.py.
set -e
cd "$(dirname "$0")/../.."
M=${1:?ruta al modelo BiRefNet .onnx}
O=editor/coleccion/matte; mkdir -p $O
while read -r name clip at dur; do
  [ -f "$O/$name.alpha.mp4" ] || python3 editor/coleccion/matte.py "$M" "$clip" "$at" "$dur" "$O/$name"
done <<'LIST'
a 2515 1.2 0.25
b 2550 0.3 0.47
c 2573 1.0 0.47
d 2517 5.4 0.48
e 2553 1.0 0.88
f 2551 2.6 0.95
g 2573 2.4 0.9
h 2510 0.4 0.9
i 2552 16.4 0.9
j 2572 2.5 0.65
k 2515 3.4 0.47
l 2550 1.4 0.47
m 2573 3.4 0.75
LIST
echo DONE
