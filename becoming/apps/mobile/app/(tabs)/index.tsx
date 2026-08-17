import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DailyPlan, PlanSlot } from "@becoming/core";
import { fetchPlan, today } from "@/lib/api";
import { theme } from "@/lib/theme";

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

export default function TodayScreen() {
  const [plan, setPlan] = useState<DailyPlan>(PLACEHOLDER);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

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
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.textDim}
          />
        }
      >
        <Text style={theme.type.label}>Good morning</Text>
        <Text style={[theme.type.title, styles.title]}>
          Your evolution today
        </Text>

        {plan.restDay ? (
          <View style={styles.card}>
            <Text style={theme.type.body}>
              Today is for recovery. No plan is the plan.
            </Text>
          </View>
        ) : (
          plan.slots.map((slot) => (
            <Pressable
              key={slot.slot}
              style={[styles.card, done[slot.slot] && styles.cardDone]}
              onPress={() =>
                setDone((d) => ({ ...d, [slot.slot]: !d[slot.slot] }))
              }
            >
              <Text style={theme.type.label}>{SLOT_LABELS[slot.slot]}</Text>
              <Text style={[theme.type.body, styles.slotText]}>{slot.text}</Text>
              <Text style={theme.type.dim}>{slot.because}</Text>
            </Pressable>
          ))
        )}

        <View style={styles.question}>
          <Text style={theme.type.label}>One question</Text>
          <Text style={[theme.type.body, styles.questionText]}>
            {plan.question}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(3) },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
  },
  cardDone: { opacity: 0.45 },
  slotText: { marginVertical: theme.spacing(1) },
  question: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(3),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  questionText: {
    marginTop: theme.spacing(1),
    fontSize: 19,
    lineHeight: 28,
    color: theme.colors.accent,
  },
});
