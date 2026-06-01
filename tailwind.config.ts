import type {Config} from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cb: {
          bg: "#0f1110",
          panel: "#181d1b",
          card: "#222824",
          border: "#3f4844",
          text: "#d8d6cf",
          muted: "#8d9491",
          teal: "#5f858c",
          burgundy: "#8f3f46",
          danger: "#b64b45"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
