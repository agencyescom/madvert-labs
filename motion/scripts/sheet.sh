#!/bin/sh
# Contact sheet of stills: scripts/sheet.sh out.png a.png b.png ...
out=$1; shift
n=$#; cols=2; rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y $(for f in "$@"; do printf -- "-i %s " "$f"; done) -filter_complex "$(i=0; for f in "$@"; do printf "[%d]scale=960:540[s%d];" $i $i; i=$((i+1)); done; i=0; for f in "$@"; do printf "[s%d]" $i; i=$((i+1)); done; printf "xstack=inputs=%d:layout=" $n; i=0; for f in "$@"; do c=$((i % cols)); r=$((i / cols)); [ $i -gt 0 ] && printf "|"; printf "%d_%d" $((c*960)) $((r*540)); i=$((i+1)); done; printf ":fill=black")" "$out"
