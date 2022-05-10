// purgecss.config.js

module.exports = {
  // Content files referencing CSS classes
  content: ["_site/**/*.html"],
  css: ["_site/**/*.css"],

  // CSS files to be purged in-place
  // css: ["src/assets/css/*.css"],
  // output: "_src/purged",
  // css: ["./src/assets/css/*.css"],
};
