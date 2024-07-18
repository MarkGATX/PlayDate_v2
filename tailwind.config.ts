import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'appBG': 'oklch(99.23% 0.006 325.627)',
        'appGold': 'oklch(91.52% 0.079 80.18)',
        'appBlue': 'oklch(32.39% 0.177 266.91)',
        'inputBG': 'oklch(91.45% 0.015 294.45)',
        'appBlueTrans': 'oklch(32.39% 0.177 266.91 / .5)'
      },
      boxShadow: {
        'activeButton': 'inset 3px 3px 5px oklch(0% 0 296.91 / .3)'
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // borderColor: {
      //   'appBlue':  'oklch(32.39% 0.177 266.91)'
      // },
      // backgroundColor: {
      //   'appGold': 'oklch(91.52% 0.079 80.18)',
      //   'appBlue':'oklch(32.39% 0.177 266.91)'
      // }
    },
  },
  plugins: [],
};
export default config;
