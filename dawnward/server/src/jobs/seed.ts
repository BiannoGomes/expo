import { buildApp } from "../index.js";
import { pool, query } from "../db.js";
import { runNightly } from "./nightly.js";
import { runWeekly } from "./weekly.js";

/**
 * Demo seed (roadmap D2): one command builds a lived-in user so any screen
 * can be shown with a real month of life behind it. Prints the device token;
 * put it in the app (or a browser's localStorage as "dawnward.token") and
 * every surface lights up: plan, campaign, constellation, promotion,
 * day-14 reveal. Run with MOCK_INTELLIGENCE=1 unless you want to spend
 * real tokens. Never point this at a production database.
 */
async function seed() {
  const app = buildApp();

  const auth = await app.inject({
    method: "POST",
    url: "/auth/device",
    payload: { deviceName: "demo-seed" },
  });
  const { token, userId } = auth.json() as { token: string; userId: string };
  const headers = { authorization: `Bearer ${token}` };

  await app.inject({
    method: "POST",
    url: "/consent",
    headers,
    payload: { reflections: true, challengeOptIn: true },
  });

  const answers = [
    "[done] People say I light up rooms and then vanish from them. Builder, restless, loyal.",
    "[done] Leaving home at nineteen shaped everything. So did the first failed company.",
    "[done] I want a business that funds a life of real adventures, not a desk that owns me.",
    "[done] I'm afraid of choosing the small safe life and calling it patience.",
    "[done] Extraordinary means my kids seeing me attempt hard things, win or lose.",
    "[done] The doom-scrolling has to go. And saying yes to every new idea.",
    "[done] Ready to meet them.",
  ];
  for (const text of answers) {
    await app.inject({
      method: "POST",
      url: "/onboarding/message",
      headers,
      payload: { text },
    });
  }

  // A short stretch of real days: debriefs, then a backdated second day so
  // the nightly pass has something honest to promote.
  await app.inject({
    method: "POST",
    url: "/debrief",
    headers,
    payload: {
      date: new Date().toISOString().slice(0, 10),
      transcript: "Deep work happened before anyone woke up. I kept the promise to myself.",
    },
  });
  const [reflection] = await query<{ id: string }>(
    `insert into records (user_id, kind, payload, occurred_at)
     values ($1, 'reflection', '{"transcript":"Day two. Kept it again, even tired."}', now() - interval '1 day')
     returning id`,
    [userId],
  );
  await query(
    `insert into records (user_id, kind, payload, occurred_at)
     values ($1, 'action_event', $2, now() - interval '1 day')`,
    [
      userId,
      JSON.stringify({
        extractionOf: reflection?.id,
        achievements: [],
        energy: "ok",
        facetTags: ["character/discipline"],
        candidateAssertions: [
          {
            statement: "You keep commitments you write down.",
            kind: "pattern",
            facetIds: ["character/discipline"],
            evidence: "Kept it again, even tired.",
          },
        ],
      }),
    ],
  );

  // Enough scattered moments that the constellation reads as a sky.
  for (let day = 2; day <= 16; day++) {
    await query(
      `insert into records (user_id, kind, payload, occurred_at)
       values ($1, 'evidence', $2, now() - ($3 || ' days')::interval)`,
      [
        userId,
        JSON.stringify({ description: `demo moment ${day}` }),
        String(day),
      ],
    );
  }

  await query("update campaigns set starts_on = current_date - 15 where user_id = $1", [userId]);
  await runNightly();
  await runNightly();
  await runWeekly();

  await app.close();
  await pool.end();
  console.log("demo user ready");
  console.log(`userId: ${userId}`);
  console.log(`token:  ${token}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
