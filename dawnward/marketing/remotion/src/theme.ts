// Dawnward film tokens. Colours mirror apps/mobile/lib/theme.ts; the film's
// own type is Source Serif 4 (display) and Source Sans 3 (labels). Interface
// text inside the phone keeps the app's real faces.
import { Easing, staticFile } from "remotion";

export const FPS = 30, W = 1080, H = 1920;
export const sec = (s: number) => Math.round(s * FPS);

export const color = {
  void: "#04060A", ground: "#0B0E12", surface: "#12161D", line: "#232A34",
  ink: "#ECE9E2", dim: "#9AA0A9", faint: "#79818F", gold: "#C9A96A",
  duskAmber: "#2A1F14", predawnIndigo: "#23283D", dawn: "#E8A87C",
};

export const font = {
  display: '"Source Serif 4", Georgia, serif',
  label: '"Source Sans 3", system-ui, sans-serif',
  app: '"Albert Sans", system-ui, sans-serif',
};

// One easing family: decisive in, long settle. Apple-like, never floaty.
export const ease = {
  move: Easing.bezier(0.65, 0, 0.35, 1),
  settle: Easing.bezier(0.16, 1, 0.3, 1),
  enter: Easing.bezier(0.33, 1, 0.68, 1),
};

export const fontFaces = `
@font-face { font-family: "Source Serif 4"; font-weight: 400; src: url(${staticFile("fonts/source-serif-4-latin-400-normal.woff2")}) format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-weight: 600; src: url(${staticFile("fonts/source-serif-4-latin-600-normal.woff2")}) format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: italic; src: url(${staticFile("fonts/source-serif-4-latin-400-italic.woff2")}) format("woff2"); }
@font-face { font-family: "Source Sans 3"; font-weight: 400; src: url(${staticFile("fonts/source-sans-3-latin-400-normal.woff2")}) format("woff2"); }
@font-face { font-family: "Source Sans 3"; font-weight: 600; src: url(${staticFile("fonts/source-sans-3-latin-600-normal.woff2")}) format("woff2"); }
@font-face { font-family: "Albert Sans"; font-weight: 400; src: url(${staticFile("fonts/AlbertSans_400Regular.woff2")}) format("woff2"); }
`;
