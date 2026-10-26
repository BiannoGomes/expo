#!/bin/sh
# Cut the v4 master into the Phase 12 test variants.
# Hard video cuts (the film's own grammar) with short audio fades at each joint.
set -e
cd "$(dirname "$0")"
M=dawnward-launch-film-v4-60s.mp4

seg () { # $1 start $2 end $3 out
  d=$(python3 -c "print(round($2-$1,3))")
  /usr/bin/ffmpeg -loglevel error -y -ss "$1" -to "$2" -i "$M" \
    -af "afade=t=in:d=0.08,afade=t=out:st=$(python3 -c "print(round($2-$1-0.1,3))"):d=0.1" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$3"
}

mkdir -p variants
seg 0     12.4  variants/_a.mp4
seg 12.4  24.4  variants/_b.mp4
seg 31.0  45.8  variants/_c.mp4
seg 31.0  38.2  variants/_c30.mp4
seg 0     6.8   variants/_p.mp4
seg 56.4  60.0  variants/_sign.mp4

cat > variants/_la.txt <<EOF
file '_a.mp4'
file '_sign.mp4'
EOF
cat > variants/_lb.txt <<EOF
file '_b.mp4'
file '_sign.mp4'
EOF
cat > variants/_lc.txt <<EOF
file '_c.mp4'
file '_sign.mp4'
EOF
cat > variants/_l30.txt <<EOF
file '_p.mp4'
file '_b.mp4'
file '_c30.mp4'
file '_sign.mp4'
EOF
for v in la lb lc l30; do
  case $v in
    la) out=dawnward-hook-recognition-15s.mp4;;
    lb) out=dawnward-hook-product-15s.mp4;;
    lc) out=dawnward-hook-world-18s.mp4;;
    l30) out=dawnward-cutdown-30s.mp4;;
  esac
  /usr/bin/ffmpeg -loglevel error -y -f concat -safe 0 -i variants/_$v.txt \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k \
    -movflags +faststart "variants/$out"
done
rm -f variants/_*.mp4 variants/_*.txt
for f in variants/*.mp4; do printf "%s: " "$f"; /usr/bin/ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"; done
