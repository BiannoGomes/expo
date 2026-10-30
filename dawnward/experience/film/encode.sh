#!/bin/sh
# Master, 30 s cut, three hooks (15 to 16.4 s) and posters from the rendered frames.
set -e
cd "$(dirname "$0")"
FR=/tmp/claude-0/film-v6-frames
mkdir -p out posters
/usr/bin/ffmpeg -nostdin -loglevel error -y -framerate 30 -i $FR/f%05d.jpg -i audio/score.wav \
  -vf "noise=c0s=4:c0f=t+u,vignette=angle=PI/6:mode=forward,format=yuv420p" \
  -c:v libx264 -crf 17 -preset slow -profile:v high -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  out/dawnward-living-universe-60s.mp4

# cut <out> <start end> [<start end> ...]: hard video cuts, 60 ms audio fades at each joint
cut () {
  OUT=$1; shift; n=0; F=""; L=""
  while [ $# -gt 0 ]; do
    a=$1; b=$2; shift 2
    d=$(python3 -c "print(round($b-$a,3))"); fo=$(python3 -c "print(round($b-$a-0.06,3))")
    F="$F[0:v]trim=$a:$b,setpts=PTS-STARTPTS[v$n];[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.06,afade=t=out:st=$fo:d=0.06[a$n];"
    L="$L[v$n][a$n]"; n=$((n+1))
  done
  /usr/bin/ffmpeg -nostdin -loglevel error -y -i out/dawnward-living-universe-60s.mp4 -filter_complex "${F}${L}concat=n=$n:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "out/$OUT"
}
rm -f out/dawnward-hook-*.mp4
cut dawnward-living-universe-30s.mp4 0 14.6 33.6 43.4 54.3 60
cut dawnward-hook-honest-minute.mp4 0 9.4 54.54 60
cut dawnward-hook-through-the-glass.mp4 14.6 25.5 54.54 60
cut dawnward-hook-understood.mp4 33.6 43.2 54.54 60

rm -f posters/*.jpg
for t in 3.2 11.5 16.6 27.5 38.5 56; do
  /usr/bin/ffmpeg -nostdin -loglevel error -y -ss $t -i out/dawnward-living-universe-60s.mp4 -frames:v 1 -q:v 2 posters/poster-$t.jpg
done
for f in out/*.mp4; do printf "%s " "$f"; /usr/bin/ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"; done
