const fs = require("fs");
const MinifyCSS = require("clean-css");
const postCSS = require("postcss");
const purgeCSS = require("@fullhuman/postcss-purgecss");

module.exports = async function () {
  // You must create the folder structure first.
  // WriteFile does not create files if parent folders are missing
  if (!fs.existsSync("_site")) {
    fs.mkdirSync("_site");
  }
  if (!fs.existsSync("_site/css")) {
    fs.mkdirSync("_site/css");
  }

  // Create a custom, purged, version of Bootstrap
  const sourceCSS = "src/assets/css/style.css";
  const destinationCSS = "_site/assets/css/style.dist.css";
  // Add in your file types here
  const sourceContent = [
    "src/**/*.njk",
    "src/**/*.html",
    "src/**/*.md",
    "src/**/*.liquid",
    "src/**/*.js",
  ];

  fs.readFile(sourceCSS, (err, css) => {
    postCSS([
      // Purge CSS will scan through and remove the styles
      // that aren't in your project
      purgeCSS({
        content: sourceContent,
        variables: true,
        keyframes: true,
      }),
    ])
      .process(css, {
        from: sourceCSS,
        to: destinationCSS,
      })
      .then((result) => {
        // Combine with Reboot
        let newCSS = result.css;
        // let rebootCSS = fs.readFileSync("source/css/_reboot.css");
        // let allCSS = rebootCSS + newCSS;
        let allCSS = newCSS;

        // Minify
        let compiledCSS = new MinifyCSS().minify(allCSS)["styles"];

        // Save
        fs.writeFileSync(destinationCSS, compiledCSS, { encoding: "utf8" });
      })
      .catch((error) => {
        console.log(error);
      });
  });
};
