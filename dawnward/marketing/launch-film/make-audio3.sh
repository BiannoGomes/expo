#!/bin/sh
# v3 mix: composed score under the founder narration and the FX pack.
set -e
cd "$(dirname "$0")"
FX=../fx
ffmpeg -loglevel error -y \
 -i audio/music.wav \
 -i $FX/vo/vo1.mp3 -i $FX/vo/vo2.mp3 -i $FX/vo/vo3.mp3 -i $FX/vo/vo4.mp3 -i $FX/vo/vo5.mp3 \
 -i $FX/vo/vo6.mp3 -i $FX/vo/vo7.mp3 -i $FX/vo/vo8.mp3 -i $FX/vo/vo9.mp3 \
 -i $FX/sfx/whoosh.wav -i $FX/sfx/whoosh.wav -i $FX/sfx/whoosh.wav \
 -i $FX/sfx/star-chime.wav -i $FX/sfx/riser.wav -i $FX/sfx/riser-air.wav \
 -i $FX/sfx/boom.wav -i $FX/sfx/shimmer.wav -i $FX/sfx/tick.wav \
 -i $FX/sfx/breath.wav -i $FX/sfx/breath.wav -i $FX/sfx/star-chime.wav \
 -filter_complex "\
[0]volume=0.52[mus];\
[1]adelay=700|700,volume=1.5[v1];[2]adelay=5200|5200,volume=1.5[v2];\
[3]adelay=13200|13200,volume=1.5[v3];[4]adelay=23900|23900,volume=1.5[v4];\
[5]adelay=28000|28000,volume=1.5[v5];[6]adelay=31600|31600,volume=1.5[v6];\
[7]adelay=38600|38600,volume=1.5[v7];[8]adelay=44000|44000,volume=1.5[v8];\
[9]adelay=56400|56400,volume=1.5[v9];\
[10]adelay=10800|10800,volume=0.45[w1];[11]adelay=23350|23350,volume=0.4[w2];\
[12]adelay=30750|30750,volume=0.45[w3];\
[13]adelay=17800|17800,volume=0.5[ch1];\
[14]adelay=31300|31300,volume=0.5[r1];[15]adelay=31300|31300,volume=0.4[r2];\
[16]adelay=34700|34700,volume=0.6[bm];\
[17]adelay=35300|35300,volume=0.5[sh];\
[18]adelay=41400|41400,volume=0.5[tk];\
[19]adelay=43100|43100,volume=0.55[br1];[20]adelay=50900|50900,volume=0.45[br2];\
[21]adelay=56900|56900,volume=0.4[ch2];\
[mus][v1][v2][v3][v4][v5][v6][v7][v8][v9][w1][w2][w3][ch1][r1][r2][bm][sh][tk][br1][br2][ch2]amix=inputs=22:normalize=0,\
alimiter=limit=0.89:level=disabled,apad=whole_dur=60,atrim=duration=60,\
aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo" \
 audio/score3.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 audio/score3.wav
