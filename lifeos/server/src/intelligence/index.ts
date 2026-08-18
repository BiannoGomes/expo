import type { Intelligence } from "@lifeos/core";
import { intelligence as anthropicIntelligence } from "./anthropic.js";
import { mockIntelligence } from "./mock.js";

/**
 * The application depends on the Intelligence interface only (spec 02 §8).
 * MOCK_INTELLIGENCE=1 swaps in the deterministic mock — used by the
 * integration tests and for running the stack without an API key.
 */
export const intelligence: Intelligence =
  process.env.MOCK_INTELLIGENCE === "1" ? mockIntelligence : anthropicIntelligence;
