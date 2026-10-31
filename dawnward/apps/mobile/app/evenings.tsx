import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fetchEvenings, setEveningLeftOut, type EveningView } from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";
import { Press } from "@/lib/motion";
import { eveningDate } from "@/lib/quote";

/**
 * Your evenings: everything the person has said at night, word for word,
 * searchable. Any evening can be left out of what Dawnward understands and
 * brought back. Leaving one out hides what rests on it; nothing is deleted.
 */
const PAGE = 30;
const LONG = 280;
const UNDO_MS = 6000;

type Notice = { text: string; undo?: () => void } | null;

function EveningCard({
  evening,
  onToggle,
}: {
  evening: EveningView;
  onToggle: (e: EveningView) => void;
}) {
  const [open, setOpen] = useState(false);
  const long = evening.text.length > LONG;
  const beliefs =
    evening.beliefCount === 1
      ? "One belief rests on this evening."
      : `${evening.beliefCount} beliefs rest on this evening.`;
  return (
    <View style={[styles.card, evening.excluded && styles.cardOut]}>
      <Text style={styles.date}>{eveningDate(evening.date)}</Text>
      <Text
        style={[styles.text, evening.excluded && styles.textOut]}
        numberOfLines={open || !long ? undefined : 6}
      >
        {evening.text}
      </Text>
      {long && (
        <Press
          onPress={() => setOpen(!open)}
          hitSlop={8}
          accessibilityLabel={open ? "Show less of this evening" : "Read all of this evening"}
        >
          <Text style={styles.link}>{open ? "Show less" : "Read all"}</Text>
        </Press>
      )}
      {evening.excluded ? (
        <Text style={styles.status}>
          Left out. Nothing from this evening shapes your steps or what I understand.
        </Text>
      ) : (
        evening.beliefCount > 0 && <Text style={styles.status}>{beliefs}</Text>
      )}
      <Press
        style={styles.action}
        onPress={() => onToggle(evening)}
        accessibilityLabel={
          evening.excluded
            ? `Bring back your evening of ${eveningDate(evening.date)}`
            : `Leave out your evening of ${eveningDate(evening.date)}`
        }
      >
        <Text style={styles.actionText}>
          {evening.excluded ? "Bring it back" : "Leave this out"}
        </Text>
      </Press>
    </View>
  );
}

export default function EveningsScreen() {
  const [query, setQuery] = useState("");
  const [evenings, setEvenings] = useState<EveningView[] | null>(null);
  const [more, setMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeq = useRef(0);

  const load = useCallback(async (q: string) => {
    const seq = ++searchSeq.current;
    try {
      const page = await fetchEvenings(q);
      if (seq !== searchSeq.current) return; // a newer search won
      setEvenings(page);
      setMore(page.length === PAGE);
      setFailed(false);
    } catch {
      if (seq === searchSeq.current) setFailed(true);
    }
  }, []);

  // Search as they type, after a short pause.
  useEffect(() => {
    const t = setTimeout(() => load(query), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [query, load]);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  function show(next: Notice) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(next);
    if (next?.undo) noticeTimer.current = setTimeout(() => setNotice(null), UNDO_MS);
  }

  function patch(id: string, excluded: boolean) {
    setEvenings((list) => list?.map((e) => (e.id === id ? { ...e, excluded } : e)) ?? list);
  }

  async function apply(evening: EveningView, leftOut: boolean, offerUndo: boolean) {
    patch(evening.id, leftOut);
    try {
      await setEveningLeftOut(evening.id, leftOut);
      show(
        offerUndo
          ? {
              text: leftOut
                ? "Left out. I won't use this evening for your steps or beliefs."
                : "Brought back. This evening counts again.",
              undo: () => apply(evening, !leftOut, false),
            }
          : null,
      );
    } catch {
      patch(evening.id, !leftOut);
      show({ text: "That didn't go through, so nothing changed. Check your connection and try again." });
    }
  }

  async function older() {
    const last = evenings?.[evenings.length - 1];
    if (!last) return;
    try {
      const page = await fetchEvenings(query, last.occurredAt);
      setEvenings([...(evenings ?? []), ...page]);
      setMore(page.length === PAGE);
    } catch {
      show({ text: "Couldn't reach your older evenings. Try again in a moment." });
    }
  }

  const searching = query.trim().length > 0;

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={theme.type.label}>Your evenings</Text>
            <Press onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close your evenings">
              <Text style={styles.link}>Close</Text>
            </Press>
          </View>
          <Text style={[theme.type.title, styles.title]}>In your own words</Text>
          <Text style={theme.type.dim}>
            Every evening you've given me, exactly as you said it. Leave any one
            out and I stop using it. You can bring it back whenever you like.
          </Text>

          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search your evenings"
            placeholderTextColor={theme.colors.faint}
            accessibilityLabel="Search your evenings"
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />

          {notice && (
            <View style={styles.notice} accessibilityLiveRegion="polite">
              <Text style={styles.noticeText}>{notice.text}</Text>
              {notice.undo && (
                <Press
                  onPress={() => {
                    const undo = notice.undo;
                    show(null);
                    undo?.();
                  }}
                  hitSlop={8}
                  accessibilityLabel="Undo"
                >
                  <Text style={styles.undo}>Undo</Text>
                </Press>
              )}
            </View>
          )}

          {failed && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>Can't reach your evenings right now.</Text>
              <Press onPress={() => load(query)} hitSlop={8} accessibilityLabel="Try again">
                <Text style={styles.undo}>Try again</Text>
              </Press>
            </View>
          )}

          {evenings === null && !failed && (
            <Text style={[theme.type.dim, styles.empty]}>Gathering your evenings…</Text>
          )}

          {evenings?.length === 0 && (
            <Text style={[theme.type.dim, styles.empty]}>
              {searching
                ? `None of your evenings mention “${query.trim()}”.`
                : "Nothing here yet. Your first evening debrief will appear here, word for word."}
            </Text>
          )}

          {evenings?.map((e) => (
            <EveningCard key={e.id} evening={e} onToggle={(ev) => apply(ev, !ev.excluded, true)} />
          ))}

          {more && (
            <Press style={styles.more} onPress={older} accessibilityLabel="Show older evenings">
              <Text style={styles.actionText}>Show older evenings</Text>
            </Press>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  link: { fontFamily: fonts.body, fontSize: 14, color: theme.colors.dim, paddingVertical: 4 },
  search: {
    marginTop: theme.spacing(3),
    minHeight: 48,
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.card,
    // A field's edge needs 3:1 (WCAG 1.4.11); faint on ground is 4.9:1.
    borderWidth: 1,
    borderColor: theme.colors.faint,
    backgroundColor: theme.colors.surface,
    color: theme.colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  notice: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.raised,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  noticeText: { ...theme.type.dim, color: theme.colors.ink, flex: 1 },
  undo: { fontFamily: fonts.body, fontSize: 15, color: theme.colors.gold, paddingVertical: 6 },
  empty: { marginTop: theme.spacing(3) },
  card: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
  },
  cardOut: { backgroundColor: theme.colors.ground },
  date: { ...theme.type.dim, color: theme.colors.faint, fontSize: 12.5 },
  text: { ...theme.type.body, marginTop: theme.spacing(1) },
  textOut: { color: theme.colors.dim },
  status: { ...theme.type.dim, marginTop: theme.spacing(1.5) },
  action: {
    marginTop: theme.spacing(1.5),
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
  },
  actionText: { fontFamily: fonts.body, fontSize: 15, color: theme.colors.gold },
  more: { marginTop: theme.spacing(3), alignSelf: "center", minHeight: 44, justifyContent: "center" },
});
