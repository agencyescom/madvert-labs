#!/usr/bin/env bash
# Contact sheet (every 0.5 s, timestamped) + frame grabs at key beats for QA.
set -euo pipefail
cd "$(dirname "$0")/.."
in=${1:-out/ad01-preview-540x960.mp4}
mkdir -p out/qa
ffmpeg -v error -y -i "$in" -vf "fps=2,scale=216:-1,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.6,tile=10x4:padding=4:color=black" -frames:v 1 out/qa/contact-sheet.jpg
echo "out/qa/contact-sheet.jpg"
