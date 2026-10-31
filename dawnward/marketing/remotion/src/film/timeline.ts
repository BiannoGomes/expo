// The flagship's single source of truth: every shot, line, caption and sound,
// in seconds. The edit (Flagship.tsx), the EDL and the shot manifest
// (scripts/manifest.mjs) are all generated from this file.
//
// Score landmarks ("Emotional build"): swell 15.12 s, climax 33.89 s,
// accent 54.54 s. Cuts land on narrative beats; the landmarks only add weight.

export type Shot = {
  id: string; from: number; to: number;
  kind: "type" | "phone" | "video" | "cards" | "insight" | "end";
  src?: string; srcIn?: number; note: string; provenance: string;
};

export const FILM_SECONDS = 60;

export const SHOTS: Shot[] = [
  { id: "A", from: 0, to: 3.8, kind: "type", note: "Hook: the confession types itself on black", provenance: "original typography" },
  { id: "B", from: 3.8, to: 6.2, kind: "phone", note: "The words fly into the real evening debrief", provenance: "app screen (debrief), corrected in code" },
  { id: "C", from: 6.2, to: 8.0, kind: "video", src: "shots/t1-first-light.mp4", srcIn: 1.4, note: "Into the screen's light: the first light of the universe", provenance: "Higgsfield Kling 4.0 i2v, keyframe gpt-image-2.5" },
  { id: "D", from: 8.0, to: 11.65, kind: "video", src: "shots/s-four-worlds.mp4", srcIn: 0.6, note: "Universe reveal: four worlds with depth", provenance: "Higgsfield Kling 4.0, keyframe from the app's planet art" },
  { id: "E1", from: 11.65, to: 12.77, kind: "video", src: "shots/s-mind-ring.mp4", srcIn: 2.4, note: "“Mind”: through the ring", provenance: "Higgsfield Kling 4.0" },
  { id: "E2", from: 12.77, to: 13.68, kind: "video", src: "shots/s-body.mp4", srcIn: 1.5, note: "“Body”", provenance: "Higgsfield Kling 4.0" },
  { id: "E3", from: 13.68, to: 14.75, kind: "video", src: "shots/s-soul.mp4", srcIn: 1.2, note: "“Soul”", provenance: "Higgsfield Kling 4.0" },
  { id: "E4", from: 14.75, to: 15.12, kind: "video", src: "shots/t3-dawn-horizon.mp4", srcIn: 2.0, note: "“and future”: the dawn limb", provenance: "Higgsfield Kling 4.0" },
  { id: "F", from: 15.12, to: 21.4, kind: "phone", note: "Real app: debrief slides to Today; “sister” travels into the step", provenance: "app screens (debrief, today), corrected in code" },
  { id: "G", from: 21.4, to: 25.7, kind: "cards", note: "No streaks. No scores. No guilt.", provenance: "original typography" },
  { id: "H", from: 25.7, to: 30.6, kind: "video", src: "shots/s-soul.mp4", srcIn: 0, note: "Soul: the people who matter", provenance: "Higgsfield Kling 4.0" },
  { id: "I", from: 30.6, to: 43.9, kind: "insight", note: "The Personal Model returns on the climax; push to the insight; “That's not right” sets it aside", provenance: "app screen (Personal Model), corrected in code" },
  { id: "K", from: 43.9, to: 48.6, kind: "video", src: "shots/t3-dawn-horizon.mp4", srcIn: 0, note: "Transformation: dawn on the limb", provenance: "Higgsfield Kling 4.0" },
  { id: "L", from: 48.6, to: 54.54, kind: "video", src: "shots/s-sunrise.mp4", srcIn: 0, note: "The sun breaks the horizon", provenance: "Higgsfield Kling 4.0" },
  { id: "M", from: 54.54, to: 60, kind: "end", note: "Lockup and the one verified next step", provenance: "original typography" },
];

// Narration (Naomi, Higgsfield). Captions mirror the voice exactly.
export const VO: { file: string; at: number; text: string; gain?: number }[] = [
  { file: "audio/n1.mp3", at: 0.45, text: "Ever go to bed not sure how your day really went?" },
  { file: "audio/n2.mp3", at: 4.05, text: "Dawnward is a journal you talk to." },
  { file: "audio/nB.mp3", at: 8.4, text: "Your days become four worlds. Mind, body, soul and future." },
  { file: "audio/nE.mp3", at: 15.5, text: "Every morning, three small steps. Drawn from your own words." },
  { file: "audio/n5.mp3", at: 21.5, text: "No streaks. No scores. No guilt.", gain: 1.6 },
  { file: "audio/nF.mp3", at: 26.3, text: "The people who matter live in Soul." },
  { file: "audio/nG.mp3", at: 33.3, text: "Slowly, it understands you. And shows you why.", gain: 1.3 },
  { file: "audio/nD.mp3", at: 38.4, text: "And when it’s wrong, you can tell it." },
  { file: "audio/nC.mp3", at: 41.5, text: "Private. Never sold.", gain: 1.2 },
  { file: "audio/n6t.wav", at: 45.4, text: "Just you, understood." },
  { file: "audio/n7.mp3", at: 55.3, text: "Dawnward. Coming soon." },
];
// Line durations (s), measured with ffprobe; captions hold for the line plus a beat.
export const VO_LEN: Record<string, number> = {
  "audio/n1.mp3": 3.32, "audio/n2.mp3": 2.35, "audio/nB.mp3": 7.0, "audio/nE.mp3": 4.28, "audio/n5.mp3": 4.05,
  "audio/nF.mp3": 2.77, "audio/nG.mp3": 4.44, "audio/nD.mp3": 2.35, "audio/nC.mp3": 2.19, "audio/n6t.wav": 2.24, "audio/n7.mp3": 2.19,
};

// Cards on black, each on its spoken phrase (n5: 0, 1.58, 3.05 s into the line).
export const CARDS = [
  { at: 21.5, text: "No streaks." },
  { at: 23.08, text: "No scores." },
  { at: 24.55, text: "No guilt." },
];

// Interface sounds and transitions (the typing ticks are generated per key in Flagship.tsx).
export const SFX: { file: string; at: number; gain: number; note: string }[] = [
  { file: "audio/shimmer.wav", at: 5.7, gain: 0.35, note: "into the light" },
  { file: "audio/star-chime.wav", at: 11.65, gain: 0.16, note: "Mind" },
  { file: "audio/star-chime.wav", at: 12.77, gain: 0.14, note: "Body" },
  { file: "audio/star-chime.wav", at: 13.68, gain: 0.14, note: "Soul" },
  { file: "audio/star-chime.wav", at: 14.75, gain: 0.14, note: "Future" },
  { file: "audio/breath.wav", at: 16.7, gain: 0.35, note: "the slide" },
  { file: "audio/star-chime.wav", at: 17.4, gain: 0.26, note: "the word lands" },
  { file: "audio/tick.wav", at: 40.0, gain: 0.9, note: "the dispute control" },
  { file: "audio/star-chime.wav", at: 54.54, gain: 0.24, note: "sonic logo" },
];

export const SCORE = { file: "audio/score.mp3", gain: 0.85, duck: 0.42 };
