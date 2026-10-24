#!/bin/sh
# Mux the rendered frames and the score into the final film.
set -e
cd "$(dirname "$0")"
FR="${1:-/tmp/claude-0/film60-frames}"
ffmpeg -loglevel error -y -framerate 30 -i "$FR/f%05d.jpg" -i audio/score.wav \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  dawnward-launch-film-60s.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 dawnward-launch-film-60s.mp4
