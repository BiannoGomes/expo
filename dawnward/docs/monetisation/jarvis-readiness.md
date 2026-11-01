# Jarvis: commercial readiness assessment (2026-11-01)

**Source:** a read-only audit of the private repo `BiannoGomes/jarvis` at `c32b3d4` (1 Nov 2026), 2,110 files. Nothing in that repo was changed.

Labels:

| Label | Meaning |
|---|---|
| **V** (verified) | Checked in the code |
| **I** (inferred) | Reasoned from the code, not run |
| **U** (untested) | Not tried |

## Verdict
**Jarvis is not a product yet, so it can't be sold as one.** (V) It's a personal operating system built around one person: a Claude Code repo of doctrine documents, about 50 skills, scheduled cloud Routines, an HQ web page and the Orb artifact on claude.ai.

The desktop Jarvis people would buy, the one that is installed, has a full-screen face, hears you and acts on your computer, is a **plan** (`jarvis/DESKTOP-JARVIS.md`). Its only code is a speech script (`jarvis/desktop/jarvis_say.py`). (V)

There *is* something sellable inside it, but it's smaller. See the recommended minimum sellable version below.

## What exists
| Part | State | Sellable as is? | |
|---|---|---|---|
| Doctrine (GODMODE, Guardian, evals, learning loop) | Real, tested, the best idea in the repo: "Jarvis proposes, you approve anything that sends, publishes or pays". Guardian is a PreToolUse hook with tests | Yes, as a pattern. It needs generalising away from Bianno | V |
| Skills (~50 in `.claude/skills`) | Many are good. **5 are adapted from Mindvalley's paid course** (meeting-intelligence, goal-accountability-coach, business-brain-builder, mcp-connector-guide, skill-forge). Others are vendored MIT tools (85 licence files kept) | Mindvalley-derived: **no**, not ours to sell. MIT ones: only with notices, and only where our own work adds value | V |
| Roast Room council | 7 agents speak as real people (Bezos, Buffett, Gary Vee, Graham, Hormozi, Martell, Wickman) | **No.** Selling impersonations of real people is a legal and trust risk | V |
| HQ (`jarvis-hq.html`) + Orb artifact | Personal dashboards wired to Bianno's own Gmail, Calendar, Blotato and Routines | Not as is: hard-wired to one person's accounts | V |
| Demo Factory | 50 code files with tests: website demos for businesses with no site | Closest to standalone. But it's a service tool for Bianno's sales, not a customer app | V |
| Content radar, video and sound kits | Stdlib and pinned tools with tests | Possibly, as small utilities | I |
| Hermes (NousResearch agent) | A third-party agent with a hardened config. Bianno's work is the config | Can't resell Hermes. A config guide at most | V |
| Personal data | **203 files contain email addresses**: prospects, sends, logs and backups. No API keys found (checked by pattern) | **Blocker:** a product build must start from a clean template, never from this repo | V |

**What the brief asked about:**
- **Install:** none exists. Today you need Claude Code, Python and the repo cloned. A non-technical customer couldn't set it up. (V)
- **Operating systems:** in practice, Bianno's Windows laptop plus the cloud. Nothing has been tested on a clean machine. (U)
- **Credentials:** keys go in a `.env` file that git ignores (V). A product would need the operating system's secure storage. (I)
- **Updates, crash recovery, diagnostics, uninstall:** none. (V)
- **Tests:** regression cases plus about 25 guard tests, all about Bianno's own setup, not a customer's. (V)
- **Running costs:** they depend on each customer's Claude plan and third-party keys (Fish, ElevenLabs, OpenRouter). Unknown per customer. (U)

## Recommended minimum sellable version: "Jarvis Lite for Claude Code" (I)
A **clean, installable starter kit** that turns a customer's own Claude Code into a safe personal assistant. It runs on the customer's own Claude subscription, so there are **no running costs to us**, and a one-time licence makes sense.

**What it contains (3 to 5 abilities that can be checked on a clean machine):**

| # | Ability | What it does |
|---|---|---|
| 1 | Guardian | Asks before anything that sends, publishes, pays or deletes. Built from our own hook and tests |
| 2 | Morning brief | Calendar plus today's priorities, from the customer's own connectors |
| 3 | Project planner | Goal → 90-day plan → weekly review. This links straight to Dawnward's Life-to-Action |
| 4 | Weekly review | What happened, what's next, with a log kept in the customer's repo |
| 5 | (optional) Second brain | Notes kept in plain files they own |

**The rest of the kit:**
- An installer (one command or a small app) that checks the requirements, writes a fresh repo with **no data of Bianno's**, and uninstalls cleanly.
- Onboarding in five minutes.
- A plain list of what it needs: a Claude plan and Claude Code. Nothing else at first.

**Not in it:**
- the Mindvalley-derived skills;
- the persona council;
- Hermes;
- the Sofia, UnifyOps and cold-email machinery;
- desktop computer-control.

**Why this first:** it can pass the release gates within weeks, not months, and it proves people pay for "Jarvis" before the desktop face is built.

## AI Creation marketplace specification (Dawnward side)

**Three layers:**
1. **Dawnward Universe:** growth.
2. **AI Creation galaxy:** discovery, demo and purchase.
3. **Installed software:** runs on its own, outside Dawnward.

**Galaxy access:**
- AI Creation is **visible to everyone**.
- The free creative mission introduces it.
- **Buying never depends on progress, and progress never comes from buying.**

**Each product page has:**
- what it does, in one line;
- a **real demo recording** of the shipped version;
- **what's needed** (operating systems tested, Claude plan required, other paid accounts);
- what's included, the version and changelog;
- the price, with running costs stated;
- the refund terms;
- support.

**The flows:**
- **Purchase:** product page → checkout (the provider's hosted page) → licence recorded to the account (the existing `entitlements` table plus a new `purchases` table) → Owned → download (signed, time-limited link) → install guide → licence activation (a key checked by the installer).
- **Updates:** Owned shows the latest version and a "What's new" note.
- **States:** every product shows one of not owned, checkout, owned, update available, refunded.
- **Accessibility:** the same rules as the rest of Dawnward: one primary action, accessible states, no fake urgency.

## Pricing and cost model (hypotheses)
| Offer | Model | Test price | Our running cost |
|---|---|---|---|
| Jarvis Lite for Claude Code | One-time licence, 12 months of updates | €49–€79 | Hosting the download and support only. Claude usage is the customer's own |
| Small utility (later) | One-time | €19–€49 | Same |
| Jarvis desktop (later) | Licence €149–€299; Pro subscription only if we run cloud services | — | Unknown until built |

**Support cost:** this is the real cost. Budget time for the first 20 customers' installs (U).

**Selling from the native apps:** this triggers Apple and Google's rules for digital goods. Sell on the web first.

## Release gates (all must pass before anything is for sale)
1. **Clean machines:** install, use and uninstall on fresh Windows 11 and macOS. Recorded.
2. **Each ability works:** an end-to-end test for every ability, run on those machines.
3. **Security review:** no data of Bianno's, no keys, Guardian on by default, prompt-injection rules.
4. **Licences:** our code only; MIT pieces keep their notices; nothing Mindvalley-derived; no personas of real people.
5. **Resources:** disk and memory measured.
6. **Onboarding:** 2 or 3 people who aren't Bianno install it unaided.
7. **Practicalities:** recovery, refund terms, support channel, update plan.
8. **Approvals:** Bianno's approval for payment, publishing and spending.

## Roadmap
| Phase | What | Gate |
|---|---|---|
| 0 | Decide: Jarvis Lite first? Checkout provider? Email sign-in? | Bianno |
| 1 | Clean template repo `jarvis-lite` (new, private): Guardian + 4 skills + installer + tests | Clean-machine tests pass |
| 2 | 3 to 5 private testers install it; fix what breaks | Onboarding passes |
| 3 | AI Creation product page + Owned library in Dawnward. Checkout in test mode only | Purchase tests in test mode |
| 4 | Licences and security review, refund and support terms | All gates pass |
| 5 | Soft launch to Bianno's audience (the 50 → 10 → 3 test) | Approval to sell |
| 6 | Only then: the desktop face (the Orb as an app), voice, computer use | Its own gates |

## Approvals needed
1. Make **Jarvis Lite for Claude Code** the first product, built in a **new private repo**, so the personal repo is never shipped.
2. Choose a checkout provider, sell on the web first, and add email sign-in so purchases can be recovered.
3. Find 3 to 5 test installers who aren't you.
4. Confirm: no Mindvalley-derived skills and no persona council in anything sold.
