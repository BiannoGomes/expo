import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { fonts, theme } from "./theme";
import { Press, useReducedMotion } from "./motion";

/**
 * THE LIVING UNIVERSE (design-direction: THE FIVE MOMENTS, creative-playbook
 * addendum). Stars are moments; worlds are domains of life; orbits are
 * confirmed connections. Progress changes the universe itself, always
 * qualitatively: atmosphere and definition grow; numbers, meters and streaks
 * never appear, and a world never darkens for inactivity.
 *
 * The artwork lives in assets/universe (generated, on pure black, so it
 * composites onto the night without masks).
 */

export type WorldKey = "body" | "mind" | "soul" | "future";

export interface World {
  key: WorldKey;
  name: string;
  meta: string;
  metaGold: boolean;
  image: ImageSourcePropType;
  /** Taxonomy v1 domain ids this world gathers. */
  domains: string[];
  /** Plan slots that belong to this world's weather. */
  slots: string[];
  /** Scale-1 placement, in 390-wide design units. */
  x: number;
  y: number;
  w: number;
}

export const WORLDS: World[] = [
  {
    key: "future",
    name: "Future",
    meta: "The direction",
    metaGold: false,
    image: require("../assets/universe/future.png"),
    domains: [],
    slots: [],
    x: 252, y: 64, w: 170,
  },
  {
    key: "body",
    name: "Body",
    meta: "A world you know",
    metaGold: false,
    image: require("../assets/universe/body.png"),
    domains: ["physical", "adventure"],
    slots: ["train"],
    x: 14, y: 206, w: 150,
  },
  {
    key: "soul",
    name: "Soul",
    meta: "Quiet, luminous",
    metaGold: false,
    image: require("../assets/universe/soul.png"),
    domains: ["meaning", "emotional", "character", "relationships"],
    slots: ["experience", "confront"],
    x: 16, y: 480, w: 100,
  },
  {
    key: "mind",
    name: "Mind",
    meta: "The current exploration",
    metaGold: true,
    image: require("../assets/universe/mind.png"),
    domains: ["mental", "career", "creativity", "wealth"],
    slots: ["build", "learn"],
    x: 172, y: 376, w: 260,
  },
];

export const NEBULA_SKY = require("../assets/universe/nebula-sky.png");
export const ORBITS = require("../assets/universe/orbits.png");

export function worldFor(key: string): World | undefined {
  return WORLDS.find((w) => w.key === key);
}

/** Moment I: the quiet sky. An imperceptible vertical drift, nothing more. */
function Drift({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduced]);
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function UniverseScene({
  onTravel,
}: {
  onTravel: (world: World) => void;
}) {
  const { width } = useWindowDimensions();
  const s = width / 390;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Image
        source={NEBULA_SKY}
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        resizeMode="cover"
        accessible={false}
      />
      <Drift>
        {WORLDS.map((world) => (
          <View
            key={world.key}
            style={{ position: "absolute", left: world.x * s, top: world.y * s, alignItems: "center" }}
          >
            <Press
              onPress={() => onTravel(world)}
              accessibilityLabel={`${world.name}. ${world.meta}. Travel to this world.`}
            >
              <Image
                source={world.image}
                style={{ width: world.w * s, height: world.w * s }}
                resizeMode="contain"
              />
            </Press>
            <Text style={styles.worldName}>{world.name}</Text>
            <Text style={[styles.worldMeta, world.metaGold && { color: theme.colors.gold }]}>
              {world.meta.toUpperCase()}
            </Text>
          </View>
        ))}
      </Drift>
    </View>
  );
}

const styles = StyleSheet.create({
  worldName: {
    marginTop: -6,
    fontFamily: fonts.display,
    fontSize: 17,
    color: theme.colors.ink,
    textShadowColor: "rgba(4,6,10,0.9)",
    textShadowRadius: 8,
  },
  worldMeta: {
    marginTop: 1,
    fontFamily: fonts.label,
    fontSize: 8,
    letterSpacing: 8 * 0.22,
    color: theme.colors.faint,
  },
});
