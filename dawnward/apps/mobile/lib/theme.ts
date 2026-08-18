/**
 * Life OS visual language — tokens per docs/design-direction.md.
 * Exact values only; never improvise new ones.
 */
export const fonts = {
  displayLight: "CormorantGaramond_300Light",
  display: "CormorantGaramond_400Regular",
  displayItalic: "CormorantGaramond_400Regular_Italic",
  displayMedium: "CormorantGaramond_500Medium",
  body: "AlbertSans_400Regular",
  bodyMedium: "AlbertSans_500Medium",
  label: "IBMPlexMono_400Regular",
  labelMedium: "IBMPlexMono_500Medium",
} as const;

export const theme = {
  colors: {
    ground: "#0B0E12",
    surface: "#12161D",
    raised: "#171C25",
    line: "#232A34",
    ink: "#ECE9E2",
    dim: "#9AA0A9",
    faint: "#79818F",
    gold: "#C9A96A",
    danger: "#B4655F",
    // Living-sky gradient stops ONLY — never used on components.
    dawn: "#E8A87C",
    duskAmber: "#2A1F14",
    predawnIndigo: "#23283D",
    // Back-compat aliases (older screens); prefer the names above.
    background: "#0B0E12",
    text: "#ECE9E2",
    textDim: "#9AA0A9",
    accent: "#C9A96A",
  },
  spacing: (n: number) => n * 8,
  radius: { card: 14, sheet: 22 },
  shadow: {
    // The one shadow — floating elements only, never cards.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 48,
    shadowOpacity: 0.45,
    elevation: 12,
  },
  type: {
    label: {
      fontFamily: fonts.label,
      fontSize: 11,
      letterSpacing: 11 * 0.22,
      textTransform: "uppercase" as const,
      color: "#79818F",
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 34,
      lineHeight: 38,
      letterSpacing: 34 * 0.02,
      color: "#ECE9E2",
    },
    epigraph: {
      fontFamily: fonts.displayItalic,
      fontSize: 24,
      lineHeight: 33,
      color: "#C9A96A",
    },
    body: {
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 25.6,
      color: "#ECE9E2",
    },
    dim: {
      fontFamily: fonts.body,
      fontSize: 13.5,
      lineHeight: 20,
      color: "#9AA0A9",
    },
  },
};
