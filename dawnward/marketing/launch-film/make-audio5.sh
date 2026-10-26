#!/bin/sh
# Film v5 mix: owner's Suno track + narrator (Naomi), music ducked under voice, -14 LUFS.
set -e
cd "$(dirname "$0")"
V=../fx/vo5
/usr/bin/ffmpeg -nostdin -loglevel error -y \
  -i audio/suno/emotional-build.wav \
  -i $V/n1.mp3 -i $V/n2.mp3 -i $V/n3.mp3 -i $V/n4t.wav -i $V/n5.mp3 -i $V/n6t.wav -i $V/n7.mp3 \
  -filter_complex "\
[0]aresample=48000,apad=whole_dur=60,atrim=duration=60[mus];\
[1]aresample=48000,adelay=350|350[v1];\
[2]aresample=48000,adelay=3950|3950[v2];\
[3]aresample=48000,adelay=6600|6600[v3];\
[4]aresample=48000,adelay=9550|9550[v4];\
[5]aresample=48000,volume=1.8,adelay=47600|47600[v5];\
[6]aresample=48000,adelay=51850|51850[v6];\
[7]aresample=48000,adelay=55200|55200[v7];\
[v1][v2][v3][v4][v5][v6][v7]amix=inputs=7:normalize=0,pan=stereo|c0=c0|c1=c0,\
highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=2.5,\
acompressor=threshold=0.12:ratio=3:attack=8:release=120:makeup=1.6,\
apad=whole_dur=60,atrim=duration=60,asplit=2[vo][key];\
[mus][key]sidechaincompress=threshold=0.04:ratio=2.5:attack=40:release=500:makeup=1[duck];\
[duck][vo]amix=inputs=2:normalize=0:weights=1 0.62[mix]" \
  -map "[mix]" -ac 2 -ar 48000 audio/mix5-pre.wav
# two-pass loudness normalisation to -14 LUFS, -1 dBTP
J=$(/usr/bin/ffmpeg -nostdin -hide_banner -i audio/mix5-pre.wav -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
set -- $mi
/usr/bin/ffmpeg -nostdin -loglevel error -y -i audio/mix5-pre.wav \
  -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true,aresample=48000" \
  -ar 48000 audio/score5.wav
/usr/bin/ffmpeg -nostdin -hide_banner -i audio/score5.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:|LRA:)" | tail -3
