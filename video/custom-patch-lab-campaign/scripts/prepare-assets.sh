#!/usr/bin/env bash
# Builds public/ from assets/source/. Usage: ./scripts/prepare-assets.sh [ad01|ad02 ...]
# (no argument = shared brand assets + every ad). Flow's generated audio on the
# clips is never used (not cleared for commercial use).
set -euo pipefail
cd "$(dirname "$0")/.."
ads=("$@"); [ ${#ads[@]} -eq 0 ] && ads=(ad01 ad02)
mkdir -p public/brand
python3 -I scripts/mask-logo.py assets/source/shared/brand/cpl-logo-circular.jpg public/brand/cpl-logo.png
python3 -I scripts/make-grain.py public/brand/grain.png
for ad in "${ads[@]}"; do
  python3 -I scripts/conform-shots.py "$ad"
  case $ad in
    ad01) python3 -I scripts/cutout-patch.py assets/source/ad01/lion-patch-still.webp public/brand/lion-patch.png ;;
  esac
  ./scripts/build-audio.sh "$ad"
done
