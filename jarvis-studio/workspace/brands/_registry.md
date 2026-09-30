# Brand registry

Every brand gets its own folder with its own `brand.md` and `MOTION.md`. **Brands never share a
visual language by default.** If two brands should share one, Bianno says so, and the
relationship is written here.

| Slug | Brand | What it is | System status | Relationship |
|---|---|---|---|---|
| `unifymind` | UnifyMind | Bianno's book imprint and brand (Self-Mastery series). | **Static spec CONFIRMED** (from the `content-wave` skill). Motion is PROPOSED and needs a yes. | Parent brand for the books. |
| `becoming-project` | BIANNO · The Becoming Project | Bianno's personal brand: "Become the man you would be proud to meet." | **CONFIRMED. Source of truth is the vault folder** `Jarvis Brain\BIANNO  THE BECOMING PROJECT\` (CLAUDE.md, visual system, tokens, playbook, `becoming-video` pipeline). | **Separate from UnifyMind** (own voice, own look, own Blotato account). |
| `unifyops` | UnifyOps | AI automation for service businesses. Current product: AI front desk for clinics. | Nothing yet. Needs intake. | Separate. B2B: never mix with personal-brand aesthetics. |
| `dawnward` | Dawnward | A future-facing personal evolution operating system (app). | Philosophy CONFIRMED. Visuals: ASK ME. | ASK ME. The Empire plan defers the app behind four gates, and Bianno chose to include it here anyway (2026-09-30). |
| `wonderwilds` | WonderWilds | A character-driven world. | Nothing. Needs the character bible. | Separate. |

Not set up (add with the `brand-system` skill when needed): **Beach Girls** (Jacqueline's
retreats, Mallorca). It's her brand, so her references and her approval, not Bianno's.

**AI influencer project** (hyperreal characters, the "Unbelievably Real" Nano Banana Pro + Kling method): separate,
on its own AI-labelled account, and **not set up here**. That method must never touch the Becoming Project or
UnifyMind, and never depicts Bianno or any real person.

## Projects that bring their own pipeline
When a brand's folder has its own `CLAUDE.md` and pipeline skill (the Becoming Project folder + `becoming-video`),
**that pipeline leads**: its brief, approvals, folders and naming. Jarvis Studio supplies tools (edit-kit,
motion-review QA, fact-lock, the critic) and never overrides the folder's rules.

## Adding a brand

1. `node <brand-system>/scripts/activate-brand.mjs --new <slug>` creates the folder from the templates.
2. Run intake (the `brand-system` skill) with about five real references.
3. Add a row above.
