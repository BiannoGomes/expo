#!/bin/sh
# The Dawnward launch-film score: original, deterministic, license-free
# synthesis. Near-silence opening, a bloom at first contact (11 s), the
# widest breath at the universe reveal (31-43 s), a quiet resolve.
set -e
cd "$(dirname "$0")"

ENV='min(1,t/2.5)*max(0,min(1,(59.4-t)/5))*(0.38+0.62*min(1,max(0,(t-11)/4)))*(1+0.75*exp(-pow((t-37)/6,2)))'
TONE='(sin(2*PI*55*t)+sin(2*PI*55.4*t)+0.6*sin(2*PI*110.2*t)+0.45*sin(2*PI*164.81*t)+0.3*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*0.08*t))+0.22*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.05*t+2)))'

ffmpeg -loglevel error -y -f lavfi -t 60 \
  -i "aevalsrc='0.045*${ENV}*${TONE}|0.045*${ENV}*(sin(2*PI*55.07*t)+sin(2*PI*55.47*t)+0.6*sin(2*PI*110.27*t)+0.45*sin(2*PI*164.88*t)+0.3*sin(2*PI*220.15*t)*(0.6+0.4*sin(2*PI*0.08*t+1))+0.22*sin(2*PI*329.7*t)*(0.5+0.5*sin(2*PI*0.05*t+3)))':s=44100" \
  -af "lowpass=f=2400" audio/bed.wav

ffmpeg -loglevel error -y -f lavfi -t 60 -i "anoisesrc=color=pink:seed=7:sample_rate=44100:amplitude=0.5" \
  -af "highpass=f=260,lowpass=f=1500,volume=eval=frame:volume='0.5*exp(-pow((t-33.8)/2.6,2))+0.16*exp(-pow((t-52.3)/2.0,2))',aformat=channel_layouts=stereo" \
  audio/swell.wav

note () { # $1 freq  $2 delay_ms  $3 out
  ffmpeg -loglevel error -y -f lavfi -t 3 \
    -i "aevalsrc=0.4*sin(2*PI*$1*t)*exp(-2.8*t)+0.14*sin(2*PI*$1*2*t)*exp(-4.5*t):s=44100" \
    -af "adelay=$2|$2,aformat=channel_layouts=stereo,apad=whole_dur=60" "audio/$3"
}
mkdir -p audio
note 440     900   n1.wav
note 554.37  2850  n2.wav
note 659.25  11450 n3.wav
note 587.33  20450 n4.wav
note 554.37  31950 n5.wav
note 659.25  52600 n6.wav
note 880     56850 n7.wav

tick () { # $1 delay_ms $2 out — a soft interface cue on screen changes
  ffmpeg -loglevel error -y -f lavfi -t 1 \
    -i "aevalsrc=0.16*sin(2*PI*1900*t)*exp(-70*t)+0.1*sin(2*PI*950*t)*exp(-50*t):s=44100" \
    -af "adelay=$1|$1,aformat=channel_layouts=stereo,apad=whole_dur=60" "audio/$2"
}
tick 23650 t1.wav
tick 41400 t2.wav

ffmpeg -loglevel error -y \
  -i audio/bed.wav -i audio/swell.wav \
  -i audio/n1.wav -i audio/n2.wav -i audio/n3.wav -i audio/n4.wav \
  -i audio/n5.wav -i audio/n6.wav -i audio/n7.wav -i audio/t1.wav -i audio/t2.wav \
  -filter_complex "amix=inputs=11:normalize=0,alimiter=limit=0.89,aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo" \
  audio/score.wav
echo "score ready"
