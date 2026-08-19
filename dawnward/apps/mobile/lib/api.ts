import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { DailyPlan } from "@dawnward/core";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "dawnward.token";

// ---------- Session (roadmap B1): anonymous device token, stored securely ----------

async function readToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function writeToken(token: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
      else globalThis.localStorage?.removeItem(TOKEN_KEY);
    } catch {
      // Private browsing: the session lives for this visit only.
    }
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

let sessionToken: string | null = null;

async function ensureSession(): Promise<string> {
  if (sessionToken) return sessionToken;
  const stored = await readToken();
  if (stored) {
    sessionToken = stored;
    return stored;
  }
  const res = await fetch(`${BASE_URL}/auth/device`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceName: Platform.OS }),
  });
  if (!res.ok) throw new Error(`device auth failed: ${res.status}`);
  const { token } = (await res.json()) as { token: string };
  sessionToken = token;
  await writeToken(token);
  return token;
}

export async function clearSession(): Promise<void> {
  sessionToken = null;
  await writeToken(null);
}

async function api(path: string, init?: RequestInit): Promise<Response> {
  const token = await ensureSession();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${token}`,
      ...(init?.body ? { "content-type": "application/json" } : {}),
    },
  });
  if (res.status === 401) {
    // Token revoked (e.g. account deleted elsewhere): start clean.
    await clearSession();
  }
  return res;
}

export function today(): string {
  // The user's day, not Greenwich's: an evening debrief in São Paulo or a
  // morning plan in Sydney must land on the date the person is living.
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// ---------- Me / consent / preferences (roadmap B2–B3) ----------

export interface Me {
  consent: { reflections?: { granted: boolean; at: string; policyVersion: string } };
  challengeOptIn: boolean;
  availableMinutesDaily: number;
  touchpoints: { morning: string; evening: string; weeklyDigest: boolean };
  preferredName: string | null;
  onboardingComplete: boolean;
}

export async function fetchMe(): Promise<Me> {
  const res = await api("/me");
  if (!res.ok) throw new Error(`me fetch failed: ${res.status}`);
  return res.json();
}

export async function giveConsent(
  reflections: boolean,
  challengeOptIn: boolean,
): Promise<void> {
  const res = await api("/consent", {
    method: "POST",
    body: JSON.stringify({ reflections, challengeOptIn }),
  });
  if (!res.ok) throw new Error(`consent failed: ${res.status}`);
}

export async function updateMe(patch: {
  challengeOptIn?: boolean;
  preferredName?: string | null;
  availableMinutesDaily?: number;
  touchpoints?: Me["touchpoints"];
}): Promise<void> {
  const res = await api("/me", { method: "PATCH", body: JSON.stringify(patch) });
  if (!res.ok) throw new Error(`update failed: ${res.status}`);
}

export async function exportData(): Promise<string> {
  const res = await api("/export");
  if (!res.ok) throw new Error(`export failed: ${res.status}`);
  return res.text();
}

export async function deleteAccount(): Promise<void> {
  const res = await api("/account", { method: "DELETE" });
  if (!res.ok) throw new Error(`delete failed: ${res.status}`);
  await clearSession();
}

// ---------- Daily loop ----------

export async function fetchPlan(date: string): Promise<DailyPlan> {
  const res = await api(`/plan/${date}`);
  if (!res.ok) throw new Error(`plan fetch failed: ${res.status}`);
  return res.json();
}

export async function markSlot(
  date: string,
  slot: string,
  done: boolean,
): Promise<DailyPlan> {
  const res = await api(`/plan/${date}/slot`, {
    method: "PATCH",
    body: JSON.stringify({ slot, done }),
  });
  if (!res.ok) throw new Error(`slot update failed: ${res.status}`);
  return res.json();
}

export async function transcribe(
  audioBase64: string,
  mimeType: string,
): Promise<string> {
  const res = await api("/transcribe", {
    method: "POST",
    body: JSON.stringify({ audio: audioBase64, mimeType }),
  });
  if (!res.ok) throw new Error(`transcription failed: ${res.status}`);
  const { text } = (await res.json()) as { text: string };
  return text;
}

export async function submitDebrief(
  date: string,
  transcript: string,
): Promise<{ crisis: boolean; reply: string }> {
  const res = await api("/debrief", {
    method: "POST",
    body: JSON.stringify({ date, transcript }),
  });
  if (!res.ok) throw new Error(`debrief failed: ${res.status}`);
  return res.json();
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
  const res = await api("/onboarding");
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
  const res = await api("/onboarding/message", {
    method: "POST",
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
  const res = await api("/assertions");
  if (!res.ok) throw new Error(`assertions fetch failed: ${res.status}`);
  return res.json();
}

export async function disputeAssertion(
  assertionId: string,
  correction?: string,
): Promise<void> {
  const res = await api(`/assertions/${assertionId}/dispute`, {
    method: "POST",
    body: JSON.stringify(correction ? { correction } : {}),
  });
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
  const res = await api("/campaign");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`campaign fetch failed: ${res.status}`);
  return res.json();
}

export async function abandonCampaign(
  campaignId: string,
  reflection?: string,
): Promise<void> {
  const res = await api(`/campaign/${campaignId}/abandon`, {
    method: "POST",
    body: JSON.stringify(reflection ? { reflection } : {}),
  });
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
  const res = await api("/events");
  if (!res.ok) throw new Error(`events fetch failed: ${res.status}`);
  return res.json();
}

export async function markEventSeen(eventId: string): Promise<void> {
  const res = await api(`/events/${eventId}/seen`, { method: "POST" });
  if (!res.ok) throw new Error(`mark seen failed: ${res.status}`);
}

// ---------- Future Self (written once at onboarding, re-readable forever) ----------

export interface FutureSelfView {
  horizonYear: number;
  domains: Record<string, string>;
}

export async function fetchFutureSelf(): Promise<FutureSelfView | null> {
  const res = await api("/future-self");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`future self fetch failed: ${res.status}`);
  return res.json();
}

// ---------- Constellation (milestone screens only) ----------

export interface Star {
  id: string;
  occurredAt: string;
  domain: string | null;
  weight: number;
}

export async function fetchConstellation(): Promise<Star[]> {
  const res = await api("/constellation");
  if (!res.ok) throw new Error(`constellation fetch failed: ${res.status}`);
  return res.json();
}
