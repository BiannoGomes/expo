# Knowledge: the Tree of Life

**Status:** built 2026-11-01. Every piece of content is a **draft for Bianno's review**, and the app says so on each one. Shown only in the private preview; not deployed.

## The shape
The Knowledge galaxy is drawn as a Tree of Life: ten spheres joined by twenty-two paths. Climbing it moves from the outer world to the inner one. Each sphere is a real button on the map, and the same worlds are listed underneath in words.

| Sphere | Meaning | World there | Kind | Access |
|---|---|---|---|---|
| Keter | Crown | **Inner Knowing**: a five-step practice (settle, ask, notice, write, let it rest), with notes kept on this device | Practice | free |
| Chokmah | Wisdom | **The Tree of Life**: the map itself, its origin and the ten spheres | The map | free |
| Binah | Understanding | The Philosophy Temple | Wisdom tradition | planned |
| Chesed | Loving-kindness | The Human Mind | Science | planned |
| Gevurah | Strength | **The Five Solids**: the Platonic solids around a star tetrahedron, from Plato to Kepler to chemistry | Science and tradition | members |
| Tiferet | Beauty | **The Hall of the Seven Principles**: the Hermetic principles, each quoted, explained, practised and honestly noted | Wisdom tradition | members |
| Netzach | Endurance | **The Flower of Life**: grow one circle into the Seed, the Flower, the Fruit and Metatron's Cube | Wisdom tradition | free |
| Hod | Splendour | **The Cosmic Calendar**: 13.8 billion years as one year; zoom to December, the last day, the last minute | Science | free |
| Yesod | Foundation | The Discovery Lab: real gravity | Science | members |
| Malkuth | Kingdom | The Cosmic Observatory: the Sun and planets | Science | free |

Civilizations stays planned, off the map.

## Honesty, built in
- **Every world is labelled** Science, Wisdom tradition, Science and tradition, Practice or The map, so nothing passes as what it isn't. This follows the advice in the "Top 10 universe explainers" brief: keep the wonder, and keep the line between science and imagination clear.
- **Every lesson card says "Draft, not yet reviewed".** Remove that only after review.
- **The Hermetic principles:**
  - quoted exactly from *The Kybalion* (1908, public domain);
  - each followed by plain meaning, a practice, and an honest note on what science does and doesn't say.
  - About says where the book really comes from: anonymous authors, New Thought era.
- **The Tree of Life** is introduced as coming from Kabbalah, a Jewish mystical tradition, later adopted by Western Hermetic schools. It's offered as a map for learning, "not as religious instruction".
- **Beliefs are kept apart from geometry and science.** The star tetrahedron's "Merkaba" meaning is called "a belief, not geometry". Metatron's Cube says which solids can be traced exactly and which only roughly.
- **Kepler's nested solids** are told as "beautiful, and wrong": a lesson in letting evidence win.
- **Inner Knowing:**
  - says it works best alongside facts and people you trust;
  - says to get proper advice for health, money or safety;
  - mentions interoception research as "still developing".
  - Questions and notes go through the crisis check.

## Sources
| Content | Source | Rights |
|---|---|---|
| Seven principles (quotes) | *The Kybalion*, Three Initiates, 1908 | Public domain |
| Platonic solids and the elements | Plato, *Timaeus* (c. 360 BCE) | Public domain; paraphrased |
| Nested-solids model | Kepler, *Mysterium Cosmographicum* (1596) | Historical fact |
| Tree of Life layout | The classic Western (Kircher) diagram of ten sefirot and 22 paths | Traditional |
| Flower of Life geometry | Drawn from first principles (hexagonal circle packing) | Original code |
| Cosmic Calendar dates | Computed from published ages (Universe 13.8 bn years, Earth 4.6 bn, etc.) | Original; idea popularised by Carl Sagan |
| All other text | Written fresh for Dawnward | Bianno's |

## What isn't here, and why
| Asked for | Why it isn't copied in | How it could come in |
|---|---|---|
| Sean Clayton's content (Miracle Academy, "7 Laws", posts, videos) | His work, not licensed to Dawnward. The 7 Hermetic principles themselves come from public-domain *The Kybalion*, so those are here in Dawnward's own words | Ask him. With written permission, his lessons could arrive as a members' pack (`content/packs`, source `bianno` or a new `partner` label) and be credited |
| Joe Dispenza's books and meditations | Copyrighted | Listed under **Go deeper**. A licensed meditation could come in as a pack |
| Neil deGrasse Tyson's *Cosmos* and books | Copyrighted | Listed under **Go deeper**. The Cosmic Calendar idea is used, not his footage or script |

## For Bianno's review
1. Read each principle card: is the meaning and practice how you'd teach it?
2. Check the Go deeper list: keep, cut or add.
3. Have someone check the science lines: the Cosmic Calendar, the Five Solids, and the Hall's honest notes.
4. Then remove "Draft, not yet reviewed" from what's approved (`src/knowledge.js`).

## Tests
`docs/galactic/test/e2e-tree.cjs` has 46 checks:
- the map (10 spheres, 22 paths, crown and root);
- the kind labels, and the Go deeper disclaimer;
- calendar dates (January 1, end of August, writing at 23:59:4x);
- the Tree's respectful origin and its ten spheres in words;
- real taps on the flower, a pillar and the star;
- the exact Kybalion quote and honest notes, all seven read and kept;
- Inner Knowing kept, with a safety reminder and the crisis check;
- members' gates;
- axe on seven screens;
- frame times;
- no errors.
