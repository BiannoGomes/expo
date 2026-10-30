#!/bin/sh
# Film v6 mix: score + narrator (Naomi), music ducked under the voice, -14 LUFS.
# Writes the master mix plus dialogue and music stems.
set -e
cd "$(dirname "$0")"
M=../../marketing/launch-film/audio/suno/emotional-build.wav
V=../../marketing/fx/vo5
mkdir -p audio
VO="[1]aresample=48000,adelay=350|350[v1];[2]aresample=48000,adelay=3950|3950[v2];[3]aresample=48000,adelay=6600|6600[v3];[4]aresample=48000,volume=1.8,adelay=9750|9750[v5];[5]aresample=48000,adelay=46300|46300[v4];[6]aresample=48000,adelay=51300|51300[v6];[7]aresample=48000,adelay=55200|55200[v7];[v1][v2][v3][v5][v4][v6][v7]amix=inputs=7:normalize=0,pan=stereo|c0=c0|c1=c0,highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=2.5,acompressor=threshold=0.12:ratio=3:attack=8:release=120:makeup=1.6,apad=whole_dur=60,atrim=duration=60"
IN="-i $M -i $V/n1.mp3 -i $V/n2.mp3 -i $V/n3.mp3 -i $V/n5.mp3 -i $V/n4t.wav -i $V/n6t.wav -i $V/n7.mp3"
/usr/bin/ffmpeg -nostdin -loglevel error -y $IN -filter_complex "[0]aresample=48000,apad=whole_dur=60,atrim=duration=60[mus];$VO,asplit=3[vo][key][vst];[mus][key]sidechaincompress=threshold=0.04:ratio=2.5:attack=40:release=500:makeup=1,asplit=2[duck][mst];[duck][vo]amix=inputs=2:normalize=0:weights=1 0.62[mix]" \
  -map "[mix]" -ac 2 -ar 48000 audio/mix-pre.wav -map "[vst]" -ac 2 -ar 48000 audio/stem-dialogue.wav -map "[mst]" -ac 2 -ar 48000 audio/stem-music.wav
J=$(/usr/bin/ffmpeg -nostdin -hide_banner -i audio/mix-pre.wav -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
/usr/bin/ffmpeg -nostdin -loglevel error -y -i audio/mix-pre.wav -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true,aresample=48000" -ar 48000 audio/score.wav
rm -f audio/mix-pre.wav
/usr/bin/ffmpeg -nostdin -hide_banner -i audio/score.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
