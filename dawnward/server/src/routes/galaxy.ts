import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { effectiveConfidence, notExcluded, stillSupported } from "../model/exclusions.js";
import { requireAuth } from "../auth.js";

/**
 * The Memory Galaxy: one presentation-free data contract shared by the
 * accessible list, the phone constellation and the WebXR view.
 *
 * - A star is a real reflection the person saved, never decoration.
 * - A theme is an active belief resting on two or more of those evenings.
 * - A link joins two evenings of the same theme, in date order, and always
 *   carries the theme that explains it. Nothing is linked without a reason.
 * Left-out evenings and beliefs resting only on them never appear.
 */

/** Kept in step with apps/mobile/lib/universe.tsx. */
export const WORLD_DOMAINS: Record<string, string[]> = {
  mind: ["mental", "career", "creativity", "wealth"],
  body: ["physical", "adventure"],
  soul: ["meaning", "emotional", "character", "relationships"],
  future: ["legacy", "environment"],
  // Spirit (added 2026-10-31) has no taxonomy domain yet: it holds the evenings
  // a person places there themselves, and nothing is sorted into it for them.
  spirit: [],
};

const EXCERPT = 160;

/** Whole words, at most EXCERPT characters, marked when shortened. */
export function excerpt(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= EXCERPT) return clean;
  const cut = clean.slice(0, EXCERPT);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : EXCERPT).replace(/[,;:.!?]$/, "")}…`;
}

/** "Seen in 7 of your evenings, across 4 days." Plain, countable, true. */
export function seenIn(evenings: number, days: number): string {
  if (evenings <= 1) return "Seen in one of your evenings so far.";
  return `Seen in ${evenings} of your evenings, across ${days} ${days === 1 ? "day" : "days"}.`;
}

export function registerGalaxyRoutes(app: FastifyInstance) {
  app.get("/galaxy", { onRequest: requireAuth }, async (request) => {
    const { world } = z
      .object({ world: z.enum(["all", "mind", "body", "soul", "spirit", "future"]).default("all") })
      .parse(request.query);
    const userId = request.userId;
    const domains = world === "all" ? null : WORLD_DOMAINS[world]!;

    const themeRows = await query<{
      id: string;
      statement: string;
      kind: string;
      confidence: string;
      confidence_basis: string;
      domain_ids: string[];
      evidence: string;
      record_ids: string[];
    }>(
      `select a.id, a.statement, a.kind, ${effectiveConfidence("a")} as confidence, a.confidence_basis, a.domain_ids,
              count(e.record_id) as evidence,
              array_agg(e.record_id::text order by r.occurred_at) as record_ids
         from assertions a
         join assertion_evidence e on e.assertion_id = a.id
         join records r on r.id = e.record_id and r.kind = 'reflection'
        where a.user_id = $1 and a.status = 'active'
          and ${stillSupported("a")}
          and ${notExcluded("e.record_id")}
          and ($2::text[] is null or a.domain_ids && $2::text[])
        group by a.id, a.source, a.confidence`,
      [userId, domains],
    );

    const starRows = await query<{
      id: string;
      occurred_at: Date;
      payload: { date?: string; transcript?: string; world?: string };
      facet_tags: string[] | null;
    }>(
      `select r.id, r.occurred_at, r.payload,
              (select x.payload->'facetTags' from records x
                where x.user_id = r.user_id and x.kind = 'action_event'
                  and x.payload->>'extractionOf' = r.id::text
                order by x.occurred_at desc
                limit 1) as facet_tags
         from records r
        where r.user_id = $1 and r.kind = 'reflection' and ${notExcluded("r.id")}
        order by r.occurred_at desc
        limit 240`,
      [userId],
    );

    const themed = new Map<string, string[]>();
    for (const t of themeRows) {
      for (const id of t.record_ids) themed.set(id, [...(themed.get(id) ?? []), t.id]);
    }
    const inWorld = (tags: string[] | null, id: string, placedIn?: string) =>
      !domains ||
      placedIn === world ||
      themed.has(id) ||
      (tags ?? []).some((f) => domains.includes(f.split("/")[0] ?? ""));

    const stars = starRows
      .filter((s) => typeof s.payload.transcript === "string" && inWorld(s.facet_tags, s.id, s.payload.world))
      .map((s) => ({
        id: s.id,
        date: s.payload.date ?? s.occurred_at.toISOString().slice(0, 10),
        excerpt: excerpt(s.payload.transcript!),
        themeIds: themed.get(s.id) ?? [],
      }))
      .reverse(); // oldest first: the galaxy reads like a life, left to right

    const visible = new Set(stars.map((s) => s.id));
    const dateOf = new Map(stars.map((s) => [s.id, s.date]));
    const themes = themeRows
      .map((t) => {
        const starIds = t.record_ids.filter((id) => visible.has(id));
        return {
          id: t.id,
          statement: t.statement,
          kind: t.kind,
          confidence: t.confidence,
          // Said from what is on screen, not from a note written when the
          // belief was first made: the count always matches the evenings shown.
          why: seenIn(starIds.length, new Set(starIds.map((id) => dateOf.get(id))).size),
          domainIds: t.domain_ids,
          starIds,
          // One evening is a guess in the making, not a pattern.
          forming: starIds.length < 2 || t.confidence === "hypothesis",
        };
      })
      .filter((t) => t.starIds.length > 0)
      .sort((a, b) => b.starIds.length - a.starIds.length);

    const links = themes.flatMap((t) =>
      t.starIds.length < 2
        ? []
        : t.starIds.slice(1).map((to, i) => ({ from: t.starIds[i]!, to, themeId: t.id })),
    );

    return { world, stars, themes, links };
  });
}
