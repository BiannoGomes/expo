# Film SFX stem: typing ticks, the step lifting, the seed, the crossing, a chime
# as each world is named, and a tick when the dispute control answers.
# Timings mirror src/film.js. Writes audio/stem-sfx.wav (48 kHz stereo, 60 s).
import math, random, wave, numpy as np
SR, DUR = 48000, 60.0
FX = "../../marketing/fx/sfx/"
def load(name):
    w = wave.open(FX + name); n = w.getnframes(); sr = w.getframerate()
    a = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, w.getnchannels()).astype(np.float32) / 32768
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    x = np.linspace(0, len(a) - 1, int(len(a) * SR / sr))
    return np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], 1)
def pitch(a, f):
    x = np.arange(0, len(a) - 1, f)
    return np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], 1)
out = np.zeros((int(SR * DUR), 2), np.float32)
def put(a, t, g):
    i = int(t * SR); j = min(len(out), i + len(a)); out[i:j] += a[: j - i] * g
tick, breath, shimmer, chime = load("tick.wav"), load("breath.wav"), load("shimmer.wav"), load("star-chime.wav")
# typing: the confession appears as s goes 1.0 -> 1.18 between 1.4 and 4.4 s (easeInOutSine)
conf = "Snapped at my sister again. Don't know why."
sm = lambda v: (lambda k: k * k * (3 - 2 * k))(min(1, max(0, v)))
prev, rnd = 0, random.Random(7)
for f in range(int(1.4 * 30), int(4.5 * 30) + 1):
    t = f / 30; k = min(1, max(0, (t - 1.4) / 3)); s = 1.0 + 0.18 * (-(math.cos(math.pi * k) - 1) / 2)
    n = round(len(conf) * sm((s - 1.0) / 0.18))
    for c in range(prev, n):
        if conf[c] != " ": put(pitch(tick, rnd.uniform(0.9, 1.15)), t + rnd.uniform(0, 0.03), rnd.uniform(0.18, 0.26))
    prev = max(prev, n)
put(breath, 6.9, 0.4)            # the sister step lifts off the glass
put(chime, 9.3, 0.45)            # kept: its seed of light
put(shimmer, 14.0, 0.45)         # through the glass, into the swell
for t, f in [(20.75, 1.0), (21.6, 0.89), (22.7, 1.19), (23.65, 0.84)]:
    put(pitch(chime, f), t, 0.25)  # each world on its spoken name
put(pitch(tick, 0.8), 40.1, 1.0)   # "you can tell it"
peak = np.abs(out).max(); print("sfx peak", round(float(peak), 3))
w = wave.open("audio/stem-sfx.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
