#!/usr/bin/env bash
# Builds everything in public/ from assets/source/. Re-run after replacing any source file.
# Flow's generated audio on the clips is dropped (not cleared for commercial music use).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/brand
python3 -I scripts/conform-shots.py
python3 -I scripts/mask-logo.py assets/source/brand/cpl-logo-circular.jpg public/brand/cpl-logo.png
python3 -I scripts/cutout-patch.py assets/source/brand/lion-patch-still.webp public/brand/lion-patch.png
python3 -I scripts/make-grain.py public/brand/grain.png
./scripts/build-audio.sh
