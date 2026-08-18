# Spec 03 — The Daily Loop

The MVP's actual product surface: morning plan, evening debrief, and — the
part neither brief covered — what happens when life interrupts. Closes
gap-analysis items A-1 (partially, via day-one value), A-2 (abandonment/
re-entry), A-4 (presence policy), and restores Part 1 §11–12.

## 1. Morning screen

One screen, five slots plus one question (Part 1 §11), generated from the
retrieval recipe in Spec 02 §5. Empty states are allowed — **a slot the model
can't fill well is left out, never padded with filler.** Three slots is a
good day; five mediocre suggestions is a failure.

| Slot | Source | Rules |
| --- | --- | --- |
| BUILD | Active campaign's current mission | The one next concrete action, ≤ 1 sentence. Never two builds. |
| TRAIN | Physical/practice commitment from campaign or established routine | Specific and sized ("45-minute run"), not "exercise". |
| LEARN | Campaign skill work or user's stated learning thread | Bounded ("15 pages", "one lesson"). |
| CONFRONT | Highest-confidence avoidance/fear assertion with a live trigger | Only from `probable`+ assertions. At most a few times per week — daily confrontation is grinding, not growth. Phrased as invitation, never accusation. |
| EXPERIENCE | Novelty generator (v1 of the Adventure Engine) | Small by default (different route, new place, talk to a stranger); bigger challenges only tied to campaign context or after streaks of sameness. |
| ONE QUESTION | Rotating, model-chosen | "What would make tonight feel like you actually lived today?" is the default; variants stay in that spirit. |

Interactions per slot: **done / skip / not today** (reschedules without
judgment) / **swap** (regenerate that slot once). All four are `ActionEvent`
records — skips are signal, not sin.

**Load guard (the Guardian, Part 1 §23, made deterministic):** the generator
receives the user's stated available time; total plan must fit it. If
yesterday's debrief flagged exhaustion or overload, today's plan shrinks
automatically (BUILD + one other slot, or rest-day mode). Sometimes the plan
*is* "rest, recover, go outside" — Part 2 §64 is implemented here, not just
admired.

## 2. Presence policy **[DECISION]**

Closes the unnamed tension between daily execution and §60's no-addiction
rule:

- Exactly **two** scheduled touchpoints: morning plan ready, evening debrief
  invitation — both at user-chosen times, both individually disableable.
- **No** streak-loss warnings, no "we miss you", no re-engagement campaigns,
  no badges, no unread-count nagging. Ever.
- One exception: a **weekly digest** for inactive users (opt-in at
  onboarding) that summarizes, never guilts ("your campaign is paused; it
  resumes whenever you do").
- Notifications contain the content (the plan's headline), so the value is in
  the notification itself, not a lure to open the app.

## 3. Evening debrief

Entry: "What happened?" — voice or text, natural speech, no form. Follow-up
questions: at most two, only when the model needs a load-bearing detail, and
only if the user hasn't signalled brevity.

**Extraction schema** (the structured output of the debrief pass; validated
by code — Spec 02 §4 step 2):

```
DebriefExtraction {
  record_id, date
  slot_outcomes: [{slot, status: done|partial|skipped|not_mentioned, note}]
  achievements: [text]
  emotions: [{label, context}]
  decisions: [{decision, status: made|avoided|pending}]
  confrontations: [{what, happened: yes|no|partial}]   // courage evidence feed
  relationships: [{person_ref, note}]                   // person_ref, not raw name (Spec 04 §4)
  energy: low|ok|high | unknown
  facet_tags: [facet_id]
  candidate_assertions: [{statement, kind, evidence: quote}]
  unresolved: [text]
  safety_flags: [...]                                   // Spec 04 §2, evaluated first
}
```

**The reply** (what the user sees) is Part 1 §12's shape, with confidence
rules from Spec 02 applied: demonstrated/discovered/progressed/neglected
lines cite today only; a "pattern detected" line may appear **only** from a
`probable`+ assertion — the nightly pass finds patterns, the debrief reply
doesn't invent them from one day. Closing line: tomorrow's single
highest-leverage move.

Debrief skipped? Nothing happens. No makeup prompts. Tomorrow's plan
generates from what's known, and after 3+ silent days the morning plan
carries one gentle line acknowledging the gap (see §4).

## 4. Re-entry (missed days, ghosted weeks, abandoned campaigns)

The product's honest bet: users will be inconsistent; the system's job is to
make coming back cheap. Deterministic tiers on days-since-last-activity:

| Gap | Behavior |
| --- | --- |
| 1–2 days | Nothing. Plans continue. No acknowledgment — noticing tiny gaps is surveillance, not care. |
| 3–13 days | Campaign auto-pauses (day counters freeze — a paused campaign can't "fail" in absentia). Next open: **Re-entry screen**, not a backlog: "Welcome back. Nothing is broken. Here's where you left off." One question — "continue, adjust, or fresh start?" — then a normal (slightly lighter) plan. Missed days are never listed. |
| 14+ days | Same, plus the model treats staleness seriously: assertions' decay clock (Spec 02 §2) has been running, and the re-entry conversation is allowed one honest question: "Did the campaign stop mattering, or did life get loud?" The answer is high-value evidence either way. |
| Explicit abandon | First-class action, no guilt flow. A short exit reflection is invited (skippable). The campaign closes as `abandoned` with whatever was learned; abandonment patterns across campaigns are exactly the kind of raw material Part 1 §20 describes ("addicted to beginnings") — but that read is only ever surfaced by a deep pass at `probable`+, with evidence, in Truth-Mode framing. |

**Rule: re-entry cost must be O(1), never O(days missed).** No backlog,
no stacked debriefs, no "catch up on 9 reflections."

## 5. Day-one value (onboarding compression)

Part 2 §51's seven days become seven **chapters**, self-paced. Default pacing
one/day, but a user may complete several in one sitting; each chapter is
10–15 focused minutes with a same-session payoff — a reflected-back insight
("here's what I heard underneath that"), not a progress bar. From chapter 1
the user already gets a lightweight daily plan (generic-but-sensible TRAIN /
LEARN / EXPERIENCE slots) so the core loop starts on day one; BUILD and
CONFRONT unlock as the model earns the context to fill them. The Future Self
reveal and 90-day campaign still land as the finale — presented explicitly as
a **first draft with a scheduled day-14 revision** (Spec 01 §6), which lowers
the stakes of the thin-data problem honestly instead of hiding it.
