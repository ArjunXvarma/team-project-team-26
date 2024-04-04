import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: { primary: "#1B6D4B", secondary: "#33C074", tertiary:"#E8F4EF", lightGreen:"#94E6A6"},
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'domine': ['Domine', 'serif'],
      },
      dropShadow: {sharp: '0px 3px 3px rgba(0, 0, 0, 0.4)'},
    },
  },
  plugins: [],
};
export default config;
