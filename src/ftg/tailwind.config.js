/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: [
        "./*.njk",
        "./*.html",
        "./*.md",
        "./*.js",
        "./*.json",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    // content: ["./site/templates/**/*.{html,php,latte,twig,js}"],
    plugins: [
        require("@tailwindcss/forms"),
    ],
};
