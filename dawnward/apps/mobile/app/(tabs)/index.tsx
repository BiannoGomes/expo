import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import type { DailyPlan, PlanSlot } from "@dawnward/core";
import {
  fetchEvents,
  fetchPlan,
  markEventSeen,
  today,
  type ModelEvent,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";
import { useReducedMotion } from "@/lib/motion";

const SLOT_LABELS: Record<PlanSlot["slot"], string> = {
  build: "One thing to build",
  train: "One thing to train",
  learn: "One thing to learn",
  confront: "One thing to confront",
  experience: "One thing to experience",
};

// Shown until the API is reachable / the model has context.
const PLACEHOLDER: DailyPlan = {
  date: today(),
  restDay: false,
  slots: [
    { slot: "build", text: "Finish the onboarding flow you postponed yesterday.", because: "Ship One Thing, day 12 — one project, finished" },
    { slot: "train", text: "Move for 30 minutes, any way you like.", because: "a body in motion carries the rest" },
    { slot: "learn", text: "Read 15 pages of something that stretches you.", because: "you said curiosity matters to you" },
    { slot: "experience", text: "Take a different route than usual today.", because: "novelty is data" },
  ],
  question: "What would make tonight feel like you actually lived today?",
};

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Morning arrival: dealt like cards — 60ms apart, 12px rise + fade. */
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

/** Completion: the slot exhales — a 200ms settle, its label warming to Gold. */
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
        ? "I was partly wrong about what's holding you back. Here's the truer version."
        : "I was wrong about what's holding you back — and that's good news.";
  return (
    <View style={styles.revealRoot}>
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
        <Pressable onPress={onDone} hitSlop={12} style={styles.revealButton}>
          <Text style={styles.revealButtonText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function TodayScreen() {
  const [plan, setPlan] = useState<DailyPlan>(PLACEHOLDER);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<ModelEvent[]>([]);
  const reduced = useReducedMotion();

  const load = useCallback(async () => {
    try {
      setPlan(await fetchPlan(today()));
    } catch {
      // Offline / no server: keep the placeholder. Never an error wall.
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
      // If it fails it resurfaces next open — still only until seen.
    }
  }

  const promotion = events.find((e) => e.kind === "promotion");
  const weeklyReview = events.find((e) => e.kind === "weekly_review");

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
          <Text style={theme.type.label}>{greetingForNow()}</Text>
          <Text style={[theme.type.title, styles.title]}>
            Your evolution today
          </Text>

          {plan.reentryGapDays !== undefined && (
            <View style={styles.reentry}>
              <Text style={theme.type.body}>
                Welcome back. Nothing is broken — your campaign paused itself
                and resumes whenever you do. Today is a light day.
              </Text>
            </View>
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

          {plan.restDay ? (
            <View style={styles.card}>
              <Text style={theme.type.body}>
                Today is for recovery. No plan is the plan.
              </Text>
            </View>
          ) : (
            plan.slots.map((slot, i) => (
              <DealtCard key={slot.slot} index={i} reduced={reduced}>
                <SlotCard
                  slot={slot}
                  done={Boolean(done[slot.slot])}
                  reduced={reduced}
                  onToggle={() =>
                    setDone((d) => ({ ...d, [slot.slot]: !d[slot.slot] }))
                  }
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

          <DealtCard index={plan.slots.length + 1} reduced={reduced}>
            <View style={styles.question}>
              <Text style={theme.type.label}>One question</Text>
              <Text style={[theme.type.epigraph, styles.questionText]}>
                {plan.question}
              </Text>
            </View>
          </DealtCard>
        </ScrollView>
      </SafeAreaView>
      {weeklyReview && (
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
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
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
  reentry: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.gold,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
  },
});
