/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.njk",
    "./src/**/*.html",
    "./src/**/*.md",
    // "./_site/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sourcesans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "msk-turquoise": "#1d90a4",
        "msk-purple": "#89207c",
        "msk-orange": "#ce583e",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
