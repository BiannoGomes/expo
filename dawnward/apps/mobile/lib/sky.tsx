import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { theme } from "./theme";
import { useReducedMotion } from "./motion";

/**
 * THE LIVING SKY (design-direction.md) — the ground knows what time it is.
 * The sky is always ≥90% darkness; the glow never exceeds the bottom 20%
 * of the screen; content never competes with it.
 *
 * The ambient field: a sparse scatter of true-to-night stars in the upper
 * sky, seeded by the calendar date, so the heavens hold still all day and
 * quietly rearrange overnight. Most are near-invisible; two carry a halo;
 * one breathes. This is atmosphere, never data: the constellation of the
 * person's real moments appears only on milestone screens.
 */
export type SkyMode = "predawn" | "still" | "dusk";

export function skyModeForNow(date = new Date()): SkyMode {
  const hour = date.getHours();
  if (hour < 10) return "predawn"; // the day is arriving
  if (hour >= 17) return "dusk"; // the day is settling
  return "still"; // a dark, quiet room even at noon
}

const GLOWS: Record<SkyMode, { colors: [string, string]; opacity: number }> = {
  predawn: { colors: ["#0B0E1200", theme.colors.predawnIndigo], opacity: 0.55 },
  still: { colors: ["#0B0E1200", "#0B0E12"], opacity: 0 },
  dusk: { colors: ["#0B0E1200", theme.colors.duskAmber], opacity: 0.8 },
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** mulberry32: a tiny seeded generator, so tonight's sky is tonight's sky. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface AmbientStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
  cool: boolean;
  halo: boolean;
}

function tonightsStars(width: number, height: number): AmbientStar[] {
  const d = new Date();
  const next = rng(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
  const stars: AmbientStar[] = [];
  for (let i = 0; i < 24; i++) {
    const mag = Math.pow(next(), 2.6); // a real sky: almost everything faint
    stars.push({
      x: next() * width,
      y: next() * height * 0.42,
      r: 0.4 + mag * 1.3,
      opacity: 0.08 + mag * 0.3,
      cool: next() > 0.65,
      halo: mag > 0.72,
    });
  }
  return stars;
}

function Breathing({ star }: { star: AmbientStar }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 3800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 3800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  return (
    <AnimatedCircle
      cx={star.x}
      cy={star.y}
      r={star.r}
      fill={star.cool ? "#C7D5EE" : theme.colors.ink}
      opacity={glow.interpolate({
        inputRange: [0, 1],
        outputRange: [star.opacity * 0.5, star.opacity * 1.4],
      })}
    />
  );
}

function AmbientField() {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const stars = useMemo(() => tonightsStars(width, height), [width, height]);
  const brightest = stars.reduce((a, b) => (b.r > a.r ? b : a), stars[0]!);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="ambWarm" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={theme.colors.ink} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={theme.colors.ink} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="ambCool" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C7D5EE" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#C7D5EE" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {stars.map((s, i) => (
        <Circle
          key={`h${i}`}
          cx={s.x}
          cy={s.y}
          r={s.halo ? s.r * 4 : 0}
          fill={s.cool ? "url(#ambCool)" : "url(#ambWarm)"}
          opacity={s.halo ? s.opacity : 0}
        />
      ))}
      {stars.map((s, i) =>
        !reduced && s === brightest ? (
          <Breathing key={`c${i}`} star={s} />
        ) : (
          <Circle
            key={`c${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.cool ? "#C7D5EE" : theme.colors.ink}
            opacity={s.opacity}
          />
        ),
      )}
    </Svg>
  );
}

export function LivingSky({ mode }: { mode: SkyMode }) {
  const glow = GLOWS[mode];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.ground }]} />
      {/* Upper atmosphere: a breath darker than the ground, so the room
          has depth instead of a flat backdrop. Darker, never lighter. */}
      <LinearGradient colors={["#06080D", "#0B0E1200"]} style={styles.zenith} />
      <AmbientField />
      {glow.opacity > 0 && (
        <LinearGradient
          colors={glow.colors}
          style={[styles.horizon, { opacity: glow.opacity }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zenith: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "35%",
    opacity: 0.8,
  },
  horizon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "20%",
  },
});
