import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  deleteAccount,
  exportData,
  fetchMe,
  updateMe,
  type Me,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";

/**
 * Settings (roadmap B3): presence controls, the challenge switch, and real
 * data rights. Quiet by design — this is the room's fuse box, not a feature.
 */
function normalizeTime(raw: string): string | null {
  const m = raw.trim().match(/^([01]?\d|2[0-3])[:.h]?([0-5]\d)?$/);
  if (!m) return null;
  const h = String(m[1]).padStart(2, "0");
  const mm = m[2] ?? "00";
  return `${h}:${mm}`;
}

function TimeField({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <TextInput
      style={styles.timeInput}
      value={draft}
      onChangeText={setDraft}
      onEndEditing={() => {
        const normal = normalizeTime(draft);
        if (normal) onCommit(normal);
        else setDraft(value);
      }}
      keyboardType="numbers-and-punctuation"
    />
  );
}

export default function SettingsScreen() {
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .catch(() => setStatus("Can't reach the server right now."));
  }, []);

  async function save(patch: Parameters<typeof updateMe>[0], next: Partial<Me>) {
    setMe((m) => (m ? { ...m, ...next } : m));
    try {
      await updateMe(patch);
    } catch {
      setStatus("That change didn't reach the server. It will catch up next time.");
    }
  }

  async function onExport() {
    setStatus("Gathering everything now…");
    try {
      const json = await exportData();
      if (Platform.OS === "web") {
        // Browser: hand the file over directly.
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dawnward-export.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const file = new File(Paths.cache, "dawnward-export.json");
        file.write(json);
        await Sharing.shareAsync(file.uri, { mimeType: "application/json" });
      }
      setStatus("Your export is ready. Everything, with its evidence.");
    } catch {
      setStatus("The export didn't go through. Check your connection and try again.");
    }
  }

  async function onDelete() {
    try {
      await deleteAccount();
      setStatus(null);
      router.back();
    } catch {
      setStatus("That didn't go through. Check your connection and try again.");
      setConfirmingDelete(false);
    }
  }

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={theme.type.label}>Settings</Text>
          <Text style={[theme.type.title, styles.title]}>The quiet controls</Text>

          <View style={styles.card}>
            <Text style={theme.type.label}>Presence</Text>
            <Text style={[theme.type.dim, styles.cardNote]}>
              Dawnward reaches out twice a day, at your times, and never
              otherwise. No streaks. No nagging. Ever.
            </Text>
            <View style={styles.row}>
              <Text style={theme.type.body}>Morning plan</Text>
              <TimeField
                value={me?.touchpoints.morning ?? "07:30"}
                onCommit={(morning) =>
                  me &&
                  save(
                    { touchpoints: { ...me.touchpoints, morning } },
                    { touchpoints: { ...me.touchpoints, morning } },
                  )
                }
              />
            </View>
            <View style={styles.row}>
              <Text style={theme.type.body}>Evening debrief</Text>
              <TimeField
                value={me?.touchpoints.evening ?? "21:00"}
                onCommit={(evening) =>
                  me &&
                  save(
                    { touchpoints: { ...me.touchpoints, evening } },
                    { touchpoints: { ...me.touchpoints, evening } },
                  )
                }
              />
            </View>
            <View style={styles.row}>
              <Text style={theme.type.body}>Weekly digest when away</Text>
              <Switch
                value={me?.touchpoints.weeklyDigest ?? false}
                onValueChange={(weeklyDigest) => {
                  if (!me) return;
                  save(
                    { touchpoints: { ...me.touchpoints, weeklyDigest } },
                    { touchpoints: { ...me.touchpoints, weeklyDigest } },
                  );
                }}
                trackColor={{ false: theme.colors.line, true: theme.colors.gold }}
                thumbColor={theme.colors.ink}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={theme.type.label}>Challenge</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={theme.type.body}>Name my contradictions</Text>
                <Text style={theme.type.dim}>
                  When what you say and what you do disagree, I say so.
                </Text>
              </View>
              <Switch
                value={me?.challengeOptIn ?? false}
                onValueChange={(challengeOptIn) =>
                  save({ challengeOptIn }, { challengeOptIn })
                }
                trackColor={{ false: theme.colors.line, true: theme.colors.gold }}
                thumbColor={theme.colors.ink}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={theme.type.label}>Your data</Text>
            <Text style={[theme.type.dim, styles.cardNote]}>
              Everything Dawnward knows is yours to take or to erase.
            </Text>
            <Pressable onPress={onExport} hitSlop={8}>
              <Text style={styles.action}>Download everything</Text>
            </Pressable>
            {!confirmingDelete ? (
              <Pressable onPress={() => setConfirmingDelete(true)} hitSlop={8}>
                <Text style={styles.danger}>Erase my account</Text>
              </Pressable>
            ) : (
              <View style={styles.confirm}>
                <Text style={theme.type.body}>
                  This erases everything, permanently. Your story, your model,
                  your campaigns. There is no undo.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable onPress={() => setConfirmingDelete(false)} hitSlop={8}>
                    <Text style={styles.keep}>Keep my account</Text>
                  </Pressable>
                  <Pressable onPress={onDelete} hitSlop={8}>
                    <Text style={styles.danger}>Erase everything</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {status && <Text style={[theme.type.dim, styles.status]}>{status}</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  content: { padding: theme.spacing(3), gap: theme.spacing(2), paddingBottom: theme.spacing(6) },
  title: { marginBottom: theme.spacing(1) },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    gap: theme.spacing(1.5),
  },
  cardNote: { marginTop: -theme.spacing(0.5) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInput: {
    fontFamily: fonts.labelMedium,
    fontSize: 14,
    letterSpacing: 2,
    color: theme.colors.ink,
    backgroundColor: theme.colors.raised,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.75),
    minWidth: 76,
    textAlign: "center",
  },
  action: { fontFamily: fonts.bodyMedium, fontSize: 15, color: theme.colors.gold },
  danger: { fontFamily: fonts.body, fontSize: 15, color: theme.colors.danger },
  keep: { fontFamily: fonts.bodyMedium, fontSize: 15, color: theme.colors.ink },
  confirm: { gap: theme.spacing(1.5), paddingTop: theme.spacing(0.5) },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: { textAlign: "center" },
});
