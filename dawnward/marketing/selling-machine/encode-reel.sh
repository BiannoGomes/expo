#!/bin/sh
# usage: sh encode-reel.sh <id>   (after node render-reel.mjs <id>)
set -e
cd "$(dirname "$0")"
ID=$1
N=$(ls /tmp/claude-0/reel-$ID | wc -l)
DUR=$(python3 -c "print(round($N/30,3))")
mkdir -p out
/usr/bin/ffmpeg -nostdin -loglevel error -y \
  -framerate 30 -i /tmp/claude-0/reel-$ID/f%05d.jpg \
  -ss 12.6 -t "$DUR" -i ../launch-film/audio/suno/emotional-build.wav \
  -filter_complex "[1:a]afade=t=in:d=0.25,afade=t=out:st=$(python3 -c "print(round($DUR-1.2,3))"):d=1.2,loudnorm=I=-14:TP=-1.5:LRA=9[a];[0:v]noise=c0s=4:c0f=t+u,format=yuv420p[v]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 \
  -movflags +faststart -shortest out/dawnward-complaint-$ID.mp4
/usr/bin/ffprobe -v error -show_entries format=duration,size -of compact out/dawnward-complaint-$ID.mp4
