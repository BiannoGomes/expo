import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  abandonCampaign,
  fetchCampaign,
  type CampaignView,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";

// Realistic fixture shown when the server is unreachable — never lorem.
const PLACEHOLDER: CampaignView = {
  id: "offline",
  title: "Ship One Thing",
  mission: "Finish and publish one project in 90 days.",
  why: "Concentrated force beats scattered ambition.",
  primaryDomain: "career",
  status: "active",
  dayNumber: 12,
  day14RevisionDone: false,
  milestones: [
    { day: 14, title: "Revise this diagnosis together" },
    { day: 30, title: "First working version" },
    { day: 60, title: "Feedback from three people" },
    { day: 90, title: "Shipped" },
  ],
};

export default function CampaignScreen() {
  const [campaign, setCampaign] = useState<CampaignView | null>(PLACEHOLDER);
  const [leaving, setLeaving] = useState(false);
  const [exitNote, setExitNote] = useState("");

  useEffect(() => {
    fetchCampaign()
      .then((c) => setCampaign(c ?? PLACEHOLDER))
      .catch(() => {});
  }, []);

  async function stepAway() {
    if (!campaign || campaign.id === "offline") {
      router.back();
      return;
    }
    try {
      await abandonCampaign(campaign.id, exitNote.trim() || undefined);
    } catch {
      // Offline: leave quietly; the server reconciles later.
    }
    router.back();
  }

  if (!campaign) return null;
  const day = campaign.dayNumber ?? 1;

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={theme.type.label}>
            {campaign.status === "paused" ? "Campaign · paused" : `Campaign · day ${day}`}
          </Text>
          <Text style={[theme.type.title, styles.title]}>{campaign.title}</Text>
          <Text style={[theme.type.body, styles.mission]}>{campaign.mission}</Text>
          <Text style={[theme.type.epigraph, styles.why]}>{campaign.why}</Text>

          <View style={styles.milestones}>
            {campaign.milestones.map((m) => {
              const isDay14 = m.day === 14;
              const passed = day > m.day;
              return (
                <View key={m.day} style={[styles.milestone, passed && { opacity: 0.45 }]}>
                  <Text style={[styles.milestoneDay, isDay14 && { color: theme.colors.gold }]}>
                    DAY {m.day}
                  </Text>
                  <View style={styles.milestoneBody}>
                    <Text style={theme.type.body}>{m.title}</Text>
                    {isDay14 && !campaign.day14RevisionDone && (
                      <Text style={[theme.type.dim, styles.promise]}>
                        A promise, not a checkpoint — if the diagnosis is wrong,
                        this is where we change it.
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {!leaving ? (
            <Pressable onPress={() => setLeaving(true)} hitSlop={8}>
              <Text style={styles.stepAway}>Step away from this campaign</Text>
            </Pressable>
          ) : (
            <View style={styles.exitCard}>
              <Text style={theme.type.body}>
                Campaigns end for good reasons too. If you want, say what
                changed — it helps me understand you. Or just go; no
                explanation owed.
              </Text>
              <TextInput
                style={styles.exitInput}
                multiline
                placeholder="What changed? (optional)"
                placeholderTextColor={theme.colors.faint}
                value={exitNote}
                onChangeText={setExitNote}
              />
              <View style={styles.exitActions}>
                <Pressable onPress={() => setLeaving(false)} hitSlop={8}>
                  <Text style={styles.stay}>Stay with it</Text>
                </Pressable>
                <Pressable onPress={stepAway} hitSlop={8}>
                  <Text style={styles.leave}>Step away</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1) },
  mission: { marginTop: theme.spacing(2) },
  why: { marginTop: theme.spacing(2), fontSize: 20, lineHeight: 28 },
  milestones: {
    marginTop: theme.spacing(4),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  milestone: {
    flexDirection: "row",
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(2),
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  milestoneDay: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 11 * 0.18,
    color: theme.colors.faint,
    width: 64,
    paddingTop: 4,
  },
  milestoneBody: { flex: 1, gap: 4 },
  promise: { fontStyle: "italic" },
  stepAway: {
    marginTop: theme.spacing(5),
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: theme.colors.faint,
    textAlign: "center",
  },
  exitCard: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
    gap: theme.spacing(1.5),
  },
  exitInput: {
    minHeight: 80,
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
  exitActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing(0.5),
  },
  stay: { fontFamily: fonts.bodyMedium, fontSize: 14, color: theme.colors.ink },
  leave: { fontFamily: fonts.body, fontSize: 14, color: theme.colors.danger },
});
