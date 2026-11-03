# Final art pass before human testing (3 Nov 2026)

These are only the gaps in what testers will see: first open → Home → the decision practice → Done → Remind me → "How did it go?" → Journey. Everything else already has its art (86 images in `experience/assets/img/art`).

**How to run it:**
- **Art plates (Part A):** in one new ChatGPT chat, paste the **style lock** once, then one prompt per message. Save each image named by its code (e.g. `HM-1.png`) and send them to Claude in batches. They go straight into the app.
- **Screen mockups (Part B):** a **separate** chat. They are references only: Claude rebuilds the look in code. Generated mockups get small text wrong, so judge layout, mood and hierarchy, not words.

## Style lock (paste first)
```
You are the art director for Dawnward, an app where a person's inner life is a living universe of five worlds (Mind, Body, Soul, Spirit, Future), other galaxies, a Quantum Gateway to imagine a possible future self, and Earth, where it all comes back into real life.
Style: surreal, dreamlike cinematic realism, like a matte painting from an epic film crossed with a lucid dream. Layered depth: something close, something in the middle, something very far, with soft volumetric light and drifting particles between the layers. Deep space #05070D to #0A1426. Light only where it really falls: warm gold #E6C07B, orbital blue #5B8CFF, cyan #37D5E8, violet #9B5BFF, lilac #C9B8FF, teal #5FE3C0, amber #F0C987. Fine film grain. No plastic CGI, no lens-flare spam, no neon outlines, no cartoons.
Light: one warm golden source from the upper left, a soft rim light on far edges.
People: only seen from behind, or as soft silhouettes of light. Never a detailed face. Never a real or recognisable person. No religious symbols of any specific faith.
Never put any text, letters, numbers, logos, UI, icons or watermarks in an image unless I ask for a blank interface element.
"Transparent" means a PNG with a transparent background and nothing else in it.
Formats: "Hero" = portrait 1080x1920, the subject in the top 40%, the lower 55% calm and dark because text sits there. "Backdrop" = portrait 1080x1920, softer and darker than a hero, it sits behind buttons. "Reflection" = portrait 1080x1920, very calm, very dark, one small light. "Reward" = square 1024x1024, transparent.
```

## Part A: art plates, in priority order
1. **HM-1, first-visit Home (Hero).**
   > One whole planet floating in deep space, its surface divided into five organic regions flowing into each other along soft glowing seams (no straight lines): deep blue crystal plateaus (Mind), green forests and rivers (Body), rose-pink meadows and soft clouds (Soul), pale silver peaks with mist and tiny stars (Spirit), warm gold terrain with luminous paths toward the horizon (Future). A few small moons, a faint nebula. Calm and hopeful. The planet sits in the top 40%; below it, quiet dark space.
2. **RV-1, "How did it go?", coming back (Hero).**
   > A small figure of light seen from behind, standing on a quiet hill on Earth at dawn, looking up at one new star that has just appeared low in the sky, the same warm gold as the light in their hand. Ordinary and real: a town's distant lights, dew on grass. The feeling of coming back to tell how something went. Subject in the top 40%.
3. **BO3-H, Beyond Overthinking chapter 3, "A one-minute pause" (Hero).**
   > A single figure seen from behind on a still lake at night, a ring of slow ripples spreading from where they stand, the swirl of thoughts above them (faint light-trails) slowing and settling into a few calm stars. Blue and lilac, one warm light.
4. **FC-H, Feeling Closer (Hero).**
   > Two small lights on two distant islands in a dark violet sea, a faint, unfinished bridge of soft light beginning to form between them, not yet touching. Hopeful, never sad. Rose and gold.
   - **FC-X (Backdrop):** the same sea, darker, the two lights far apart.
   - **FC-R (Reflection):** one lantern on a quiet shore, the other island just visible.
   - **FC-K (Reward):** two small moons, one rose and one gold, orbiting a shared soft light.
5. **BC-H, Becoming Consistent (Hero).**
   > A winding path of small stepping-stones across a dark valley, each stone glowing faintly gold where it has been stepped on, the path continuing toward a distant dawn. Some stones dim, then bright again: a missed step is part of the path.
   - **BC-X (Backdrop):** the valley, darker.
   - **BC-R (Reflection):** one glowing stone, quiet mist.
   - **BC-K (Reward):** a small amber moon with a faint ring of seven tiny lights.
6. **RM-1, Remind me (Reward, transparent):** a small golden marker-star resting on a thin curved horizon line, like a moment saved for later. Simple, elegant, readable at 64 px.
7. **ICON-1024, app icon:** square 1024x1024, no transparency, no text. A small golden spiral galaxy with a bright warm core on deep space #05070D, centred, filling about 70%, crisp at 60 px.
8. **OG-1, link preview (optional):** 1200x630, the HM-1 planet on the right third, dark empty space on the left (text is added in code).

## Part B: screen mockups (reference only)
Paste this first in the separate chat:
```
Design high-fidelity mobile app screens, 390x844 (iPhone), for Dawnward, a calm personal-growth app. Dark theme: background #05070D with a subtle painted space scene behind content; cards are dark glass (rgba(10,14,24,.75), 1px hairline border, 16px radius, soft blur). Headings in an elegant serif (Cormorant), body in Inter, generous spacing, 16-20px side margins. Exactly ONE gold (#E8C37A) primary button per screen, everything else quiet (text buttons, outlines). Bottom tab bar with 5 tabs: Home, Universe, Reflect, Learn, Journey. Apple-quality restraint: no clutter, no badges, no streaks, no points, no confetti. Text must be legible over the art. Show the screen alone, no device frame.
```
Then one at a time:
1. **Home, first visit.** Title "Going back and forth on something?". A small line: "Find one next step in about 8 minutes. Stop any time and pick up later. What you write stays on this phone." One card: "Beyond Overthinking · Mind · Understand the loop" with the gold button "Begin · 8 min", and small text links "Choose another", "Not today", "Why this?". Below: "Your worlds", five small planets in a row. The five-region planet art behind, top half.
2. **Done.** Title "Done". One line: "Try it, then come back and say how it went." A card with the chosen action "Start the tax form on Saturday" and "Saturday morning". Buttons: gold "Go home", outline "Remind me", text "Back to Learn". A small golden moon lighting up.
3. **Remind me sheet.** A bottom sheet over the Done screen: "Remind me", the action, a Day field and a Time field (iOS style), gold "Save to my calendar", "Cancel", and a quiet line "Nothing is sent anywhere; your calendar app keeps it."
4. **How did it go?** Title "How did it go?", the action in a card, four calm choices as large rows: "I did it", "Partly", "Not yet", "I changed my mind", an optional text box "Anything you noticed?", gold "Save". Earth at dawn behind.
5. **Journey, after the first practice.** Title "Journey". A soft image of the user's "Kindled" light, counts "1 Chapter · 1 Action", and the practice listed as a milestone with its date. Calm and sparse.

Send the five mockups to Claude with one line each on what you like.
