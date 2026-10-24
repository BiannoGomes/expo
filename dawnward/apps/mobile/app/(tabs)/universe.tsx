import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { fetchPlan, today } from "@/lib/api";
import type { DailyPlan } from "@dawnward/core";
import { fonts, theme } from "@/lib/theme";
import { Press, useReducedMotion } from "@/lib/motion";
import { UniverseScene, WORLDS, type World } from "@/lib/universe";

/**
 * My universe, scale 1: the intimate sky. The cosmos is the environment,
 * never a replacement for the interface — the one quiet move stays visible
 * without exploring anything.
 *
 * Moment II (travel): tapping a world dollies the whole sky toward it for
 * 1600 ms, ease in-out cubic, then the world opens. Reduced motion travels
 * instantly; nothing is lost with the movement.
 */
export default function UniverseScreen() {
  const { width, height } = useWindowDimensions();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const reduced = useReducedMotion();
  const zoom = useRef(new Animated.Value(0)).current;
  const target = useRef({ x: 0, y: 0 });
  const [traveling, setTraveling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      zoom.setValue(0);
      setTraveling(false);
      fetchPlan(today())
        .then(setPlan)
        .catch(() => {});
    }, [zoom]),
  );

  const travel = (world: World) => {
    if (traveling) return;
    const s = width / 390;
    // Where the world's center sits, so the camera can move toward it.
    target.current = {
      x: width / 2 - (world.x + world.w / 2) * s,
      y: height / 2 - (world.y + world.w / 2) * s,
    };
    if (reduced) {
      router.push(`/world/${world.key}`);
      return;
    }
    setTraveling(true);
    Animated.timing(zoom, {
      toValue: 1,
      duration: 1600,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.push(`/world/${world.key}`);
    });
  };

  const nextMove = plan?.slots.find((slot) => !plan.done?.[slot.slot]);
  const moveWorld = nextMove
    ? WORLDS.find((w) => w.slots.includes(nextMove.slot))
    : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: "#06080D" }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, target.current.x * 2.2] }) },
              { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, target.current.y * 2.2] }) },
              { scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) },
            ],
          },
        ]}
      >
        <UniverseScene onTravel={travel} />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="none">
          <Text style={styles.label}>MY UNIVERSE</Text>
          <Text style={styles.scale}>SCALE 1 · THE INTIMATE SKY</Text>
        </View>
        <View style={{ flex: 1 }} pointerEvents="box-none" />
        {!traveling && (
          <View style={styles.panelWrap} pointerEvents="box-none">
            {nextMove ? (
              <Press
                onPress={() => moveWorld && travel(moveWorld)}
                accessibilityLabel={`One quiet move: ${nextMove.text}. Opens the ${moveWorld?.name ?? "world"} it belongs to.`}
              >
                <View style={styles.panel}>
                  <Text style={styles.panelLabel}>ONE QUIET MOVE</Text>
                  <Text style={styles.panelTask}>{nextMove.text}</Text>
                  <Text style={styles.panelWhy}>
                    {moveWorld ? `From your ${moveWorld.name} world` : "From your plan"} · tap a
                    world to travel
                  </Text>
                </View>
              </Press>
            ) : (
              <View style={styles.panel}>
                <Text style={styles.panelLabel}>TONIGHT</Text>
                <Text style={styles.panelTask}>The day is lived. The debrief is waiting.</Text>
              </View>
            )}
            <Press onPress={() => router.push("/you")} accessibilityLabel="What I understand about you">
              <Text style={styles.modelLink}>What I understand about you →</Text>
            </Press>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(2),
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 11 * 0.22,
    color: theme.colors.dim,
  },
  scale: {
    fontFamily: fonts.label,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    color: theme.colors.faint,
  },
  panelWrap: {
    paddingHorizontal: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  panel: {
    backgroundColor: "rgba(11,14,18,0.78)",
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    gap: 6,
  },
  panelLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    color: theme.colors.gold,
  },
  panelTask: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
    color: theme.colors.ink,
  },
  panelWhy: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.dim,
  },
  modelLink: {
    paddingVertical: theme.spacing(1),
    paddingHorizontal: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.colors.dim,
  },
});
