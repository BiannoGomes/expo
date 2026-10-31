import type { DailyPlan, PlanSource } from "@dawnward/core";

/** One of the person's recent evenings, as given to the plan generator. */
export interface RecentWords {
  recordId: string;
  date: string;
  transcript: string;
}

/** What the generator may claim: a record id and words it says came from it. */
export interface ClaimedSource {
  sourceRecordId?: string;
  quote?: string;
}

const MIN_QUOTE = 8;
const MAX_QUOTE = 220;

/** Fold the differences a keyboard or transcript introduces, nothing more. */
function fold(text: string): string {
  return text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * A quote is shown only if it is really the person's: the record must be one
 * of their recent evenings and the words must appear in it, verbatim up to
 * whitespace, case and curly quotes. Anything else is dropped, never repaired.
 * Returned text is the span as the person said it, not the model's copy.
 */
export function verifySource(
  claimed: ClaimedSource,
  words: RecentWords[],
): PlanSource | undefined {
  const { sourceRecordId, quote } = claimed;
  if (!sourceRecordId || !quote) return undefined;
  const evening = words.find((w) => w.recordId === sourceRecordId);
  if (!evening) return undefined;

  const wanted = fold(quote).replace(/^["']+|["'.,;:!?]+$/g, "").trim();
  if (wanted.length < MIN_QUOTE || wanted.length > MAX_QUOTE) return undefined;

  // Search the folded transcript, then map back to the original characters
  // so the person sees their own punctuation.
  const original = evening.transcript;
  const map: number[] = [];
  let folded = "";
  let lastSpace = true;
  for (let i = 0; i < original.length; i++) {
    let ch = original[i]!;
    if (/\s/.test(ch)) {
      if (lastSpace) continue;
      ch = " ";
      lastSpace = true;
    } else {
      lastSpace = false;
      ch = fold(ch) || ch;
    }
    folded += ch.toLowerCase();
    map.push(i);
  }
  const at = folded.indexOf(wanted);
  if (at === -1) return undefined;
  const start = map[at]!;
  const end = map[at + wanted.length - 1]! + 1;
  // Whole words only: a quote that starts or stops inside a word reads as
  // a glitch, and changes what the person said.
  const wordChar = /[\p{L}\p{N}]/u;
  if (wordChar.test(original[start - 1] ?? "") || wordChar.test(original[end] ?? "")) {
    return undefined;
  }
  return {
    recordId: evening.recordId,
    date: evening.date,
    quote: original.slice(start, end),
  };
}

/** The generator's raw plan: the shared shape plus unverified claims. */
export type ClaimedPlan = Omit<DailyPlan, "slots" | "questionSource"> & {
  slots: (DailyPlan["slots"][number] & ClaimedSource)[];
  questionSourceRecordId?: string;
  questionQuote?: string;
};

/** Keep every step; attach a source only where it verifies. */
export function attachSources(plan: ClaimedPlan, words: RecentWords[]): DailyPlan {
  const { questionSourceRecordId, questionQuote, ...rest } = plan;
  const questionSource = verifySource(
    { sourceRecordId: questionSourceRecordId, quote: questionQuote },
    words,
  );
  return {
    ...rest,
    slots: plan.slots.map(({ sourceRecordId, quote, ...slot }) => {
      const source = verifySource({ sourceRecordId, quote }, words);
      return source ? { ...slot, source } : slot;
    }),
    ...(questionSource ? { questionSource } : {}),
  };
}
