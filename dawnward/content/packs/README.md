# Members' content packs

Everything you make on your own computer becomes members' content in the app, with no extra cost:
- writing with your **Claude Opus** subscription;
- animation with **Fable**;
- your own lessons and worksheets from your **Skool** community.

Each pack is a folder here with a `pack.json` and its files. A checker makes sure every pack is safe, accessible and honestly labelled before the app shows it.

## Make a pack in five steps
1. **Copy `_template`** to a new folder, named in lowercase with dashes, for example `evening-reset`. Set `"id"` to the same name.
2. **Put the files in that folder:** videos, audio, PDFs and images.
3. **Fill in `pack.json`:**
   - `title` and `summary`;
   - `place`: where it appears. Use `library`, a galaxy (`creative`, `spiritual`, `knowledge`, `ai`) or a world (`mind`, `body`, `soul`, `spirit`, `future`);
   - `access`: `"plus"` for members, or `"free"` for a taster;
   - the items (see below).
4. **Check it:** run `node tools/packs.mjs` in `dawnward/experience`. It says what to fix, in plain words. Nothing changes in the app until there's nothing left to fix.
5. **Build:** `node build.mjs`. The pack shows in Learn › Members' Library, and on the galaxy or world you chose.

## Item types
| Type | Needs | Good for |
|---|---|---|
| `lesson` | `text`, with a blank line between paragraphs | Lessons you write with Opus and edit yourself |
| `video` | `file` (mp4 or webm) or `url` (https), plus `captions` (a .vtt file), or `"noSpeech": true` with a `description` | Fable animations, Skool lesson videos you recorded |
| `audio` | `file` or `url`, plus a `transcript` | Guided practices in your voice |
| `worksheet` | `file` (PDF) | Worksheets from your Skool course |
| `image` | `file` and `alt` (or `"alt": ""` if decorative) | Illustrations |

Every item also needs:
- `"source"`: `opus`, `fable`, `skool` or `bianno`. The app shows it honestly, for example "Written with Claude Opus, reviewed by Bianno".
- `"title"`.

## The rules the checker enforces
- **Opus writing needs your review first.** Add `"reviewed": {"by": "Bianno", "on": "YYYY-MM-DD"}` once you've read and edited it. Until then it's left out; `--drafts` shows it marked "Draft" for checking.
- **Only what you own.** Every pack needs `"rights"` and `"rightsConfirmed": true`.
  - From Skool, bring only your own lessons, posts, videos and worksheets.
  - Never bring members' posts, comments, names, photos or faces: that's their content and their privacy.
  - Skool has no export tool here. Copy your own text, and download your own videos from wherever you host them.
- **Accessible:**
  - videos have captions, or a description if nothing is spoken;
  - audio has a transcript;
  - images have alt text.
- **Big files:** anything over 12 MB gets a note to host it and use `"url"`, so the app stays small.

## Ideas that fit what's already built
| Your tool | Pack idea | Where |
|---|---|---|
| Fable | A short animated opening for each galaxy, or a slow "door at dusk" loop | `creative`, `spiritual` |
| Fable | Animated explainers for each Beyond Overthinking chapter | `mind` |
| Opus + your edit | Extra lessons for the Knowledge galaxy (the Human Mind, Philosophy), reviewed by you | `knowledge` |
| Opus + your edit | Pre-written "Dream Forge" story prompts and starter worlds (no live AI needed) | `ai` |
| Skool | Your course modules: lesson text, recorded videos with captions, worksheets | `library`, or the matching world |
| Your voice | Guided breathing or evening practices, with transcripts | `spiritual` |
