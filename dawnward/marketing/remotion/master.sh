#!/bin/sh
# Finish a Remotion render for social: two-pass loudnorm to -14 LUFS / -1 dBTP, video stream copied.
# Usage: sh master.sh in.mp4 out.mp4
set -e
J=$(ffmpeg -nostdin -hide_banner -i "$1" -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- "$1" "$2" $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -nostdin -loglevel error -y -i "$1" -c:v copy -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$3:measured_TP=$4:measured_LRA=$5:measured_thresh=$6:offset=$7:linear=true,aresample=48000" -c:a aac -b:a 256k -movflags +faststart "$2"
