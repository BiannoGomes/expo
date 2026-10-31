import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { router } from "expo-router";
import {
  disputeAssertion,
  setEveningLeftOut,
  type Galaxy,
  type GalaxyStar,
  type GalaxyTheme,
} from "./api";
import { fonts, theme } from "./theme";
import { Press, useReducedMotion } from "./motion";
import { eveningDate } from "./quote";
import { announce } from "./a11y";

/**
 * The Memory Galaxy (prototype B). A presentation of /galaxy, nothing more:
 * every star is an evening the person shared, every line joins two evenings
 * that support the same belief and is explained by it. The list mode shows
 * exactly the same data for screen readers and for anyone who prefers it.
 * Layout is deterministic: oldest on the left, height from the evening's id.
 */

const HEIGHT = 240;
const PAD = 22;
const HIT = 44;
/** Stars never sit closer than this; a crowded sky scrolls sideways
 * instead, so every star keeps a tap area of its own (WCAG 2.5.8). */
const MIN_SPACING = 32;

const CONFIDENCE_WORDS: Record<GalaxyTheme["confidence"], string> = {
  hypothesis: "A guess",
  probable: "Probably true",
  established: "Well established",
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Final mix, so ids that differ only at the end still spread out.
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}

type Selection = { kind: "star"; id: string } | { kind: "theme"; id: string } | null;
type Notice = { text: string; undo?: () => void } | null;

export function MemoryGalaxy({
  galaxy,
  worldName,
  newStarId,
  onChanged,
}: {
  galaxy: Galaxy;
  worldName: string;
  /** The evening just captured: it is born, then selected. */
  newStarId?: string | null;
  onChanged: () => void;
}) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState<"sky" | "list">("sky");
  const [selected, setSelected] = useState<Selection>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const birth = useRef(new Animated.Value(1)).current;
  const [confirmDispute, setConfirmDispute] = useState(false);
  useEffect(() => announce(notice?.text), [notice]);

  // Before paint, so the new star never flashes at full size for a frame.
  useLayoutEffect(() => {
    if (!newStarId) return;
    setSelected({ kind: "star", id: newStarId });
    if (reduced) {
      birth.setValue(1);
      return;
    }
    birth.setValue(0);
    Animated.timing(birth, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [newStarId, reduced, birth]);

  const themes = useMemo(() => new Map(galaxy.themes.map((t) => [t.id, t])), [galaxy]);
  const n = galaxy.stars.length;
  const skyWidth = Math.max(width, PAD * 2 + Math.max(n - 1, 0) * MIN_SPACING);
  const spacing = n > 1 ? (skyWidth - PAD * 2) / (n - 1) : HIT;
  // Never wider than the gap to the next star, so targets cannot overlap.
  const hit = Math.min(HIT, Math.floor(spacing));
  const placed = useMemo(() => {
    const usable = Math.max(skyWidth - PAD * 2, 1);
    return new Map(
      galaxy.stars.map((s, i) => [
        s.id,
        {
          x: PAD + (n === 1 ? usable / 2 : (usable * i) / Math.max(n - 1, 1)),
          y: PAD + (HEIGHT - PAD * 2) * (0.15 + 0.7 * hash(s.id)),
        },
      ]),
    );
  }, [galaxy, skyWidth, n]);

  const selectedTheme = selected?.kind === "theme" ? themes.get(selected.id) : undefined;
  const selectedStar =
    selected?.kind === "star" ? galaxy.stars.find((s) => s.id === selected.id) : undefined;
  const litStars = new Set(
    selectedTheme?.starIds ?? selectedStar?.themeIds.flatMap((t) => themes.get(t)?.starIds ?? []) ?? [],
  );
  const litTheme = (themeId: string) =>
    selectedTheme ? selectedTheme.id === themeId : selectedStar?.themeIds.includes(themeId);

  async function leaveOut(star: GalaxyStar) {
    try {
      await setEveningLeftOut(star.id, true);
      setSelected(null);
      setNotice({
        text: "Left out. This evening no longer shapes your steps or what I understand.",
        undo: async () => {
          setNotice(null);
          await setEveningLeftOut(star.id, false).catch(() =>
            setNotice({ text: "That didn't go through. You can bring it back from Your evenings." }),
          );
          onChanged();
        },
      });
      onChanged();
    } catch {
      setNotice({ text: "That didn't go through, so nothing changed. Try again in a moment." });
    }
  }

  async function dispute(t: GalaxyTheme) {
    try {
      await disputeAssertion(t.id);
      setSelected(null);
      setNotice({ text: "Noted. I've set that aside, and I won't act on it." });
      onChanged();
    } catch {
      setNotice({ text: "That didn't go through, so nothing changed. Try again in a moment." });
    }
  }

  const empty = galaxy.stars.length === 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={styles.label}>Your evenings in {worldName}</Text>
        {!empty && (
          <Press
            onPress={() => setMode(mode === "sky" ? "list" : "sky")}
            hitSlop={10}
            accessibilityLabel={mode === "sky" ? "Show as a list" : "Show as a sky"}
          >
            <Text style={styles.link}>{mode === "sky" ? "Show as a list" : "Show as a sky"}</Text>
          </Press>
        )}
      </View>

      {empty ? (
        <Text style={styles.dim}>
          No evenings here yet. When you share one that touches {worldName}, it becomes a star.
        </Text>
      ) : mode === "sky" ? (
        <>
          <Text style={styles.dim}>
            Each star is an evening you shared. A line means two evenings support the same thing I
            understand about you. Tap a star to see what.
          </Text>
          <View
            style={styles.sky}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          >
            <ScrollView
              horizontal
              scrollEnabled={skyWidth > width}
              showsHorizontalScrollIndicator={skyWidth > width}
              contentContainerStyle={{ width: skyWidth, height: HEIGHT }}
            >
            {width > 0 && (
              <Svg width={skyWidth} height={HEIGHT} accessible={false}>
                {galaxy.links.map((l) => {
                  const a = placed.get(l.from);
                  const b = placed.get(l.to);
                  if (!a || !b) return null;
                  const lit = litTheme(l.themeId);
                  return (
                    <Line
                      key={`${l.from}-${l.to}-${l.themeId}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={lit ? theme.colors.gold : theme.colors.dim}
                      // 0.75 keeps an unlit line at 3:1 or better (WCAG 1.4.11).
                      strokeOpacity={lit ? 0.9 : 0.75}
                      strokeWidth={lit ? 1.5 : 1}
                    />
                  );
                })}
                {galaxy.stars.map((s) => {
                  const p = placed.get(s.id)!;
                  const isNew = s.id === newStarId;
                  const isSel = selectedStar?.id === s.id;
                  const r = s.themeIds.length ? 4.5 : 3;
                  const fill = litStars.has(s.id) || isSel ? theme.colors.gold : theme.colors.ink;
                  return isNew ? (
                    <AnimatedCircle
                      key={s.id}
                      cx={p.x}
                      cy={p.y}
                      r={birth.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, r * 2.4, r + 1] })}
                      fill={theme.colors.gold}
                      opacity={birth}
                    />
                  ) : (
                    <Circle key={s.id} cx={p.x} cy={p.y} r={isSel ? r + 1.5 : r} fill={fill} opacity={0.95} />
                  );
                })}
              </Svg>
            )}
            {width > 0 &&
              galaxy.stars.map((s) => {
                const p = placed.get(s.id)!;
                return (
                  <Pressable
                    key={`hit-${s.id}`}
                    onPress={() => setSelected({ kind: "star", id: s.id })}
                    style={[styles.hit, { left: p.x - hit / 2, top: p.y - HIT / 2, width: hit }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Your evening of ${eveningDate(s.date)}: ${s.excerpt}`}
                  />
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : (
        <View style={styles.list}>
          {galaxy.themes.map((t) => (
            <Press
              key={t.id}
              style={styles.row}
              onPress={() => setSelected({ kind: "theme", id: t.id })}
              accessibilityLabel={`${t.forming ? "Still forming" : CONFIDENCE_WORDS[t.confidence]}: ${t.statement}. ${t.starIds.length} evenings.`}
            >
              <Text style={styles.rowMeta}>
                {t.forming ? "Still forming" : CONFIDENCE_WORDS[t.confidence]} · {t.starIds.length}{" "}
                {t.starIds.length === 1 ? "evening" : "evenings"}
              </Text>
              <Text style={styles.rowText}>{t.statement}</Text>
            </Press>
          ))}
          {galaxy.stars
            .slice()
            .reverse()
            .map((s) => (
              <Press
                key={s.id}
                style={styles.row}
                onPress={() => setSelected({ kind: "star", id: s.id })}
                accessibilityLabel={`Your evening of ${eveningDate(s.date)}: ${s.excerpt}`}
              >
                <Text style={styles.rowMeta}>{eveningDate(s.date)}</Text>
                <Text style={styles.rowText}>{s.excerpt}</Text>
              </Press>
            ))}
        </View>
      )}

      {notice && (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Text style={styles.noticeText}>{notice.text}</Text>
          {notice.undo && (
            <Press onPress={() => notice.undo?.()} hitSlop={8} accessibilityLabel="Undo">
              <Text style={styles.undo}>Undo</Text>
            </Press>
          )}
        </View>
      )}

      {selectedStar && (
        <View style={styles.inspect} accessibilityLiveRegion="polite">
          <Text style={styles.rowMeta}>
            {selectedStar.id === newStarId ? "A new star · " : ""}
            {eveningDate(selectedStar.date)}
          </Text>
          <Text style={styles.quote}>“{selectedStar.excerpt}”</Text>
          {selectedStar.themeIds.length > 0 ? (
            <>
              <Text style={styles.dim}>This evening supports:</Text>
              {selectedStar.themeIds.map((id) => {
                const t = themes.get(id);
                return t ? (
                  <Press
                    key={id}
                    onPress={() => setSelected({ kind: "theme", id })}
                    accessibilityLabel={`See why: ${t.statement}`}
                  >
                    <Text style={styles.themeLink}>{t.statement}</Text>
                  </Press>
                ) : null;
              })}
            </>
          ) : (
            <Text style={styles.dim}>Not linked to anything yet. That takes more than one evening.</Text>
          )}
          <View style={styles.actions}>
            <Press onPress={() => router.push("/evenings")} accessibilityLabel="Read in full">
              <Text style={styles.link}>Read in full</Text>
            </Press>
            <Press onPress={() => leaveOut(selectedStar)} accessibilityLabel="Leave this out">
              <Text style={styles.link}>Leave this out</Text>
            </Press>
          </View>
        </View>
      )}

      {selectedTheme && (
        <View style={styles.inspect} accessibilityLiveRegion="polite">
          <Text style={styles.rowMeta}>
            {selectedTheme.forming ? "Still forming" : CONFIDENCE_WORDS[selectedTheme.confidence]}
          </Text>
          <Text style={styles.statement}>{selectedTheme.statement}</Text>
          <Text style={styles.dim}>{selectedTheme.why}</Text>
          <Text style={styles.dim}>The evenings behind this:</Text>
          {selectedTheme.starIds.map((id) => {
            const s = galaxy.stars.find((x) => x.id === id);
            return s ? (
              <Text key={id} style={styles.evidence}>
                {eveningDate(s.date)}: “{s.excerpt}”
              </Text>
            ) : null;
          })}
          {confirmDispute ? (
            // A dispute cannot be undone, so it is asked once (WCAG 3.3.4).
            <View style={{ gap: 6 }}>
              <Text style={styles.dim}>Set this aside? I'll stop acting on it.</Text>
              <View style={styles.actions}>
                <Press
                  onPress={() => {
                    setConfirmDispute(false);
                    dispute(selectedTheme);
                  }}
                  accessibilityLabel="Set it aside"
                >
                  <Text style={styles.dispute}>Set it aside</Text>
                </Press>
                <Press onPress={() => setConfirmDispute(false)} accessibilityLabel="Keep it as it is">
                  <Text style={styles.link}>Keep it as it is</Text>
                </Press>
              </View>
            </View>
          ) : (
            <Press onPress={() => setConfirmDispute(true)} accessibilityLabel="That's not right">
              <Text style={styles.dispute}>That's not right</Text>
            </Press>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing(1.5) },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontFamily: fonts.body, fontSize: 13, color: theme.colors.gold },
  link: { fontFamily: fonts.body, fontSize: 14, color: theme.colors.gold, paddingVertical: 8 },
  dim: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: theme.colors.dim },
  sky: {
    height: HEIGHT,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "rgba(6,8,13,0.6)",
    overflow: "hidden",
  },
  hit: { position: "absolute", width: HIT, height: HIT, borderRadius: HIT / 2 },
  list: { gap: theme.spacing(1) },
  row: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(1.5),
    gap: 4,
  },
  rowMeta: { fontFamily: fonts.body, fontSize: 12.5, color: theme.colors.faint },
  rowText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: theme.colors.ink },
  inspect: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  quote: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 25, color: theme.colors.ink },
  statement: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, color: theme.colors.ink },
  themeLink: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: theme.colors.gold, paddingVertical: 6 },
  evidence: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: theme.colors.ink },
  actions: { flexDirection: "row", gap: theme.spacing(3) },
  dispute: { fontFamily: fonts.body, fontSize: 14, color: theme.colors.danger, paddingVertical: 8 },
  notice: {
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.raised,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  noticeText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: theme.colors.ink, flex: 1 },
  undo: { fontFamily: fonts.body, fontSize: 15, color: theme.colors.gold, paddingVertical: 6 },
});
