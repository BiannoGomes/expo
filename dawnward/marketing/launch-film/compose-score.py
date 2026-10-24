#!/usr/bin/env python3
"""The Dawnward launch-film score, composed.

A minor, rubato, three voices: a felt-piano motif (sine + soft harmonics,
long exponential decay), a slow pad (detuned partials, gentle attack), and
a quiet sub bass. Structure follows the film exactly: sparse single notes
in the dark (0-11), the motif blooms at first contact (11), fullest during
the universe reveal (31-43), thins for the payoff (43-51), resolves to the
major at the brand moment and ends on one high star of a note.

Entirely deterministic and original: no samples, no third-party material.
"""
import math, struct, wave

SR = 44100
DUR = 60.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N

def add(t0, freq, dur, vel, voice):
    s0 = int(t0 * SR)
    n = int(dur * SR)
    pan = 0.5 + 0.35 * math.sin(freq)  # deterministic stereo placement
    for i in range(n):
        if s0 + i >= N: break
        t = i / SR
        if voice == "piano":
            env = math.exp(-t * 1.9) * min(1.0, t * 220)
            v = (math.sin(2*math.pi*freq*t) + 0.42*math.sin(2*math.pi*freq*2*t)*math.exp(-t*3.2)
                 + 0.18*math.sin(2*math.pi*freq*3*t)*math.exp(-t*5.0))
        elif voice == "pad":
            a = min(1.0, t / 1.6); rel = min(1.0, max(0.0, (dur - t) / 1.8))
            env = a * rel
            v = (math.sin(2*math.pi*freq*t) + math.sin(2*math.pi*(freq*1.003)*t)
                 + 0.5*math.sin(2*math.pi*(freq*0.5)*t)) / 2.5
        else:  # bass
            a = min(1.0, t / 0.4); rel = min(1.0, max(0.0, (dur - t) / 1.2))
            env = a * rel
            v = math.sin(2*math.pi*freq*t) + 0.2*math.sin(2*math.pi*freq*2*t)
        sample = vel * env * v
        L[s0+i] += sample * (1 - pan * 0.5)
        R[s0+i] += sample * (0.5 + pan * 0.5)

def hz(name):
    names = {"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
    n, octv = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + (octv - 4) * 12 - 9) / 12)

P, PAD, BASS = "piano", "pad", "bass"

# ---- I · the dark (0-11): four lone thoughts ----
add(0.9,  hz("A4"), 6, 0.16, P)
add(2.85, hz("E5"), 6, 0.13, P)
add(5.0,  hz("C5"), 6, 0.12, P)
add(7.7,  hz("B4"), 6, 0.12, P)
add(9.6,  hz("E4"), 7, 0.10, P)
add(4.0,  hz("A2"), 8, 0.05, PAD)

# ---- II · the bloom (11-31): the motif over Am F C G ----
chords = [("A2", ["A3","C4","E4"]), ("F2", ["F3","A3","C4"]),
          ("C3", ["C4","E4","G4"]), ("G2", ["G3","B3","D4"])]
motif = [["E5","C5","A4","B4"], ["C5","A4","F4","G4"],
         ["G4","C5","E5","D5"], ["D5","B4","G4","A4"]]
for k in range(4):
    t0 = 11.0 + k * 5.0
    root, tones = chords[k]
    add(t0, hz(root), 5.4, 0.10, BASS)
    for tone in tones:
        add(t0, hz(tone), 5.6, 0.045, PAD)
    for j, nn in enumerate(motif[k]):
        add(t0 + 0.3 + j * 1.15, hz(nn), 4.5, 0.11 - j * 0.012, P)

# ---- III · the reveal (31-43): fullest, rising ----
reveal = [("A2", ["A3","C4","E4","G4"]), ("F2", ["F3","A3","C4","E4"]),
          ("C3", ["C4","E4","G4","B4"])]
for k in range(3):
    t0 = 31.0 + k * 4.0
    root, tones = reveal[k]
    add(t0, hz(root), 4.4, 0.12, BASS)
    for tone in tones:
        add(t0, hz(tone), 4.6, 0.05, PAD)
    arp = ["A4","C5","E5","A5","E5","C5"] if k == 0 else (
          ["F4","A4","C5","F5","C5","A4"] if k == 1 else ["G4","C5","E5","G5","E5","C5"])
    for j, nn in enumerate(arp):
        add(t0 + j * 0.62, hz(nn), 3.4, 0.085, P)
# the arrival chord (41.3, the world opens)
add(41.3, hz("A2"), 6, 0.11, BASS)
for tone in ["A3","E4","A4","C5"]:
    add(41.3, hz(tone), 6, 0.05, PAD)
add(41.35, hz("E5"), 5, 0.12, P)

# ---- IV · the payoff (43-51): thin and warm ----
add(44.2, hz("C5"), 6, 0.10, P)
add(45.9, hz("A4"), 6, 0.085, P)
add(47.6, hz("E5"), 6, 0.10, P)
add(49.3, hz("B4"), 6, 0.08, P)
add(43.5, hz("F2"), 7.4, 0.07, BASS)
for tone in ["F3","A3","C4"]:
    add(43.5, hz(tone), 7.4, 0.035, PAD)

# ---- V · the resolve (51-60): A major, one last star ----
add(51.2, hz("A2"), 8.4, 0.10, BASS)
for tone in ["A3","C#4","E4","A4"]:
    add(51.4, hz(tone), 8.0, 0.05, PAD)
add(52.6, hz("E5"),  7, 0.11, P)
add(54.4, hz("C#5"), 7, 0.09, P)
add(56.85, hz("A5"), 5.5, 0.12, P)
add(58.3, hz("E6"),  3.4, 0.05, P)

# ---- master: gentle fade edges, soft clip ----
with wave.open("audio/music.wav", "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        t = i / SR
        g = min(1.0, t / 0.8) * min(1.0, max(0.0, (59.6 - t) / 1.6)) if t > 55 or t < 1 else 1.0
        for ch in (L, R):
            s = ch[i] * 0.9 * g
            s = math.tanh(s * 1.4) / 1.4
            frames += struct.pack("<h", int(max(-1, min(1, s)) * 32767))
    w.writeframes(frames)
print("composed: audio/music.wav")
