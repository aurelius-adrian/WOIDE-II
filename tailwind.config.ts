import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#292929",
        "light-bg": "#ffffff"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        "xs": "425px"
      },
    },
  },
  plugins: [],
};
export default config;
