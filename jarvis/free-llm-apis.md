# Free LLM API tiers — reference for the inbox classifier (27 Sep 2026)

> Source: cheahjs/free-llm-api-resources (verified real, 29.4K★, curated list — a README,
> not software). Captured because Bianno flagged it. ONE sanctioned use in this stack:
> a free-tier key to run the desktop inbox classifier (Capture→Classify slice,
> mental-models.md §2) at €0, every 15 min, so Claude capacity stays on strategy work.
> NOT sanctioned: routing Claude Code through third-party endpoints — commander-confirmed
> SKIP (oss-radar, 22 Sep council D-list). That verdict stands.

## Candidate providers (permanent free tiers)
| Provider | Why it fits the classifier | Limits |
|---|---|---|
| Groq | very fast small models (Llama-class), OpenAI-compatible API | UNKNOWN — verify at repo |
| Google AI Studio (Gemini) | generous free tier, good classification quality | UNKNOWN — verify at repo |
| OpenRouter :free models | many models behind one key | UNKNOWN — verify at repo |
| Cerebras / Mistral / NVIDIA NIM | backups if the above rate-limit | UNKNOWN — verify at repo |

Rule: real numbers or UNKNOWN. Cowork fills the limits column from the live README when
the classifier slice starts (it comes AFTER the Playwright slice per ARCHITECTURE.md).
Keys go in .env only — never in docs, db, or vault (secrets-001).

## What the classifier needs (for sizing)
~96 calls/day (every 15 min), tiny prompts (route one inbox item → {route, confidence,
tags} JSON). Any provider above covers this inside a free tier. Router tools, gateways,
and multi-provider proxies remain out of scope.
