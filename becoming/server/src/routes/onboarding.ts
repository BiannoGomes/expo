import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  DOMAIN_IDS,
  ONBOARDING_CHAPTER_COUNT,
  TAXONOMY_VERSION,
  chapterByIndex,
  type CandidateAssertion,
} from "@becoming/core";
import { query } from "../db.js";
import { intelligence } from "../intelligence/anthropic.js";
import { crisisResponse } from "../safety/crisis.js";
import { createHypothesis, linkEvidence } from "../model/integrate.js";
import { rebuildModelSummary } from "../model/summary.js";

interface OnboardingStateRow {
  chapter_index: number;
  messages: { role: "user" | "assistant"; text: string }[];
  horizon_year: number | null;
  completed_at: string | null;
}

async function loadState(userId: string): Promise<OnboardingStateRow> {
  const [row] = await query<OnboardingStateRow>(
    `insert into onboarding_state (user_id) values ($1)
     on conflict (user_id) do update set updated_at = now()
     returning chapter_index, messages, horizon_year, completed_at`,
    [userId],
  );
  if (!row) throw new Error("onboarding state unavailable");
  return row;
}

async function recentDistress(userId: string, hours: number): Promise<boolean> {
  const rows = await query(
    `select 1 from safety_events
      where user_id = $1 and created_at > now() - ($2 || ' hours')::interval
      limit 1`,
    [userId, String(hours)],
  );
  return rows.length > 0;
}

export function registerOnboardingRoutes(app: FastifyInstance) {
  app.get("/onboarding/:userId", async (request) => {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const state = await loadState(userId);
    const chapter = chapterByIndex(state.chapter_index);
    return {
      complete: Boolean(state.completed_at),
      chapterIndex: state.chapter_index,
      chapterCount: ONBOARDING_CHAPTER_COUNT,
      chapterTitle: chapter?.title ?? null,
      opening: state.messages.length === 0 ? (chapter?.opening ?? null) : null,
      messages: state.messages,
    };
  });

  app.post("/onboarding/:userId/message", async (request, reply) => {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const body = z.object({ text: z.string().min(1).max(8000) }).parse(request.body);

    // Safety triage before everything (spec 04 §2).
    const triage = await intelligence.triageSafety(body.text);
    if (triage.level === "crisis") {
      await query(
        "insert into safety_events (user_id, level) values ($1, 'crisis')",
        [userId],
      );
      return reply.send({ crisis: true, reply: crisisResponse(null) });
    }
    if (triage.level === "distress") {
      await query(
        "insert into safety_events (user_id, level) values ($1, 'distress')",
        [userId],
      );
    }

    const state = await loadState(userId);
    if (state.completed_at) {
      return reply.code(409).send({ error: "onboarding already complete" });
    }
    const chapter = chapterByIndex(state.chapter_index);
    if (!chapter) return reply.code(409).send({ error: "no active chapter" });

    const soften =
      triage.level === "distress" || (await recentDistress(userId, 36));

    const turn = await intelligence.onboardingTurn({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      aims: chapter.aims,
      history: state.messages,
      message: body.text,
      soften,
    });

    const messages = [
      ...state.messages,
      { role: "user" as const, text: body.text },
      { role: "assistant" as const, text: turn.reply },
    ];

    if (!turn.chapterComplete) {
      await query(
        "update onboarding_state set messages = $2, updated_at = now() where user_id = $1",
        [userId, JSON.stringify(messages)],
      );
      return { crisis: false, reply: turn.reply, chapterComplete: false };
    }

    // Chapter complete: transcript becomes an immutable record; candidates
    // become stated hypotheses citing it.
    const [record] = await query<{ id: string }>(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'onboarding_response', $2, now()) returning id`,
      [userId, JSON.stringify({ chapterId: chapter.id, messages })],
    );
    if (record) {
      try {
        const candidates = await intelligence.extractChapter({
          chapterId: chapter.id,
          transcript: messages.map((m) => `${m.role}: ${m.text}`).join("\n"),
        });
        for (const candidate of candidates) {
          await createHypothesis(
            userId, candidate, record.id, `onboarding:${chapter.id}`, "stated",
          );
        }
      } catch (err) {
        request.log.error({ err }, "chapter extraction failed; record kept");
      }
    }

    const nextIndex = state.chapter_index + 1;
    const finished = nextIndex >= ONBOARDING_CHAPTER_COUNT;

    await query(
      `update onboarding_state
          set chapter_index = $2, messages = '[]', updated_at = now()
        where user_id = $1`,
      [userId, nextIndex],
    );

    if (!finished) {
      const next = chapterByIndex(nextIndex);
      return {
        crisis: false,
        reply: turn.reply,
        chapterComplete: true,
        nextChapterTitle: next?.title,
        nextOpening: next?.opening,
      };
    }

    // The finale: synthesis (spec 03 §5) — Future Self, bottleneck, campaign.
    const reveal = await synthesize(userId);
    await query(
      "update onboarding_state set completed_at = now() where user_id = $1",
      [userId],
    );
    return {
      crisis: false,
      reply: turn.reply,
      chapterComplete: true,
      onboardingComplete: true,
      reveal,
    };
  });
}

async function synthesize(userId: string): Promise<string> {
  const stated = await query<{
    id: string; statement: string; kind: CandidateAssertion["kind"];
    facet_ids: string[]; domain_ids: string[];
  }>(
    `select id, statement, kind, facet_ids, domain_ids from assertions
      where user_id = $1 and status = 'active' and method like 'onboarding:%'`,
    [userId],
  );
  const covered = new Set(stated.flatMap((a) => a.domain_ids));
  const uncovered = DOMAIN_IDS.filter((d) => !covered.has(d));

  const [user] = await query<{ available_minutes_daily: number }>(
    "select available_minutes_daily from users where id = $1",
    [userId],
  );
  const [state] = await query<{ horizon_year: number | null }>(
    "select horizon_year from onboarding_state where user_id = $1",
    [userId],
  );

  const synthesis = await intelligence.synthesizeOnboarding({
    candidates: stated.map((a) => ({
      statement: a.statement,
      kind: a.kind,
      facetIds: a.facet_ids,
      evidence: "",
    })),
    uncoveredDomains: uncovered,
    horizonYear: state?.horizon_year ?? new Date().getFullYear() + 4,
    availableMinutesDaily: user?.available_minutes_daily ?? 90,
  });

  await query(
    `insert into future_selves (user_id, horizon_year, narrative)
     values ($1, $2, $3)`,
    [
      userId,
      state?.horizon_year ?? new Date().getFullYear() + 4,
      JSON.stringify({ domains: synthesis.futureSelf, gaps: synthesis.gaps }),
    ],
  );

  // The bottleneck is a hypothesis over onboarding records — never a fact
  // (spec 01 §6). It cites every chapter transcript.
  const [bottleneck] = await query<{ id: string }>(
    `insert into assertions
       (user_id, kind, statement, domain_ids, facet_ids, source, method,
        confidence, confidence_basis, taxonomy_version)
     values ($1, 'bottleneck', $2, $3, '{}', 'inferred', 'onboarding-synthesis',
             'hypothesis', $4, $5)
     returning id`,
    [
      userId,
      synthesis.bottleneck.statement,
      [synthesis.campaign.primaryDomain],
      `onboarding synthesis (${synthesis.bottleneck.classId}); thin data — revise at day 14. ${synthesis.bottleneck.basis}`,
      TAXONOMY_VERSION,
    ],
  );
  if (bottleneck) {
    const chapterRecords = await query<{ id: string }>(
      `select id from records where user_id = $1 and kind = 'onboarding_response'`,
      [userId],
    );
    for (const r of chapterRecords) await linkEvidence(bottleneck.id, r.id);
  }

  await query(
    `insert into campaigns
       (user_id, title, mission, why, primary_domain, secondary_domains,
        status, starts_on)
     values ($1, $2, $3, $4, $5, $6, 'active', current_date)`,
    [
      userId,
      synthesis.campaign.title,
      synthesis.campaign.mission,
      synthesis.campaign.why,
      synthesis.campaign.primaryDomain,
      synthesis.campaign.secondaryDomains,
    ],
  );

  await rebuildModelSummary(userId);
  return synthesis.reveal;
}
