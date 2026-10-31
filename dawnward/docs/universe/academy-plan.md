# The Transformation Academy: audit and proposed plan

**Status:** proposal accepted in part. Decisions A1 and A2 made by Bianno on 2026-10-31 (below), and chapters 1 and 2 of Beyond Overthinking are drafted. It answers "Begin with a read-only audit and proposed implementation plan" in the Transformation Academy directive. It also covers Learn, the Personal Knowledge Library and the AI Expedition Director from the 10/10 directive.

## 1. What exists today, and what's missing

| Directive asks for | Today | Gap |
|---|---|---|
| Academy → Expedition → Chapter | World → Solar system → Mission (`packages/core/src/expeditions/catalog.ts`) | The same shape under other names. Rename in the interface, not the data. |
| Lesson (read or listen) | Missions open with a short intro step, nothing longer | A `lesson` step type: readable text, optional audio |
| Interactive practice | `choice`, `lens`, `rehearse` steps with feedback | Works. More exercise types later (sorting, timed pause). |
| Optional real-world experiment | `plan` step → experiment → check-in → landmark | Works end to end |
| Reflection | `reflect` step, plus the private reflection space | Works |
| Downloadable resource | None | A `resources` table and a print-ready worksheet per chapter |
| Enrollment and chapter progress | Attempts and progress events (idempotent) | Enrollment ("I'm following this expedition") is one small table |
| Daily Compass | **Built in this pass** (deterministic, explained, dismissible) | Will use enrollment once it exists |
| XP | Not built: discoveries only (owner decision, brand brief) | **Decision A1** |
| Book ingestion | None | Workflow in §4 |
| AI explanation, variation, practice | Spec in `docs/hybrid/ai-orchestration-spec.md`; missions are hand-written | Live model not connected or tested |

## 2. The content model (additive, no change to existing tables)

```
academy (= world)            mind | body | soul | spirit | future
expedition (= system)        id, world, title, objective, chapter_count, status: draft | reviewed | published
chapter (= mission)          id, expedition_id, n, objective, minutes, status, reviewed_by, reviewed_at
  steps                      lesson | choice | lens | rehearse | plan | reflect | close   (lesson is new)
resource                     id, chapter_id, kind: worksheet | checklist | excerpt | audio | link,
                             title, file_ref, source, rights: owned | licensed | public-domain, approved_by, approved_at
enrollment                   user_id, expedition_id, started_at, paused_at          (one per user and expedition)
resource_bookmark            user_id, resource_id, note
```

- **Chapter progress** reuses `mission_attempts` and `progress_events`, which are already idempotent and isolated per user.
- **Statuses:**
  - A chapter shows to users only when it's `published`.
  - `draft` chapters appear as "Planned", never as available.
  - Publishing needs a named reviewer (`reviewed_by`).
  - Generated text can never publish itself.

## 3. The Clarity Protocol (Mind, 14 chapters): the framework

Each chapter has six parts:
1. one objective;
2. a short lesson (3–5 min read);
3. an interactive exercise;
4. one optional real-world experiment;
5. a reflection question;
6. a worksheet that's useful on paper, without the app.

**What's real today:** The Thought Labyrinth already covers "separate the facts from the story" with lenses, rehearse, reflect and plan. Proposal: it becomes Chapter 2 once its lesson step is written.

**Chapters 1 and 2 need authored text.** I can draft them for Bianno's edit, in plain language, citing only sources we can name:
- **Chapter 1, "Notice the noise".** Attention and competing thoughts; a two-minute noting practice; a "thought inventory" worksheet.
- **Chapter 2, "Facts and the story".** The labyrinth, plus a lesson; a two-column facts and story worksheet.

**Chapters 3–14** show as "Planned" with a working title only, until reviewed content exists. No filler lessons.

**The worksheet rule** (from the directive): each one must be specific enough to use on paper, never a decorative certificate.
- **Format:** print-styled HTML that saves as PDF from the browser; on a published page, the `downloads` capability.
- **Accessibility:** each worksheet is also readable in the app as text.

## 4. Bianno's books into the library

Candidates named: *Self-Mastery for Ambitious Young Men* (Mind, Future), *The Invisible Ocean* (Spirit), *The Sealed Codex* (exploration).

I haven't read any of these manuscripts, so nothing here describes their content.

**Workflow per book:**
1. Bianno supplies the manuscript and confirms rights. The `rights` field records it.
2. I map chapters to objectives in a table: `book → chapter → objective → lesson → exercise → real-world step → worksheet`, quoting page ranges. Each row carries its source.
3. Bianno approves the map. Then lessons are drafted from the text, never from memory or invention.
4. Editorial review, then publish chapter by chapter.

**In-app reading:**
- approved excerpts, bookmarks and notes;
- offline only where the rights allow;
- attribution on every page;
- no full third-party books.

## 5. Decisions needed from Bianno

| # | Decision | Options | My recommendation |
|---|---|---|---|
| A1 | XP (**decided: keep discoveries**) | Keep discoveries only (brand brief: "no points, levels…"), or add XP | Discoveries, plus a visible "chapters completed" count. It shows progress honestly without points. If you want XP, it'll be deterministic and awarded only for completing activities, never for what you disclose or how you feel. |
| A2 | First expedition (**decided: Beyond Overthinking**) | The Clarity Protocol (Mind) or Beyond Overthinking (Mind, 7 chapters) | Beyond Overthinking first: seven chapters can be finished and reviewed sooner. Then the Clarity Protocol. |
| A3 | Who reviews lessons | Bianno, or Bianno plus a qualified reviewer for anything touching mental health | Bianno for tone; a qualified reviewer before any lesson on anxiety or overthinking is published. |
| A4 | Which book first | One of the three | The one whose manuscript is final and fully yours. |
| A5 | Live AI | Approve a small test budget for the bounded Expedition Director | After A2 content exists: AI adapts reviewed content, it doesn't originate it. |

## 6. Order of work (each phase ends in tests plus Bianno's approval)

1. **Done this pass:** the portrait fix, the Home and Universe split, the Daily Compass, Journey milestones.
2. **Done:** the `lesson` and `sort` steps, chapter statuses (draft or reviewed), and "Planned" chapters in Learn. Enrollment is still to come.
3. **Drafted:** Beyond Overthinking chapters 1 to 4 (understand the loop, facts and assumptions, a one-minute pause, the Decision Lab), each with a printable worksheet; chapters 5 to 7 planned. Following an expedition is built. Review copy: [`../academy/beyond-overthinking.md`](../academy/beyond-overthinking.md). Waiting for Bianno's edit and a qualified reviewer.
4. The Compass uses enrollment: "Chapter 2 of 7", plus a "Why this?" that names the expedition you chose.
5. Library: resources, bookmarks, the book-mapping workflow (A4).
6. Bounded AI practice: scenario variations validated server-side against the reviewed chapter.
7. Remaining academies, one expedition each, then the Future Self Observatory behind the Quantum Gateway.
8. Device testing, VoiceOver and TalkBack, and a small user study (`docs/hybrid/beta-validation-plan.md`).

Nothing deploys, publishes or spends money without Bianno's approval.
