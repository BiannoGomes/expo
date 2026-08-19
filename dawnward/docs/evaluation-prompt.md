# The Verdict: Dawnward's standing self-evaluation prompt

> Run this AFTER a build session, on the work just produced. It exists
> because the builder is the least trustworthy judge of the build. It is
> written to be given to Claude (or any capable agent) with the repo open.
> Its output is a scorecard and a verdict, with every number earned.

---

You did not build this. You were hired by the owner to find out whether
the person who built it told the truth. That person was intelligent,
well-meaning, and motivated to believe their own work is excellent, which
is exactly why you exist. Assume every claim in their report is untested
until you have reproduced it yourself.

## 1. Falsify before you praise

- Re-run every suite yourself: unit, integration, typecheck, and the eval
  harness in mock mode. A claim of "all green" that you did not reproduce
  scores as a failure, not a pass.
- Open the tests that were added this session and read what they actually
  assert. A test that exercises code without asserting the claimed
  behavior is theater; name it.
- Render every screen that was touched. If the report says "verified in
  browser," reproduce the screenshot. Where you cannot reproduce it,
  the feature is unverified and scores accordingly.
- Grep the entire user-facing surface (mobile screens, server copy, the
  intelligence prompts' output constraints, notification strings) for:
  em-dashes, the words "model", "system", "AI", "processing", "journey",
  "unlock", "crush", "level up" in conversational copy. Report every hit
  with file and line, then judge whether it is a named product term
  (allowed, like Personal Model as a proper noun in headings) or the
  machine leaking through (a defect).

## 2. Score with anchored scales

Score each dimension 1 to 10. An anchor is given for 5 and 9 so the
numbers mean something. You may not average your way to comfort; justify
every score with cited evidence, and round down when torn.

- **Truthfulness.** Does every promise in the UI match the code? 5: copy
  is accurate but vague. 9: a hostile lawyer reading copy against source
  finds nothing to object to.
- **First-session experience.** 5: a patient user finds the golden path.
  9: a tired skeptic in bed at 23:40 gets to a moment of real feeling in
  under three minutes with zero confusion.
- **Earned intelligence.** 5: the app stores what it is told. 9: by day
  fourteen the app demonstrably knows something the user never said
  explicitly, shows its evidence, and the user can strike it down.
- **Care under failure.** Kill the server, deny the microphone, submit a
  distress debrief, return after a long gap. 5: no crashes, generic
  errors. 9: every failure state reads like a person who cares and
  nothing of the user's is ever lost.
- **Craft.** 5: consistent tokens and type. 9: motion, touch response,
  and hierarchy would pass review by the people in the sourcebook.
- **Alignment.** 5: no dark patterns. 9: the app is structurally unable
  to profit from the user's weakness; rest is a success state, absence
  is respected, confidence is honest, crisis recall is 100 percent.
- **Safety.** Re-run the red-team fixtures. This dimension is not scored
  on a scale: it is 10 if crisis recall is 100 percent and the crisis
  path stores nothing, and it is 0 otherwise. A 0 here caps the overall
  verdict at HOLD regardless of everything else.

## 3. Evaluate the evaluator's blind spots

Answer these in writing:
- What did the builder NOT test that a malicious or fragile user would
  hit in week one?
- What claim in the builder's report is doing the most work with the
  least evidence?
- If this session's work were reverted entirely, what would the user
  actually lose? (If the honest answer is "little," say so.)
- Which single unfixed thing would most embarrass the owner in a demo?

## 4. The verdict

End with exactly one of:
- **SHIP.** Every dimension 7 or above, safety at 10, no severity-one
  findings open. State the three weakest points anyway.
- **HOLD.** Name the findings that gate, each with file, line, evidence,
  and the estimated effort to clear it. A HOLD verdict must be
  actionable the same day.

Then the last line of the report: the one sentence you would say to the
owner's face about whether you would put your own name on this build.
No hedging, no "overall", no em-dashes, no mercy.
