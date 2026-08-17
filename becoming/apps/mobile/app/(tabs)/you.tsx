import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AssertionConfidence } from "@becoming/core";
import { theme } from "@/lib/theme";

/**
 * The Personal Model surface: what the system believes, how sure it is, and
 * why (spec 02 §6 — inspect / dispute / edit). Placeholder data until the
 * assertions endpoint exists.
 */
const SAMPLE: {
  statement: string;
  confidence: AssertionConfidence;
  why: string;
}[] = [
  {
    statement: "Adventure and challenge are core values for you.",
    confidence: "established",
    why: "Stated in onboarding and confirmed by 4 experiences you recorded.",
  },
  {
    statement: "Your consistency drops when you run several projects at once.",
    confidence: "probable",
    why: "Seen in 3 reflections across 2 weeks.",
  },
];

const CONFIDENCE_LABEL: Record<AssertionConfidence, string> = {
  hypothesis: "A guess",
  probable: "Probably true",
  established: "Well established",
};

export default function YouScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={theme.type.label}>Personal model</Text>
        <Text style={[theme.type.title, styles.title]}>
          What I understand about you
        </Text>
        <Text style={theme.type.dim}>
          Everything here cites its evidence, and everything here can be
          corrected. If something is wrong, tell me — corrections outrank my
          inferences, always.
        </Text>

        {SAMPLE.map((a) => (
          <View key={a.statement} style={styles.card}>
            <Text style={[theme.type.label, styles.confidence]}>
              {CONFIDENCE_LABEL[a.confidence]}
            </Text>
            <Text style={[theme.type.body, styles.statement]}>
              {a.statement}
            </Text>
            <Text style={theme.type.dim}>Why I think this: {a.why}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  card: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: theme.spacing(2.5),
  },
  confidence: { color: theme.colors.accent },
  statement: { marginVertical: theme.spacing(1) },
});
