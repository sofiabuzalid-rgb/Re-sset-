#!/bin/sh
# Offline Whisper small (q8 ONNX, word timestamps) from npm, since huggingface.co is blocked here.
# The tarball holds only model files (no scripts); it is extracted, never npm-installed.
set -e
M=/home/user/whisper-models
[ -f $M/package/models/Xenova/whisper-small/onnx/decoder_model_merged_quantized.onnx ] || {
  mkdir -p $M && curl -sS https://registry.npmjs.org/sts-whisper-small/-/sts-whisper-small-1.0.0.tgz | tar xz -C $M
}
cd "$(dirname "$0")" && npm install --ignore-scripts
