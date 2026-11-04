# Dawnward: your to-do list (only the things that need you)

**Status, 1 Nov 2026:** everything that can be built and tested without your accounts is done and passing:
- 16 browser suites, 840 checks;
- 56 server tests;
- 65 integration tests against a real Postgres;
- all 11 database migrations;
- a typecheck of the server and the core package;
- the server starting and answering `/health`.

> **Update, 4 Nov 2026: no AI.** Dawnward now runs entirely on the phone (see `docs/blueprint/2026-11-04-without-ai.md`). **Steps 1–3 below (Anthropic key, ElevenLabs, Railway) are not needed now.** Keep them for later, only if you ever add optional backup between devices. **What matters now is step 4 (the site, already live on Cloudflare) and step 6 (testers).**

What's left needs your logins. Do them in this order. Keys go **only** into the places named below, never into chat or the repo.

---

## 1. Anthropic API key (5 min): the "intelligence" that reads reflections
1. Go to **console.anthropic.com** → API Keys → Create key. Name it `dawnward`.
2. Add a little credit: €5 to €10 is plenty for testing.
3. Keep the key handy for step 3 (Railway).

Without it, the server uses a safe stand-in ("mock") that gives simple replies.

## 2. ElevenLabs API key (5 min, optional): speaking instead of typing
1. Go to **elevenlabs.io** → Profile → API Keys → Create.
2. Keep it for step 3.

Without it, the Speak button falls back gently and typing still works.

## 3. Railway: put the server and database online (15 min)
1. Go to **railway.com** and sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → `BiannoGomes/expo`.
3. In the new service: **Settings**
   - **Root Directory:** `dawnward`
   - **Branch:** `claude/becoming-product-brief-45v3ua`. Use `main` instead once this branch is merged.
   - Railway reads `dawnward/railway.json`. It runs the database migrations, starts the server and checks `/health` by itself.
4. In the project: **+ New → Database → PostgreSQL**. Pick an **EU region** for the database and the server; your privacy plan says EU.
5. In the server service: **Variables**, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway fills it in) |
| `ANTHROPIC_API_KEY` | your key from step 1 |
| `ELEVENLABS_API_KEY` | your key from step 2 (optional) |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | the web address from step 4, e.g. `https://dawnward.pages.dev` |

6. **Settings → Networking → Generate Domain.** Open `https://<that domain>/health`. It should say `{"ok":true}`.
7. Optional, the nightly and weekly jobs: add two **Cron** services from the same repo, with start commands `npm run nightly -w server` (daily, e.g. `0 3 * * *`) and `npm run weekly -w server` (e.g. `0 4 * * 1`), and the same variables.

This was tested here as the same commands against a local Postgres, not on Railway itself. If a step looks different on Railway, send me a screenshot.

## 4. Put the web experience online (10 min, free)
The web app is just files, in `dawnward/experience/dist` after `node build.mjs`. The easiest host:
1. **Cloudflare Pages** (pages.cloudflare.com) → Create → **Direct upload**.
2. Drag in the `dist` folder. Or connect the repo with: build command `cd dawnward/experience && npm ci && node build.mjs`, output `dawnward/experience/dist`.
3. Copy the address it gives you into `CORS_ORIGINS` on Railway (step 3.5).

The web app works on its own, with everything kept on the device. The server is only needed for accounts and the AI replies.

*(Before, publishing a public page was blocked here until you said yes. This step is you doing it.)*

## 5. The phone app (when you're ready)
1. Get an **Expo account** (expo.dev) and an **Apple Developer account** (€99 a year) for TestFlight.
2. Set `EXPO_PUBLIC_API_URL` to your Railway address (step 3.6) in the EAS build settings.
3. Run `npx eas build -p ios` from `dawnward/apps/mobile`. I can walk you through it on your computer.

## 6. Before real users
- [ ] Someone to **review the draft content**: the Knowledge lessons, Wisdom Library sources and the extra questions. Everything is marked draft in the app. List: `docs/monetisation/ai-creation-plan.md` §9.
- [ ] **Try it on your phone**, and watch 2 or 3 friends use it without help.
- [ ] Privacy page and terms (`docs/launch-checklist.md` has the details).

---

**Not on this list on purpose:** payments and selling (paused, your call), Jarvis Lite (paused), new galaxies.
The longer original checklist with the reasoning behind each step is `docs/launch-checklist.md`.
