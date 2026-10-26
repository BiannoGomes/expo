#!/bin/sh
set -e
cd "$(dirname "$0")"
/usr/bin/ffmpeg -loglevel error -y \
  -framerate 30 -i /tmp/claude-0/film-v4-frames/f%05d.jpg \
  -i audio/score4.wav \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart -shortest \
  dawnward-launch-film-v4-60s.mp4
/usr/bin/ffprobe -v error -show_entries format=duration,size -of default=nw=1 dawnward-launch-film-v4-60s.mp4
