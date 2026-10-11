#!/bin/sh
# Expands the studio clips into JPEG frame sequences the renderer reads (run once after clone).
cd "$(dirname "$0")/../assets/video" || exit 1
for v in car talking-head watch; do
  mkdir -p "$v" && ffmpeg -v error -y -i "$v.mp4" -q:v 3 "$v/%03d.jpg"
done
