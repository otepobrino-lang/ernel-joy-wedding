/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: "#4A0018",
        wine: "#31000F",
        accent: "#650B27",
        champagne: "#D8B56D",
        gold: "#F1DDAA",
        ivory: "#FFF9EF",
        cream: "#F7F0E6",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Montserrat", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};