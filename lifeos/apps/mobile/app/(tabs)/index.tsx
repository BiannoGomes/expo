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
import type { DailyPlan, PlanSlot } from "@lifeos/core";
import { fetchPlan, today } from "@/lib/api";
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

export default function TodayScreen() {
  const [plan, setPlan] = useState<DailyPlan>(PLACEHOLDER);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const reduced = useReducedMotion();

  const load = useCallback(async () => {
    try {
      setPlan(await fetchPlan(today()));
    } catch {
      // Offline / no server: keep the placeholder. Never an error wall.
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
  reentry: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.gold,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
  },
});
