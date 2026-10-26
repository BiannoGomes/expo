#!/bin/sh
set -e
cd "$(dirname "$0")"
/usr/bin/ffmpeg -nostdin -loglevel error -y \
  -framerate 30 -i /tmp/claude-0/film-v5-frames/f%05d.jpg \
  -i audio/score5.wav \
  -vf "noise=c0s=5:c0f=t+u,vignette=angle=PI/6:mode=forward,format=yuv420p" \
  -c:v libx264 -crf 17 -preset slow -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  dawnward-launch-film-v5-60s.mp4
/usr/bin/ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact dawnward-launch-film-v5-60s.mp4
