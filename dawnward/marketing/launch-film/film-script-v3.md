# Dawnward launch film v3: the complete script and how it was made

A handover document. Everything in the current 60 second film is described here: the method, the exact timeline, every spoken line, every on-screen word, every sound cue, and the honest weaknesses. Use this as raw material for the upgrade.

## 1. How the film is physically made

The film is not edited in a video editor. It is a single animated web page rendered frame by frame.

1. **The stage**: one HTML file (`film.html`), 1080 x 1920, holding eight scenes stacked on top of each other. Each scene contains either real app screens (the actual Dawnward interface, animating live: cards cascading, text typing itself, a caret blinking, EQ bars breathing) or cinematic AI footage layered behind text.
2. **The clock**: an anime.js timeline drives every movement. It is deterministic: the page exposes a function that jumps the whole film to any millisecond, so frame 900 always looks exactly the same.
3. **The camera**: a headless Chromium browser steps through the timeline 1800 times (30 fps x 60 s), seeks the background videos to the matching moment, waits for the frame to paint, and screenshots each step as a JPEG.
4. **The assembly**: ffmpeg stitches the 1800 frames into H.264 video and muxes the finished audio mix under it.
5. **The audio**: built separately as one 60 second WAV. A composed instrumental bed (A minor resolving to A major), nine voiceover lines in the founder's own cloned voice (ElevenLabs engine via Higgsfield), and a synthesized FX pack (whooshes, risers, a soft boom, shimmer, star chimes, breath swells, an interface tick), all mixed with ffmpeg at fixed millisecond offsets, limited to peak at -1 dB.
6. **The footage**: three 6 second cinematic clips generated with Seedance 2.5 (9:16, 1080p): a dark ocean at first light, a hand releasing a gold point of light into the night, a drift through slate-blue nebula toward warm light.
7. **The screens**: the Universe tab and the Mind world are live captures of the real running app. Today, Debrief and the Personal Model are pixel-faithful rebuilds of the shipped screens, animated by hand so their interface elements can move independently.

## 2. The brand rules the film obeys (keep these in any upgrade)

- Colors: near-black ground `#0B0E12`, warm ivory ink `#ECE9E2`, gold `#C9A96A` for what matters, cool starlight `#C7D5EE`, slate nebula `#4A5A7A` for atmosphere, dawn `#E8A87C` only in skies.
- Type: Cormorant Garamond for feeling, Albert Sans for interface, IBM Plex Mono for small labels.
- Never: streaks, badges, scores, percentages, progress meters, confetti, guilt, red urgency, fake store listings or prices or download claims. The end card CTA is deliberately a placeholder.
- The voice is a caring person, never a system describing itself.

## 3. The full timeline, second by second

### Scene I · The interruption (0.0 to 4.3)
- **Picture**: near-black. A single gold spark ignites at 0.35 and breathes.
- **Voice (0.7)**: "You don't need another routine. You need a direction."
- **On screen**: the same two sentences arrive word by word (each word fades up 26 px with a blur that resolves, 700 ms, 130 ms stagger).
- **Sound**: near silence, a sub drone fading in under the voice.

### Scene II · First light (4.1 to 10.7)
- **Picture**: the ocean-at-first-light footage, slow settle from 1.1 scale to 1.
- **Voice (5.2)**: "Meet Dawnward. It learns you, from your own words."
- **On screen**: "Meet Dawnward." then "It learns you, from your own words."
- **Sound**: drone holds low. A whoosh at 10.8 cuts to Scene III.

### Scene III · The morning (10.9 to 23.3)
- **Picture**: a phone rises from darkness with a gold rim light, showing the Today screen. Its four cards cascade in (44 px rise, 650 ms, 240 ms stagger). One task is marked kept: a gold edge draws up its side and a small star is born at its corner (scale 0.5 to 1.4 to 1 with glow) while the task text dims.
- **Voice (13.2)**: "Each morning, a few quiet moves that matter."
- **On screen**: "A few quiet moves that matter."
- **Sound**: a warm bloom under the phone reveal, a star chime at 17.8, a whoosh at 23.35 into Scene IV.

### Scene IV · The evening (23.4 to 30.9)
- **Picture**: the same phone slides to the evening debrief. A typed reflection appears character by character with a gold caret ("Today I sent the chapter. Scared, but I did it."), then the listening state breathes: five EQ bars stepping in slow sine waves.
- **Voice (23.9)**: "Each evening, you talk. It listens."
- **Voice (28.0)**: "And what you live, becomes a star."
- **On screen**: "You talk. It listens." then "What you live becomes a star."
- **Sound**: soft interface cues, a whoosh at 30.75 into Scene V.

### Scene V · The universe reveal (30.9 to 42.9)
- **Picture**: the real Universe tab inside the phone (four planets on a nebula sky: Body a warm earth, Mind a ringed blue giant, Soul a small luminous moon, Future a distant amber world). At 34.6 the phone recedes and the cosmos takes the whole frame. At 38.2 the camera travels toward Mind (3.4 s ease-in-out dolly, scale 2.2). At 41.3 it arrives inside the real Mind world screen: "The world of clarity."
- **Voice (31.6)**: "Your life becomes a universe. Body. Mind. Soul. Future."
- **Voice (38.6)**: "Travel your worlds. Watch them grow, as you do."
- **On screen**: "Your life becomes a universe." then "Watch your worlds grow, as you do."
- **Sound**: the widest moment. A riser pair from 31.3, a soft boom at 34.7 as the cosmos lands, shimmer at 35.3, an interface tick at 41.4 on arrival.

### Scene VI · The emotional payoff (43.1 to 50.6)
- **Picture**: the hand-releasing-a-star footage. At 46.0 a dark veil falls over it and at 46.3 the Personal Model screen rises through: "What I understand about you", evidence-backed observations in warm italic serif, slow 4.6 s drift upward.
- **Voice (44.0)**: "It already holds the picture of who you're becoming."
- **On screen**: "The picture of who you're becoming."
- **Sound**: a low breath swell at 43.1, everything else drops away.

### Scene VII · The brand moment (50.9 to 55.6)
- **Picture**: the nebula-flight footage drifting toward warm light. The wordmark "Dawnward" arrives in large Cormorant.
- **Voice**: none. The one deliberate silence.
- **Sound**: a breath swell at 50.9, the score resolving to its major key.

### Scene VIII · The invitation (55.9 to 60.0)
- **Picture**: end card on black. Small gold mono "Dawnward", then "Become who you are becoming." in serif, then the placeholder line "The sky is being prepared". Fade to black at 59.3.
- **Voice (56.4)**: "Dawnward. Become who you are becoming."
- **Sound**: a star chime at 56.9, the score resolving to silence by 59.4.

## 4. The nine voice lines in order (the complete VO script)

1. "You don't need another routine. You need a direction."
2. "Meet Dawnward. It learns you, from your own words."
3. "Each morning, a few quiet moves that matter."
4. "Each evening, you talk. It listens."
5. "And what you live, becomes a star."
6. "Your life becomes a universe. Body. Mind. Soul. Future."
7. "Travel your worlds. Watch them grow, as you do."
8. "It already holds the picture of who you're becoming."
9. "Dawnward. Become who you are becoming."

## 5. Honest weaknesses of v3 (where the upgrade should strike)

- **Flat dimensionality**: everything lives on one plane. The phone translates and scales but never tilts in perspective; there is no parallax between foreground, phone and sky inside the app scenes; no depth-of-field, no light wrap, no reflections. The cosmos travel is a 2D zoom pretending to be a dolly.
- **Pacing**: the film is wall-to-wall narration from 0.7 to 47 s. The only breathing room is Scene VII. Great ads alternate density and silence; this one holds one even tempo, and the cuts land on the schedule rather than on the music.
- **Music**: the bed is composed in-house with a synthesized piano and pad. It is clean but has no human performance, no dynamics that the edit can cut against, no low-end power at the reveal. The plan was an external ElevenLabs Music track; that swap is one command once the domain is allowed.
- **Wording**: the captions mostly restate the voice a second later, which doubles instead of layering. Several lines describe features ("you talk, it listens") rather than cutting at a feeling.
- **The reveal arrives too easily**: the universe appears at 31 s without resistance before it. There is no tension, so the payoff spends less than it could.
- **The end has no destination**: the placeholder CTA is correct legally but gives the viewer nowhere to put the feeling.

## 6. What an upgraded version can reuse directly

All of these exist in the repository and are reusable as-is:
- The deterministic render pipeline (any new HTML timeline renders the same way).
- Nine cloned-voice lines (`marketing/fx/vo/`) and the voice itself for new lines (Higgsfield element "Bianno Voice").
- The FX pack (`marketing/fx/sfx/`) and its mix recipes.
- Three Seedance clips (`marketing/fx/broll/`), and the account can generate more in the same style.
- The seven celestial artworks and the real app screens.
- The motion preset library (word blur-in, card cascade, star birth, dolly travel, panel arrival, EQ breath) in `marketing/fx/README.md`.
