# The Wisdom Library and the first Wisdom Constellation

**Content revision: 2 November 2026.** This document and `wisdom.js` incorporate the source and editorial audit, including the later-supplied `questions.md`.

**Scope:** 21 Wisdom Library entries reviewed; 26 bank questions and five guided follow-ups/actions reviewed separately in `questions.md`. All card copy is Dawnward paraphrase, not quotation. Publisher/catalogue records verify publication details; where only descriptions or excerpts were accessible, the entire book has not been checked. This is not clinical validation or a claim that every cited study has been independently replicated.

**Implementation status:** The 1 November draft reported a built, undeployed implementation, 22 checks in `docs/galactic/test/e2e-wisdom.cjs` and a server catalogue test. These claims are **UNVERIFIED** here. Only the three supplied content files were edited; no application code, server, deployment or test suite was available.

## What the original implementation report describes

The brief’s gate remains: do not add more experts or worlds until one complete learning journey passes testing and user evaluation.

1. Wisdom Library: free, Knowledge galaxy, Tree of Life, `#/knowledge/wisdom`; 21 thinkers with a source, paraphrase, evidence class, limits, world, question and small experiment. Reflect on this is intended to retain the selected question with the answer.
2. Becoming Consistent: one Future-world constellation following Question → four labelled perspectives and disagreements → choose a difficulty → a seven-day experiment → review → Journey. Its actual content and behaviour were not supplied and remain **UNVERIFIED**.
3. Gateway and Reflect questions: revised copy is now in `questions.md`; the claim that Bianno’s original wording is used word for word no longer applies to the revised copy.

The original report says other constellations, the four experiences (Mirror of Identity, Hall of Unlived Lives, Garden of Connection, The Last Sunrise), AI and the new galaxies were not built. Their current status remains **UNVERIFIED**. They should still wait for the quality gate.

## Evidence classes: claim-level labels

These are editorial categories, not a formal GRADE assessment. They apply to the particular claim, not an author, a whole book, a paid course or the app’s exercise. “Mixed or early” also includes mature research with important limitations; the label does not mean all such research is new. A one-off app exercise has not automatically been validated because it resembles a researched programme.

| Class | App label | Current entries and scope |
|---|---|---|
| 1 | Strong research | Gollwitzer: specific if–then planning. Clear: repetition in consistent contexts and habit mechanisms only, not the complete book framework. |
| 2 | Mixed or early research | Kahneman, Kabat-Zinn, Csikszentmihalyi, Kwik, Dweck, Neff, Duckworth, Brown, Goleman, Kotler. Brown’s cited account is qualitative research and interpretation. |
| 3 | Philosophy or practice | Frankl, Epictetus and Holiday, Jung, Perel, Lakhiani, Peer, Beckwith, Tsabary, Nichols. |

Do not rely on array order to group the cards. Existing entry order, IDs and numeric classes are preserved; render sections from the `evidence` value. The previously discussed fourth “Speculative” class is not exported by `EVIDENCE` and has no entries. Do not imply it is an implemented category.

## Source and attribution register

Every work below exists. Short titles are retained where sufficient; edition and translation distinctions are stated where material. The precise reach of each claim and unresolved checks are recorded below.

| ID | Source / publication record | App evidence label |
|---|---|---|
| `gollwitzer` | [Implementation intentions: Strong effects of simple plans, American Psychologist, 54(7), 493–503, 1999](https://prospectivepsych.org/sites/default/files/pictures/Gollwitzer_Implementation-intentions-1999.pdf) | Strong research |
| `kahneman` | [Thinking, Fast and Slow, 2011](https://www.penguinrandomhouse.com/books/89308/thinking-fast-and-slow-by-daniel-kahneman/) | Mixed or early research |
| `kabatzinn` | [Full Catastrophe Living: Using the Wisdom of Your Body and Mind to Face Stress, Pain, and Illness, 1990](https://books.google.com/books/about/Full_Catastrophe_Living.html?id=QeGGPwAACAAJ) | Mixed or early research |
| `csikszentmihalyi` | [Flow: The Psychology of Optimal Experience, 1990](https://books.google.com/books/about/Flow.html?id=B4ryzwEACAAJ) | Mixed or early research |
| `clear` | [Atomic Habits, 2018](https://books.google.com/books/about/Atomic_Habits.html?id=fFCjDQAAQBAJ) | Strong research |
| `kwik` | [Limitless: Upgrade Your Brain, Learn Anything Faster, and Unlock Your Exceptional Life, 2020](https://books.google.com/books/about/Limitless.html?id=kYGPEAAAQBAJ) | Mixed or early research |
| `dweck` | [Mindset, 2006](https://www.penguinrandomhouse.com/books/44330/mindset-by-carol-s-dweck-phd/9781588365231/) | Mixed or early research |
| `neff` | [Self-Compassion, 2011](https://books.google.com/books/about/Self_Compassion.html?id=6krvBkA78XcC) | Mixed or early research |
| `duckworth` | [Grit: The Power of Passion and Perseverance, 2016](https://www.simonandschuster.com/books/Grit/Angela-Duckworth/9781501111105) | Mixed or early research |
| `brown` | [Daring Greatly, 2012](https://www.penguinrandomhouse.com/books/600469/daring-greatly-by-brene-brown/9781101594995/) | Mixed or early research |
| `goleman` | [Emotional Intelligence, 1995](https://books.google.com/books/about/Emotional_Intelligence.html?id=XP5GAAAAMAAJ) | Mixed or early research |
| `kotler` | [The Rise of Superman: Decoding the Science of Ultimate Human Performance, 2014](https://books.google.com/books/about/The_Rise_of_Superman.html?id=Rj3YAgAAQBAJ) | Mixed or early research |
| `frankl` | [Man’s Search for Meaning; German original 1946, English translation 1959](https://www.viktorfrankl.org/standard_literaturliste.html) | Philosophy or practice |
| `stoics` | [Epictetus, Enchiridion, section 1, Elizabeth Carter translation (Internet Classics Archive); Ryan Holiday, The Obstacle Is the Way, 2014](https://classics.mit.edu/Epictetus/epicench.html) | Philosophy or practice |
| `jung` | [Aion: Researches into the Phenomenology of the Self; German original 1951, English translation 1959, chapter II: The Shadow](https://www.jstor.org/stable/j.ctt5hhqh6) | Philosophy or practice |
| `perel` | [Mating in Captivity, 2006](https://books.google.com/books/about/Mating_in_Captivity.html?id=-HIhMOQanIEC) | Philosophy or practice |
| `lakhiani` | [The Code of the Extraordinary Mind, 2016](https://www.penguinrandomhouse.com/books/593005/the-code-of-the-extraordinary-mind-by-vishen-lakhiani-founder-of-mindvalley/) | Philosophy or practice |
| `peer` | [I Am Enough: Mark Your Mirror and Change Your Life, 2018](https://books.google.com/books/about/I_Am_Enough.html?id=25tWvQEACAAJ) | Philosophy or practice |
| `beckwith` | [Life Visioning: A Transformative Process for Activating Your Unique Gifts and Highest Potential, 2012](https://us.macmillan.com/books/9781604076615/lifevisioning/) | Philosophy or practice |
| `tsabary` | [The Conscious Parent: Transforming Ourselves, Empowering Our Children, 2010](https://books.google.com/books/about/The_Conscious_Parent.html?id=i2NzvgEACAAJ) | Philosophy or practice |
| `nichols` | [No Matter What!: 9 Steps to Living the Life You Love, 2009](https://books.google.com/books/about/No_Matter_What.html?id=DkBfKuRRjmAC) | Philosophy or practice |

## Entry-by-entry revision notes and remaining limits

- **Peter Gollwitzer (`gollwitzer`):** Full article title corrected. Strong label applies to specific if–then planning, not a guarantee of action. See R1–R2.
- **Daniel Kahneman (`kahneman`):** Downgraded the combined practical claim; removed the blanket assurance that all core findings hold up. Replication status must be assessed claim by claim. See R3.
- **Jon Kabat-Zinn (`kabatzinn`):** Downgraded under the present three-class scheme: review reports moderate evidence and small-to-moderate symptom effects. No claim that a brief app practice equals MBSR. See R4–R5.
- **Mihaly Csikszentmihalyi (`csikszentmihalyi`):** Removed the precise “just above skill” prescription. Correlates and performance associations do not establish reliable induction or causation. See R6–R7.
- **James Clear (`clear`):** Strong label applies only to the stated habit mechanisms, not the complete commercial framework. The 66-day figure is a modelled median from one study, not a deadline. See R8–R9.
- **Jim Kwik (`kwik`):** Author’s public explanation confirms he teaches the older loci technique; matching passage in the 2020 edition remains UNVERIFIED. Do not imply he invented it. See R10–R11.
- **Carol Dweck (`dweck`):** Kept mixed label and made disagreement between reviews explicit. See R12–R13.
- **Kristin Neff (`neff`):** Updated an outdated limitation: intervention studies exist, with weaker or less consistent advantages over active controls. See R14.
- **Angela Duckworth (`duckworth`):** Definition and cautious label retained; added an editorial reminder that changing a goal can be sensible. This reminder is not presented as a finding of the grit review. See R15.
- **Brené Brown (`brown`):** Qualitative research explicitly identified. The book does not establish a reliable causal benefit from disclosure; no exhaustive claim that no trials exist. See R16.
- **Daniel Goleman (`goleman`):** Retained mixed label; clarified competing constructs and overlap with established measures. See R17–R18.
- **Steven Kotler (`kotler`):** Removed unverified attribution about teams. Extreme-athlete examples are not controlled tests of a universal performance method. See R7.
- **Viktor Frankl (`frankl`):** Distinguished German original (1946) from English translation (1959); first English title and later retitling are edition-dependent. Removed exhaustive “few trials” claim. No implication that suffering or survival is chosen. See R19.
- **Epictetus and Ryan Holiday (`stoics`):** Narrowed the card to Epictetus §1, a named translation, and Holiday. Removed the unused Marcus Aurelius citation and the unverified historical CBT-influence statement. Holiday source: https://books.google.com/books/about/The_Obstacle_Is_the_Way.html?id=3Sm-CAAAQBAJ .
- **Carl Jung (`jung`):** German original 1951; English translation 1959. Removed the irritation attribution, which was UNVERIFIED in Aion, and the assumption that disliked traits exist in the user.
- **Esther Perel (`perel`):** Qualified the claim as Perel’s clinical interpretation, not a universal rule. Author’s explanation: https://www.estherperel.com/blog/letters-from-esther-30-appreciating-otherness-in-relationships .
- **Vishen Lakhiani (`lakhiani`):** Publisher excerpt supports questioning inherited rules; retained philosophy label and made consequences and responsibilities explicit.
- **Marisa Peer (`peer`):** Removed evidential borrowing from a different self-talk technique. Independent trials of branded RTT remain UNVERIFIED, not asserted absent. Mixed affirmation findings: R20–R23.
- **Michael Bernard Beckwith (`beckwith`):** Made spiritual premises explicit and distinguished imagined answers from authoritative guidance. Publisher sample: https://soundstrue-media.s3.amazonaws.com/pdf/k2271-LifeVisioning-websample.pdf .
- **Dr. Shefali Tsabary (`tsabary`):** Returned the idea to parenting; removed unsupported “past matters more than present” comparison and age-of-feeling exercise. Publisher description: https://www.namastepublishing.com/the-conscious-parent .
- **Lisa Nichols (`nichols`):** Replaced the UNVERIFIED specific story-transformation attribution with the publisher-supported themes of confidence, perseverance and honesty. Sharing is optional. Publisher: https://www.hachettebookgroup.com/titles/lisa-nichols/no-matter-what/9781600242939/ .

## Research references and what they support

| Ref | Source | Use and limits |
|---|---|---|
| R1 | [Gollwitzer & Sheeran (2006), Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes](https://doi.org/10.1016/S0065-2601(06)38002-1) | Meta-analysis supporting if–then planning; does not guarantee action in every setting. |
| R2 | [Psychology of Planning (2025), Annual Review of Psychology](https://doi.org/10.1146/annurev-psych-021524-110536) | Review of planning mechanisms and moderators, including motivation and plan structure. |
| R3 | [Swaryandini et al. (2025), Systematic review and meta-analysis of educational approaches to reduce cognitive biases among students](https://www.nature.com/articles/s41562-025-02253-y) | Targeted debiasing training; transfer to real-world decisions remains uncertain. Not validation of simply thinking slowly. |
| R4 | [Goyal et al. (2014), Meditation Programs for Psychological Stress and Well-being](https://doi.org/10.1001/jamainternmed.2013.13018) | Systematic review/meta-analysis: moderate evidence for small-to-moderate improvements in anxiety, depression and pain; not blanket evidence for all wellbeing outcomes. |
| R5 | [Farias et al. (2020), Adverse events in meditation practices and meditation-based therapies](https://pubmed.ncbi.nlm.nih.gov/32820538/) | Systematic review documenting adverse experiences; heterogeneous methods prevent a universal risk estimate for a brief app exercise. |
| R6 | [Fong et al. (2015), The challenge–skill balance and antecedents of flow](https://doi.org/10.1080/17439760.2014.967799) | Meta-analysis of antecedent associations; not proof of a universally optimal challenge–skill gap. Online publication was 2014; journal issue 2015. |
| R7 | [A systematic review and meta-analysis of the relationship between flow states and performance (2021)](https://doi.org/10.1080/1750984X.2021.1929402) | Association between flow and performance; causation and reliable induction are not established by that association. |
| R8 | [Wood & Rünger (2016), Psychology of Habit](https://doi.org/10.1146/annurev-psych-122414-033417) | Review supporting repetition in recurring contexts and habit automaticity; basis for Clear’s narrowly scoped strong label. |
| R9 | [Lally et al. (2010), How are habits formed: Modelling habit formation in the real world](https://doi.org/10.1002/ejsp.674) | Primary study, not a review. Modelled time to automaticity varied widely; 66 days is not a personal deadline. |
| R10 | [Twomey & Kroneisen (2021), The effectiveness of the loci method as a mnemonic device](https://pubmed.ncbi.nlm.nih.gov/33535926/) | Meta-analysis: recall benefits with methodological limitations and predominantly university settings. |
| R11 | [Rayner et al. (2016), So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?](https://doi.org/10.1177/1529100615623267) | Review of reading and the speed–comprehension trade-off. |
| R12 | [Macnamara & Burgoyne (2023), Do growth mindset interventions impact students’ academic achievement?](https://doi.org/10.1037/bul0000352) | Meta-analysis finding negligible achievement effects in higher-quality studies. |
| R13 | [Burnette et al., A systematic review and meta-analysis of growth mindset interventions: For whom, how, and why might such interventions work?](https://pubmed.ncbi.nlm.nih.gov/36227318/) | Published online 2022; journal issue 2023. Reports benefits in targeted/high-fidelity settings. Interpret alongside R12 rather than hiding disagreement. |
| R14 | [Effects of Self-Compassion Interventions on Reducing Depressive Symptoms, Anxiety, and Stress: A Meta-Analysis (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10239723) | Intervention evidence; active versus passive comparison groups matter. |
| R15 | [Credé, Tynan & Harms (2017), Much ado about grit](https://doi.org/10.1037/pspp0000102) | Meta-analysis: overlap with conscientiousness and limited incremental prediction. |
| R16 | [Brown, Research / appendix to Daring Greatly](https://brenebrown.com/the-research) | Author’s qualitative-method account, not a controlled effectiveness trial or systematic review. |
| R17 | [Joseph & Newman (2010), Emotional intelligence: an integrative meta-analysis and cascading model](https://pubmed.ncbi.nlm.nih.gov/20085406/) | Distinguishes emotional-intelligence constructs and their relationships with job performance. |
| R18 | [Joseph et al. (2015), Why does self-reported emotional intelligence predict job performance?](https://pubmed.ncbi.nlm.nih.gov/25243996/) | Meta-analysis of mixed EI; substantial overlap with other constructs. |
| R19 | [A systematic review of the effectiveness of meaning-centred psychotherapies in depressed participants (2024)](https://pubmed.ncbi.nlm.nih.gov/38009557/) | A narrow review, not a census of all logotherapy trials or verification of memoir claims. |
| R20 | [Kross et al. (2014), Self-talk as a regulatory mechanism: how you do it matters](https://pubmed.ncbi.nlm.nih.gov/24467424/) | Primary experiments on linguistic self-distancing, not Peer’s affirmations or branded therapy. |
| R21 | [Wood et al. (2009), Positive Self-Statements](https://doi.org/10.1111/j.1467-9280.2009.02370.x) | Primary experiments reporting possible backfire for some people with low self-esteem. |
| R22 | [On the failure to replicate past findings regarding positive affirmations and self-esteem](https://www.sciencedirect.com/science/article/abs/pii/S2212144719301103) | Replication attempts did not reproduce that pattern; do not turn R21 into a universal harm claim. |
| R23 | [Rapid Transformational Therapy descriptive paper, BEMS Reports (2021)](https://bemsreports.org/index.php/bems/article/download/113/157) | Descriptive discussion acknowledging sparse evidence, not an independent randomised effectiveness trial. |

Author confirmation that Kwik teaches the older memory-palace technique: [public explanation](https://jimkwik.com/podcasts/kwik-brain-011-how-to-memorize-give-a-speech-without-notes). Clear’s practical framework: [author’s summary](https://jamesclear.com/atomic-habits-summary). These establish what the authors teach, not whether every claim is effective.

## Unverified material and launch checks

- The exact circulation quote about irritation attributed to Jung was not located in Aion. It has been removed from the card, not reassigned to another book.
- A matching memory-palace passage in the 2020 Limitless edition remains UNVERIFIED; the author’s public teaching is confirmed. Add a checked page reference if claiming the passage is in that edition.
- Claims about teams in The Rise of Superman and the specific story-transformation claim attributed to No Matter What! were UNVERIFIED and have been replaced with narrower publisher-supported summaries.
- Exhaustive claims that no independent RTT trials or no Brown controlled trials exist were not established by a systematic absence search; do not publish those assertions.
- The previous document mentioned Frankl quoting Nietzsche. No such quotation appears in the supplied `wisdom.js`; wording, provenance and use in the unsupplied constellation remain UNVERIFIED. No quotation has been added here.
- Inspect Becoming Consistent before launch: revise any affected evidence labels, quotations, disagreements, seven-day requirements or disclosure instructions. Do not infer it is fixed because these files are revised.
- Full-book passage verification is incomplete for several sources. No invented quotations, page numbers or blanket replication assurances have been added.

## Rules for cards and reflections

- No implied partnership: none of these people is connected with or endorses Dawnward. Do not depict them as instructors or have an AI impersonate them.
- Own words: use the revised paraphrases; do not copy course scripts or branded teaching sequences.
- Label the claim, not the person. Explain limits alongside it and link the actual source and supporting review.
- Keep uncertainty visible. A philosopher’s view, a qualitative finding and a trial result must not be presented as interchangeable evidence.
- Offer an optional small experiment, not a promise of transformation. Private reflection, adapting, stopping and doing nothing today are valid choices.
- Required app controls and reward rules are specified in `questions.md`; their implementation is UNVERIFIED. Copy revisions alone cannot provide those controls.

## Content intentionally left out

Jon and Missy Butcher / Lifebook remain out of scope. The earlier justification that there is categorically no published primary text was UNVERIFIED and should not be repeated as fact. No source for a new entry has been verified in this audit.

## Decisions still with Bianno

1. Galaxies: the brief proposes Personal Growth, Knowledge, Relationships, Creative Worlds, Purpose & Prosperity, the Quantum Gateway and Earth. The earlier report instead describes AI Creation and Spiritual Exploration. No galaxy lineup was changed in these files.
2. Next constellation: Self-worth, Decisions or Connection remains a product choice. No new constellation was built in this content revision.
3. Four experiences: write and review them separately. The Last Sunrise’s actual script was not supplied; an exit and check-in do not by themselves establish its suitability.
4. Further review: source passage checks and review of the actual delivered user experience remain outstanding; do not label the app clinically approved.

## What to measure separately

Reflection completion, return without a reminder, real actions attempted, perceived usefulness, stopping/skipping and reported distress. These files contain no measurement results. Engagement does not establish benefit or safety.

## Change log — 2 November 2026

Revised all 21 entries while preserving IDs, worlds and exported fields; narrowed the two strong-research cards; downgraded three broad claims; corrected article and translation details; updated limitations and attribution; removed leading shadow/old-hurt prompts and evidential borrowing; aligned optional actions with the later question-bank review; added source links and unresolved checks; retained product decisions and distinguished historical build reports from verified behaviour.

## Implementation in the app (Claude, 2 Nov 2026)
- `experience/src/wisdom.js` now holds this review's 21 revised entries, with IDs, worlds and export names unchanged.
  - **Evidence changes:** Kahneman, Kabat-Zinn and Csikszentmihalyi move from Strong to Mixed or early.
  - **Grouping:** sections are drawn from each entry's `evidence` value, not array order (as before; tested in `e2e-wisdom.cjs`).
- **Conflict, kept:** four Connection entries were added after this review's draft: `attachment` (strong), `holtlunstad` (strong), `gottman` (mixed) and `gable` (mixed). See `docs/universe/connection.md`. They're kept and marked **"Not yet reviewed"** on their cards (`UNREVIEWED`). They should go through the same review.
- **Each card now links:**
  - its **Source** (the register above);
  - for 18 entries, **What the research says** (the R-references).
  
  The footer says labels describe the claim on the card, not the book or the person, and that some passages are still being checked.
- **Becoming Consistent, inspected and fixed:**
  - the Neff label is now "Mixed or early research";
  - the unverified Frankl/Nietzsche attribution is removed;
  - Clear is narrowed to the habit mechanisms;
  - Gollwitzer gets a limit;
  - the seven-day experiment is optional.
- **"Reflect on this"** carries the card's revised question into Reflect, unchanged.
