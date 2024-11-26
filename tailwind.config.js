/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "fe-blue": {
          100: "#eaebf4",
          200: "#d7daff",
          300: "#8b95ff",
          400: "#595da6",
          500: "#2f3590",
          600: "#262a73",
          700: "#1c2056",
          800: "#13153a",
          900: "#090b1d",
        },
        "fe-orange": {
          100: "#ffe9d5",
          200: "#ffd3ac",
          300: "#ffbd82",
          400: "#ffa759",
          500: "#ff912f",
          600: "#ee7540",
          700: "#eb5213",
          800: "#eb2833",
          900: "#eb2070",
        },
      },
    },
  },
  plugins: [],
};
