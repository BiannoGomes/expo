# Spec 04 — Safety & Privacy Mechanisms

Turns Part 2 §48's principles into mechanisms. Closes gap-analysis items
C-10, C-11, C-12. Legal review is still required before launch — this spec
defines the engineering posture so counsel reviews a design, not a blank
page.

## 1. Scope of the problem

Life OS stores fears, relationship details, health behaviour, childhood
memories, and emotional state — much of it GDPR Article 9 special-category
data — and its signature features (Truth Mode, CONFRONT slot, bottleneck
diagnosis) deliberately apply psychological pressure. Safety is therefore
part of the core loop, not a wrapper.

## 2. Crisis detection and escalation

**Triage pass:** every free-text/audio input (onboarding, debriefs, Future
Self conversations) runs a cheap, fast classification *before* any other
processing (Spec 02 §4 step 1). Output is one of:

- `none` → normal pipeline.
- `distress` (acute stress, hopeless language, harmful-coping mentions
  below crisis level) → normal pipeline continues, but the responding pass is
  instructed to soften: no CONFRONT slot tomorrow, no Truth-Mode content, no
  challenge framing; acknowledge, reduce load (Spec 03 §1 load guard), and
  where a professional would plainly help, say so warmly.
- `crisis` (self-harm or suicide signal, harm to others, abuse disclosure,
  medical emergency) → the pipeline **stops**. A deterministic, hand-written
  (not generated) response template renders: acknowledgment + localized
  crisis resources (region-aware directory: 988 in the US, 112/116 123 in the
  EU, etc., maintained as versioned config) + explicit statement of what the
  app is not. No plan is generated that day. Truth Mode and CONFRONT lock for
  a cooldown period. The event is logged minimally (flag + timestamp, not
  content-extracted into assertions — a crisis is not "evidence").

**Standing rules (deterministic, in code):** the system never diagnoses;
never generates content in medical/clinical/medication, legal-advice, or
individual-security domains beyond "see a professional"; CONFRONT and
challenge features never target grief, trauma disclosures, or anything the
triage pass has flagged; physical challenges (TRAIN/EXPERIENCE) carry
conservative bounds and never escalate against reported pain/injury.
Truth-Mode-style contradiction content requires an explicit user opt-in at
onboarding ("do you want me to challenge you when I see contradictions?") and
respects a per-session "not now."

**Age gate:** 18+ at launch. **[DECISION]** The FAMILY tier (child spaces)
is deferred indefinitely — building identity models of minors is a distinct
product with distinct legal duties (GDPR-K, parental consent, child
development expertise); it does not ride along.

## 3. Consent and data-category model

Consent is granular, layered, and recorded (who/what/when/version):

| Category | Basis | Notes |
| --- | --- | --- |
| Account + billing | Contract | Ordinary. |
| Goals, campaigns, plans | Contract | The service itself. |
| Reflections, fears, emotional state, health behaviour | **Explicit consent** (Art. 9) | Separate, unbundled consent screen at onboarding, plain-language, revocable. Revocation stops the deep features and offers export. |
| Relationship/other-people data | Explicit consent + §4 rules | |
| Life Archive uploads | Explicit consent per category | Phase 3 feature; consent design ships with it. |

No advertising use, no sale, no cross-user training on personal content —
stated in the policy and honored in the architecture (single-tenant data
paths; aggregate/product analytics only on de-identified operational events,
never on reflection content). LLM vendor calls run under a data processing
agreement with no-training terms and minimum-necessary payloads (retrieval
recipes already enforce minimization).

## 4. Third parties in the user's data

People the user mentions get a `PersonRef` (user-assigned label, e.g. "my
father") rather than free-floating names in assertions; raw text stays only
in the immutable records the user controls. Rules: the system never builds
assertions *about* third parties — only about the user's experience of the
relationship ("you feel unheard by X", never "X is dismissive" as a fact);
never suggests contacting, monitoring, or gathering information about a
specific person; deleting a `PersonRef` cascades over every record and
assertion that references it. Uploaded media containing others (Life
Archive, Phase 3) will need its own consent framing before that feature
ships.

## 5. Data rights mechanics

- **Export:** self-serve, complete (records, assertions with provenance,
  campaigns), machine-readable JSON + human-readable HTML, within GDPR
  timelines (target: minutes, not days).
- **Deletion:** per-record and full-account, with the propagation semantics
  of Spec 02 §7. Vendor-side deletion bounded by the provider's stated
  retention window and documented in the policy.
- **Retention:** raw audio deleted after transcription (transcript is the
  record) **[DECISION]**; inactive accounts get a deletion-warning schedule
  (e.g. 24 months) rather than indefinite hoarding.
- **Security baseline:** encryption in transit and at rest, EU data
  residency for EU users **[DECISION]**, no personal content in logs or
  error reports, access controls + audit trail on any staff access, secrets
  management, and a written breach-response runbook before launch.

## 6. The "AI pressure" boundary

The product's edge — challenge, confrontation, trajectory projection — gets
explicit limits: Anti-Potential-style projections are framed as scenarios,
never predictions, and are never shown unprompted; the system never uses
shame, comparison to other users, or fear of loss as motivators; every
challenging feature has a visible off-switch; and the weekly deep pass
includes a self-check instruction — if engagement looks driven by anxiety
rather than value (compulsive checking, distressed reflections about the app
itself), the system *reduces* its own presence and says so. §60's "never
intentionally maximize dependency" made operational.
