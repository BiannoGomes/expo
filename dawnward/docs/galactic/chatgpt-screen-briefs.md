# Dawnward screens: briefs for ChatGPT

This pack is for making the look you signed up for (the Galaxy Home board, October 2026) with ChatGPT, so that it can go into the real app rather than stay a picture.

## The one rule that makes this work

Ask ChatGPT for **art with no words in it**. Leave every word, button and number to the code.

Image models still garble type. Your hero shows it: "REMEMBERS" comes out broken. They also invent numbers and features. So the split is:

- **ChatGPT paints** the planets, the worlds, the galaxy core and the skies.
- **The code draws** the type, glass panels, buttons, icons and every number and quote, from your real data. That keeps it sharp at any size, readable by screen readers and true.

You can still ask for whole-screen concepts to explore a direction (section C). Treat those as mood boards only; the words on them get rebuilt.

## A. Paste this first, once per chat (the style lock)

```
You are the art director for Dawnward, a private evening-reflection app whose home is a living galaxy. Keep every image in this chat in one consistent style:

Style: cinematic, painterly sci-fi realism, like a high-end film matte painting. Deep space #05070D to #0A1426. Glowing accents only where light really falls: cyan #37D5E8, orbital blue #5B8CFF, violet #9B5BFF, warm gold #E6C07B. Fine film grain, no plastic CGI look, no lens-flare spam, no neon outlines, no cartoon style.
Light: one warm golden star at the centre of the galaxy lights every planet from the same side. Rim light on the far edge, soft atmosphere glow.
Each planet is a small world you can see into: a landscape on the surface, under a thin glassy atmosphere.
Never put any text, letters, numbers, logos, UI, buttons, icons or watermarks in the image.
```

## B. The art the real app needs (these go straight into the build)

Generate square images at 1024 × 1024 and portrait images at 1024 × 1536. Download PNGs and send them to me in this chat. I'll upscale only if you approve credits for it, and I'll record where each image came from.

| # | Asset | Prompt to send after the style lock |
|---|---|---|
| 1 | **Mind planet** | `A single planet centred on pure black, filling 80% of the frame, nothing cropped. Mind world: snowy blue mountains and a still lake under a cold blue-cyan atmosphere, a faint thin ring of light. Lit from the left by a warm gold star. Pure #000000 background, no stars, no text.` |
| 2 | **Body planet** | Same as 1, but: `Body world: lush green forest, a waterfall, low cloud, teal-green atmosphere.` |
| 3 | **Soul planet** | Same as 1, but: `Soul world: violet and pink blossom trees on a quiet hill, soft dusk light, violet atmosphere.` |
| 4 | **Future planet** | Same as 1, but: `Future world: a golden city of tall spires rising from cliffs, amber atmosphere, a wide thin ring tilted around the planet.` |
| 5 | **Galaxy core** | `Top-down three-quarter view of a spiral galaxy core: a bright warm gold centre with two swirling arms of gold and pale blue dust, centred on pure black, filling 70% of the frame. No planets, no text.` |
| 6 | **Home sky, portrait** | `Deep space background for a phone screen: soft violet and blue nebula clouds at the edges, dark empty centre for content, scattered fine stars, a few distant dark rocky asteroids at the lower left. Portrait. No planets, no text.` |
| 7 to 10 | **World close-ups** (one per world) | `Portrait close-up for a phone screen. The [Mind/Body/Soul/Future] planet seen up close from orbit, filling the top 55% of the frame, its landscape clearly visible. The lower 45% fades smoothly to near-black #05070D so text can sit on it. No text.` |
| 11 | **Entrance** | `Portrait. A lone figure sitting on a cliff edge, seen from behind, looking at a huge planet rising over the horizon in golden light. Wide space above for a title, dark lower third. No text.` |
| 12 | **Memory constellations sky** | `Portrait. Dark sky where glowing star-points join into a few loose constellation shapes, violet and gold, with a small spiral galaxy and two small planets at the edges. Leave the centre dark. No lines of text, no labels.` |
| 13 | **Crystal formation** (for the insight screen) | `Glowing violet and gold crystal cluster floating in space, on pure black, filling 70% of the frame. No text.` |

What I do with them: planets 1 to 4 become real sprites in the 3D galaxy, lit and orbiting, with the glow and atmosphere I already render. 5 sits in the core. 6 and 12 become the skies. 7 to 11 and 13 head the world, entrance and insight screens behind glass panels.

## C. Each screen: what ChatGPT needs to know

Use this when you want a full-screen concept to explore a direction. For each screen, give ChatGPT the style lock, then the block below, then: `Portrait 1024 × 1536, iPhone proportions, no status bar. Show the layout only; lettering will be replaced, so keep any text short and in English.`

Every screen shares:

- **Top:** the wordmark (in serif) on home screens. Elsewhere, a back arrow and at most two round glass icon buttons.
- **Panels:** dark glass with a thin light edge. Gold is for small accents only, never for body text.
- **Type:** serif (Cormorant Garamond) for titles, Inter for everything you read.

### 1. Entrance
- **Purpose:** the first moment. A point of light opens into your galaxy.
- **Shows:** "Dawnward" and "YOUR UNIVERSE REMEMBERS", the line "A more connected you, in a more meaningful tomorrow", and one round star button, "Tap to begin".
- **Leave out:** anything else. A returning person never sees this screen.

### 2. Galaxy Home (your hero, the main screen)
- **Purpose:** your four worlds around a central star, and what Dawnward understands so far.
- **Shows:**
  - the four planets, each with its name, three small words and an Enter button. Mind: reflect, understand, clarity. Body: energy, habits, wellbeing. Soul: values, connection, meaning. Future: goals, pathways, possibilities.
  - a notice card: "A new connection found · 3 memories linked".
  - a glass card: "Good evening" with one insight about you, and **beneath it the evenings it came from** (for example, "Seen in 3 of your evenings").
  - three small cards: Tonight's reflection, New insight, Tomorrow's three steps.
  - a central star button with "Tap to speak or write" on the left and "Your universe is listening" on the right.
- **Change from your board:**
  - "Today's Reflection" becomes "Tonight's reflection": Dawnward is an evening debrief.
  - "Next step" is tomorrow's three steps, which already exist.

### 3. to 6. Mind, Body, Soul, Future worlds
- **Purpose:** inside one world.
- **Shows:**
  - the world close-up (art 7 to 10) and the world name;
  - one line, for example Mind: "Your thoughts, patterns and inner world";
  - four glass rows.
- **The rows I can make real:**
  - "New reflection: write or speak, saved to this world";
  - "Memories here: every evening you placed here";
  - "What I understand here: insights, each showing its evenings";
  - a fourth row that differs per world:
    - Mind: "Tomorrow's steps";
    - Body: "What helps your energy", drawn from your evenings;
    - Soul: "People who come up";
    - Future: "Your destination and its milestones".
- **Leave out for now:**
  - "Integrations: connect your health data", because it isn't built;
  - "Rituals", unless we decide to build them.

### 7. Write or Speak
- **Purpose:** capture tonight's reflection.
- **Shows:**
  - "Write or speak your reflection";
  - "A safe space for what's real";
  - a large text field;
  - a big glowing microphone star;
  - a Voice / Type switch;
  - which world it goes to, as four small chips;
  - a Keep it button.
- **Leave out:** the photo and scan buttons. They don't exist, and adding them is a separate decision.

### 8. A new star (missing from your board, and the moment people will remember)
- **Purpose:** what happens right after Keep it.
- **Shows:**
  - a new star igniting in the world's colour;
  - your exact words in a glass card, with tonight's date;
  - "Kept, word for word";
  - "Not linked to anything yet. That takes more than one evening";
  - a button, "Review what I understand".

### 9. Memory Galaxy
- **Purpose:** every evening as a star, with lines between evenings that support the same insight.
- **Shows:**
  - "Your Memory Galaxy";
  - a count line such as "342 memories · 12 constellations" (real numbers come from your data);
  - All / Themes / People filters;
  - constellations labelled with names and memory counts;
  - Map / Timeline / Connections at the bottom.

### 10. Insight detail (your "Self Growth" screen)
- **Purpose:** one insight and the proof behind it.
- **Shows:**
  - the crystal art;
  - the insight title and "28 connected memories";
  - the statement;
  - under it, **two or three of your actual quotes with dates**;
  - three buttons: "That's right", "Correct it" and "That's not right";
  - related themes.
- **Why this matters:** it's what makes Dawnward trustworthy instead of a horoscope. Every claim shows its evidence, and you can overrule it.

### 11. Insights
- **Purpose:** what Dawnward thinks, kept apart from what you said.
- **Shows:**
  - For You / Patterns / Connections tabs;
  - "A new pattern" with its source evenings;
  - "What this might mean", labelled as a guess when it is one;
  - a card that says "I don't have enough evidence to conclude that yet", shown proudly, not hidden.
- **Leave out:** "42% higher than last month". It's a score, and scores are off the table for Dawnward. Show "Seen in 6 of your last 10 evenings" instead, which is a count of your own words.

### 12. Your possible paths (Future)
- **Purpose:** a goal is a destination you travel towards.
- **Shows:**
  - "Your possible paths";
  - Career / Wellbeing / Relationships tabs;
  - planets along a glowing path;
  - one path card with an "Explore this path" button;
  - milestones that light up only when an evening says they happened, each showing that evening's words.

### 13. Menu
- **Purpose:** move between places.
- **Shows:**
  - Galaxy home, Mind, Body, Soul, Future;
  - then Tonight, Tomorrow's steps, Memory galaxy, Insights, Evenings and Settings;
  - at the bottom, "Your universe · growing since" plus the real start date.

### 14. Tomorrow's three steps (missing from your board; it's the core of the app)
- **Purpose:** each morning, three small steps drawn from last night's words.
- **Shows:**
  - "Tomorrow" with the date;
  - three glass cards, each with one step and a small line saying which evening it came from;
  - a done tick for each.
- **Leave out:** streaks, percentages, badges.

### 15. Settings and privacy
- **Shows:**
  - "Learning: on / paused";
  - "Export everything";
  - "Leave an evening out";
  - "Delete my universe";
  - the line "Private. Never sold."
- **Purpose:** this is the promise in your headline, so it deserves a beautiful screen too.

## D. What not to let ChatGPT add

- No streaks, scores, percentages, badges or levels.
- No light theme.
- No invented testimonials, ratings or store badges.
- No features that don't exist presented as shipped: health integrations, photo capture, rituals. If you want them, they're a product decision first.
- No insight without its evenings underneath.
- No text baked into art you plan to use in the app.

## Provenance

When you send the images, tell me which prompt made each one. I record it beside the asset (tool: ChatGPT image generation; prompt; date), as I do for fonts and code.
