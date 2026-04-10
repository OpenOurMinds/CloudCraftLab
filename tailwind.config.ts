import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        border: "#000000",
        ring: "#000000",
        bauhaus: {
          black: "#000000",
          white: "#FFFFFF",
          gray: "#808080",
        },
        muted: {
          DEFAULT: "#F0F0F0",
          foreground: "#808080"
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
      },
      borderWidth: {
        DEFAULT: '2px', // Enforce thick borders
        '0': '0',
        '2': '2px',
        '4': '4px',
      },
      borderRadius: {
        // Enforce sharp corners everywhere
        lg: "0",
        md: "0",
        sm: "0",
        DEFAULT: "0",
        xl: "0",
        '2xl': "0",
        '3xl': "0",
        full: "0"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
