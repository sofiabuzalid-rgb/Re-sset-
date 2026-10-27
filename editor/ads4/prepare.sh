#!/usr/bin/env bash
# Recreates editor/video/public/ads4 (media is not committed). Usage: prepare.sh <artlist_recording.mp4> <afro_house.mp3>
set -e
cd "$(dirname "$0")/../video"
mkdir -p public/ads4
for n in 2839 2840 2842 2846 2848 2851 2852 2857 2861 2862 2863 2865 2866 2869; do cp -f public/outlet/IMG_$n.mp4 public/ads4/; done
for n in 2037 2038 2039 2040; do cp -f public/promo/IMG_$n.mp4 public/ads4/; done
cp -f "$2" public/ads4/music_afrohouse.mp3
ffmpeg -v error -y -i "$1" -vn -ac 2 -ar 48000 public/ads4/music_artlist.wav
