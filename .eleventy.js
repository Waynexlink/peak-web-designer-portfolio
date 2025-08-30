// This is the definitive lightweight, self-contained, and fully-corrected configuration.

const eleventyMinify = require("@codestitchofficial/eleventy-plugin-minify");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const client = require("./src/_data/client.js");
const less = require("less");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const esbuild = require("esbuild");

module.exports = function (eleventyConfig) {
  // Determine if we are in a production build
  const isProduction = process.env.ELEVENTY_ENV === "PROD";

  // Dummy Shortcodes & Filters to prevent template errors from removed image plugin
  eleventyConfig.addNunjucksShortcode("getUrl", (path) => path);
  eleventyConfig.addFilter("resize", (src) => src);
  eleventyConfig.addFilter("avif", (src) => src);
  eleventyConfig.addFilter("webp", (src) => src);
  eleventyConfig.addFilter("jpeg", (src) => src);

  // Plugins
  eleventyConfig.addPlugin(sitemap, { sitemap: { hostname: client.url } });
  if (isProduction) {
    eleventyConfig.addPlugin(eleventyMinify);
  }

  // --- Template Language Compilation ---

  // LESS/CSS Compilation (CORRECTED FOR MULTIPLE FILES)
  eleventyConfig.addTemplateFormats("less");
  eleventyConfig.addExtension("less", {
    outputFileExtension: "css",
    // This permalink function is the key. It creates a unique output path
    // for every single .less file, preventing conflicts.
    compileOptions: {
      permalink: function (contents, inputPath) {
        // Example input: ./src/assets/less/critical.less
        // Example output: /assets/css/critical.css
        return (data) => {
          return (
            data.page.filePathStem.replace("/assets/less/", "/assets/css/") +
            ".css"
          );
        };
      },
    },
    compile: async function (inputContent, inputPath) {
      try {
        const result = await less.render(inputContent, {
          paths: ["./src/assets/less/"], // Important for @import statements
        });
        const postcssResult = await postcss([autoprefixer]).process(
          result.css,
          { from: inputPath }
        );
        return () => postcssResult.css;
      } catch (error) {
        console.error(`Less compilation error in ${inputPath}:`, error);
      }
    },
  });

  // JavaScript Bundling with esbuild
  eleventyConfig.addTemplateFormats("js");
  eleventyConfig.addExtension("js", {
    outputFileExtension: "js",
    compile: async (content, path) => {
      if (!path.startsWith("./src/assets/js/")) {
        return;
      }
      return async () => {
        let output = await esbuild.build({
          target: "es2020",
          entryPoints: [path],
          minify: isProduction,
          bundle: true,
          write: false,
        });
        return output.outputFiles[0].text;
      };
    },
  });

  // Filters & Shortcodes
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addFilter("date", (dateObj) =>
    new Date(dateObj).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
  eleventyConfig.addFilter("isoDate", (dateObj) =>
    new Date(dateObj).toISOString()
  );
  eleventyConfig.addFilter("postDate", (dateObj) =>
    new Date(dateObj).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  // Passthrough Copies
  eleventyConfig.addPassthroughCopy("./src/assets/favicons");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy("./src/assets/images");
  eleventyConfig.addPassthroughCopy("./src/assets/svgs");
  eleventyConfig.addPassthroughCopy("./src/admin");
  eleventyConfig.addPassthroughCopy("./src/_redirects");

  // Set custom directories and engines
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "public",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
