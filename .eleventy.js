// requre Luxon for date conversion
const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");
const CleanCSS = require("clean-css");

// markdown settings and plugins
const markdownIt = require("markdown-it");
const markdownItImageFigures = require("markdown-it-image-figures");

// Details about HowTo enable MarkdownIt Image Figures
// https://github.com/Antonio-Laguna/markdown-it-image-figures
// https://github.com/11ty/eleventy/issues/675#issuecomment-527700027

const markdown = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

markdown.use(markdownItImageFigures, {
  lazy: true,
  async: true,
  classes: "lazy",
  figcaption: true,
});

// 11ty image plugin
async function imageShortcode(src, alt, caption, sizes) {
  let metadata = await Image(src, {
    widths: [300, 600, 1024],
    formats: ["webp", "jpeg"],
    urlPath: "/media/", // used in frontend
    outputDir: "./_site/media/", // used in dev
  });
  let lowsrc = metadata.jpeg[0];
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
  if (caption === undefined) {
    caption = alt;
  }

  return `<figure><picture>
    ${Object.values(metadata)
      .map((imageFormat) => {
        return `  <source type="${
          imageFormat[0].sourceType
        }" srcset="${imageFormat
          .map((entry) => entry.srcset)
          .join(", ")}" sizes="${sizes}">`;
      })
      .join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="lazy"
        sizes="auto",
        decoding="async">
        <figcaption>${caption}</figcaption>
    </picture></figure>`;
}

// You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
// return Image.generateHTML(metadata, imageAttributes);
// }

// module exports
module.exports = function (eleventyConfig) {
  // Set directories to pass through to the _site folder
  eleventyConfig.addPassthroughCopy("src/assets/");
  eleventyConfig.addPassthroughCopy("img/");
  eleventyConfig.addPassthroughCopy("src/**/*.jpg");
  eleventyConfig.addPassthroughCopy("src/**/*.png");
  eleventyConfig.addPassthroughCopy("src/**/*.gif");
  eleventyConfig.addPassthroughCopy("src/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/**/*.mp4");
  eleventyConfig.addPassthroughCopy("src/**/*.txt");

  // set markdown engine
  eleventyConfig.setLibrary("md", markdown);

  // Watch scss folder for changes
  // not necessary in this setup
  eleventyConfig.addWatchTarget("./src/assets/");
  eleventyConfig.addWatchTarget("./src/_scss");
  eleventyConfig.addWatchTarget("./img/");

  // RSS Feeds
  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "default", // opt-out of <img/>-style XHTML single tags
    },
  });

  // open a browser window on --watch
  eleventyConfig.setBrowserSyncConfig({
    open: true,
  });

  // SHORTCODES
  // 11ty image plugin shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  // shortcode for inserting the current year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // convert date to [Month DD, YYYY], set timezone to UTC to ensure date is not off by one
  // https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
  // https://www.11ty.dev/docs/dates/#dates-off-by-one-day
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toLocaleString(
      DateTime.DATE_FULL
    );
  });

  eleventyConfig.addFilter("sortByTitle", (values) => {
    return values
      .slice()
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
  });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  return {
    // set the input and output directories
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts",
    },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
