#!/bin/sh
# Dawnward film v4 mix: score + founder VO + FX, no whooshes.
set -e
cd "$(dirname "$0")"
V=../fx/vo4
S=../fx/sfx
/usr/bin/ffmpeg -loglevel error -y \
  -i audio/music4.wav \
  -i audio/roomtone.wav \
  -i audio/notif.wav \
  -i $V/v1.mp3 -i $V/v2.mp3 -i $V/v3.mp3 -i $V/v4.mp3 -i $V/v5.mp3 \
  -i $V/v6.mp3 -i $V/v7.mp3 -i $V/v8.mp3 -i $V/v9.mp3 -i $V/v10.mp3 \
  -i $S/star-chime.wav -i $S/star-chime.wav -i $S/star-chime.wav \
  -i $S/tick.wav -i $S/tick.wav -i $S/tick.wav -i $S/tick.wav \
  -i $S/shimmer.wav -i $S/boom.wav \
  -i $S/breath.wav -i $S/breath.wav -i $S/riser-air.wav \
  -filter_complex "\
[0]volume=0.95[mus];\
[1]volume=1.0[rt];\
[2]volume=1.0[ntf];\
[3]adelay=1000|1000,volume=1.5[v1];\
[4]adelay=4400|4400,volume=1.5[v2];\
[5]adelay=13600|13600,volume=1.5[v3];\
[6]adelay=17400|17400,volume=1.5[v4];\
[7]adelay=25200|25200,volume=1.5[v5];\
[8]adelay=31300|31300,volume=1.5[v6];\
[9]adelay=36200|36200,volume=1.5[v7];\
[10]adelay=43400|43400,volume=1.5[v8];\
[11]adelay=47200|47200,volume=1.5[v9];\
[12]adelay=57000|57000,volume=1.5[v10];\
[13]adelay=21600|21600,volume=0.6[ch1];\
[14]adelay=27700|27700,volume=0.45[ch2];\
[15]adelay=57400|57400,volume=0.5[ch3];\
[16]adelay=24700|24700,volume=0.5[tk1];\
[17]adelay=24940|24940,volume=0.45[tk2];\
[18]adelay=25180|25180,volume=0.45[tk3];\
[19]adelay=41300|41300,volume=0.5[tk4];\
[20]adelay=34900|34900,volume=0.6[sh];\
[21]adelay=34900|34900,volume=0.35[bm];\
[22]adelay=31000|31000,volume=0.5[br1];\
[23]adelay=49000|49000,volume=0.5[br2];\
[24]adelay=32200|32200,volume=0.25[rz];\
[mus][rt][ntf][v1][v2][v3][v4][v5][v6][v7][v8][v9][v10][ch1][ch2][ch3][tk1][tk2][tk3][tk4][sh][bm][br1][br2][rz]amix=inputs=25:normalize=0,\
alimiter=limit=0.89:level=disabled,apad=whole_dur=60,atrim=duration=60,aresample=44100" \
  -ac 2 audio/score4.wav
/usr/bin/ffprobe -v error -show_entries format=duration -of csv=p=0 audio/score4.wav
