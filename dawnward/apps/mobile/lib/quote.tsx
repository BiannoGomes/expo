import { StyleSheet, Text, View } from "react-native";
import type { PlanSource } from "@dawnward/core";
import { fonts, theme } from "@/lib/theme";

/** "Tuesday 2 September", in the person's own locale. Noon avoids DST edges. */
export function eveningDate(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/**
 * The person's own words behind a step or a question. The server shows a
 * source only when the quote is verbatim from that evening, so this never
 * renders anything they did not say.
 */
export function EveningQuote({ source }: { source: PlanSource }) {
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`From your evening, ${eveningDate(source.date)}: ${source.quote}`}
    >
      <Text style={styles.from}>From your evening, {eveningDate(source.date)}</Text>
      <Text style={styles.quote}>“{source.quote}”</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.line,
  },
  from: { ...theme.type.dim, color: theme.colors.faint, fontSize: 12.5 },
  quote: {
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.ink,
    marginTop: theme.spacing(0.5),
  },
});
