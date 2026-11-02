# Dawnward — Public-source motion and interaction research

Research date: 2 November 2026. Scope: public documentation, public design articles, public screenshots and recording indexes only. No signed-in apps, private assets or extracted application code.

**Design premise: 8/10.** A living universe gives progress a memorable spatial form. The weakness is repeated travel: a beautiful flight can become friction before a two-minute practice. Let people skip travel and resume a practice directly. This rating is design judgment, not a research finding.

## How to read this document

- **DOCUMENTED** means a public source explicitly supports the statement. It does not mean the current installed app was tested.
- **INTERPRETATION** means a design reading of the cited reference.
- **UNVERIFIED** means the requested detail could not be established. A linked source beside an unverified item is the reference checked, not proof of that item.
- **ESTIMATE / UNVERIFIED** timings are rough reconstruction starting points, not frame measurements or disclosed implementation values. Confidence in these ranges is low, approximately 30%. Exact easing curves are unverified unless stated otherwise.
- A sequence is not a stopwatch. Where a source establishes order but not timing, steps below must not be assumed to fit inside ten seconds.
- Recording timestamps below come from publishers’ chapter indexes. They identify reference segments; no claim is made that those videos were frame-inspected. No invented video timestamps are supplied.
- Transfer ideas and the final three directions are proposals, not claims about the reference products.

The evidence is strongest for documented controls, audio and design intent. **A complete, timed first-ten-second audit of all twelve products could not be verified from the accessible public material.** Gaps are explicit below.

## 1. Endel

**Reference scope:** mobile soundscape app; public onboarding examples of unspecified build date. Do not mix these with Endel’s separate visionOS app.

1. **First open, first 10 seconds:** DOCUMENTED sequence: (1) dark opening; (2) the three use cases appear in a staggered fade; (3) logo and supporting description appear; (4) abstract forms and Continue follow. Exact ten-second boundaries: **UNVERIFIED**. [Public launch description](https://60fps.design/shots/endel-splash). A separate recording index locates animated value propositions at **00:05–00:32**, showing why the whole introduction cannot safely be called a ten-second sequence. [Recording index](https://screensdesign.com/apps/endel-focus-sleep-sounds/?vs=63164).
2. **Transitions:** opacity reveals rather than a documented directional camera move. ESTIMATE / UNVERIFIED: individual reveals **300–700 ms**, gentle ease-out feel; whole sequence duration and actual curve unknown. [Launch description](https://60fps.design/shots/endel-splash).
3. **Gestures:** tap Start activates Autoplay, which selects soundscapes; this is official. Swipe, drag and long-press responses for this mobile build: **UNVERIFIED**. [Official product description](https://endel.io/).
4. **Text readability:** INTERPRETATION: sparse text on the dark opening separates reading from the abstract reveal; contrast ratios and behavior during playback are **UNVERIFIED**. [Launch description](https://60fps.design/shots/endel-splash).
5. **Sound:** DOCUMENTED: adaptive soundscapes respond to contextual inputs, and each has a generative visual. A shared input system does **not** establish beat-synchronized animation. Exact sound-to-motion mapping and launch sound: **UNVERIFIED**. [Official site](https://endel.io/).
6. **Accessibility:** mobile reduced-motion behavior: **UNVERIFIED** in the reviewed product material. Do not infer support from iOS settings alone. [Official site checked](https://endel.io/).
7. **Transfer to Dawnward:** Give each practice a restrained visual state that reflects its purpose, while keeping the practice’s Start action obvious. Proposal derived from [Endel’s paired soundscapes and visuals](https://endel.io/).

## 2. Calm

**Reference scope:** historical public onboarding plus current public Scene documentation; these are not one verified build.

1. **First open, first 10 seconds:** historical DOCUMENTED order: (1) a breathing invitation on a blue gradient; (2) goal selection; (3) account creation; (4) trial/paywall; (5) home guidance. Only the order is established; completion inside ten seconds is **UNVERIFIED**. [Appcues teardown](https://goodux.appcues.com/blog/calm-app-new-user-experience). A different recording indexes permissions at **00:00–00:07** and goals at **00:07–00:11**, demonstrating version differences. [Recording index](https://screensdesign.com/apps/calm/).
2. **Transitions:** DOCUMENTED: Zen Mode removes the interface; the desktop idle variant fades menus after **15 seconds**. Mobile documentation describes disappearance as immediate. Any **200–400 ms** mobile fade/ease-out is ESTIMATE / UNVERIFIED, not a measured Calm value. Scene-change direction and duration: **UNVERIFIED**. [Zen Mode guide](https://support.calm.com/hc/en-us/articles/360008619874-How-to-Hide-App-Menus-View-Scenes-Only-Zen-Mode).
3. **Gestures:** tap empty background to hide menus; tap again to restore. Scroll the Scene list; tap to download/select; drag the Scene volume slider. Landscape Zen Mode is documented for iOS; Android landscape is temporarily disabled. Long press: **UNVERIFIED**. [Zen Mode](https://support.calm.com/hc/en-us/articles/360008619874-How-to-Hide-App-Menus-View-Scenes-Only-Zen-Mode), [Scenes](https://support.calm.com/hc/en-us/articles/115002474307-Calm-Scenes-Guide-Change-Background-Volume-Playback-Timer).
4. **Text readability:** DOCUMENTED historical opening uses a simple gradient behind a short line. INTERPRETATION: it reduces competition before the richer home environment. Exact scrim/blur recipe over Scenes: **UNVERIFIED**. [Onboarding analysis](https://goodux.appcues.com/blog/calm-app-new-user-experience).
5. **Sound:** Scenes include ambient audio on home and during meditations, with separate volume and continuation duration. Sleep Stories override Scene audio with their own design. Motion synchronization: **UNVERIFIED**. [Official Scenes guide](https://support.calm.com/hc/en-us/articles/115002474307-Calm-Scenes-Guide-Change-Background-Volume-Playback-Timer).
6. **Accessibility:** silent Scenes and independent ambient volume are documented user controls; neither proves reduced-motion support. Reduced-motion behavior: **UNVERIFIED**. [Sound controls](https://support.calm.com/hc/en-us/articles/115002582948-How-to-Stop-Background-Scene-Sounds-in-the-Calm-App).
7. **Transfer to Dawnward:** Let a world become a quiet practice environment by removing navigation and independently controlling ambience. Proposal derived from [Zen Mode](https://support.calm.com/hc/en-us/articles/360008619874-How-to-Hide-App-Menus-View-Scenes-Only-Zen-Mode).

## 3. Headspace

**Reference scope:** historical mobile onboarding and official session-accessibility documentation.

1. **First open, first 10 seconds:** DOCUMENTED at a coarse level: opening animation → onboarding → an immediate first-meditation action on the core page. Frame order within the opening, timing and current-build first screen: **UNVERIFIED**. [Public onboarding analysis](https://theappfuel.com/examples/headspace_onboarding). It would be inaccurate to replace those gaps with a detailed invented sequence.
2. **Transitions:** brand animation at opening and onboarding completion is documented. Travel direction, spring behavior and durations: **UNVERIFIED**; no defensible measured millisecond range was found. [Onboarding analysis](https://theappfuel.com/examples/headspace_onboarding).
3. **Gestures:** tap session settings to toggle available captions and haptic assistance. Swipe, drag and long-press navigation responses: **UNVERIFIED** in the reviewed sources. [Official session controls](https://help.headspace.com/hc/en-us/articles/1260804149670-Closed-Captions-and-Haptic-Assistance-Options).
4. **Text readability:** DOCUMENTED brand approach uses illustrated characters and environments. Keeping explanatory text apart from detailed illustrations is a useful INTERPRETATION, but a current UI contrast/scrim mechanism is **UNVERIFIED**. [Animation partner’s account](https://nexusstudios.com/work/headspace/).
5. **Sound:** guided sessions are the audio experience described by the accessibility controls; exact interface sounds, onset fades and synchronization to animated characters: **UNVERIFIED**. Do not treat animated educational films as evidence of app-navigation audio. [Session documentation](https://help.headspace.com/hc/en-us/articles/1260804149670-Closed-Captions-and-Haptic-Assistance-Options).
6. **Accessibility:** DOCUMENTED: captions for some English content; haptic assistance on supported sessions, enabled alongside captions; Audio Description is also linked. App-wide reduced motion: **UNVERIFIED**. [Official accessibility article](https://help.headspace.com/hc/en-us/articles/1260804149670-Closed-Captions-and-Haptic-Assistance-Options).
7. **Transfer to Dawnward:** Use animation to explain one unfamiliar practice, then offer that practice immediately. Proposal derived from [Headspace’s onboarding-to-first-session pattern](https://theappfuel.com/examples/headspace_onboarding).

## 4. Finch

**Reference scope:** July 2025 public onboarding capture; official new-user and sound guides.

1. **First open, first 10 seconds:** DOCUMENTED order: (1) hatch/invite/backup choices; (2) choose an egg; (3) tap to hatch; (4) hatch reveal; (5) name the bird; (6) select a trait. Which steps fit inside ten seconds: **UNVERIFIED**, dependent on user input. [July 2025 capture analysis](https://www.botsi.com/resources/flows/apps/finch-2025-07).
2. **Transitions:** hatch reveal is documented, but its direction and easing are **UNVERIFIED**. A **400–800 ms** reveal with a soft spring is an ESTIMATE / UNVERIFIED reconstruction option, not an observed Finch specification. [Capture analysis](https://www.botsi.com/resources/flows/apps/finch-2025-07).
3. **Gestures:** tap to hatch; scroll down Home to add goals; completing goals supplies energy for an adventure. Swipe-specific, draggable-pet and long-press behaviors: **UNVERIFIED**. [Capture analysis](https://www.botsi.com/resources/flows/apps/finch-2025-07), [official new-user guide](https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide).
4. **Text readability:** INTERPRETATION: the onboarding breaks ownership decisions into separate screens rather than laying a long explanation over the pet. Detailed motion-time legibility and contrast measurements: **UNVERIFIED**. [Public screen sequence](https://www.botsi.com/resources/flows/apps/finch-2025-07).
5. **Sound:** DOCUMENTED: device ringer and volume control sounds; the official guide says there is no separate in-app sound toggle. Exact hatch/task sound timing: **UNVERIFIED**. [Official sound guide](https://help.finchcare.com/hc/en-us/articles/39759518297229-Sound-Settings).
6. **Accessibility:** the App Store listing does not declare supported accessibility features; that is missing disclosure, not evidence of no support. Reduced motion: **UNVERIFIED**. [App Store](https://apps.apple.com/pl/app/finch-self-care-pet/id1528595748).
7. **Transfer to Dawnward:** Let the user create their first Journey star before asking for a lengthy profile. Proposal derived from [Finch’s early hatch payoff](https://www.botsi.com/resources/flows/apps/finch-2025-07).

## 5. Sky: Children of the Light

**Reference scope:** official public control documentation, including explicitly labelled older **Sky Beta** pages; not proof of the latest retail opening.

1. **First open, first 10 seconds:** **UNVERIFIED**. The reviewed official sources establish controls but do not establish a current, timed cold-launch sequence. No precise logo → arrival → tutorial timeline is claimed. [Official help center](https://thatgamecompany.helpshift.com/hc/en/).
2. **Transitions:** walking, jumping and flying provide continuous spatial movement, rather than every interaction replacing a page. Flight-mode switching is documented for controllers. Camera follow lag, portal transition duration and easing: **UNVERIFIED**; player-driven traversal has no single fixed duration. [Official controller controls](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/494-can-i-use-a-controller-to-play-sky/).
3. **Gestures:** documented Beta touch controls: drag in the movement area to run; smaller displacement slows to walking; tap jump; flick to jump directionally; drag from a foot to step. One-handed mode uses a two-finger camera gesture. Long-press touch-flight mapping for current retail: **UNVERIFIED**, not inferred from controller hold-to-fly. [Official Beta movement guide](https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/375-how-do-i-get-my-character-to-move/).
4. **Text readability:** current text-panel materials, contrast and subtitle protection over bright landscapes: **UNVERIFIED** in the reviewed documentation. The game’s sparse-looking presentation alone would not prove readable text. [Official help reference checked](https://thatgamecompany.helpshift.com/hc/en/).
5. **Sound:** official help documents interaction with outside music through visible headphones on characters. A precise flight/landing/camera audio mapping: **UNVERIFIED**. [Official gameplay help](https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/section/118-gameplay-features/).
6. **Accessibility:** one-handed controls and side swapping are documented input accommodations on the Beta page. Current reduced-motion/flash/camera-comfort behavior: **UNVERIFIED** from the reviewed material. [Control schemes](https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/375-how-do-i-get-my-character-to-move/).
7. **Transfer to Dawnward:** Make movement visibly proportional to input, but provide a simple tap-to-destination alternative for every flight. Proposal derived from [Sky’s variable-speed movement](https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/375-how-do-i-get-my-character-to-move/).

## 6. Journey — thatgamecompany

**Reference scope:** original game’s public developer/publisher descriptions; platform controls vary.

1. **First open, first 10 seconds:** DOCUMENTED narrative setup: isolated desert traveler, with a distant mountain established as the goal. Exact launch logos, opening-shot order and the ten-second cut-off: **UNVERIFIED**. The narrative setup must not be passed off as an observed boot sequence. [Developer description](https://thatgamecompany.com/journey/).
2. **Transitions:** DOCUMENTED traversal includes gliding across sand and soaring above ruins. Direction follows traversal; actual camera easing, fade timing and scene-loading durations: **UNVERIFIED**. A fixed “800 ms transition” would misrepresent continuous play. [Publisher description](https://www.annapurna.com/interactive/journey).
3. **Gestures/inputs:** controller camera manipulation by right stick or SixAxis is described in a public review, alongside singing as communication. Touch tap/swipe/drag/long-press mappings on iOS: **UNVERIFIED** in this research. [Platform-specific review](https://www.psu.com/reviews/journey-review/).
4. **Text readability:** INTERPRETATION: showing a distant destination can reduce reliance on written navigation. Exact subtitle, menu backing and contrast rules: **UNVERIFIED**. [Developer’s destination description](https://thatgamecompany.com/journey/).
5. **Sound:** DOCUMENTED developer interview describes an opening drone and wind creating entry into the world. Precise timestamps and sound-event synchronization are **UNVERIFIED**. [Developer interview](https://gamesbeat.com/kellee-santiago-describes-the-making-of-thatgamecompanys-journey/2/).
6. **Accessibility:** reduced-motion settings and their platform differences: **UNVERIFIED** in the reviewed official descriptions; this is not a claim that none exist. [Developer](https://thatgamecompany.com/journey/), [publisher](https://www.annapurna.com/interactive/journey).
7. **Transfer to Dawnward:** Keep one meaningful destination visible so a user can understand where to go before reading instructions. Proposal derived from [Journey’s mountain goal](https://thatgamecompany.com/journey/).

## 7. Monument Valley 2

**Reference scope:** original mobile puzzle interaction; later editions may differ.

1. **First open, first 10 seconds:** **UNVERIFIED** as a timed cold launch. Public walkthrough material establishes an opening tutorial chapter, but does not establish logo-to-input timing. [Written walkthrough](https://www.gamezebo.com/walkthroughs/monument-valley-2-walkthrough/). A public video guide indexes **00:00 — Chapter 1: Tutorial**, which is a chapter locator, not evidence that the app launches directly into it. [Video guide index](https://www.videogamesblogger.com/2017/06/07/monument-valley-2-walkthrough.htm).
2. **Transitions:** DOCUMENTED puzzle actions rotate cranks **90°**, slide architectural pieces and open routes. Drag duration is user-controlled. Post-release settle **250–500 ms**, soft ease-out, is ESTIMATE / UNVERIFIED; actual curve and interchapter timing unknown. [Walkthrough](https://www.gamezebo.com/walkthroughs/monument-valley-2-walkthrough/).
3. **Gestures:** tap destinations to move; hold and drag handles/cranks to reshape routes. “Hold” here starts manipulation, not a verified timed long-press menu. Independent swipe command: **UNVERIFIED**. [Walkthrough](https://www.gamezebo.com/walkthroughs/monument-valley-2-walkthrough/).
4. **Text readability:** INTERPRETATION: architectural puzzles carry much of the instruction through layout and manipulation, reducing text demand. Exact text-background treatment during chapter transitions: **UNVERIFIED**. [Official game description](https://ustwogames.co.uk/our-games/monument-valley-2/).
5. **Sound:** DOCUMENTED composer account treats music, effects and implementation as one interactive experience; discusses dynamic music and a gentle, spacious palette. Exact click/chime-to-motion offsets: **UNVERIFIED**. [Todd Baker interview](https://www.asoundeffect.com/behind-beautiful-sound-monument-valley-2-todd-baker/).
6. **Accessibility:** reduced-motion behavior and alternatives to drag manipulation: **UNVERIFIED** in reviewed official material. [Official game page](https://ustwogames.co.uk/our-games/monument-valley-2/).
7. **Transfer to Dawnward:** Make a completed practice cause one comprehensible change in the world, rather than a decorative celebration unrelated to progress. Proposal informed by [mechanics communicating story progression](https://www.gdcvault.com/play/1025136/Game-Mechanics-for-Storytelling-in).

## 8. Apple Vision Pro onboarding

**Reference scope:** official setup and visionOS interaction documentation; setup is a device process, not a ten-second app intro.

1. **First open, first 10 seconds:** DOCUMENTED order: (1) connect battery and await readiness tone; (2) put on headset, displays activate on eye detection; (3) Quick Start or manual setup; (4) guided setup including eyes/hands. Some users are asked to hold the Crown for alignment. Exact first ten seconds and placement of all screens: **UNVERIFIED**; readiness itself can take **30–45 seconds** before manual power-on is advised. [Setup guide](https://support.apple.com/guide/apple-vision-pro/turn-on-and-set-up-devd5d9e3a52/27/visionos/27), [alignment](https://support.apple.com/en-us/120050).
2. **Transitions:** windows can be moved by pinch-drag; this is spatial repositioning under user control. Setup-panel entrance direction, duration and spring constants: **UNVERIFIED**. Do not confuse immersive promotional films with setup transitions. [Official gesture guide](https://support.apple.com/en-gb/117741).
3. **Gestures:** look and finger-tap to select; pinch-drag to move/scroll precisely; swipe to scroll rapidly and tap to stop. Pinch-hold is a platform gesture, but its specific onboarding response is **UNVERIFIED**. [Controls](https://support.apple.com/en-gb/guide/apple-vision-pro/tan1e2a29e00/27/visionos/27), [Apple gesture guidance](https://developer.apple.com/design/human-interface-guidelines/gestures/).
4. **Text readability:** DOCUMENTED platform mechanism: glass material and vibrancy keep foreground text and symbols legible over surroundings. That does not verify the material on every onboarding panel. [Apple Materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials).
5. **Sound:** readiness tone is documented. Focus, selection and setup-completion sound timing relative to motion: **UNVERIFIED**. [Setup guide](https://support.apple.com/guide/apple-vision-pro/turn-on-and-set-up-devd5d9e3a52/27/visionos/27).
6. **Accessibility:** DOCUMENTED Reduce Motion under Settings → Accessibility → Motion limits some interface movement. Exact substitutions on each onboarding screen: **UNVERIFIED**. [Official motion guide](https://support.apple.com/en-au/guide/apple-vision-pro/tanfba13872a/27/visionos/27).
7. **Transfer to Dawnward:** Teach a new interaction through one visible target and immediate feedback, while keeping instructions on a stable readable plane. Proposal derived from [Apple’s setup and interaction model](https://support.apple.com/guide/apple-vision-pro/get-started-with-applevisionpro-tan489cfe222/27/visionos/27).

## 9. igloo.inc

**Reference scope:** Abeto/Bureaux’s 2024 experience documented by its creators, not a claim about today’s deployed page.

1. **First open, first 10 seconds:** DOCUMENTED: a real-time introduction transitions seamlessly into the outdoor experience. Loading state, exact shot sequence and what is visible at second ten: **UNVERIFIED**. [Creator case study, Animation section](https://www.awwwards.com/igloo-inc-case-study.html).
2. **Transitions:** DOCUMENTED: scrollable scene navigation; transitions combine frost, displacement and chromatic effects. Camera direction varies by scene; it is not one universal zoom. Scroll-linked movement has no fixed millisecond duration. Residual smoothing **300–700 ms**, ease-out-like, is ESTIMATE / UNVERIFIED. [Creator case study, Process/Design](https://www.awwwards.com/igloo-inc-case-study.html).
3. **Gestures:** scroll navigates the experience; selecting external links changes particle forms. Touch swipe mapping, free drag camera and long press: **UNVERIFIED**. [Creator case study, Interactive Particles](https://www.awwwards.com/igloo-inc-case-study.html).
4. **Text readability:** DOCUMENTED: WebGL text supports shader glitches and scrambling. That is a rendering/effect choice, **not proof of readable contrast or screen-reader support**; protective text backing and contrast ratios remain **UNVERIFIED**. [Creator case study, UI Design](https://www.awwwards.com/igloo-inc-case-study.html).
5. **Sound:** DOCUMENTED: Bureaux supplied music and effects matched to particle movement. Exact timing, audio defaults and mute persistence: **UNVERIFIED**. [Creator case study, Interactive Particles](https://www.awwwards.com/igloo-inc-case-study.html).
6. **Accessibility:** low-end performance testing is described; reduced motion, keyboard equivalents and semantic alternatives to WebGL text are **UNVERIFIED**. Performance is not accessibility. [Creator case study](https://www.awwwards.com/igloo-inc-case-study.html).
7. **Transfer to Dawnward:** Make the introduction resolve into the actual navigable galaxy so the arrival feels continuous. Proposal derived from [the real-time introduction](https://www.awwwards.com/igloo-inc-case-study.html).

## 10. Stripe Sessions site

**Reference scope:** **2024** campaign for the main reference; a separately identified **2023** observation for text protection. The annual sites must not be blended into one implementation.

1. **First open, first 10 seconds:** DOCUMENTED for 2024: campaign uses an ongoing metallic-gradient wave, including website assets. Exact browser first paint, loading sequence, headline order and ten-second timing: **UNVERIFIED**. [Commissioned studio’s account](https://estudi-image.com/projects/stripe-sessions-2024/). The current 2024 archive is a session-content page, not proof that the launch design remains live. [Official archive](https://stripe.com/sessions/2024).
2. **Transitions:** continuous flowing graphic is documented; exact scroll morphing, direction and easing are **UNVERIFIED**. Loop period in milliseconds: **UNVERIFIED**, with no defensible measurement available. [Studio account](https://estudi-image.com/projects/stripe-sessions-2024/).
3. **Gestures:** scroll/click are the public site’s relevant interaction class; specific 2024 scroll-to-graphic mappings, draggable graphics and long press: **UNVERIFIED**. Avoid treating a gallery’s “scroll animation” label as a control specification. [Public design reference](https://www.stateofflow.io/updates/stripe-sessions-website).
4. **Text readability:** a **2023** public design critique specifically notes protective rectangles behind the logo and Register control when the moving graphic crosses them. Whether the 2024 design uses that mechanism: **UNVERIFIED**. [Dated critique](https://threadreaderapp.com/thread/1648046139730452480.html).
5. **Sound:** site ambience, hover sounds and motion-linked audio: **UNVERIFIED**. Event films and keynote audio are not evidence of interface audio. [Studio reference checked](https://estudi-image.com/projects/stripe-sessions-2024/).
6. **Accessibility:** 2024 reduced-motion substitutions, pause controls and keyboard parity: **UNVERIFIED** in the reviewed sources. [Public reference checked](https://www.stateofflow.io/updates/stripe-sessions-website).
7. **Transfer to Dawnward:** Reserve protected zones behind key labels so spectacle can pass nearby without compromising reading. Proposal derived specifically from [the 2023 observation](https://threadreaderapp.com/thread/1648046139730452480.html).

## 11. Linear.app

**Reference scope:** the **product interface**, using March 2026 design documentation and current public help. This is distinct from Linear’s marketing-site animation.

1. **First open, first 10 seconds:** DOCUMENTED returning-user behavior: a preference controls which home view opens. New-account first-ten-second onboarding is **UNVERIFIED**; it depends on account/workspace state. [Official preferences](https://linear.app/docs/account-preferences).
2. **Transitions:** DOCUMENTED design intent prioritizes familiar, fluid interaction and predictable controls. Exact modal slide direction, duration and easing: **UNVERIFIED**. A **120–220 ms** fade/short ease-out would be an ESTIMATE / UNVERIFIED reconstruction target, not a published Linear token. [2026 design account](https://linear.app/now/behind-the-latest-design-refresh).
3. **Gestures/inputs:** click opens/selects controls; drag issues to board positions; horizontal trackpad scrolling or dragging empty board space pans columns. Keyboard alternatives move items and switch layouts. Touch long press and mobile swipe effects: **UNVERIFIED** here. [Official board guide](https://linear.app/docs/board-layout).
4. **Text readability:** DOCUMENTED: dimmer navigation lets primary work lead; refined hierarchy and predictable headers reduce competing visual weight. Font-size and theme preferences are available. This is about interface hierarchy, not text over cinematic imagery. [Design rationale](https://linear.app/now/behind-the-latest-design-refresh), [preferences](https://linear.app/docs/account-preferences).
5. **Sound:** default interface soundscape and motion-linked feedback: **UNVERIFIED**. Quiet visual design does not prove silent audio behavior. [Design account checked](https://linear.app/now/behind-the-latest-design-refresh).
6. **Accessibility:** documented font-size, theme, pointer and link-underline choices; board keyboard alternatives. Product-wide reduced-motion substitutions: **UNVERIFIED**. Marketing-site evaluations do not establish app behavior. [Preferences](https://linear.app/docs/account-preferences), [board keyboard controls](https://linear.app/docs/board-layout).
7. **Transfer to Dawnward:** Keep navigation predictable and visually recessive so the current practice receives attention. Proposal derived from [Linear’s hierarchy principles](https://linear.app/now/behind-the-latest-design-refresh).

## 12. Arc browser onboarding

**Reference scope:** historical **desktop Arc** onboarding described in 2023–2024 articles; not Arc Search, Dia or the unrelated Android TV app named ARC Browser.

1. **First open, first 10 seconds:** DOCUMENTED by a public eyewitness account: (1) desktop outside the Arc window dims to black; (2) an illuminated sphere and sound establish the introduction. Subsequent setup culminates in a membership card. Exact ten-second endpoint and intervening shot order: **UNVERIFIED**. [February 2024 analysis](https://www.howtheygrow.co/p/how-arc-grows).
2. **Transitions:** surrounding-screen fade is documented. Exact sphere trajectory and later panel transitions: **UNVERIFIED**. Fade **500–1,000 ms**, ease-in-out feel, is ESTIMATE / UNVERIFIED, not a measured Arc value. [Same public account](https://www.howtheygrow.co/p/how-arc-grows).
3. **Gestures/inputs:** public onboarding GIF shows color/transparency personalization; exact click-drag mapping, swipe steps and long-press effects: **UNVERIFIED**. Do not import Arc Search’s separate gestures into desktop onboarding. [Public GIF/article](https://www.rocek.dev/blog/arc-browser).
4. **Text readability:** INTERPRETATION: dimming the desktop reduces distraction around the onboarding window. Exact text materials, luminance and contrast ratios: **UNVERIFIED**. [Onboarding account](https://www.howtheygrow.co/p/how-arc-grows).
5. **Sound:** DOCUMENTED: a sound effect accompanies the illuminated introduction. Frame synchronization, trigger location, volume and mute behavior: **UNVERIFIED**. [Public account](https://www.howtheygrow.co/p/how-arc-grows).
6. **Accessibility:** onboarding-specific reduced-motion behavior, skip support and assistive-technology behavior: **UNVERIFIED** in reviewed material. [Public onboarding screenshots](https://www.saasui.design/pattern/onboarding/arc-browser).
7. **Transfer to Dawnward:** Use one brief, skippable arrival ritual to mark entering the universe, then let repeated visits open directly to useful work. Proposal inspired by [Arc’s multisensory introduction](https://www.howtheygrow.co/p/how-arc-grows); skip and repeat behavior are Dawnward recommendations.

## Three motion directions for Dawnward

The following are proposed starting specifications, not timings attributed to the references. Each direction is under 150 words. Fit scores are subjective judgments. For all three, honor system reduced motion, offer an in-app override, retain visible tap alternatives and keep progress understandable without sound. Apple explicitly identifies scaling, spinning and simulated depth as potential motion triggers: [Reduced Motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/).

### A. Calm cinematic — fit 9/10

**Core rules:** Controls acknowledge within 80–120 ms. Sheets fade in over 200–300 ms. Galaxy-to-planet travel takes 900–1,400 ms, with smooth ease-in-out acceleration and no overshoot. Optional practice ambience expands/contracts over 8–12 seconds; it is never a mandatory breathing prescription. Camera movement ends before instructions appear. Reading text, practice timer, Back and Exit never drift. Reduced motion replaces travel with a 150–200 ms dissolve and freezes ambient movement.

**Signature moment:** Completing a practice releases one point of light that becomes a permanent Journey star over 700–1,000 ms; optional soft tone at settlement.

**Risk:** Slow navigation becomes a repeated toll. Offer Skip travel and direct Resume.

**Why this score:** Best alignment with short, reflective practices; cinematic travel still needs strict restraint.

### B. Living physics — fit 7/10

**Core rules:** Touch acknowledgment within 80 ms. Dragged planets follow input directly; release settles with a critically damped spring, approximately 250–450 ms. Limit displacement to 8–16 px, with no orbital flinging. Cards settle in 180–280 ms. No decorative bounce during a practice. Text, controls and the selected target’s touch area never move under the finger. Reduced motion removes springs and displacement; selected states change by color, outline and a 120–180 ms fade.

**Signature moment:** A completed practice gently draws nearby Journey stars toward a new star, then settles; no whole-screen shake.

**Risk:** Toy-like motion can weaken emotional seriousness, and drag-first navigation excludes some users. Every drag has a tap alternative.

**Why this score:** Strong tactile engagement, but easier to overuse and harder to keep contemplative.

### C. Spatial depth — fit 8/10

**Core rules:** Use three restrained depth layers; input parallax stays within 4–12 px and stops during reading. Planet approach takes 700–1,100 ms with smooth ease-in-out; portal crossing takes 400–650 ms, without camera roll, rapid field-of-view change or a mandatory tunnel. Reveal instructions after the camera settles. Text, timer and navigation remain on a stable foreground plane. Reduced motion uses static destination compositions and a 150–200 ms crossfade, with no parallax.

**Signature moment:** A planet’s horizon opens into its practice world while the planet remains visible as an orientation anchor.

**Risk:** Depth effects add rendering cost and discomfort; impressive travel can obscure the next action.

**Why this score:** Strongest expression of Dawnward’s universe, with more performance and accessibility work than A.

