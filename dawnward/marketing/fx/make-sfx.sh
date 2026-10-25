#!/bin/sh
# The Dawnward SFX pack: original cinematic sound effects, synthesized
# deterministically. Layer under films at -14 to -22 dB; all rights ours.
set -e
cd "$(dirname "$0")/sfx"

# whoosh: a passing sweep for streak wipes and cuts
ffmpeg -loglevel error -y -f lavfi -t 1.2 -i "anoisesrc=color=pink:seed=11:sample_rate=44100:amplitude=0.8" \
  -af "lowpass=f=2600,highpass=f=180,volume=eval=frame:volume='exp(-pow((t-0.45)/0.22,2))',aformat=channel_layouts=stereo" whoosh.wav
# riser: three seconds of lift into a reveal
ffmpeg -loglevel error -y -f lavfi -t 3 \
  -i "aevalsrc='0.3*sin(2*PI*(70+180*t)*t)*(t/3)+0.2*sin(2*PI*(140+360*t)*t)*(t/3)':s=44100" \
  -af "aformat=channel_layouts=stereo,lowpass=f=1800" riser.wav
ffmpeg -loglevel error -y -f lavfi -t 3 -i "anoisesrc=color=pink:seed=5:sample_rate=44100:amplitude=0.5" \
  -af "highpass=f=400,lowpass=f=3200,volume=eval=frame:volume='0.5*pow(t/3,2.2)',aformat=channel_layouts=stereo" riser-air.wav
# boom: a soft cinematic impact, no trailer slam
ffmpeg -loglevel error -y -f lavfi -t 2.5 \
  -i "aevalsrc='0.9*sin(2*PI*(88*exp(-t*1.4)+36)*t)*exp(-t*2.2)':s=44100" \
  -af "aformat=channel_layouts=stereo,lowpass=f=240" boom.wav
# shimmer: the sound of a sky appearing
ffmpeg -loglevel error -y -f lavfi -t 2.6 \
  -i "aevalsrc='(0.12*sin(2*PI*2093*t)+0.1*sin(2*PI*2637*t+1)+0.08*sin(2*PI*3136*t+2)+0.06*sin(2*PI*3951*t+3))*exp(-t*1.1)*min(1,t*14)':s=44100" \
  -af "aformat=channel_layouts=stereo" shimmer.wav
# star chime: one star is born
ffmpeg -loglevel error -y -f lavfi -t 3 \
  -i "aevalsrc='0.35*sin(2*PI*1318.5*t)*exp(-t*2.1)+0.18*sin(2*PI*1977.5*t)*exp(-t*3)+0.1*sin(2*PI*2637*t)*exp(-t*4)':s=44100" \
  -af "aformat=channel_layouts=stereo" star-chime.wav
# tick: a quiet interface cue
ffmpeg -loglevel error -y -f lavfi -t 0.6 \
  -i "aevalsrc='0.3*sin(2*PI*1900*t)*exp(-t*70)+0.2*sin(2*PI*950*t)*exp(-t*50)':s=44100" \
  -af "aformat=channel_layouts=stereo" tick.wav
# breath: a low swell for scene openings
ffmpeg -loglevel error -y -f lavfi -t 4 -i "anoisesrc=color=brown:seed=3:sample_rate=44100:amplitude=0.7" \
  -af "lowpass=f=300,volume=eval=frame:volume='0.6*exp(-pow((t-2)/1.1,2))',aformat=channel_layouts=stereo" breath.wav
echo "sfx pack ready"
