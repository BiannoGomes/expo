import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

  async function onDispute(assertion: AssertionView) {
    Alert.alert(
      "That's not right?",
      "I'll set this aside immediately. Your corrections always outrank my inferences.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Set it aside",
          style: "destructive",
          onPress: async () => {
            try {
              await disputeAssertion(assertion.id);
              await load();
            } catch {
              // Silent retry on next focus; never guilt-loop the user.
            }
          },
        },
      ],
    );
  }

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
            tintColor={theme.colors.textDim}
          />
        }
      >
        <Text style={theme.type.label}>Personal model</Text>
        <Text style={[theme.type.title, styles.title]}>
          What I understand about you
        </Text>
        <Text style={theme.type.dim}>
          Everything here cites its evidence, and everything here can be
          corrected. If something is wrong, tell me — corrections outrank my
          inferences, always.
        </Text>

        {(empty || assertions === null) && (
          <Link href="/onboarding" asChild>
            <Pressable style={styles.cta}>
              <Text style={theme.type.label}>Begin</Text>
              <Text style={[theme.type.body, styles.ctaText]}>
                Who are you becoming?
              </Text>
              <Text style={theme.type.dim}>
                Seven short chapters. Self-paced. Then you meet your Future
                Self — and the first 90 days toward them.
              </Text>
            </Pressable>
          </Link>
        )}

        {offline && (
          <Text style={[theme.type.dim, { marginTop: theme.spacing(2) }]}>
            Can't reach the server right now — pull to retry.
          </Text>
        )}

        {assertions?.map((a) => (
          <View
            key={a.id}
            style={[styles.card, a.status === "disputed" && { opacity: 0.5 }]}
          >
            <Text style={[theme.type.label, styles.confidence]}>
              {a.status === "disputed"
                ? "Set aside — you disputed this"
                : CONFIDENCE_LABEL[a.confidence]}
            </Text>
            <Text style={[theme.type.body, styles.statement]}>
              {a.statement}
            </Text>
            <Text style={theme.type.dim}>Why I think this: {a.why}</Text>
            {a.status !== "disputed" && (
              <Pressable onPress={() => onDispute(a)} hitSlop={8}>
                <Text style={styles.dispute}>That's not right</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  cta: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
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
  confidence: { color: theme.colors.accent },
  statement: { marginVertical: theme.spacing(1) },
  dispute: {
    marginTop: theme.spacing(1.5),
    color: theme.colors.danger,
    fontSize: 13,
  },
});
