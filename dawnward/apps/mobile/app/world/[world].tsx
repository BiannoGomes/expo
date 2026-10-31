import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  disputeAssertion,
  fetchAssertions,
  fetchFutureSelf,
  fetchGalaxy,
  fetchPlan,
  newClientKey,
  submitDebrief,
  today,
  type AssertionView,
  type Galaxy,
  type FutureSelfView,
} from "@/lib/api";
import type { DailyPlan } from "@dawnward/core";
import { fonts, theme } from "@/lib/theme";
import { Press, useReducedMotion } from "@/lib/motion";
import { NEBULA_SKY, worldFor } from "@/lib/universe";
import { MemoryGalaxy } from "@/lib/galaxy";
import { announce } from "@/lib/a11y";

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
  const [confirmDispute, setConfirmDispute] = useState(false);
  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [newStarId, setNewStarId] = useState<string | null>(null);
  const [thought, setThought] = useState("");
  const [keeping, setKeeping] = useState(false);
  const [captureNote, setCaptureNote] = useState<string | null>(null);
  const worldKey = (["mind", "body", "soul", "future"] as const).find((k) => k === key);
  const thoughtKey = useRef(newClientKey());
  useEffect(() => announce(captureNote), [captureNote]);

  const loadGalaxy = useCallback(async (): Promise<Galaxy | null> => {
    if (!worldKey) return null;
    try {
      const g = await fetchGalaxy(worldKey);
      setGalaxy(g);
      return g;
    } catch {
      return null;
    }
  }, [worldKey]);

  /** Prototype A: one thought, kept inside this world, born as a star. */
  async function keepThought() {
    const text = thought.trim();
    if (!text || keeping || !worldKey) return;
    setKeeping(true);
    setCaptureNote(null);
    // Without a galaxy loaded there is nothing to compare against, so no
    // star is announced as new rather than the wrong one.
    const before = galaxy ? new Set(galaxy.stars.map((s) => s.id)) : null;
    try {
      const result = await submitDebrief(today(), text, worldKey, thoughtKey.current);
      if (result.crisis) {
        // Nothing is stored in a crisis; the words stay and the reply leads.
        setCaptureNote(result.reply);
        return;
      }
      setThought((t) => (t.trim() === text ? "" : t));
      thoughtKey.current = newClientKey();
      const g = await loadGalaxy();
      const born = before ? g?.stars.find((s) => !before.has(s.id)) : undefined;
      setNewStarId(born?.id ?? null);
      setCaptureNote(born ? "Kept. It's a star now." : "Kept. It's in Your evenings.");
    } catch {
      setCaptureNote("That didn't reach me. Your thought is still here. Try again in a moment.");
    } finally {
      setKeeping(false);
    }
  }
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
      loadGalaxy();
    }, [key, reduced, rise, loadGalaxy]),
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
            <Text style={styles.title} accessibilityRole="header">{copy.title}</Text>
            <Text style={styles.body}>{copy.text}</Text>

            <View style={styles.capture}>
              <TextInput
                style={styles.captureInput}
                value={thought}
                onChangeText={setThought}
                placeholder={`One thought for ${world.name}`}
                placeholderTextColor={theme.colors.faint}
                accessibilityLabel={`One thought for ${world.name}`}
                multiline
              />
              <Press
                style={[styles.keep, (!thought.trim() || keeping) && { opacity: 0.45 }]}
                onPress={keepThought}
                disabled={!thought.trim() || keeping}
                accessibilityLabel="Keep it"
              >
                <Text style={styles.keepText}>{keeping ? "Keeping…" : "Keep it"}</Text>
              </Press>
            </View>
            {captureNote && (
              <Text style={styles.captureNote} accessibilityLiveRegion="polite">
                {captureNote}
              </Text>
            )}

            {galaxy && (
              <MemoryGalaxy
                galaxy={galaxy}
                worldName={world.name}
                newStarId={newStarId}
                onChanged={() => {
                  loadGalaxy();
                  fetchAssertions().then(setAssertions).catch(() => {});
                }}
              />
            )}

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
                ) : confirmDispute ? (
                  // A dispute cannot be undone, so it is asked once (WCAG 3.3.4).
                  <View style={{ gap: 8 }}>
                    <Text style={styles.beliefWhy}>Set this aside? I'll stop acting on it.</Text>
                    <View style={{ flexDirection: "row", gap: 24 }}>
                      <Press
                        onPress={() => {
                          setConfirmDispute(false);
                          setDisputed(true);
                          disputeAssertion(belief.id).catch(() => setDisputed(false));
                        }}
                        accessibilityLabel="Set it aside"
                      >
                        <Text style={styles.dispute}>Set it aside</Text>
                      </Press>
                      <Press onPress={() => setConfirmDispute(false)} accessibilityLabel="Keep it as it is">
                        <Text style={styles.beliefWhy}>Keep it as it is</Text>
                      </Press>
                    </View>
                  </View>
                ) : (
                  <Press onPress={() => setConfirmDispute(true)} accessibilityLabel="That's not right">
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
  capture: { flexDirection: "row", alignItems: "flex-end", gap: theme.spacing(1) },
  captureInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    borderWidth: 1,
    borderColor: theme.colors.faint,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    color: theme.colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  keep: {
    minHeight: 48,
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.gold,
    justifyContent: "center",
  },
  keepText: { fontFamily: fonts.body, fontSize: 15, color: theme.colors.ground },
  captureNote: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: theme.colors.ink },
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
