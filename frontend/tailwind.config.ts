import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        landing: {
          orange: "#F57C00",
          "orange-dark": "#FF9800",
          blue: "#1565C0",
          "blue-dark": "#42A5F5",
          green: "#2E7D32",
          "green-dark": "#66BB6A",
          beige: "#FFF8E1",
          "beige-dark": "#2C2416",
          cream: "#FFFBF5",
          "cream-dark": "#1A1612",
        },
        teacher: {
          primary: "#1976D2",
          "primary-dark": "#42A5FA",
          surface: "#FFFFFF",
          "surface-dark": "#1E293B",
          border: "#E2E8F0",
          "border-dark": "#334155",
          text: "#1E293B",
          "text-dark": "#F1F5F9",
        },
        student: {
          purple: "#9B7EDE",
          "purple-dark": "#B794F6",
          pink: "#FFB6D9",
          "pink-dark": "#FFC4E1",
          blue: "#86C8E8",
          "blue-dark": "#9CD9F0",
          green: "#95D5B2",
          "green-dark": "#A8E6C1",
          yellow: "#FFD97D",
          "yellow-dark": "#FFE699",
          orange: "#FFB085",
          "orange-dark": "#FFBA9D",
        },
        middle: {
          purple: "#8B5CF6",
          pink: "#EC4899",
          blue: "#3B82F6",
          green: "#10B981",
        },
        high: {
          primary: "#3B82F6",
          secondary: "#8B5CF6",
          success: "#10B981",
          accent: "#F59E0B",
        },
      },
      fontFamily: {
        merriweather: ["Merriweather", "serif"],
        "source-sans": ["Source Sans 3", "sans-serif"],
        fredoka: ["Fredoka", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "student-gradient": "linear-gradient(135deg, #FFF1F3 0%, #E7E6FF 50%, #E0F4FF 100%)",
        "student-gradient-dark": "linear-gradient(135deg, #2D1B2E 0%, #1F1A3D 50%, #1A2332 100%)",
        "middle-gradient": "linear-gradient(135deg, #E8EAF6 0%, #E1F5FE 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
