import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import type { DailyPlan, PlanSlot } from "@dawnward/core";
import {
  fetchEvents,
  fetchMe,
  fetchPlan,
  markEventSeen,
  markSlot,
  today,
  type Me,
  type ModelEvent,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";
import { Press, useReducedMotion } from "@/lib/motion";
import { Constellation } from "@/lib/constellation";
import { syncPresence } from "@/lib/presence";

const SLOT_LABELS: Record<PlanSlot["slot"], string> = {
  build: "One thing to build",
  train: "One thing to train",
  learn: "One thing to learn",
  confront: "One thing to confront",
  experience: "One thing to experience",
};

// Shown ONLY to an onboarded person when their plan is unreachable, and it
// says so. It claims nothing about them (the app never fakes knowing you).
const FALLBACK: DailyPlan = {
  date: today(),
  restDay: false,
  slots: [
    { slot: "train", text: "Move for 30 minutes, any way you like.", because: "a steady default for any day" },
    { slot: "learn", text: "Read 15 pages of something worth your attention.", because: "a steady default for any day" },
    { slot: "experience", text: "Take a different route than usual today.", because: "a steady default for any day" },
  ],
  question: "What would make tonight feel like you actually lived today?",
};

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Morning arrival: dealt like cards, 60ms apart, 12px rise + fade. */
function DealtCard({
  index,
  reduced,
  children,
}: {
  index: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [index, progress, reduced]);
  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Completion: the slot exhales, its label warming to Gold for one breath. */
function SlotCard({
  slot,
  done,
  reduced,
  onToggle,
}: {
  slot: PlanSlot;
  done: boolean;
  reduced: boolean;
  onToggle: () => void;
}) {
  const breath = useRef(new Animated.Value(0)).current;
  const press = () => {
    onToggle();
    if (!done && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (!done && !reduced) {
      breath.setValue(0);
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 600, delay: 400, useNativeDriver: true }),
      ]).start();
    }
  };
  return (
    <Pressable style={[styles.card, done && styles.cardDone]} onPress={press}>
      <View>
        <Text style={theme.type.label}>{SLOT_LABELS[slot.slot]}</Text>
        <Animated.Text
          style={[
            theme.type.label,
            styles.labelBreath,
            { color: theme.colors.gold, opacity: breath },
          ]}
        >
          {SLOT_LABELS[slot.slot]}
        </Animated.Text>
      </View>
      <Text style={[theme.type.body, styles.slotText]}>{slot.text}</Text>
      <Text style={theme.type.dim}>{slot.because}</Text>
    </Pressable>
  );
}

/** The reveal (sacred moment #3): 800ms of darkness, then the words. */
function WeeklyReveal({
  event,
  reduced,
  onDone,
}: {
  event: ModelEvent;
  reduced: boolean;
  onDone: () => void;
}) {
  const words = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.timing(words, {
      toValue: 1,
      duration: 900,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, [reduced, words]);
  const verdictLine =
    event.payload.verdict === "confirmed"
      ? "The diagnosis holds. Two weeks of your life agree with it."
      : event.payload.verdict === "revised"
        ? "I was partly wrong about what was holding you back. Here is the truer version."
        : "I was wrong about what was holding you back. That is good news.";
  return (
    <View style={styles.revealRoot}>
      <Constellation />
      <Animated.View style={{ opacity: words, gap: 16, maxWidth: 320 }}>
        <Text style={theme.type.label}>
          {event.payload.day14 ? "Day 14 · the revision" : "Weekly review"}
        </Text>
        <Text style={[theme.type.title, { fontSize: 28, lineHeight: 36 }]}>
          {verdictLine}
        </Text>
        {(event.payload.notableChanges ?? []).map((line) => (
          <Text key={line} style={theme.type.dim}>
            {line}
          </Text>
        ))}
        <Press onPress={onDone} hitSlop={12} style={styles.revealButton}>
          <Text style={styles.revealButtonText}>Continue</Text>
        </Press>
      </Animated.View>
    </View>
  );
}

/** The first thing a new person sees: an invitation, never a fake plan. */
function Invitation() {
  return (
    <View style={styles.invitation}>
      <Text style={theme.type.label}>Dawnward</Text>
      <Text style={[theme.type.title, styles.invitationTitle]}>
        Who are you becoming?
      </Text>
      <Text style={[theme.type.body, styles.invitationBody]}>
        Before there can be a plan for your days, I need to know whose days
        they are. Seven short chapters, at your own pace. Then every morning
        starts here, written for you.
      </Text>
      <Link href="/onboarding" asChild>
        <Press style={styles.invitationButton}>
          <Text style={styles.invitationButtonText}>Begin your story</Text>
        </Press>
      </Link>
    </View>
  );
}

export default function TodayScreen() {
  const [me, setMe] = useState<Me | "loading" | "unreachable">("loading");
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [planFailed, setPlanFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<ModelEvent[]>([]);
  const reduced = useReducedMotion();

  const load = useCallback(async () => {
    let current: Me | "unreachable";
    try {
      current = await fetchMe();
    } catch {
      current = "unreachable";
    }
    setMe(current);

    const onboarded = current === "unreachable" || current.onboardingComplete;
    if (!onboarded) return;

    if (current !== "unreachable") {
      // Keep the two daily touchpoints in step with settings; never prompts here.
      syncPresence(current.touchpoints).catch(() => {});
    }

    try {
      setPlan(await fetchPlan(today()));
      setPlanFailed(false);
    } catch {
      setPlan(FALLBACK);
      setPlanFailed(true);
    }
    try {
      setEvents(await fetchEvents());
    } catch {
      // Events are a grace note, never an error state.
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function dismissEvent(event: ModelEvent) {
    setEvents((all) => all.filter((e) => e.id !== event.id));
    try {
      await markEventSeen(event.id);
    } catch {
      // If it fails it resurfaces next open, still only until seen.
    }
  }

  async function toggleSlot(slot: PlanSlot["slot"]) {
    if (!plan) return;
    const next = !plan.done?.[slot];
    setPlan({ ...plan, done: { ...plan.done, [slot]: next } });
    if (!planFailed) {
      try {
        await markSlot(plan.date, slot, next);
      } catch {
        // The optimistic mark stands; the server catches up next sync.
      }
    }
  }

  const promotion = events.find((e) => e.kind === "promotion");
  const weeklyReview = events.find((e) => e.kind === "weekly_review");
  const notOnboarded = me !== "loading" && me !== "unreachable" && !me.onboardingComplete;

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.dim}
            />
          }
        >
          {me === "loading" ? null : notOnboarded ? (
            <Invitation />
          ) : (
            <>
              {plan?.reentryGapDays === undefined ? (
                <>
                  <Text style={theme.type.label}>{greetingForNow()}</Text>
                  <Text style={[theme.type.title, styles.title]}>
                    Your evolution today
                  </Text>
                </>
              ) : (
                <View style={styles.reentryHero}>
                  <Text style={theme.type.label}>{greetingForNow()}</Text>
                  <Text style={[theme.type.title, styles.title]}>Welcome back</Text>
                  <Text style={[theme.type.body, styles.reentryBody]}>
                    Nothing is broken. Your campaign kept your seat warm, and it
                    starts again whenever you do. Today is a light one.
                  </Text>
                </View>
              )}

              {planFailed && (
                <Text style={[theme.type.dim, styles.offlineNote]}>
                  I can't reach your plan right now, so here is a steady
                  default. Pull down when you're back online.
                </Text>
              )}

              {promotion?.payload.statement && (
                <View style={styles.promotion}>
                  <Text style={[theme.type.label, { color: theme.colors.gold }]}>
                    I'm starting to understand something about you
                  </Text>
                  <Text style={[theme.type.epigraph, styles.promotionStatement]}>
                    {promotion.payload.statement}
                  </Text>
                  <Text style={theme.type.dim}>
                    Why I think this: {promotion.payload.basis}
                  </Text>
                  <Pressable onPress={() => dismissEvent(promotion)} hitSlop={8}>
                    <Text style={styles.promotionDismiss}>Noted</Text>
                  </Pressable>
                </View>
              )}

              {plan?.restDay ? (
                <View style={styles.restDay}>
                  <Text style={theme.type.label}>A rest day</Text>
                  <Text style={[theme.type.epigraph, styles.restLine]}>
                    No plan is the plan.
                  </Text>
                  <Text style={theme.type.dim}>
                    Sleep. Walk. Eat well. Look up. The work will still know you
                    tomorrow.
                  </Text>
                </View>
              ) : (
                plan?.slots.map((slot, i) => (
                  <DealtCard key={slot.slot} index={i} reduced={reduced}>
                    <SlotCard
                      slot={slot}
                      done={Boolean(plan.done?.[slot.slot])}
                      reduced={reduced}
                      onToggle={() => toggleSlot(slot.slot)}
                    />
                    {slot.slot === "build" && (
                      <Link href="/campaign" asChild>
                        <Pressable hitSlop={8}>
                          <Text style={styles.campaignLink}>The campaign →</Text>
                        </Pressable>
                      </Link>
                    )}
                  </DealtCard>
                ))
              )}

              {plan && !plan.restDay && (
                <DealtCard index={plan.slots.length + 1} reduced={reduced}>
                  <View style={styles.question}>
                    <Text style={theme.type.label}>One question</Text>
                    <Text style={[theme.type.epigraph, styles.questionText]}>
                      {plan.question}
                    </Text>
                  </View>
                </DealtCard>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      {weeklyReview && !notOnboarded && (
        <WeeklyReveal
          event={weeklyReview}
          reduced={reduced}
          onDone={() => dismissEvent(weeklyReview)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6), flexGrow: 1 },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(3) },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
  },
  cardDone: { opacity: 0.45 },
  labelBreath: { position: "absolute", top: 0, left: 0 },
  slotText: { marginVertical: theme.spacing(1) },
  question: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(3),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  questionText: { marginTop: theme.spacing(1.5) },
  offlineNote: { marginBottom: theme.spacing(2) },
  promotion: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.gold,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
  promotionStatement: { fontSize: 20, lineHeight: 27, color: theme.colors.ink },
  promotionDismiss: {
    alignSelf: "flex-end",
    fontFamily: fonts.labelMedium,
    fontSize: 11,
    letterSpacing: 11 * 0.22,
    textTransform: "uppercase",
    color: theme.colors.gold,
    paddingTop: theme.spacing(0.5),
  },
  campaignLink: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    letterSpacing: 10.5 * 0.2,
    textTransform: "uppercase",
    color: theme.colors.faint,
    paddingLeft: theme.spacing(0.5),
    paddingBottom: theme.spacing(1.5),
  },
  reentryHero: { marginBottom: theme.spacing(1) },
  reentryBody: {
    marginTop: -theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.colors.dim,
  },
  restDay: {
    paddingVertical: theme.spacing(8),
    alignItems: "center",
    gap: theme.spacing(2),
  },
  restLine: { fontSize: 30, lineHeight: 40 },
  invitation: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: theme.spacing(8),
    gap: theme.spacing(2),
  },
  invitationTitle: { fontSize: 40, lineHeight: 48 },
  invitationBody: { color: theme.colors.dim, maxWidth: 320 },
  invitationButton: {
    alignSelf: "flex-start",
    marginTop: theme.spacing(1),
    backgroundColor: theme.colors.gold,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1.75),
  },
  invitationButtonText: {
    fontFamily: fonts.labelMedium,
    color: theme.colors.ground,
    fontSize: 12,
    letterSpacing: 12 * 0.22,
    textTransform: "uppercase",
  },
  revealRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.ground,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  revealButton: {
    alignSelf: "flex-start",
    marginTop: theme.spacing(2),
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1.25),
  },
  revealButtonText: {
    fontFamily: fonts.labelMedium,
    fontSize: 11,
    letterSpacing: 11 * 0.22,
    textTransform: "uppercase",
    color: theme.colors.ink,
  },
});
