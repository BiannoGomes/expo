import type { DailyPlan } from "@becoming/core";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// Dev-only stand-in until auth exists (server /users bootstrap).
export const DEV_USER_ID = process.env.EXPO_PUBLIC_DEV_USER_ID ?? "";

export async function fetchPlan(date: string): Promise<DailyPlan> {
  const res = await fetch(`${BASE_URL}/plan/${DEV_USER_ID}/${date}`);
  if (!res.ok) throw new Error(`plan fetch failed: ${res.status}`);
  return res.json();
}

export async function submitDebrief(
  date: string,
  transcript: string,
): Promise<{ crisis: boolean; reply: string }> {
  const res = await fetch(`${BASE_URL}/debrief/${DEV_USER_ID}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ date, transcript }),
  });
  if (!res.ok) throw new Error(`debrief failed: ${res.status}`);
  return res.json();
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Onboarding ----------

export interface OnboardingState {
  complete: boolean;
  chapterIndex: number;
  chapterCount: number;
  chapterTitle: string | null;
  opening: string | null;
  messages: { role: "user" | "assistant"; text: string }[];
}

export async function fetchOnboarding(): Promise<OnboardingState> {
  const res = await fetch(`${BASE_URL}/onboarding/${DEV_USER_ID}`);
  if (!res.ok) throw new Error(`onboarding fetch failed: ${res.status}`);
  return res.json();
}

export interface OnboardingReply {
  crisis: boolean;
  reply: string;
  chapterComplete?: boolean;
  nextChapterTitle?: string;
  nextOpening?: string;
  onboardingComplete?: boolean;
  reveal?: string;
}

export async function sendOnboardingMessage(text: string): Promise<OnboardingReply> {
  const res = await fetch(`${BASE_URL}/onboarding/${DEV_USER_ID}/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`onboarding message failed: ${res.status}`);
  return res.json();
}

// ---------- Personal Model ----------

export interface AssertionView {
  id: string;
  kind: string;
  statement: string;
  domainIds: string[];
  source: string;
  confidence: "hypothesis" | "probable" | "established";
  status: string;
  why: string;
  lastConfirmedAt: string;
}

export async function fetchAssertions(): Promise<AssertionView[]> {
  const res = await fetch(`${BASE_URL}/assertions/${DEV_USER_ID}`);
  if (!res.ok) throw new Error(`assertions fetch failed: ${res.status}`);
  return res.json();
}

export async function disputeAssertion(
  assertionId: string,
  correction?: string,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/assertions/${DEV_USER_ID}/${assertionId}/dispute`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(correction ? { correction } : {}),
    },
  );
  if (!res.ok) throw new Error(`dispute failed: ${res.status}`);
}
