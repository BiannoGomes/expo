#!/bin/sh
# Masters, cutdowns (captioned and clean), stems, posters, thumbnails, EDL.
# Run after: npm run flagship && npm run flagship:clean && npm run stems
set -e
cd "$(dirname "$0")/.."
D=deliver; mkdir -p $D/posters $D/thumbs $D/stems
sh master.sh out/raw-60s-captioned.mp4 $D/dawnward-flagship-60s-9x16-captioned.mp4
sh master.sh out/raw-60s-clean.mp4 $D/dawnward-flagship-60s-9x16-clean.mp4

# cut <in> <out> <start end> ...: hard cuts, 120 ms audio fades at each joint, re-normalised
cut () {
  IN=$1; OUT=$2; shift 2; n=0; F=""; L=""
  while [ $# -gt 0 ]; do
    a=$1; b=$2; shift 2
    fo=$(python3 -c "print(round($b-$a-0.12,3))")
    F="$F[0:v]trim=$a:$b,setpts=PTS-STARTPTS[v$n];[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.12,afade=t=out:st=$fo:d=0.12[a$n];"
    L="$L[v$n][a$n]"; n=$((n+1))
  done
  ffmpeg -nostdin -loglevel error -y -i "$IN" -filter_complex "${F}${L}concat=n=$n:v=1:a=1[v][a]" -map "[v]" -map "[a]" \
    -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart /tmp/dw-cut.mp4
  sh master.sh /tmp/dw-cut.mp4 "$OUT"
}
for v in captioned clean; do
  M=$D/dawnward-flagship-60s-9x16-$v.mp4
  cut $M $D/dawnward-30s-9x16-$v.mp4 0.4 6.2 15.12 25.7 33.3 40.95 54.54 58.7
  cut $M $D/dawnward-hook-confession-15s-9x16-$v.mp4 0.4 5.6 15.12 21.4 54.54 58.7
  cut $M $D/dawnward-hook-four-worlds-15s-9x16-$v.mp4 8.0 15.12 21.4 25.7 54.54 58.7
  cut $M $D/dawnward-hook-understood-15s-9x16-$v.mp4 33.3 43.7 54.54 58.7
done

for s in dialogue music fx; do [ -f out/stem-$s.wav ] && cp out/stem-$s.wav $D/stems/; done
for t in 2.2 9.5 12.0 17.6 22.0 27.5 37.0 40.8 51.5 57.0; do
  ffmpeg -nostdin -loglevel error -y -ss $t -i $D/dawnward-flagship-60s-9x16-clean.mp4 -frames:v 1 $D/posters/poster-$t.png
done
for t in 12.0 22.0 37.0; do
  ffmpeg -nostdin -loglevel error -y -ss $t -i $D/dawnward-flagship-60s-9x16-clean.mp4 -frames:v 1 -vf scale=540:960 -q:v 3 $D/thumbs/thumb-$t.jpg
done
node --experimental-strip-types scripts/manifest.mjs
for f in $D/*.mp4; do printf "%s " "$f"; ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"; done
