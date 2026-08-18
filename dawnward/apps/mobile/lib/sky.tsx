import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "./theme";

/**
 * THE LIVING SKY (design-direction.md) — the ground knows what time it is.
 * The sky is always ≥90% darkness; the glow never exceeds the bottom 20%
 * of the screen; content never competes with it.
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

export function LivingSky({ mode }: { mode: SkyMode }) {
  const glow = GLOWS[mode];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.ground }]} />
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
  horizon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "20%",
  },
});
