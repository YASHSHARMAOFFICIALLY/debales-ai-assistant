import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}", "./src/lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        panel: "#f6f4ef",
        line: "#ded8ce",
        moss: "#58735f",
        tomato: "#c65f46",
        gold: "#c59b48",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(30, 25, 15, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
