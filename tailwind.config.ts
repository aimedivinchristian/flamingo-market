import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pink:  { DEFAULT: "#e8267a", light: "#f04d96", pale: "#fff0f7", pale2: "#ffe0ef" },
        cyan:  { DEFAULT: "#0db8d4", light: "#e6f9fc" },
        flamingo: { dark: "#1a1a2e" },
      },
      fontFamily: {
        plus:    ["var(--font-plus)", "system-ui", "sans-serif"],
        display: ["var(--font-plus)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pink: "0 8px 32px rgba(232,38,122,0.18)",
        card: "0 8px 32px rgba(0,0,0,0.10)",
      },
      backgroundImage: {
        "gradient-pink": "linear-gradient(135deg,#e8267a,#f04d96)",
        "gradient-pink-pale": "linear-gradient(135deg,#fff5f9,#f0f8ff)",
      },
    },
  },
  plugins: [],
};
export default config;
