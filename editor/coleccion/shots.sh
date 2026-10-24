#!/usr/bin/env bash
# Recorta cada tramo usado en el reel (clip, entrada s, duración s) → editor/video/public/coleccion/<nombre>.mp4 sobre fondo blanco.
set -e
cd "$(dirname "$0")/../.."
M=${1:?ruta al modelo BiRefNet .onnx}
O=editor/video/public/coleccion; mkdir -p $O
while read -r name clip at dur; do
  [ -f "$O/$name.mp4" ] || python3 editor/coleccion/matte.py "$M" "$clip" "$at" "$dur" "$O/$name.mp4"
done <<'LIST'
a-salvia 2515 1.2 0.25
b-rosa 2550 0.3 0.5
c-gris 2573 1.0 0.47
d-salvia-espalda 2517 5.4 0.48
e-rosa 2553 1.0 0.9
f-rosa-medio 2551 2.6 1.38
g-salvia-full 2510 0.4 0.95
h-gris-cerca 2574 0.8 1.25
i-paso 2517 4.1 0.57
j-rosa 2550 1.4 0.62
k-salvia 2515 3.4 0.55
LIST
echo DONE
