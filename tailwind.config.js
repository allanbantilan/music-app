/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Spotify × YT Music hybrid tokens (dark-only v1). Use ONLY these.
        base: "#0A0A0A",
        surface: {
          DEFAULT: "#161616", // cards, sheets, tab bar
          raised: "#222222", // pressed states, inactive chips, search fill
          overlay: "#2A2A2A", // modals, context menus
        },
        primary: "#FFFFFF",
        secondary: "#B3B3B3",
        muted: "#7A7A7A",
        accent: "#1ED760",
        danger: "#F2545B",
        "chip-active": "#FFFFFF",
        // legacy yt-* tokens — still used by not-yet-migrated screens
        yt: {
          bg: "#030303",
          surface: "#212121",
          surface2: "#383838",
          textPrimary: "#FFFFFF",
          textSecondary: "#AAAAAA",
          accent: "#FF0033",
        },
      },
      borderRadius: {
        thumb: "8px", // artwork thumbnails
        card: "12px", // cards, sheets
        pill: "9999px", // chips, buttons, search bar
      },
    },
  },
  plugins: [],
};
