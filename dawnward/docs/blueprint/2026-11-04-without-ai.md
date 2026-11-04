# Dawnward without AI (decision, 4 Nov 2026)

**Bianno's decision:** no AI insights. Dawnward works fully on the phone.

## Why this is a strength, not a loss
- **"Nothing you write ever leaves your phone."** Almost no reflection app can say this, and it's true here:
  - no account;
  - no server;
  - no AI service;
  - no tracking.
- **No running costs per user.** Hosting is a static site (Cloudflare Pages, free).
- **Much less legal work.** No sensitive data is processed anywhere, so most of `docs/legal/FACT-CHECK.md` doesn't apply.
  - Still open: the web Speak button uses the browser's own speech recognition (Google, in Chrome).
  - Still open: a "16 and over" line.
- **Simpler to explain and to test.**

## What replaces the AI
| The AI would have… | Now, on the phone |
|---|---|
| Found patterns overnight | **Noticing** (`experience/src/noticing.js`): words you keep coming back to (in 3+ reflections and at least a third of them), the feeling you name most often, the weekday you usually write, where your attention has been, and how your chosen steps went. Each one quotes your own words as evidence, and you confirm it ("That's right") or hide it ("Not quite"). Counts and quotes only: never a diagnosis, a cause or a score. |
| Written a weekly review | **Journey › Week**: reflections, practices, steps chosen and how they went, the worlds you spent time in, one line you wrote, and the question you came back to. **Save as PDF.** On Sundays and Mondays, Home offers it. |
| Read worksheets for you | **Fillable worksheets**: type straight into the tables; answers save as you type and come back after a reload. Print or save as PDF with your answers. Journey lists your worksheets. Learn offers them under each series at any time. |
| Planned your day | The **Daily Compass** already suggests one next practice from what you've done (never from what you write). |

## Simpler
- **People see only what exists** (`experience/src/scope.js`). Planned chapters and pathways stay in the content files as the roadmap, but the app hides them: no "Planned" rows, no "being written", no AI studios promised.
- **One clear next chapter per series** in Learn. Every chapter is under "All chapters". Only the chapter you're on says "Continue"; another you opened says "Started".
- **No "draft" labels** anywhere people see them. Review still happens before launch; the word is ours, not theirs.

## What's kept, and how
| Built | Use now |
|---|---|
| Practices, Reflect, the question bank, the Wisdom Library and constellations | Unchanged: they are the product |
| "How did it go?", Remind me (calendar file) | The core loop, unchanged |
| Galaxies, worlds, art, motion lab | The reward and the atmosphere: explore at your own pace |
| Server (`dawnward/server`), accounts, Claude intelligence | **Kept in the repo, switched off.** Later, if wanted: optional backup between devices. Any AI would be a separate, opt-in decision. |

## Remaining decisions for Bianno
1. **AI Creation galaxy:** with no AI, it holds only the Creation Gallery. Rename it (for example "Your Creations" or "The Gallery"), or fold it into Creative Worlds?
2. **The web Speak button:** label it ("Your browser turns speech into text; in Chrome, Google does this") or remove it, so the "nothing leaves your phone" promise stays exactly true.
3. **The promise in the app:** put "Nothing you write ever leaves this phone" on the first screen?

## Tested
`docs/galactic/test/e2e-noai.cjs` (28 checks), covering:
- nothing planned or draft in Learn, worlds or AI Creation;
- one Continue when two chapters are started;
- the Week view's counts and its quote of your own words;
- noticing with evidence, "That's right" kept, "Not quite" hidden after a reload;
- a worksheet filled in, a row added, saved, printed with answers, listed in Journey and back after a reload;
- Delete everything removing it all;
- axe on each new screen.
