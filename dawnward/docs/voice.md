# Voice — provider research and decision

> The evening debrief is a spoken thing by nature. People talk about their
> day more honestly than they type about it. This document records how voice
> works in Dawnward, which provider we chose, and why.

## What ships

- A "Speak it instead" control on the debrief screen. Tap, talk, tap again.
- The recording goes to `POST /transcribe` as base64 and comes back as words
  appended to the editable text box. The user always sees and can edit what
  was heard before anything is submitted.
- The audio is transcribed and dropped. Only the words become a record.
  This is the same privacy posture as everything else (spec 04 §5).
- The server hides the vendor behind a `Transcription` interface
  (`server/src/intelligence/transcription.ts`), exactly like the
  Intelligence layer hides Anthropic. Swapping vendors is one file.
- If transcription is unavailable, the app says so like a person would:
  "I couldn't hear that just now. Typing still works." Typing is always the
  fallback, never a dead end.

## The research

Three real options, compared on accuracy, price, and fit:

| Option | Accuracy | Price | Notes |
| --- | --- | --- | --- |
| ElevenLabs Scribe | Best in class in recent benchmarks (about 2 percent word error rate on English) | Around $0.40 per hour of audio | One key also unlocks ElevenLabs text to speech later |
| Deepgram Nova | Very good, tuned for streaming | Around $0.26 per hour | The documented cost fallback |
| Self-hosted Whisper | Good | Server cost only | Ops burden, slower cold starts, ours to babysit |

A note on alisterai.com, which came up during research: Alister is a
recruiting and sourcing tool that connects to Claude, not a voice product.
It is not relevant here.

There is also a fourth option worth knowing about: on-device dictation
(the microphone key on the iOS and Android keyboard) already works in the
debrief text box today, free, with no audio ever leaving the phone. Some
users will simply use that, and that is fine.

## The decision: ElevenLabs Scribe

Chosen because:

1. Accuracy is the whole product here. A debrief that gets mangled teaches
   the model wrong things about a person's life. Scribe currently benchmarks
   as the most accurate hosted transcription available.
2. One vendor, two doors. The same ElevenLabs key powers text to speech,
   which is the natural next step: the weekly reveal and the Future Self
   letter, spoken. That is a planned moment, not scope creep, and it needs
   no new accounts when we build it.
3. Cost is a rounding error. A daily two minute debrief is about one hour
   of audio per user per month, roughly $0.40. The intelligence layer costs
   far more.

Deepgram stays documented as the fallback if volume ever makes the price
difference matter.

## What the owner needs to do

One thing: create an ElevenLabs account, make an API key, and put it in
`server/.env` as `ELEVENLABS_API_KEY`. Until then the mock transcription
answers in development, and the app degrades gracefully in production
(typing still works). This is item 4 on the launch checklist.

## Sources

- ElevenLabs Scribe accuracy and pricing review: latenode.com/blog/elevenlabs-scribe-review
- Speech to text API comparison 2026: futureagi.com/blog/speech-to-text-apis-in-2026
- Alister (what it actually is): alisterai.com
