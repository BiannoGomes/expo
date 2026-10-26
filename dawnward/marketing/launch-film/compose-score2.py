#!/usr/bin/env python3.13
"""Dawnward film v4 score. Stereo, motif-driven, mapped to the locked edit.

The dawn motif: E rising to A, a fourth. First heard alone at 10.8 as a single
unanswered note, completed in full at the brand resolve, and stamped as the
three-second sign-off at the end (the campaign's byte-identical audio signature).

Sections (seconds):
  0.0-10.8   silence (the problem owns the mix)
  10.8-17.4  lone notes: E4 (10.8), A2 (13.6)
  17.4-21.6  the music enters under "listens": Am pad, sparse piano
  21.6-24.4  the star: high piano pair, held pad
  24.4-31.0  movement: soft pulse, Am F C G, motif fragments
  31.0-34.55 suspension: unresolved sus chord, swell, then a 350 ms hole
  34.9       the landing: A major bloom with sub
  36.5-43.3  spacious: slow pads, high motif
  43.3-45.8  warmer pulse (the wide sky with labels)
  45.8-52.0  intimate: solo piano thinning
  52.0-56.4  resolve: A major, the motif completed
  56.4-59.4  sign-off: E5 then A5 over warm pad, decay to silence
"""
import numpy as np, wave, struct

SR = 44100
DUR = 60.0
N = int(SR * DUR)
t_all = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)

def hz(name):
    names = {"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
    pitch, octv = name[:-1], int(name[-1])
    semis = names[pitch] + (octv - 4) * 12 - 9  # A4 = 440
    return 440.0 * 2 ** (semis / 12)

def env(n, a, d, sustain=0.0, s_len=0, r=0.4):
    """attack, decay-to-sustain, hold, release (all seconds)."""
    e = np.zeros(n)
    ai, di, si, ri = int(a*SR), int(d*SR), int(s_len*SR), int(r*SR)
    i = 0
    for seg_len, start, stop in ((ai, 0, 1), (di, 1, sustain), (si, sustain, sustain), (ri, sustain, 0)):
        seg_len = min(seg_len, n - i)
        if seg_len <= 0: continue
        e[i:i+seg_len] = np.linspace(start, stop, seg_len, endpoint=False)
        i += seg_len
    return e[:n]

def place(sig, t0, pan=0.0):
    i0 = int(t0 * SR)
    i1 = min(i0 + len(sig), N)
    if i0 >= N: return
    seg = sig[: i1 - i0]
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    L[i0:i1] += seg * gl
    R[i0:i1] += seg * gr

def piano(note, t0, dur, vel=0.5, pan=0.0):
    """Felt piano: detuned unison pair, inharmonic partials, soft hammer."""
    f = hz(note)
    n = int(dur * SR)
    t = np.arange(n) / SR
    for det, p in ((0.9995, pan - 0.12), (1.0006, pan + 0.12)):
        sig = np.zeros(n)
        for k, w in ((1, 1.0), (2, 0.38), (3, 0.14), (4, 0.05)):
            fk = f * det * k * (1 + 0.0004 * k * k)
            sig += w * np.sin(2 * np.pi * fk * t) * np.exp(-t * (2.2 + 0.9 * k))
        hammer = 0.05 * np.random.default_rng(int(f)).standard_normal(n) * np.exp(-t * 90)
        sig = (sig + hammer) * env(n, 0.008, dur * 0.72, 0.0, 0, 0.2) * vel
        place(sig, t0, p)

def pad(notes, t0, dur, vel=0.18, a=1.4, r=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    for j, note in enumerate(notes):
        f = hz(note)
        sig = np.zeros(n)
        for k, w in ((1, 1.0), (2, 0.22), (3, 0.09)):
            sig += w * np.sin(2 * np.pi * f * k * t + j)
        sig += 0.35 * np.sin(2 * np.pi * f * 1.004 * t + 1.7)
        sig *= env(n, a, 0.3, 0.85, max(dur - a - 0.3 - r, 0), r) * vel
        place(sig, t0, (-0.4, 0.4, -0.2, 0.2, 0.0)[j % 5])

def sub(note, t0, dur, vel=0.3, a=0.6, r=1.4):
    f = hz(note); n = int(dur * SR); t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * f * t) * env(n, a, 0.2, 0.9, max(dur - a - 0.2 - r, 0), r) * vel
    place(sig, t0, 0.0)

def air(t0, dur, vel=0.05, a=None, r=1.0):
    n = int(dur * SR)
    rng = np.random.default_rng(7)
    x = rng.standard_normal(n)
    y = np.zeros(n); alpha = 0.02
    acc = 0.0
    for i in range(n):
        acc += alpha * (x[i] - acc); y[i] = acc
    y /= np.max(np.abs(y)) + 1e-9
    a = a if a is not None else dur * 0.8
    sig = y * env(n, a, 0.1, 0.9, max(dur - a - 0.1 - r, 0), r) * vel
    place(sig, t0, 0.0)

# ---- 10.8-17.4 lone notes
piano("E4", 10.8, 5.0, 0.42)
piano("A2", 13.6, 5.0, 0.34)

# ---- 17.4 the music enters
pad(["A2", "E3", "A3", "C4"], 17.4, 7.4, 0.13, a=1.8)
piano("A3", 17.9, 3.4, 0.3, -0.2)
piano("C4", 19.1, 3.2, 0.26, 0.2)
piano("E4", 20.2, 3.4, 0.3, 0.0)

# ---- 21.6 the star
piano("E5", 21.65, 3.0, 0.30, 0.25)
piano("A5", 22.05, 3.4, 0.24, -0.25)
pad(["A2", "E3"], 21.6, 3.2, 0.10, a=0.8)

# ---- 24.4-31.0 movement
chords = [(24.4, ["A2","E3","C4"]), (26.0, ["F2","C3","A3"]), (27.6, ["C3","G3","E4"]), (29.2, ["G2","D3","B3"])]
for tt, cc in chords:
    pad(cc, tt, 2.1, 0.11, a=0.5, r=0.9)
for i in range(13):
    tt = 24.6 + i * 0.5
    if tt < 30.8:
        piano("A2" if i % 2 == 0 else "A3", tt, 0.9, 0.11, -0.1 if i % 2 else 0.1)
piano("E4", 26.1, 1.8, 0.2); piano("A4", 26.6, 2.2, 0.2)
piano("E4", 28.5, 1.8, 0.18); piano("A4", 29.0, 2.2, 0.18)
sub("A1", 24.4, 6.6, 0.16, a=1.2)

# ---- 31.0 suspension (unresolved, swells, then a hole)
n_sus = int(3.55 * SR); t_sus = np.arange(n_sus) / SR
swell = np.linspace(0.35, 1.0, n_sus) ** 1.6
for note, w, p in (("E2",0.5,0.0),("D4",0.32,-0.3),("G4",0.3,0.3),("A4",0.26,0.0)):
    f = hz(note)
    sig = (np.sin(2*np.pi*f*t_sus) + 0.3*np.sin(2*np.pi*f*2.003*t_sus)) * swell * 0.14 * w
    fade = np.ones(n_sus); fo = int(0.12*SR); fade[-fo:] = np.linspace(1,0,fo)
    place(sig * fade, 31.0, p)
air(31.0, 3.55, 0.06, a=3.0, r=0.3)
# the hole: 34.55-34.9 is intentionally empty

# ---- 34.9 the landing (A major bloom)
pad(["A2","E3","A3","C#4","E4"], 34.9, 6.5, 0.17, a=0.25, r=2.8)
sub("A1", 34.9, 5.5, 0.3, a=0.08, r=2.2)
piano("A3", 34.9, 4.0, 0.34); piano("C#5", 35.1, 4.0, 0.2, 0.3); piano("E5", 35.3, 4.5, 0.18, -0.3)

# ---- 36.5-43.3 spacious
pad(["A2","E3","B3","E4"], 38.0, 5.6, 0.10, a=2.0)
piano("E5", 37.8, 3.0, 0.2, 0.2); piano("A5", 38.6, 3.6, 0.17, -0.2)
piano("E5", 41.0, 2.6, 0.16, -0.15); piano("A5", 41.8, 3.0, 0.14, 0.15)

# ---- 43.3-45.8 the wide sky, warmer
pad(["D3","A3","F#4"], 43.3, 2.8, 0.12, a=0.6, r=1.0)
piano("D4", 43.5, 1.6, 0.16); piano("F#4", 44.2, 2.0, 0.16, 0.2); piano("A4", 44.9, 2.2, 0.15, -0.2)

# ---- 45.8-52.0 intimate
pad(["A2","E3"], 45.8, 6.4, 0.09, a=1.6, r=2.0)
piano("A3", 46.6, 3.4, 0.24)
piano("C#4", 48.6, 3.2, 0.2, 0.2)
piano("E4", 50.4, 2.8, 0.17, -0.2)

# ---- 52.0 resolve
pad(["A2","E3","A3","C#4"], 52.0, 5.0, 0.14, a=1.0, r=2.4)
piano("A3", 52.4, 3.4, 0.26)
piano("E4", 53.6, 1.6, 0.26, 0.1); piano("A4", 54.4, 2.6, 0.28, -0.1)  # the motif, completed
sub("A1", 52.0, 4.6, 0.18, a=0.8, r=1.8)

# ---- 56.4-59.4 the sign-off (the fixed audio signature)
pad(["A2","E3","C#4"], 56.4, 3.0, 0.1, a=0.5, r=1.6)
piano("E5", 56.6, 1.3, 0.24, 0.15)
piano("A5", 57.3, 2.0, 0.26, -0.15)

# master: gentle soft clip and fade tail
mix = np.stack([L, R])
mix = np.tanh(mix * 1.15) * 0.82
fade_n = int(0.6 * SR)
mix[:, -fade_n:] *= np.linspace(1, 0, fade_n)

with wave.open("audio/music4.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    inter = np.empty(N * 2, dtype=np.int16)
    inter[0::2] = np.clip(mix[0] * 32767, -32767, 32767).astype(np.int16)
    inter[1::2] = np.clip(mix[1] * 32767, -32767, 32767).astype(np.int16)
    w.writeframes(inter.tobytes())
print("music4.wav written")

# ---- the notification cluster (0-4.2, cuts dead)
n = int(4.4 * SR)
sig = np.zeros(n)
times = [0.35, 0.95, 1.5, 1.95, 2.35, 2.7, 3.0, 3.26, 3.5, 3.7, 3.87, 4.02, 4.14]
rng = np.random.default_rng(3)
for i, tt in enumerate(times):
    i0 = int(tt * SR); bl = int(0.09 * SR)
    tb = np.arange(bl) / SR
    f1, f2 = 1568 * (1 + 0.02 * rng.standard_normal()), 2093 * (1 + 0.02 * rng.standard_normal())
    blip = (np.sin(2*np.pi*f1*tb) + 0.6*np.sin(2*np.pi*f2*tb)) * np.exp(-tb*60) * (0.22 + 0.012*i)
    sig[i0:i0+bl] += blip
    if i % 3 == 0:
        bz = int(0.12 * SR); tz = np.arange(bz) / SR
        buzz = np.sign(np.sin(2*np.pi*170*tz)) * np.exp(-tz*22) * 0.05
        j0 = i0 + int(0.02*SR)
        sig[j0:j0+bz] += buzz
sig[int(4.2*SR):] = 0.0
st = np.stack([sig, sig * 0.92])
with wave.open("audio/notif.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    inter = np.empty(n * 2, dtype=np.int16)
    inter[0::2] = np.clip(st[0] * 32767, -32767, 32767).astype(np.int16)
    inter[1::2] = np.clip(st[1] * 32767, -32767, 32767).astype(np.int16)
    w.writeframes(inter.tobytes())
print("notif.wav written")

# ---- room tone (whole film, very low)
n = N
x = np.random.default_rng(11).standard_normal(n)
y = np.zeros(n); acc = 0.0
for i in range(n):
    acc += 0.004 * (x[i] - acc); y[i] = acc
y /= np.max(np.abs(y)) + 1e-9
y *= 0.0045
st = np.stack([y, np.roll(y, 220)])
with wave.open("audio/roomtone.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    inter = np.empty(n * 2, dtype=np.int16)
    inter[0::2] = np.clip(st[0] * 32767, -32767, 32767).astype(np.int16)
    inter[1::2] = np.clip(st[1] * 32767, -32767, 32767).astype(np.int16)
    w.writeframes(inter.tobytes())
print("roomtone.wav written")
