// Hex mirrors of the tailwind color tokens, for APIs that need a raw color
// string (Ionicons `color`, gradient stops, Reanimated). Keep in sync with
// tailwind.config.js.
export const COLORS = {
  base: "#0A0A0A",
  surface: "#161616",
  surfaceRaised: "#222222",
  surfaceOverlay: "#2A2A2A",
  primary: "#FFFFFF",
  secondary: "#B3B3B3",
  muted: "#7A7A7A",
  accent: "#1ED760",
  danger: "#F2545B",
} as const;
