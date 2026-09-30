#!/usr/bin/env python3
"""compose-score: an ORIGINAL score composed in code, to picture. Owned outright: no licence, no credits,
no training-data questions. Felt piano, warm pad, a low organic pulse and sea ambience, in a synthetic
room reverb. The cue sheet (JSON) sets tempo, key, chords and sections, so the music lifts exactly where
the edit needs it. Needs numpy + scipy.

usage: python compose-score.py cue.json out.wav
cue.json:
{ "duration": 52.0, "bpm": 64, "sr": 48000, "seed": 7,
  "chords": [ {"t": 0.0, "notes": ["B2","F#3","D4","A4"]}, ... ],          # sounding from t until the next chord
  "sections": [ {"t": 0, "piano": "sparse", "pad": 0.0, "pulse": 0.0, "sea": 0.5}, ... ],  # levels 0..1, ramped
  "accents": [ {"t": 43.0, "type": "lift"} ],                              # a soft swell that lands on t
  "fade_out": 4.0 }
"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

cue = json.load(open(sys.argv[1])); out = sys.argv[2]
SR = cue.get("sr", 48000); DUR = cue["duration"]; N = int(SR * DUR)
rng = np.random.default_rng(cue.get("seed", 7))
BEAT = 60.0 / cue.get("bpm", 64)
t_all = np.arange(N) / SR

NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
def hz(n):
    name, octave = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)

def lp(x, fc, order=2): return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)

def env_level(key):
    """Piecewise-linear level for a section key (ramped over 1.5 s at each boundary)."""
    secs = cue["sections"]; lvl = np.zeros(N)
    pts = [(s["t"], s.get(key, 0.0)) for s in secs]
    for i, (t0, v) in enumerate(pts):
        t1 = pts[i + 1][0] if i + 1 < len(pts) else DUR
        a, b = int(t0 * SR), int(t1 * SR); lvl[a:b] = v
    k = int(1.5 * SR); ker = np.ones(k) / k
    return np.convolve(lvl, ker, mode="same")

def chord_at(t):
    cur = cue["chords"][0]["notes"]
    for c in cue["chords"]:
        if c["t"] <= t + 1e-6: cur = c["notes"]
    return cur

# ---- felt piano ---------------------------------------------------------------------------------------
def piano_note(f0, vel, length=6.0):
    n = int(length * SR); t = np.arange(n) / SR; y = np.zeros(n)
    B = 0.00035
    for k in range(1, 10):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > SR / 2 - 1000: break
        amp = (1.0 / k ** 1.7) * np.exp(-k * (0.35 - 0.2 * vel))
        tau = (3.2 if f0 < 300 else 2.2) / (1 + 0.55 * (k - 1))
        y += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 2 * np.pi)) * np.exp(-t / tau)
    att = np.minimum(1, t / 0.012); y *= att                      # soft felt attack
    thump = lp(rng.standard_normal(int(0.03 * SR)), 900) * np.exp(-np.arange(int(0.03 * SR)) / (0.006 * SR)) * 0.08
    y[: len(thump)] += thump
    y = lp(y, 1800 + 2600 * vel)                                   # velocity = brightness
    return y * vel

piano = np.zeros((N, 2))
def place(sig, t0, pan=0.0, bus=None):
    bus = piano if bus is None else bus
    a = int(t0 * SR); b = min(N, a + len(sig))
    if a >= N: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[a:b, 0] += sig[: b - a] * l; bus[a:b, 1] += sig[: b - a] * r

# Piano pattern follows the section's density: "sparse" (one note per bar), "arp" (gentle 8ths),
# "single" (a lone melodic line), "none".
secs = cue["sections"]
def section_at(t):
    cur = secs[0]
    for s in secs:
        if s["t"] <= t + 1e-6: cur = s
    return cur

t = cue.get("first_note", 0.2); step = BEAT / 2; i = 0
while t < DUR - cue.get("fade_out", 4.0) * 0.6:
    s = section_at(t); mode = s.get("piano", "sparse"); notes = chord_at(t)
    tones = sorted(notes, key=hz)
    if mode == "sparse" and i % 8 == 0:
        place(piano_note(hz(tones[-1]), 0.55), t, pan=0.15); place(piano_note(hz(tones[0]) , 0.35), t + 0.02, pan=-0.2)
    elif mode == "arp":
        seq = [tones[0], tones[1], tones[2], tones[-1], tones[2], tones[1], tones[-1], tones[2]]
        nt = seq[i % 8]; vel = 0.42 + 0.12 * (i % 4 == 0) + rng.uniform(-0.04, 0.04)
        place(piano_note(hz(nt), vel), t + rng.uniform(-0.008, 0.012), pan=(hz(nt) - 300) / 900)
    elif mode == "single" and i % 4 == 0:
        place(piano_note(hz(tones[-1]), 0.5), t, pan=0.1)
    t += step; i += 1
for a in cue.get("accents", []):
    if a["type"] == "resolve":                                      # final chord, struck softly
        for k, nt in enumerate(sorted(chord_at(a["t"]), key=hz)):
            place(piano_note(hz(nt), 0.5 - 0.05 * k, 8.0), a["t"] + 0.03 * k, pan=-0.3 + 0.2 * k)

# ---- warm pad ------------------------------------------------------------------------------------------
pad = np.zeros((N, 2))
chords = cue["chords"]
for ci, c in enumerate(chords):
    t0 = c["t"]; t1 = chords[ci + 1]["t"] if ci + 1 < len(chords) else DUR
    a, b = int(t0 * SR), min(N, int((t1 + 1.2) * SR)); n = b - a; tt = np.arange(n) / SR
    seg = np.zeros((n, 2))
    for nt in c["notes"]:
        f = hz(nt); f = f * 2 if f < 110 else (f / 2 if f > 500 else f)   # keep the pad out of the mud
        for side, det in ((0, -0.004), (1, 0.004)):
            y = np.zeros(n)
            for h in range(1, 14):                                      # band-limited saw
                if f * h > 5000: break
                y += np.sin(2 * np.pi * f * (1 + det) * h * tt + rng.uniform(0, 6.28)) / h
            seg[:, side] += y
    fade = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (t1 + 1.2 - t0 - tt)) / 1.2)
    pad[a:b] += seg * fade[:, None] * 0.05
pad[:, 0] = hp(lp(pad[:, 0], 1100, 4), 120); pad[:, 1] = hp(lp(pad[:, 1], 1100, 4), 120)
pad *= env_level("pad")[:, None]

# ---- low organic pulse (a heartbeat, felt more than heard) ---------------------------------------------
pulse = np.zeros(N); k_len = int(0.35 * SR); kt = np.arange(k_len) / SR
kick = np.sin(2 * np.pi * (48 + 30 * np.exp(-kt / 0.04)) * kt) * np.exp(-kt / 0.12)
tb = 0.0
while tb < DUR:
    for off, g in ((0.0, 1.0), (0.28, 0.55)):                           # lub-dub
        a = int((tb + off) * SR)
        if a + k_len < N: pulse[a:a + k_len] += kick * g
    tb += BEAT * 2
pulse = lp(pulse, 180) * env_level("pulse") * 0.35
pulse = np.stack([pulse, pulse], 1)

# ---- sea ambience ------------------------------------------------------------------------------------
def brown(n):
    x = np.cumsum(rng.standard_normal(n)); x = hp(x, 40); return x / (np.abs(x).max() + 1e-9)
swell = 0.55 + 0.45 * (0.6 * np.sin(2 * np.pi * 0.071 * t_all) + 0.4 * np.sin(2 * np.pi * 0.113 * t_all + 1.3))
sea = np.stack([hp(lp(brown(N), 2200), 150) * swell, hp(lp(brown(N), 2200), 150) * np.roll(swell, int(0.8 * SR))], 1) * 0.07
sea *= env_level("sea")[:, None]

# ---- lift accents: a slow swell of the pad's upper octave into the landing point --------------------------
lift = np.zeros((N, 2))
for a in cue.get("accents", []):
    if a["type"] != "lift": continue
    t1 = a["t"]; t0 = t1 - a.get("len", 3.0); aa, bb = int(t0 * SR), min(N, int((t1 + 2.5) * SR)); tt = np.arange(bb - aa) / SR
    notes = chord_at(t1 + 0.01); y = np.zeros(bb - aa)
    for nt in notes:
        f = hz(nt) * 2
        y += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    shape = np.where(tt < (t1 - t0), (tt / (t1 - t0)) ** 2.2, np.exp(-(tt - (t1 - t0)) / 1.4))
    y = lp(y * shape, 2500) * 0.018
    lift[aa:bb, 0] += y; lift[aa:bb, 1] += np.roll(y, 240)

# ---- room: synthetic stereo reverb ---------------------------------------------------------------------
def ir(rt60=3.2, pre=0.025):
    n = int(rt60 * SR); t = np.arange(n) / SR
    e = np.exp(-6.91 * t / rt60)
    l = lp(rng.standard_normal(n), 5200) * e; r = lp(rng.standard_normal(n), 5200) * e
    z = np.zeros(int(pre * SR)); return np.concatenate([z, l]), np.concatenate([z, r])
irl, irr = ir()
def verb(x, wet):
    wl = fftconvolve(x[:, 0], irl)[:N]; wr = fftconvolve(x[:, 1], irr)[:N]
    w = np.stack([wl, wr], 1); w *= np.abs(x).max() / (np.abs(w).max() + 1e-9)
    return x * (1 - wet) + w * wet

mix = verb(piano, 0.42) * 1.0 + verb(pad, 0.35) + verb(lift, 0.5) + pulse + sea
mix[:, 0] = hp(mix[:, 0], 40); mix[:, 1] = hp(mix[:, 1], 40)          # phones can't play sub; don't waste loudness on it
fo = cue.get("fade_out", 4.0); fade = np.minimum(1, np.maximum(0, (DUR - t_all) / fo)); mix *= fade[:, None]
fi = np.minimum(1, t_all / 0.05); mix *= fi[:, None]
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.6) / np.tanh(1.6)       # gentle glue, no pumping
mix *= 0.89
import wave
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"compose-score → {out} · {DUR:.1f}s · {cue.get('bpm', 64)} bpm · {len(cue['chords'])} chords · {len(secs)} sections")
