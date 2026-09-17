# Bianno Gomes · The Author Universe

One page, eight chapters, one organism. Built to the Author Universe creative
direction: three books as three territories of one question, and a realtime
environment that changes state as the visitor travels through it.

## Chapters

| # | Chapter | World state |
|---|---|---|
| 01 | The Question. Atmosphere, then the name arrives, then the question | Gold |
| 02 | The Three Worlds. Three doors, the thread beneath them | Gold |
| 03 | The Body. Self-Mastery: flyer hooks, ember line, cover, buy | Ember (structure, heat) |
| 04 | The Depth. The Invisible Ocean: his own description, cover, buy | Ocean (navy, silver-blue) |
| 05 | The Code. The Sealed Codex: four keys, cover | Gold (symbol) |
| 06 | Why I Write. Portrait slot, the sea and the page, @unifymind | Gold, solid |
| 07 | The Choice. Three recognition doors that scroll to their book | Gold |
| 08 | The First Page. Email capture, MailerLite-ready | Gold, solid |
| — | Footer exhale: the three books, the name, the question again | — |

The engine is a raymarched signed-distance field with a golden-spiral particle
galaxy. Scroll selects the form and the territory: palettes, environment light,
and key light all blend continuously between gold, ember, and ocean. In the
ocean territory the geometry holds a permanent partial dissolve. A comet crosses
every eleven seconds. Dawn and dusk in the visitor's clock warm the horizon.

## Typography

Playfair Display for display (the direction's named face), EB Garamond for body
(the books' own text face, chosen over Inter because the page should read as
literature), Cinzel only for inscriptions: cover placeholders, numerals, the
header mark. Chapter labels are blueprint blue; ember appears exactly once, on
"There are two versions of you."

## Truth and style laws (from the site brief)

- Zero em-dashes in printable text. None of the banned vocabulary ("journey"
  from an earlier pairs list was recut as "voyage" before that section retired).
- Biography restricted to confirmed material. Sea references are generic:
  no vessels, employers, or ports.
- No invented metrics, reviews, testimonials, or press. No fake follower counts.
- The buy button without a link says "Amazon link pending" instead of lying.

## What still blocks launch

| Item | Status |
|---|---|
| Self-Mastery buy link | tr.ee shortlink from Bianno, unverified here (tr.ee egress-blocked). Prefer the public amazon.com/dp/ link |
| The Invisible Ocean buy link | Same |
| The Sealed Codex buy link | **Missing.** The KDP bookshelf URL is a private dashboard, not a product page. Use "View on Amazon" from the bookshelf and paste the public link |
| Cover art | Typographic placeholders render until `BOOKS[*].cover` is set. Real covers exist in the vault's KDP packages (4 - EBOOK COVER, 1600x2560) |
| Author portrait | `PORTRAIT` empty. Professional AIGLE portraits exist in Drive but exceed what the connector can carry; paste one into chat |
| MailerLite | `MAILERLITE_ACTION` empty; form states it is not connected. MCP server also unauthorized in this session |
| Tracking parameters | Cannot be added to tr.ee shortlinks; direct Amazon links accept them |

The vault at C:\Users\biann\Desktop\Jarvis and Instagram are unreachable from
this cloud container; everything here came from chat, Drive documents, and the
production record.

## Verified

Headless Chromium, engine on and off: 3 worlds, 5 hooks, 4 keys, 3 doors,
3 covers, letter reveal, door scroll, JSON-LD valid, no horizontal overflow,
no console errors beyond the sandbox's own font-fetch failure. Reduced motion
shows all content statically; no WebGL2 falls back to a static ground.
