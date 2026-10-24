import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  disputeAssertion,
  fetchAssertions,
  fetchFutureSelf,
  fetchPlan,
  today,
  type AssertionView,
  type FutureSelfView,
} from "@/lib/api";
import type { DailyPlan } from "@dawnward/core";
import { fonts, theme } from "@/lib/theme";
import { Press, useReducedMotion } from "@/lib/motion";
import { NEBULA_SKY, worldFor } from "@/lib/universe";

/**
 * A world, scale 2: one domain of life, readable. What matters, what has
 * actually been learned (with its receipts and a one-tap dispute), and one
 * quiet move. Never a score, never a meter.
 *
 * Moment III: the panel arrives 80 ms after the world settles — rise 24 px,
 * 420 ms, ease-out quart. Reduced motion: the panel is simply present.
 */

const WORLD_COPY: Record<string, { title: string; text: string }> = {
  body: {
    title: "The world where promises become physical.",
    text: "Training, rest, the water you're preparing for. This world holds only what your days have shown it. Its weather is simply how things have been lately.",
  },
  mind: {
    title: "The world of clarity.",
    text: "Connections appear here between what you read, what you write and what you believe. The rings are the thoughts that keep returning, settling into orbit.",
  },
  soul: {
    title: "The quiet, luminous world.",
    text: "Meaning, feeling and the people who matter live here. It grows in light when your evenings say something true.",
  },
  future: {
    title: "The direction you chose.",
    text: "An aspiration you wrote, never a prediction. It gains definition as your days agree with it.",
  },
};

export default function WorldScreen() {
  const { world: key } = useLocalSearchParams<{ world: string }>();
  const world = worldFor(key ?? "");
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [assertions, setAssertions] = useState<AssertionView[]>([]);
  const [futureSelf, setFutureSelf] = useState<FutureSelfView | null>(null);
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [disputed, setDisputed] = useState(false);
  const rise = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useFocusEffect(
    useCallback(() => {
      if (!reduced) {
        rise.setValue(0);
        Animated.timing(rise, {
          toValue: 1,
          duration: 420,
          delay: 80,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }).start();
      }
      fetchAssertions().then(setAssertions).catch(() => {});
      fetchPlan(today()).then(setPlan).catch(() => {});
      if (key === "future") fetchFutureSelf().then(setFutureSelf).catch(() => {});
    }, [key, reduced, rise]),
  );

  if (!world) return null;
  const copy = WORLD_COPY[world.key];
  const belief = assertions.find(
    (a) => a.status === "active" && a.domainIds.some((d) => world.domains.includes(d)),
  ) ?? assertions.find((a) => a.domainIds.some((d) => world.domains.includes(d)));
  const move = plan?.slots.find(
    (slot) => world.slots.includes(slot.slot) && !plan.done?.[slot.slot],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#06080D" }}>
      <Image
        source={NEBULA_SKY}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessible={false}
      />
      <Image
        source={world.image}
        style={{
          position: "absolute",
          left: width * 0.1,
          top: -width * 0.32,
          width: width * 1.35,
          height: width * 1.35,
        }}
        resizeMode="contain"
        accessible={false}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <Press onPress={() => router.back()} accessibilityLabel="Back to your sky">
            <Text style={styles.back}>← YOUR SKY</Text>
          </Press>
          <Text style={styles.scale}>SCALE 2 · {world.name.toUpperCase()}</Text>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: rise,
                transform: [
                  { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              },
            ]}
          >
            <Text style={styles.panelLabel}>
              {world.name.toUpperCase()} · {world.meta.toUpperCase()}
            </Text>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.body}>{copy.text}</Text>

            {world.key === "future" && futureSelf && (
              <View style={styles.beliefCard}>
                <View style={styles.beliefTop}>
                  <Text style={styles.beliefLabel}>THE PERSON YOU'RE BECOMING</Text>
                  <Text style={styles.beliefYear}>{futureSelf.horizonYear}</Text>
                </View>
                {Object.entries(futureSelf.domains)
                  .slice(0, 2)
                  .map(([domain, line]) => (
                    <Text key={domain} style={styles.futureLine}>
                      {line}
                    </Text>
                  ))}
                <Text style={styles.body}>An aspiration you chose. Never a prediction.</Text>
              </View>
            )}

            {world.key !== "future" && belief && (
              <View style={styles.beliefCard}>
                <Text style={styles.beliefLabel}>WHAT I UNDERSTAND SO FAR</Text>
                <Text style={styles.beliefStatement}>{belief.statement}</Text>
                <Text style={styles.beliefWhy}>{belief.why}</Text>
                {disputed ? (
                  <Text style={styles.beliefWhy}>
                    Thank you. I'll hold this loosely until your days say otherwise.
                  </Text>
                ) : (
                  <Press
                    onPress={() => {
                      setDisputed(true);
                      disputeAssertion(belief.id).catch(() => setDisputed(false));
                    }}
                    accessibilityLabel="That's not right"
                  >
                    <Text style={styles.dispute}>That's not right</Text>
                  </Press>
                )}
              </View>
            )}

            {move && (
              <View style={styles.moveBlock}>
                <Text style={styles.move}>One quiet move today: {move.text}.</Text>
                <Text style={styles.beliefWhy}>{move.because}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(1),
  },
  back: {
    paddingVertical: theme.spacing(1.5),
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    color: theme.colors.dim,
  },
  scale: {
    fontFamily: fonts.label,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    color: theme.colors.faint,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: theme.spacing(3),
  },
  panel: {
    backgroundColor: "rgba(11,14,18,0.82)",
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sheet,
    padding: theme.spacing(3),
    gap: theme.spacing(2),
  },
  panelLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 11 * 0.22,
    color: theme.colors.gold,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 35,
    color: theme.colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: theme.colors.dim,
  },
  beliefCard: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  beliefTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  beliefLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    color: theme.colors.faint,
  },
  beliefYear: {
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    color: theme.colors.faint,
  },
  beliefStatement: {
    fontFamily: fonts.displayItalic,
    fontSize: 19,
    lineHeight: 26,
    color: theme.colors.ink,
  },
  futureLine: {
    fontFamily: fonts.displayItalic,
    fontSize: 19,
    lineHeight: 26,
    color: theme.colors.gold,
  },
  beliefWhy: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.dim,
  },
  dispute: {
    paddingVertical: theme.spacing(1),
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.colors.danger,
  },
  moveBlock: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    paddingTop: theme.spacing(2),
    gap: 6,
  },
  move: {
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.gold,
  },
});
