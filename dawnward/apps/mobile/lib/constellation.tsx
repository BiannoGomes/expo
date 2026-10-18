import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  RadialGradient,
  Stop,
} from "react-native-svg";
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
 * same life always draws the same sky.
 *
 * The rendering is astronomical, not decorative: stars carry magnitude
 * (most faint, few bright), color temperature (warm ink, cool blue-white,
 * gold for the moments that mattered), a soft halo, and, on the brightest,
 * the four-point diffraction cross a real lens would give them. Three
 * stars twinkle on a slow breath; reduced motion stills the whole sky.
 */

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

type Temp = "warm" | "cool" | "gold";

interface PlacedStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
  temp: Temp;
  bright: boolean;
}

const TEMP_FILL: Record<Temp, string> = {
  warm: theme.colors.ink,
  cool: "#C7D5EE",
  gold: theme.colors.gold,
};

function place(stars: Star[], width: number, height: number): PlacedStar[] {
  const now = Date.now();
  const oldest = Math.max(
    ...stars.map((s) => now - new Date(s.occurredAt).getTime()),
    1,
  );
  return stars.map((star) => {
    const h1 = hash(star.id);
    const h2 = hash(star.id + "y");
    const h3 = hash(star.id + "m");
    const sector = star.domain
      ? DOMAIN_ORDER.indexOf(star.domain)
      : Math.floor(h1 * 12);
    const sectorStart = (Math.max(sector, 0) / 12) * width;
    const x = sectorStart + h1 * (width / 12);
    // Recent moments sit low in the band; older ones drift higher. The
    // whole sky stays in the top of the screen so it never crosses content.
    const age = (now - new Date(star.occurredAt).getTime()) / oldest;
    const y = height * (0.26 - age * 0.2 + (h2 - 0.5) * 0.05);
    // Magnitude follows a real sky: a cubed roll keeps most stars faint
    // and lets a few burn. Weight (what the moment meant) adds its own light.
    const r = 0.6 + star.weight * 1.3 + Math.pow(h3, 3) * 1.1;
    const gold = star.weight >= 0.7;
    return {
      x,
      y: Math.min(Math.max(y, height * 0.03), height * 0.3),
      r,
      opacity: 0.2 + star.weight * 0.45 + h3 * 0.15,
      temp: gold ? "gold" : h3 > 0.62 ? "cool" : "warm",
      bright: gold || r > 1.9,
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

const MIN_STARS = 14;

function Twinkle({ star }: { star: PlacedStar }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2600 + star.r * 900,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2600 + star.r * 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow, star.r]);
  return (
    <AnimatedCircle
      cx={star.x}
      cy={star.y}
      r={star.r}
      fill={TEMP_FILL[star.temp]}
      opacity={glow.interpolate({
        inputRange: [0, 1],
        outputRange: [star.opacity * 0.55, Math.min(star.opacity * 1.25, 1)],
      })}
    />
  );
}

export function Constellation() {
  const { width, height } = useWindowDimensions();
  const [stars, setStars] = useState<Star[]>(PREVIEW);
  const reduced = useReducedMotion();
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchConstellation()
      .then((s) => setStars(s))
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

  const isPreview = Boolean(stars[0]?.id.startsWith("preview"));
  if (!isPreview && stars.length < MIN_STARS) {
    return null;
  }

  const placed = place(stars.slice(0, 22), width, height);
  const byDomain = new Map<string, number[]>();
  stars.forEach((star, i) => {
    const key = star.domain ?? "";
    byDomain.set(key, [...(byDomain.get(key) ?? []), i]);
  });
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const idxs of byDomain.values()) {
    for (let k = 0; k + 1 < idxs.length && k < 4; k++) {
      const a = placed[idxs[k]!];
      const b = placed[idxs[k + 1]!];
      if (!a || !b) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 10 && d < width * 0.3) {
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
  }

  // The three brightest non-gold stars breathe; everything else holds still.
  const twinklers = new Set(
    placed
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => !reduced && s.bright)
      .sort((a, b) => b.s.r - a.s.r)
      .slice(0, 3)
      .map(({ i }) => i),
  );

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
        <Defs>
          <RadialGradient id="haloWarm" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={theme.colors.ink} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={theme.colors.ink} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="haloCool" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#C7D5EE" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#C7D5EE" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="haloGold" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={theme.colors.gold} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={theme.colors.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {edges.map((e, i) => (
          <Line
            key={`e${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={theme.colors.ink}
            strokeWidth={0.5}
            opacity={0.07}
          />
        ))}
        {placed.map((s, i) => {
          const halo =
            s.temp === "gold" ? "url(#haloGold)" : s.temp === "cool" ? "url(#haloCool)" : "url(#haloWarm)";
          return (
            <G key={`s${i}`}>
              {s.bright && (
                <Circle cx={s.x} cy={s.y} r={s.r * 3.6} fill={halo} opacity={s.opacity} />
              )}
              {s.bright && (
                <>
                  <Line
                    x1={s.x - s.r * 4.5}
                    y1={s.y}
                    x2={s.x + s.r * 4.5}
                    y2={s.y}
                    stroke={TEMP_FILL[s.temp]}
                    strokeWidth={0.5}
                    opacity={s.opacity * 0.35}
                  />
                  <Line
                    x1={s.x}
                    y1={s.y - s.r * 4.5}
                    x2={s.x}
                    y2={s.y + s.r * 4.5}
                    stroke={TEMP_FILL[s.temp]}
                    strokeWidth={0.5}
                    opacity={s.opacity * 0.35}
                  />
                </>
              )}
              {twinklers.has(i) ? (
                <Twinkle star={s} />
              ) : (
                <Circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill={TEMP_FILL[s.temp]}
                  opacity={s.opacity}
                />
              )}
            </G>
          );
        })}
      </Svg>
    </Animated.View>
  );
}
