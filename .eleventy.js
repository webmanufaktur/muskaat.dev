// requre Luxon for date conversion
const path = require("path");
const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");
const CleanCSS = require("clean-css");
const pluginPageAssets = require("eleventy-plugin-page-assets");
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
// basic setup from tutorial
// https://www.11ty.dev/docs/plugins/image/
//

async function imageShortcode(src, alt, cls, wdth = "null") {
  let metadata = await Image(src, {
    widths: wdth,
    formats: ["webp", "jpeg"],
    urlPath: "/assets/media/", // used in frontend
    outputDir: "_site/assets/media/", // used in dev
    filenameFormat: function (id, src, width, format) {
      const extension = path.extname(src);
      const name = path.basename(src, extension);

      return `${name}-${id}-${width}w.${format}`;
    },
    cacheOptions: {
      duration: "1d",
      directory: ".cache",
      removeUrlQueryParams: false,
    },
  });
  let imageAttributes = {
    alt,
    class: cls,
    sizes: "auto",
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

// module exports
module.exports = function (eleventyConfig) {
  // Set directories to pass through to the _site folder
  eleventyConfig.addPassthroughCopy("src/assets/");
  eleventyConfig.addPassthroughCopy("images/");
  eleventyConfig.addPassthroughCopy("img/");

  // set markdown engine
  eleventyConfig.setLibrary("md", markdown);

  // Watch scss folder for changes
  // not necessary in this setup
  eleventyConfig.addWatchTarget("./src/assets/");

  // RSS Feeds
  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "default", // opt-out of <img/>-style XHTML single tags
    },
  });

  // asset management
  eleventyConfig.addPlugin(pluginPageAssets, {
    mode: "directory",
    postsMatching: "src/**/*.md",
    assetsMatching: "*.jpg|*.png|*.gif|*.mp4|*.webp|*.webm|.svg",
    silent: true,
  });

  // open a browser window on --watch
  eleventyConfig.setBrowserSyncConfig({
    // open: true,
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
