import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { fetchConstellation, type Star } from "./api";
import { theme } from "./theme";
import { useReducedMotion } from "./motion";

// Taxonomy v1 domain order (packages/core taxonomy.v1.json). Kept inline so
// the app bundle never imports runtime code from the server-side core package.
const DOMAIN_ORDER = [
  "physical", "mental", "emotional", "character", "relationships", "career",
  "wealth", "creativity", "adventure", "meaning", "environment", "legacy",
];

/**
 * The constellation (design-direction: THE LIVING SKY). Milestone screens
 * only. Every point of light is something the person lived; weight comes
 * from what the moment turned out to mean. Layout is deterministic: the
 * same life always draws the same sky. Drift is one slow breath, and
 * reduced motion stills it completely.
 */

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

interface PlacedStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
  gold: boolean;
}

function place(stars: Star[], width: number, height: number): PlacedStar[] {
  const now = Date.now();
  const oldest = Math.max(
    ...stars.map((s) => now - new Date(s.occurredAt).getTime()),
    1,
  );
  return stars.map((star) => {
    const h1 = hash(star.id);
    const h2 = hash(star.id + "y");
    const sector = star.domain
      ? DOMAIN_ORDER.indexOf(star.domain)
      : Math.floor(h1 * 12);
    const sectorStart = (Math.max(sector, 0) / 12) * width;
    const x = sectorStart + h1 * (width / 12);
    // Older moments sit higher in the sky; recent ones near the horizon.
    const age = (now - new Date(star.occurredAt).getTime()) / oldest;
    const y = height * (0.08 + age * 0.62 + (h2 - 0.5) * 0.08);
    return {
      x,
      y: Math.min(Math.max(y, height * 0.05), height * 0.75),
      r: 1 + star.weight * 1.6,
      opacity: 0.22 + star.weight * 0.6,
      gold: star.weight >= 0.7,
    };
  });
}

// A believable sky for the offline preview: shaped like a real month of
// records, and clearly replaced the moment real life arrives.
const PREVIEW: Star[] = Array.from({ length: 26 }, (_, i) => ({
  id: `preview-${i * 7919}`,
  occurredAt: new Date(Date.now() - i * 86400000 * 1.3).toISOString(),
  domain: DOMAIN_ORDER[(i * 5) % 12] ?? null,
  weight: i % 6 === 0 ? 0.7 : i % 4 === 0 ? 0.55 : 0.4,
}));

export function Constellation() {
  const { width, height } = useWindowDimensions();
  const [stars, setStars] = useState<Star[]>(PREVIEW);
  const reduced = useReducedMotion();
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchConstellation()
      .then((s) => {
        if (s.length >= 3) setStars(s);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 14000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 14000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduced]);

  const placed = place(stars, width, height);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
          ],
        },
      ]}
    >
      <Svg width={width} height={height}>
        {placed.map((s, i) => (
          <Circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.gold ? theme.colors.gold : theme.colors.ink}
            opacity={s.opacity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
