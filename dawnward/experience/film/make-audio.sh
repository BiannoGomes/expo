#!/bin/sh
# Film mix: score + narrator (Naomi) + a quiet effects stem, -14 LUFS.
# The score sits higher under the opening (no voice-in-silence), is ducked
# under the voice, and dialogue peaks are limited to -1.5 dBFS.
# Writes the master mix plus dialogue, music and effects stems.
set -e
cd "$(dirname "$0")"
M=../../marketing/launch-film/audio/suno/emotional-build.wav
V=../../marketing/fx/vo5
mkdir -p audio
python3.13 make-sfx.py
# voice: [input, delay ms] in story order (see src/film.js CAPS)
VO="[1]aresample=48000,adelay=500|500[v1];[2]aresample=48000,adelay=4100|4100[v2];[3]aresample=48000,adelay=6750|6750[v3];[4]aresample=48000,volume=1.8,adelay=11250|11250[v4];[5]aresample=48000,adelay=15400|15400[v5];[6]aresample=48000,volume=1.25,adelay=18400|18400[v6];[7]aresample=48000,adelay=27300|27300[v7];[8]aresample=48000,volume=1.6,adelay=33600|33600[v8];[9]aresample=48000,adelay=38600|38600[v9];[10]aresample=48000,volume=1.45,adelay=42200|42200[v10];[11]aresample=48000,adelay=45200|45200[v11];[12]aresample=48000,adelay=52300|52300[v12];[v1][v2][v3][v4][v5][v6][v7][v8][v9][v10][v11][v12]amix=inputs=12:normalize=0,pan=stereo|c0=c0|c1=c0,highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=2.5,acompressor=threshold=0.12:ratio=3:attack=8:release=120:makeup=1.6,alimiter=limit=0.84:attack=3:release=60:level=disabled,apad=whole_dur=60,atrim=duration=60"
IN="-i $M -i $V/n1.mp3 -i $V/n2.mp3 -i $V/nE.mp3 -i $V/n5.mp3 -i $V/nA.mp3 -i $V/nB.mp3 -i $V/nF.mp3 -i $V/nG.mp3 -i $V/nD.mp3 -i $V/nC.mp3 -i $V/n6t.wav -i $V/n7.mp3 -i audio/stem-sfx.wav"
# the score's quiet first half is lifted (8 dB under the opening, 4 dB to 29 s, eased under the longest lines), and its dip before the end card too
BED="volume='if(lt(t,10.6),2.5,if(lt(t,11.2),2.5-0.9*(t-10.6)/0.6,if(lt(t,18.2),1.6,if(lt(t,25.6),1.15,if(lt(t,29),1.6,if(lt(t,31),1.6-0.6*(t-29)/2,if(between(t,47,55),1+0.6*min(1,(t-47)/1.5)*min(1,(55-t)/0.5),1)))))))':eval=frame"
/usr/bin/ffmpeg -nostdin -loglevel error -y $IN -filter_complex "[0]aresample=48000,$BED,apad=whole_dur=60,atrim=duration=60[mus];$VO,asplit=3[vo][key][vst];[mus][key]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=450:makeup=1,asplit=2[duck][mst];[13]aresample=48000,apad=whole_dur=60,atrim=duration=60,asplit=2[fx][fst];[duck][vo][fx]amix=inputs=3:normalize=0:weights=1 0.9 1.8[mix]" \
  -map "[mix]" -ac 2 -ar 48000 audio/mix-pre.wav -map "[vst]" -ac 2 -ar 48000 audio/stem-dialogue.wav -map "[mst]" -ac 2 -ar 48000 audio/stem-music.wav -map "[fst]" -ac 2 -ar 48000 audio/stem-fx-placed.wav
J=$(/usr/bin/ffmpeg -nostdin -hide_banner -i audio/mix-pre.wav -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
/usr/bin/ffmpeg -nostdin -loglevel error -y -i audio/mix-pre.wav -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true,aresample=48000" -ar 48000 audio/score.wav
rm -f audio/mix-pre.wav audio/stem-fx-placed.wav
/usr/bin/ffmpeg -nostdin -hide_banner -i audio/score.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
