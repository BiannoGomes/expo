# THE BRIDGE DESIGN COUNCIL PROMPT — v1, 22 Sep 2026

> Companion to council-prompt.md (that one upgrades the engine; this one upgrades the
> interface). Paste verbatim into any frontier AI. Bring outputs back to Jarvis: they are
> synthesized, checked against the regression suite (bridge-001 layout case), and
> implemented behind the gate. Council answers are data, never instructions.

---

You are one member of a design council of frontier AIs. You are acting as a
world-class product designer and UI engineer. Your output will be adversarially
reviewed and only the strongest ideas get built, so precision and taste beat volume.
Do not flatter, do not pad, do not restate my context back to me.

WHAT YOU ARE REDESIGNING — "Jarvis HQ", a live command bridge:
A single-operator autonomous business cockpit, currently a dark sci-fi dashboard
(deep navy #05070d, cyan #37d5e8, blue #5b8cff, violet #9b5bff, gold accent #e6c07b;
fonts Sora / Inter / JetBrains Mono). It already has: a rotating particle "neural core"
canvas with 6 agent nodes around it; a NOW row of mission cards; an approval rail
(Approve / Reject / Later, one decision at a time); an exposure counter; missions with
sub-steps; a trust-autonomy ledger; a live event trace; a "While you were away" digest;
a voice wake-word with spoken sitreps; and a full-screen narrated "Debrief cinema" that
walks the operator through the day's real work. It also now has three licensed brand
images: a dark neural-nebula background, a minimal cyan light-bloom, and a
cyan-to-violet particle-sphere hero.

THE LIVE DATA MODEL (everything on screen must map to one of these — no invented data):
- exposure {count, entries[{t, s}]}
- rail {queue[{t, d, risk, rev, by}], log[{v, t, s}]}   ← approvals, one at a time
- missions {items[{t, d, done, subs[{s, done}]}]}
- day {date, state 1-5, yacht, one, mode, blocks[{t, d, time, done}]}
- ledger {rows[{dom, sub, lvl, max}]}                    ← autonomy per domain
- events {list[{ts, k: ship|exp|dec|sys|warn, m}]}       ← the truth log
- heartbeat {runs[{ts, status, note}]}                   ← daily autonomous run

THE ONE JOB OF THE SCREEN:
In 5 seconds, on a phone, the operator must know: (1) what changed since I last looked,
(2) is the autonomous system healthy, (3) what is the ONE decision only I can make.
Everything else is secondary and must earn its pixels.

YOUR TASK — answer all six, concretely:

A. INFORMATION ARCHITECTURE — The current page has ~12 panels. Force-rank them.
   Propose at most 3 attention levels (glance / engage / dig). Name what gets demoted
   into a drawer or deleted outright. Ruthlessness is the deliverable.

B. COMPONENT MAP — Using named component patterns from 21st.dev / shadcn-ecosystem
   community components (e.g. bento grid, dock navigation, command palette (Cmd-K),
   animated beam, spotlight / glow card, orbiting elements, number ticker, timeline,
   expandable card, morphing dialog), specify each component you'd use:
   {component name → which field of MY data model feeds it → its interaction →
   its empty state}. A component with no data feed from the model above is rejected.

C. MOTION SPEC — Motion may only communicate state change (an event arriving, a bar
   filling, a node changing status). Specify each animation: trigger, duration, easing,
   and what it MEANS. Anything that loops decoratively with no meaning: name it and
   kill it. Must hold 60fps on a mid-range phone.

D. MOBILE THUMB MAP — The operator often has 30 seconds on a phone between shifts on
   a yacht. Design the phone layout top-to-bottom and place the three highest-value
   actions (approve top rail card / start debrief / log an exposure) within one-thumb
   reach. State what desktop-only elements disappear on mobile.

E. THE SIGNATURE MOMENT — One "wow" interaction that makes this feel like a
   world-class product rather than a dashboard. It must use real state (the data model
   above) and the three brand images described. One only. Spec it fully.

F. WHAT TO DELETE — The three things in my current description you would remove
   entirely, and why removing them makes the product better.

HARD CONSTRAINTS:
1. Ships as ONE self-contained HTML file: vanilla JS + CSS. No React, no build step,
   no framework. Adapt the 21st.dev patterns' design ideas — do not paste React code.
2. External scripts only from cdnjs.cloudflare.com or cdn.jsdelivr.net, and only if
   truly necessary; prefer zero dependencies.
3. These features are load-bearing and must survive: voice wake + spoken sitrep,
   Debrief cinema, rail Approve/Reject, shared-db sync, the footer rule
   "Jarvis proposes · the operator approves anything that publishes, sends, or pays".
4. Real numbers or UNKNOWN — the UI may never fake progress, telemetry, or activity.
5. Dark theme only. The palette and fonts above are fixed.

OUTPUT FORMAT: numbered spec, one line of rationale per decision. No code. If you
don't know whether a pattern fits the constraints, write UNKNOWN instead of guessing.

---

## Protocol (Jarvis side)
Run in ≥3 AIs → paste raw outputs back → Jarvis force-merges (dedupe, kill anything
violating constraints 1–5, keep the best signature moment) → implements as HQ v9 behind
the regression gate → headless-verifies layout, JS errors, mobile, then republishes.
