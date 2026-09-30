# Brand registry

Every brand gets its own folder with its own `brand.md` and `MOTION.md`. **Brands never share a
visual language by default.** If two brands should share one, Bianno says so, and the
relationship is written here.

| Slug | Brand | What it is | System status | Relationship |
|---|---|---|---|---|
| `unifymind` | UnifyMind | Bianno's personal brand and book imprint (Self-Mastery series). Documents the yachting → AI journey. | **Static spec CONFIRMED** (from the `content-wave` skill). Motion is PROPOSED and needs a yes. | Parent brand for the books. |
| `becoming-project` | The Becoming Project | The public experiment of becoming the man he'd be proud to meet. | Philosophy CONFIRMED (from Bianno). Visuals: ASK ME. | ASK ME: a series inside UnifyMind, or a standalone brand? |
| `unifyops` | UnifyOps | AI automation for service businesses. Current product: AI front desk for clinics. | Nothing yet. Needs intake. | Separate. B2B: never mix with personal-brand aesthetics. |
| `dawnward` | Dawnward | A future-facing personal evolution operating system (app). | Philosophy CONFIRMED. Visuals: ASK ME. | ASK ME. The Empire plan defers the app behind four gates, and Bianno chose to include it here anyway (2026-09-30). |
| `wonderwilds` | WonderWilds | A character-driven world. | Nothing. Needs the character bible. | Separate. |

Not set up (add with the `brand-system` skill when needed): **Beach Girls** (Jacqueline's
retreats, Mallorca). It's her brand, so her references and her approval, not Bianno's.

## Adding a brand

1. `node <brand-system>/scripts/activate-brand.mjs --new <slug>` creates the folder from the templates.
2. Run intake (the `brand-system` skill) with about five real references.
3. Add a row above.
