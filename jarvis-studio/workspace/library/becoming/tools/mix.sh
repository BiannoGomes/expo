#!/usr/bin/env bash
# Becoming house mix and master (foundation spec decision 10). FFmpeg only.
#
#   tools/mix.sh [--voice voice.wav] [--voice-at SECONDS] [--score-gain DB] [--stems DIR] score.wav out.(wav|m4a)
#
# Score-only path (no --voice):
#   score -> high-pass 140 Hz (the house 150 Hz rule, set just under the landing low D at 146.8 Hz so the sting stays)
#         -> master
# Voice path (--voice):
#   voice -> 48 kHz stereo -> high-pass 80 Hz -> placed at --voice-at -> two-pass gain to -16 LUFS integrated
#   score -> high-pass 140 Hz -> --score-gain (default -4 dB, the bed between lines)
#         -> ducked under speech: 3-band Linkwitz-Riley split at 2 and 5 kHz, each band through sidechaincompress keyed by
#            a speech gate made from the voice (40 ms look-ahead, ~0.3 s hold, ~0.3 s release). The duck depth is set
#            by the compressor's dry floor, so it doesn't depend on how loud he speaks:
#            DUCK_DB (13) on every band plus DIP_DB (2) more on 2-5 kHz, so the score's broadband drop is bounded to
#            13-15 dB whatever its spectrum (inside the house 12-15 dB).
#   voice + ducked score -> master
#   Stems for tools/audio-qa.mjs go to --stems DIR (default <out without extension>.stems/):
#     voice.wav (as mixed), score-pre.wav (score bus before the duck), score-post.wav (after the duck and the dip).
# Master (both paths):
#   high-pass 60 Hz -> gain to -14 LUFS integrated -> true-peak limiter (4x oversampled alimiter, ceiling CEILING_DBTP)
#   -> 48 kHz; re-measured and corrected until within 0.05 LU and under the ceiling (max 6 passes).
#   out.wav: 24-bit PCM, 48 kHz stereo. out.m4a: AAC 256 kb/s, 48 kHz (the mux format); re-checked after encoding.
#
# Environment (defaults): FFMPEG=ffmpeg FFPROBE=ffprobe TARGET_LUFS=-14 CEILING_DBTP=-1.5 (headroom for AAC; must be <= -1)
#   VOICE_LUFS=-16 VOICE_HP=80 SCORE_HP=140 (0 = off) MASTER_HP=60 DUCK_DB=13 DIP_DB=2 KEY_THRESH=0.02 (speech gate,
#   linear, on the -16 LUFS voice) LOOKAHEAD=0.04 DUCK_RELEASE_MS=300
# Exit codes: 0 ok, 1 processing/verification failure, 2 usage error.
set -euo pipefail

FFMPEG=${FFMPEG:-ffmpeg}; FFPROBE=${FFPROBE:-ffprobe}
TARGET_LUFS=${TARGET_LUFS:--14}; CEILING_DBTP=${CEILING_DBTP:--1.5}
VOICE_LUFS=${VOICE_LUFS:--16}; VOICE_HP=${VOICE_HP:-80}; SCORE_HP=${SCORE_HP:-140}; MASTER_HP=${MASTER_HP:-60}
DUCK_DB=${DUCK_DB:-13}; DIP_DB=${DIP_DB:-2}; KEY_THRESH=${KEY_THRESH:-0.02}; LOOKAHEAD=${LOOKAHEAD:-0.04}; DUCK_RELEASE_MS=${DUCK_RELEASE_MS:-300}

usage() { [ -n "${1:-}" ] && echo "mix.sh: $1" >&2; echo "usage: tools/mix.sh [--voice voice.wav] [--voice-at SECONDS] [--score-gain DB] [--stems DIR] score.wav out.(wav|m4a)" >&2; exit 2; }
die() { echo "mix.sh: FAILED: $*" >&2; exit 1; }
say() { echo "mix.sh: $*"; }

VOICE=""; VOICE_AT=0; SCORE_GAIN_DB=-4; STEMS=""; POS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --voice) [ $# -ge 2 ] || usage "--voice needs a file"; VOICE=$2; shift 2 ;;
    --voice-at) [ $# -ge 2 ] || usage "--voice-at needs seconds"; VOICE_AT=$2; shift 2 ;;
    --score-gain) [ $# -ge 2 ] || usage "--score-gain needs dB"; SCORE_GAIN_DB=$2; shift 2 ;;
    --stems) [ $# -ge 2 ] || usage "--stems needs a directory"; STEMS=$2; shift 2 ;;
    -h|--help) usage ;;
    --*) usage "unknown option $1" ;;
    *) POS+=("$1"); shift ;;
  esac
done
[ ${#POS[@]} -eq 2 ] || usage "need score.wav and out file"
SCORE=${POS[0]}; OUT=${POS[1]}
[ -f "$SCORE" ] || usage "no such score $SCORE"
[ -z "$VOICE" ] || [ -f "$VOICE" ] || usage "no such voice $VOICE"
case "$OUT" in *.wav) OUTFMT=wav ;; *.m4a) OUTFMT=m4a ;; *) usage "out must end in .wav or .m4a" ;; esac
isnum() { awk -v x="$1" 'BEGIN{exit !(x ~ /^-?[0-9]+(\.[0-9]+)?$/)}'; }
for v in "$VOICE_AT" "$SCORE_GAIN_DB" "$TARGET_LUFS" "$CEILING_DBTP" "$VOICE_LUFS" "$DUCK_DB" "$DIP_DB"; do isnum "$v" || usage "not a number: $v"; done
awk -v c="$CEILING_DBTP" 'BEGIN{exit !(c <= -1.0)}' || usage "CEILING_DBTP must be <= -1.0"
calc() { awk "BEGIN{printf \"%.6f\", $1}"; }

TMP=$(mktemp -d "${TMPDIR:-/tmp}/becoming-mix.XXXXXX"); trap 'rm -rf "$TMP"' EXIT
ff() { "$FFMPEG" -hide_banner -nostats -loglevel error -y "$@" || die "ffmpeg $*"; }
# integrated loudness (LUFS, 3 decimals) and true peak (dBTP): ffmpeg ebur128, the same meter tools/audio-qa.mjs uses
measure() {
  local m="$TMP/r128.txt" r
  "$FFMPEG" -hide_banner -nostats -loglevel error -i "$1" -vn -map 0:a:0 -af "ebur128=peak=true:metadata=1:framelog=verbose,ametadata=mode=print:file=$m" -f null - || die "can't measure $1"
  r=$(awk -F= '/lavfi\.r128\.I=/{i=$2} /lavfi\.r128\.true_peaks_ch[0-9]+=/{if($2+0>p)p=$2+0} END{if(i=="")exit 1; printf "%.3f %.3f", i, (p>0 ? 20*log(p)/log(10) : -144)}' "$m") || die "no loudness reading for $1"
  echo "$r"
}
probe() { "$FFPROBE" -v error -select_streams a:0 -show_entries "stream=$2" -of default=nw=1:nk=1 "$1" | head -1; }

# 1. score bus at 48 kHz stereo float; its length is the piece's length
ff -i "$SCORE" -vn -map 0:a:0 -af "aresample=48000:resampler=soxr,aformat=sample_fmts=flt:channel_layouts=stereo" -c:a pcm_f32le "$TMP/score48.wav"
N=$(probe "$TMP/score48.wav" duration_ts); [ "${N:-0}" -gt 0 ] || die "score has no audio"
SECS=$(awk -v n="$N" 'BEGIN{printf "%.3f", n/48000}')
SHP=""; [ "$SCORE_HP" != "0" ] && SHP="highpass=f=$SCORE_HP:p=2,"

if [ -z "$VOICE" ]; then
  say "score-only path · $SCORE · $SECS s · score HP ${SCORE_HP} Hz"
  ff -i "$TMP/score48.wav" -af "${SHP}anull" -c:a pcm_f32le "$TMP/premix.wav"
else
  [ -n "$STEMS" ] || STEMS="${OUT%.*}.stems"
  mkdir -p "$STEMS"
  say "voice path · voice $VOICE at ${VOICE_AT} s · score $SCORE · $SECS s · stems $STEMS"
  # 2. voice: 48 kHz stereo, HP 80 Hz, placed, padded/trimmed to the score's length, then two-pass gain to -16 LUFS
  CH=$(probe "$VOICE" channels)
  case "$CH" in 1) UP="pan=stereo|c0=c0|c1=c0," ;; 2) UP="" ;; *) UP="aformat=channel_layouts=stereo," ;; esac
  VMS=$(calc "$VOICE_AT*1000")
  VDUR=$("$FFPROBE" -v error -show_entries format=duration -of default=nw=1:nk=1 "$VOICE")
  awk -v a="$VOICE_AT" -v d="$VDUR" -v s="$SECS" 'BEGIN{exit !(a + d > s + 0.01)}' && echo "mix.sh: warning: voice ends at $(calc "$VOICE_AT+$VDUR") s, after the score ($SECS s); it will be cut" >&2
  ff -i "$VOICE" -vn -map 0:a:0 -af "aresample=48000:resampler=soxr,${UP}aformat=sample_fmts=flt:channel_layouts=stereo,highpass=f=$VOICE_HP:p=2,adelay=${VMS}:all=1,apad=whole_len=$N,atrim=end_sample=$N" -c:a pcm_f32le "$TMP/voice-hp.wav"
  read -r VI VTP < <(measure "$TMP/voice-hp.wav")
  awk -v i="$VI" 'BEGIN{exit !(i > -70)}' || die "voice is silent (I=$VI LUFS)"
  VG=$(calc "$VOICE_LUFS - ($VI)")
  ff -i "$TMP/voice-hp.wav" -af "volume=${VG}dB" -c:a pcm_f32le "$STEMS/voice.wav"
  say "voice: HP ${VOICE_HP} Hz, measured $VI LUFS, gain $VG dB -> $VOICE_LUFS LUFS"
  # 3. score bus before the duck
  ff -i "$TMP/score48.wav" -af "${SHP}volume=${SCORE_GAIN_DB}dB" -c:a pcm_f32le "$STEMS/score-pre.wav"
  # 4. speech key: 1 where |voice| > KEY_THRESH, else 0; moved LOOKAHEAD earlier so the duck is down before the first syllable
  LA=$(awk -v s="$LOOKAHEAD" 'BEGIN{printf "%d", s*48000 + 0.5}')
  ff -i "$STEMS/voice.wav" -af "pan=mono|c0=0.5*c0+0.5*c1,aeval=exprs='gt(abs(val(0)),$KEY_THRESH)':channel_layout=mono,atrim=start_sample=$LA,asetpts=PTS-STARTPTS,apad=whole_len=$N,atrim=end_sample=$N" -c:a pcm_f32le "$TMP/key.wav"
  # 5. duck + dip. The compressor runs far past its threshold on the 0/1 key, so its output is the dry floor (1 - mix).
  MIXB=$(calc "1 - exp(-($DUCK_DB)/20*log(10))"); MIXM=$(calc "1 - exp(-($DUCK_DB + $DIP_DB)/20*log(10))")
  SC="threshold=0.000976563:ratio=20:attack=1:release=$DUCK_RELEASE_MS:knee=1:detection=peak"
  ff -i "$STEMS/score-pre.wav" -i "$TMP/key.wav" -filter_complex \
    "[0:a]acrossover=split=2000 5000:order=4th[lo][mid][hi];[1:a]asplit=3[k0][k1][k2];[lo][k0]sidechaincompress=$SC:mix=$MIXB[dlo];[mid][k1]sidechaincompress=$SC:mix=$MIXM[dmid];[hi][k2]sidechaincompress=$SC:mix=$MIXB[dhi];[dlo][dmid][dhi]amix=inputs=3:normalize=0[o]" \
    -map "[o]" -c:a pcm_f32le "$STEMS/score-post.wav"
  say "score: HP ${SCORE_HP} Hz, bus ${SCORE_GAIN_DB} dB, ducked ${DUCK_DB} dB under speech (+${DIP_DB} dB at 2-5 kHz)"
  ff -i "$STEMS/voice.wav" -i "$STEMS/score-post.wav" -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0:duration=first[o]" -map "[o]" -c:a pcm_f32le "$TMP/premix.wav"
fi

# 6. master: HP 60 Hz, then gain + oversampled limiter, iterated on the measurement
ff -i "$TMP/premix.wav" -af "highpass=f=$MASTER_HP:p=2" -c:a pcm_f32le "$TMP/premaster.wav"
read -r PI PTP < <(measure "$TMP/premaster.wav")
awk -v i="$PI" 'BEGIN{exit !(i > -70)}' || die "mix is silent (I=$PI LUFS)"
G=$(calc "$TARGET_LUFS - ($PI)"); LIM=$(calc "$CEILING_DBTP - 0.3"); pass=0; ok=0
while [ $pass -lt 6 ]; do
  pass=$((pass + 1))
  LIN=$(calc "exp(($LIM)/20*log(10))")
  ff -i "$TMP/premaster.wav" -af "volume=${G}dB,aresample=192000:resampler=soxr,alimiter=limit=$LIN:level=0:attack=2:release=60:latency=1,aresample=48000:resampler=soxr,atrim=end_sample=$N" -c:a pcm_f32le "$TMP/master.wav"
  read -r MI MTP < <(measure "$TMP/master.wav")
  say "master pass $pass: gain $G dB, limiter $LIM dBFS -> $MI LUFS, $MTP dBTP"
  if awk -v i="$MI" -v t="$TARGET_LUFS" -v p="$MTP" -v c="$CEILING_DBTP" 'BEGIN{d=i-t; if(d<0)d=-d; exit !(d <= 0.05 && p <= c)}'; then ok=1; break; fi
  G=$(calc "$G + ($TARGET_LUFS) - ($MI)")
  awk -v p="$MTP" -v c="$CEILING_DBTP" 'BEGIN{exit !(p > c)}' && LIM=$(calc "$LIM - ($MTP - ($CEILING_DBTP)) - 0.05")
done
[ $ok -eq 1 ] || echo "mix.sh: warning: master didn't settle within 0.05 LU in $pass passes; checking the output against the house limits" >&2

mkdir -p "$(dirname "$OUT")"
if [ "$OUTFMT" = wav ]; then ff -i "$TMP/master.wav" -c:a pcm_s24le -ar 48000 "$OUT"
else ff -i "$TMP/master.wav" -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"; fi
read -r FI FTP < <(measure "$OUT")
awk -v i="$FI" -v t="$TARGET_LUFS" -v p="$FTP" 'BEGIN{d=i-t; if(d<0)d=-d; exit !(d <= 0.5 && p <= -1.0)}' || die "output $OUT measures $FI LUFS, $FTP dBTP (needs $TARGET_LUFS ±0.5, <= -1.0 dBTP)"
say "OK $OUT · $FI LUFS · $FTP dBTP · $SECS s · 48 kHz stereo $([ "$OUTFMT" = wav ] && echo 24-bit PCM || echo AAC 256k)"
