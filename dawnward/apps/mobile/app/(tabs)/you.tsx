import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useFocusEffect } from "expo-router";
import {
  disputeAssertion,
  fetchAssertions,
  type AssertionView,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";

/**
 * The Personal Model surface: what the system believes, how sure it is, and
 * why (spec 02 §6 — inspect / dispute / correct). Hedging is mechanical:
 * driven by the confidence field, decided server-side.
 */
const CONFIDENCE_LABEL: Record<AssertionView["confidence"], string> = {
  hypothesis: "A guess",
  probable: "Probably true",
  established: "Well established",
};

function AssertionCard({
  assertion,
  onResolved,
}: {
  assertion: AssertionView;
  onResolved: () => void;
}) {
  const [mode, setMode] = useState<"read" | "options" | "correct">("read");
  const [correction, setCorrection] = useState("");
  const disputed = assertion.status === "disputed";

  async function setAside(withCorrection?: string) {
    try {
      await disputeAssertion(assertion.id, withCorrection);
      onResolved();
    } catch {
      // Offline: leave the card as-is; nothing was lost.
      setMode("read");
    }
  }

  return (
    <View style={[styles.card, disputed && { opacity: 0.5 }]}>
      <Text style={[theme.type.label, styles.confidence]}>
        {disputed ? "Set aside, at your word" : CONFIDENCE_LABEL[assertion.confidence]}
      </Text>
      <Text style={[theme.type.body, styles.statement]}>
        {assertion.statement}
      </Text>
      <Text style={theme.type.dim}>Why I think this: {assertion.why}</Text>

      {!disputed && mode === "read" && (
        <Pressable onPress={() => setMode("options")} hitSlop={8}>
          <Text style={styles.dispute}>That's not right</Text>
        </Pressable>
      )}

      {mode === "options" && (
        <View style={styles.options}>
          <Text style={theme.type.dim}>
            Your word outranks mine here, always.
          </Text>
          <View style={styles.optionRow}>
            <Pressable onPress={() => setAside()} hitSlop={8}>
              <Text style={styles.optionQuiet}>Set it aside</Text>
            </Pressable>
            <Pressable onPress={() => setMode("correct")} hitSlop={8}>
              <Text style={styles.optionGold}>Say it in your words</Text>
            </Pressable>
          </View>
        </View>
      )}

      {mode === "correct" && (
        <View style={styles.options}>
          <TextInput
            style={styles.correctionInput}
            multiline
            autoFocus
            placeholder="What's actually true…"
            placeholderTextColor={theme.colors.faint}
            value={correction}
            onChangeText={setCorrection}
          />
          <View style={styles.optionRow}>
            <Pressable onPress={() => setMode("read")} hitSlop={8}>
              <Text style={styles.optionQuiet}>Never mind</Text>
            </Pressable>
            <Pressable
              disabled={!correction.trim()}
              onPress={() => setAside(correction.trim())}
              hitSlop={8}
            >
              <Text style={[styles.optionGold, !correction.trim() && { opacity: 0.35 }]}>
                That's the truth of it
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function YouScreen() {
  const [assertions, setAssertions] = useState<AssertionView[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setAssertions(await fetchAssertions());
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const empty = assertions !== null && assertions.length === 0;

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={theme.colors.dim}
            />
          }
        >
          <View style={styles.headerRow}>
            <Text style={theme.type.label}>Personal model</Text>
            <Link href="/settings" asChild>
              <Pressable hitSlop={12}>
                <Text style={styles.settingsLink}>Settings</Text>
              </Pressable>
            </Link>
          </View>
          <Text style={[theme.type.title, styles.title]}>
            What I understand about you
          </Text>
          <Text style={theme.type.dim}>
            Each belief here shows where it came from, and you can correct
            any of it. If something reads wrong, tell me. Your word wins,
            every time.
          </Text>

          {(empty || assertions === null) && (
            <Link href="/onboarding" asChild>
              <Pressable style={styles.cta}>
                <Text style={theme.type.label}>Begin</Text>
                <Text style={styles.ctaText}>Who are you becoming?</Text>
                <Text style={theme.type.dim}>
                  Seven short chapters, at your own pace. At the end you meet
                  your Future Self, and the first 90 days toward them.
                </Text>
              </Pressable>
            </Link>
          )}

          {offline && (
            <Text style={[theme.type.dim, { marginTop: theme.spacing(2) }]}>
              Can't reach the server right now. Pull down to try again.
            </Text>
          )}

          {assertions?.map((a) => (
            <AssertionCard key={a.id} assertion={a} onResolved={load} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsLink: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    letterSpacing: 10.5 * 0.2,
    textTransform: "uppercase",
    color: theme.colors.faint,
  },
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  cta: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.gold,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
  },
  ctaText: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: 27 * 0.02,
    color: theme.colors.gold,
    marginVertical: theme.spacing(1),
  },
  card: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
  },
  confidence: { color: theme.colors.gold },
  statement: { marginVertical: theme.spacing(1) },
  dispute: {
    marginTop: theme.spacing(1.5),
    fontFamily: fonts.body,
    color: theme.colors.danger,
    fontSize: 13,
  },
  options: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: theme.spacing(1.5),
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionQuiet: { fontFamily: fonts.body, fontSize: 14, color: theme.colors.dim },
  optionGold: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: theme.colors.gold,
  },
  correctionInput: {
    minHeight: 70,
    backgroundColor: theme.colors.raised,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(1.5),
    color: theme.colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    textAlignVertical: "top",
  },
});
