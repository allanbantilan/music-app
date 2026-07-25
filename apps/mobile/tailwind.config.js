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
        yt: {
          bg: "#030303",
          surface: "#212121",
          surface2: "#383838",
          textPrimary: "#FFFFFF",
          textSecondary: "#AAAAAA",
          accent: "#FF0033",
        },
      },
    },
  },
  plugins: [],
};
