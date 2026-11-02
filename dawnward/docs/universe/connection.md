# Connection: the second Wisdom Constellation ("Feeling Closer")

**Status, 2 Nov 2026:** built and tested as a **draft**:
- the mission `connection-1` in Soul, system `soul-connection`;
- four new Wisdom Library entries, and Perel's limits extended;
- the "Feeling Closer" row in the Wisdom Library.

It needs a reviewer before launch, like the rest of the Wisdom Library.

**Source:** research run by ChatGPT for Bianno (Job 3), pasted into the session on 2 Nov 2026. Its own rating was "8/10 as a product concept". It also flagged the main risk: turning "what feels familiar" into a diagnosis. The links below are the ones it gave, with tracking tags removed. **Not re-fetched here.** The DOIs and years match the published papers as far as I know, but a reviewer must open each one.

## What's in the mission
| Step | Content |
|---|---|
| Intro | Four ways of looking at feeling distant (partner, friend or family). "None of them is a diagnosis." |
| Question | "Who do you feel further from than you'd like?" (a first name or a letter is enough) |
| Explore | Four perspectives, each with its evidence label and its limit, then "They answer different questions" (marked as our own comparison) |
| Choose | "Which feels worth exploring?" Never "which explains your relationship". |
| Act | One seven-day experiment, with whom and roughly when |
| Close | In seven days: what you tried, how they responded, keep going or change course. Any answer counts. |

The relationship safety note (if a relationship feels unsafe, this isn't the right practice, plus findahelpline.com) shows on it, and the crisis check runs on every written answer.

## The four perspectives (and the two left out)
| Perspective | Evidence label | Limit stated in the app |
|---|---|---|
| Gottman: small invitations ("bids"). *The Relationship Cure*, 2001, with DeClaire. [UW announcement](https://www.washington.edu/news/2001/05/07/the-relationship-cure-is-manual-for-emotional-connection/) | Mixed or early | Observational, mostly married couples; some wider predictive claims challenged ([PMC1828692](https://pmc.ncbi.nlm.nih.gov/articles/PMC1828692/)) |
| Attachment: Hazan & Shaver 1987 ([doi](https://doi.org/10.1037/0022-3514.52.3.511)); Li & Chan 2012 meta-analysis, 73 studies, 21,602 people ([doi](https://doi.org/10.1002/ejsp.1842)) | Strong (for the association) | Tendencies, not types; can't explain one relationship |
| Gable et al. 2004 ([PubMed](https://pubmed.ncbi.nlm.nih.gov/15301629/)); Gable, Gonzaga & Strachman 2006 ([PubMed](https://pubmed.ncbi.nlm.nih.gov/17059309/)) | Mixed or early | No proof a short exercise lasts; doesn't replace dealing with hurt |
| Holt-Lunstad 2015 ([doi](https://doi.org/10.1177/1745691614568352)); 2022 review ([doi](https://doi.org/10.1146/annurev-publhealth-052020-110732)) | Strong (for the association) | Not a simple cause; money, caring, disability and grief limit connection |
| Brené Brown, *Daring Greatly* (2012) | Already in the Library (mixed) | Left out of the mission: overlaps openness and responsiveness. ChatGPT labels the *application* "philosophy or practice"; the reviewer should decide whether to move her entry |
| Esther Perel, *Mating in Captivity* (2006) | Already in the Library (philosophy) | Left out of the mission: desire is narrower than connection, so it fits a separate romantic-intimacy branch later. Added: "this isn't advice to pull away from someone who already feels neglected" |

## Unverified (said plainly)
- Whether this four-perspective combination helps anyone.
- Whether any of the seven-day exercises works as a Dawnward exercise.
- Any idea that seven days reliably repairs distance. The app never claims it.

## Tests
- `server/test/expeditions.test.ts`: the mission's shape, labels and wording, and that it never says "explains your relationship".
- `docs/galactic/test/e2e-wisdom.cjs`: both constellations in the Library; each thinker under the right evidence; the safety note; play-through to Done; axe.
