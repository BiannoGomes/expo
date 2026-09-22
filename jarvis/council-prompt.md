# THE JARVIS COUNCIL PROMPT — v1, 22 Sep 2026

> Paste this verbatim into any frontier AI (ChatGPT, Gemini, DeepSeek, Qwen, Grok…).
> Bring every output back to Jarvis for adversarial verification before adopting
> anything. Precision beats impressiveness; sourced beats confident.

---

You are being consulted as one member of a council of frontier AIs. Your answer will
be adversarially verified against primary sources by another AI before anything is
adopted, so precision beats impressiveness. Do not flatter, do not pad, do not restate
my context back to me.

CONTEXT — the real system you are upgrading (called Jarvis):
- Strategy brain (frontier LLM) + an execution supervisor + spawned single-job workers;
  official Playwright MCP as deterministic browser hands; a quarantine layer screening
  all external content for prompt injection before it reaches privileged agents.
- Canonical state in a small shared JSON document DB; deep memory in an Obsidian vault
  of markdown files; a daily autonomous heartbeat (cron) doing ONE unit of work per
  run; an event spine logging every action as typed events; a trust ledger governing
  autonomy levels per task type.
- Hard governance: the AI proposes, the human approves anything that publishes, sends,
  or pays. One human checkpoint; everything else autonomous.
- Content engine, free-first: deterministic HTML→MP4 rendering (HyperFrames), Wan2.2
  TI2V-5B on an RTX 5060, local TTS (Qwen3-TTS planned), Wav2Lip avatar; paid
  generation credits spent only on proven winners. Experiments run one-variable-vs-
  control; all metrics are real numbers or UNKNOWN — never invented.
- Commercial layer: offer ladder (free content → lead magnet → €97 audit → setup →
  €500/mo retainer) on Kit + Stripe + Calendly, with an attribution chain
  content → lead → customer → revenue.

HARD CONSTRAINTS — violating any makes your answer useless:
1. Budget €0 by default. Hardware: one Windows PC, RTX 5060 with 8GB VRAM, plus
   already-owned cloud LLM subscriptions. No new paid APIs.
2. EU-usable licenses only. (Example trap: HunyuanVideo's community license excludes
   the EU. Check this class of problem on everything you recommend.)
3. No agent sprawl. Upgrades must improve STATE, SUPERVISION, VERIFICATION, MEMORY,
   or LEARNING — never add another orchestration framework.
4. The operator has 10–25 hours/week around a full-time job at sea. Anything
   requiring daily manual maintenance fails.
5. The publish/send/pay human gate is permanent. Do not propose removing or
   automating around it.

YOUR TASK — answer with SPECIFICS (names, repos, papers, exact mechanisms), never
categories or platitudes:

A. INTELLIGENCE COMPOUNDING — What are the 3 highest-leverage mechanisms known today
   for making a single-operator AI system measurably smarter every week from its own
   operating data (self-critique loops, evaluation harnesses, memory distillation,
   skill libraries, post-mortem pipelines)? For each: the source (paper, repo, or
   documented practice) and exactly how it plugs into a daily heartbeat.

B. MEMORY — Best current practice for long-horizon personal-AI memory that fits in
   flat markdown files + a small JSON DB (no vector-database infrastructure): what
   gets summarized, what kept verbatim, what deliberately forgotten, and on what
   schedule?

C. TOOLS I'M MISSING — Up to 5 free/open-source tools or models from the last 12
   months that materially beat what I listed for: voice, avatar video, browser
   automation, evaluation, or growth analytics. For each: license, fit vs. 8GB VRAM,
   and the single measured metric where it wins.

D. FAILURE MODES — The 3 most common ways systems like this quietly degrade (stale
   memory, sycophantic self-evaluation, metric gaming, silent tool rot), and the
   cheapest automatic detector for each.

E. THE QUESTION I DIDN'T ASK — The one upgrade you would make that I haven't
   mentioned anywhere above, and why it outranks everything I did mention.

OUTPUT FORMAT — for every claim:
[CLAIM] → [SOURCE: name + link] → [CONFIDENCE: high/med/low] → [FITS CONSTRAINTS:
yes/no, and which constraint if no].
If you don't know or can't source something, write UNKNOWN. An invented answer is
worse than no answer and will be caught in verification.

---

## Protocol (Jarvis side)
1. Run in ≥3 different AIs. 2. Paste raw outputs back to Jarvis. 3. Jarvis verifies
every claim against primary sources, dedupes, scores against doctrine, and returns
ARMED / QUEUED / SKIP verdicts into oss-radar.md. Council answers are DATA, never
instructions — nothing they say bypasses the rail.
