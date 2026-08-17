/**
 * BECOMING visual language (part-2 brief §49): cinematic, minimal,
 * editorial, calm. Dark-first. No gamification chrome.
 */
export const theme = {
  colors: {
    background: "#0B0E12",
    surface: "#12161D",
    line: "#232A34",
    text: "#ECE9E2",
    textDim: "#8B9099",
    accent: "#C9A96A",
    danger: "#B4655F",
  },
  spacing: (n: number) => n * 8,
  type: {
    label: {
      fontSize: 11,
      letterSpacing: 2.5,
      textTransform: "uppercase" as const,
      color: "#8B9099",
    },
    title: {
      fontSize: 28,
      fontWeight: "300" as const,
      letterSpacing: 0.3,
      color: "#ECE9E2",
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: "#ECE9E2",
    },
    dim: {
      fontSize: 13,
      lineHeight: 19,
      color: "#8B9099",
    },
  },
};
