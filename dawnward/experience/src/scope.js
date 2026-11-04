// People see only what exists. Planned chapters and pathways stay in the content files (they're our
// roadmap), but the app hides them: a list of promises makes a product feel unfinished and harder to follow.
import { SYSTEMS, WORLD_PLAY } from "../../packages/core/src/expeditions/index.ts";
for (const s of SYSTEMS) s.planned = [];
for (const w of Object.keys(WORLD_PLAY)) WORLD_PLAY[w].planned = [];
