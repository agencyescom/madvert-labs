#!/usr/bin/env bash
# Usage: build-audio.sh ad01|ad02. Synthesize the ad's temp score, then loudness-normalise to -14 LUFS / -1 dBTP
# (two-pass loudnorm, linear mode) for Reels/TikTok/Shorts delivery.
set -euo pipefail
cd "$(dirname "$0")/.."
ad=${1:?usage: build-audio.sh ad01|ad02}
mkdir -p public/audio
raw=public/audio/$ad-score-raw.wav
python3 -I scripts/sound-design-$ad.py "$raw"
stats=$(ffmpeg -hide_banner -i "$raw" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null /dev/null 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$raw" -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a pcm_s24le public/audio/$ad-mix.wav
rm "$raw"
for st in vo bed; do [ -f "public/audio/$ad-score-raw-$st.wav" ] && mv "public/audio/$ad-score-raw-$st.wav" "public/audio/$ad-stem-$st.wav"; done
ffmpeg -hide_banner -i public/audio/$ad-mix.wav -af ebur128=peak=true -f null /dev/null 2>&1 | grep -E '^\s+(I:|Peak:)'
