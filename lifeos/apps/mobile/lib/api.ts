import type { DailyPlan } from "@lifeos/core";

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

// ---------- Campaign ----------

export interface CampaignView {
  id: string;
  title: string;
  mission: string;
  why: string;
  primaryDomain: string;
  status: "active" | "paused";
  dayNumber: number | null;
  day14RevisionDone: boolean;
  milestones: { day: number; title: string }[];
}

export async function fetchCampaign(): Promise<CampaignView | null> {
  const res = await fetch(`${BASE_URL}/campaign/${DEV_USER_ID}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`campaign fetch failed: ${res.status}`);
  return res.json();
}

export async function abandonCampaign(
  campaignId: string,
  reflection?: string,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/campaign/${DEV_USER_ID}/${campaignId}/abandon`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reflection ? { reflection } : {}),
    },
  );
  if (!res.ok) throw new Error(`abandon failed: ${res.status}`);
}

// ---------- Model events (shown once, dismissible forever) ----------

export interface ModelEvent {
  id: string;
  kind: "promotion" | "weekly_review";
  payload: {
    statement?: string;
    basis?: string;
    verdict?: string;
    notableChanges?: string[];
    campaignTitle?: string | null;
    day14?: boolean;
  };
  createdAt: string;
}

export async function fetchEvents(): Promise<ModelEvent[]> {
  const res = await fetch(`${BASE_URL}/events/${DEV_USER_ID}`);
  if (!res.ok) throw new Error(`events fetch failed: ${res.status}`);
  return res.json();
}

export async function markEventSeen(eventId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${DEV_USER_ID}/${eventId}/seen`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`mark seen failed: ${res.status}`);
}
