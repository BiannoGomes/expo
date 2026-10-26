# Dawnward v4: Sound Language

Timing, frequency and dynamics lessons from the reference library, and a concrete recommendation for Dawnward's sonic identity. Sources and verification status are in reference-library.md; where a reference's sound could not be verified at frame level, the lesson below is drawn from the verified strategy or from genre convention and is marked as such.

---

## 1. Lessons from the references

### 1.1 Silence is a dynamic, not an absence
- Source: Calm's silent election-night spot (verified strategy: 30 seconds of bought silence inside the loudest broadcast of the year).
- Lesson: silence only reads as calm against surrounding noise. In a feed or an ad break, the quietest asset wins attention by contrast. Inside a film, a sudden drop to near-silence is the strongest emphasis available, stronger than any riser.
- Application: reserve Dawnward's deepest silence for the moment the product appears. The reveal should be the quietest two seconds of the film.

### 1.2 Escalation needs a spine, and the spine can be a voice
- Source: Nike "You Can't Stop Us" (verified: the edit is locked to a steadily building voiceover; the montage escalates to a collective payoff).
- Lesson: when a film builds, something continuous must carry the build across cuts, or the escalation reads as random intensity. Nike uses speech cadence; the pictures serve it.
- Application: Dawnward's build should be carried by one warm voice or one evolving musical line, never by cut speed. The caring-person voice is Dawnward's equivalent of Nike's oration, at a fraction of the volume.

### 1.3 One repeated track gesture creates campaign recognition
- Source: Google "Best Phones Forever" (verified: fixed character voices across every variant make each spot identifiable before any logo); Apple "Get Ready" (a single licensed track carries continuity across disparate images).
- Lesson: a fixed sonic element, repeated identically across assets, becomes the brand's audio logo whether or not one is designed. Decide what that element is on purpose.
- Application: design a two to three second Dawnward sign-off sound and keep it byte-identical across the hero film, cutdowns and future work.

### 1.4 Teach with a calm voice, not a presenter voice
- Source: Apple Vision Pro "Guided Tour" (per Brian Solis's written analysis: deliberately calm, simple instructions that manage expectation).
- Lesson: an unhurried, low-pressure voice converts a new product's strangeness into anticipated competence. Pace sentences slower than feels natural in the edit suite; the viewer's living room is slower than the timeline.
- Application: voiceover delivery direction for Dawnward: intimate mic distance, low volume, no sell, pauses long enough to feel like listening.

### 1.5 Ordinary-space transformation is an ambience crossfade
- Source: Calm "Sleep Stories: The Orient Express" (unreviewed at frame level; the verified device is a bedroom gradually becoming a train scene, which as a sound problem is a bed-to-bed crossfade).
- Lesson: transformation scenes live or die on the ambience layer: room tone must crossfade into the imagined world's tone so gradually that the viewer cannot name the moment it changed.
- Application: record true room tone on every live-action setup; build the Dawnward canvas its own "room tone" (a near-subliminal low bed) so entering the UI world is an acoustic place change, not a mute.

### 1.6 Sound-off is the default on social
- Source: genre observation from the Calm and feed-advertising coverage (Marketing Brew's grouping of low-stimulation ads), not a frame-level finding.
- Lesson: most feed impressions play silent. A film whose meaning depends on audio fails at its most common exposure; a film whose stillness and typography carry meaning silently gets the sound as a bonus for the engaged viewer.
- Application: every cutdown must work fully muted: Cormorant captions set with care (not burned-in subtitle style), meaning legible from picture alone. Sound becomes the reward layer, which suits a brand whose promise is quiet anyway.

---

## 2. Frequency and dynamics guidance

- Low end: one warm, soft low-frequency bed (felt more than heard) can give the near-black canvas physical weight. Keep it clean and sparse; no cinematic sub-drops, no braams. Loud low end is the sound of every other launch film.
- Midrange: reserve the midrange for the voice. Keep music arrangement thin (two to three elements) whenever the voice speaks.
- High end: gold accents in picture can pair with a single high, delicate sonic detail (a soft struck or bowed tone, a breath of air). Use as scarcely as the colour: one glint, one sound.
- Risers: avoid conventional risers. If anticipation is needed before the reveal, use subtraction instead: remove elements one by one until near-silence, then let the reveal restore a single warm tone. This is the sound-design inverse of the standard trailer build, and it matches the brand.
- Sound bridges: pre-lap the next scene's ambience or the voice under the end of the current shot so transitions feel inevitable. Especially useful into the reveal: let the UI world's tone arrive a second before its image (see creative-opportunities.md).
- Dynamics overall: the film's loudness profile should be an exhale, not a ramp: gentle presence, a quiet middle, the softest point at the reveal, a warm (not loud) resolution. Master conservatively; competing on loudness contradicts the positioning.
- Motif: one melodic cell of two to four notes, stated once early (possibly as a near-subliminal hum) and resolved fully at the sign-off. Repetition across assets turns it into the audio identity (lesson 1.3).

---

## 3. Concrete recommendation: the Dawnward sonic identity

One sentence: Dawnward sounds like first light in a quiet room: a felt low warmth, a single human voice close and unhurried, one small gold detail of sound, and silence used as the emphasis.

Specification:

1. Palette: soft piano or plucked/bowed single notes with long decays, a warm low pad two octaves down, genuine room ambience, one delicate high "glint" element. No drums in the hero film; at most a slow felt pulse in energetic cutdowns. No synth arps, no corporate ukulele, no epic percussion.
2. Motif: a rising two or three note figure (the "dawn" gesture) in a warm key, stated incompletely early in the film and completed at the sign-off. The completed form, exactly as mixed, is the fixed campaign sign-off sound (lesson 1.3).
3. Voice: one caring, unhurried voice, recorded close, directed to speak to one person. The voice never announces; it notices.
4. Dynamics map for the hero film: near-silence open (held black), ambience plus low warmth under the human opening, subtraction (not a riser) approaching the reveal, the film's quietest moment on the reveal, motif completion and warm settle at the end.
5. Mute-first rule: picture lock must pass a full-mute review before sound design begins.

### Tooling and licensing path

- Prototyping: ElevenLabs Instant Soundtracks (https://elevenlabs.io/blog/introducing-instant-soundtracks) to rough in score and timed SFX against animatics; it places effects at matching timestamps and keeps music and SFX on separate layers, which fits the sparse-accent approach. Eleven Music (https://elevenlabs.io/docs/capabilities/music) for iterating the motif: section-level inpainting lets the team rework the sign-off bar without regenerating the track; the sound-effects API (https://elevenlabs.io/docs/capabilities/sound-effects) covers loopable ambiences and the single glint accents, up to 30 seconds per generation with WAV output.
- Licensing for paid media: ElevenLabs states Eleven Music is cleared for nearly all commercial uses including advertising, with scope varying by plan (some uses require Enterprise); verify the current terms at elevenlabs.io/music-terms for the exact plan before any paid placement, and note the SFX docs state no licence terms, so confirm those separately. If using Artlist or Epidemic Sound instead, the licence tier must explicitly cover paid digital advertising for the entity running the ads, with broadcast or CTV clearance added if the media plan extends there; third-party comparisons conflict on per-project versus unlimited scope, so confirm against the current licence text and archive the licence PDF with the project.
- Preference: for the hero film's final score, favour either a cleared custom composition or a track whose paid-advertising clearance is unambiguous in writing. Generated audio is ideal for prototyping and may be acceptable for final use once plan terms are confirmed in writing for advertising use.
