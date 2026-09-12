import type { Config } from "tailwindcss";

// نظام الألوان مثبّت حسب المواصفات فقط: خلفية سوداء، كروت كحلي غامق/فحمي،
// أحمر أساسي للأزرار والتأكيدات، نص أبيض أساسي، نص رمادي ثانوي.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: "#12141C",
        "surface-hover": "#171A24",
        border: "#232633",
        primary: {
          DEFAULT: "#E31B23",
          hover: "#C71620",
          foreground: "#FFFFFF",
        },
        foreground: "#FFFFFF",
        muted: "#9CA3AF",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
