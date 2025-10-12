// Plugins
import eleventySass from "eleventy-sass";
import pluginRev from "eleventy-plugin-rev";
import { minify } from "terser";

// Filters
import { dateFormatter } from "./src/_eleventy/filters/date-format.js";

// Shortcodes
 import { createData } from "./src/_eleventy/shortcodes/structured-data.js";

// Utilities
import { sassOptions } from "./src/_eleventy/utilities/sassCompileOptions.js";
import { htmlMinifier } from "./src/_eleventy/utilities/minify-html.js";

// Main Config
export default async function(eleventyConfig) {

  ////////////////////////////////////////////////////
  // Watch Javascript File Changes, and Minimize
  ////////////////////////////////////////////////////

  // folder to keep an eye on
  eleventyConfig.addWatchTarget("./src/js/inline/");
  // let'er rip
  eleventyConfig.addFilter("jsmin", async function (code) {
    let minified = await minify(code);
    return minified.code;
	});

  ////////////////////////////////////////////////////
  // Pass Throughs
  ////////////////////////////////////////////////////

  ['src/img', 'src/server', {'src/js/packages': 'js/packages/'}, {"src/fonts": "fonts"}].forEach(filesFromPath =>
    eleventyConfig.addPassthroughCopy(filesFromPath)
  );
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('manifest.webmanifest');
  eleventyConfig.addPassthroughCopy('src/server');

  ////////////////////////////////////////////////////
  // Plugins
  ////////////////////////////////////////////////////

  // let eleventy handle compiling sass
  eleventyConfig.addPlugin(eleventySass, sassOptions);
  // revision the css filename
  eleventyConfig.addPlugin(pluginRev);

  ////////////////////////////////////////////////////
  // Filters
  ////////////////////////////////////////////////////

  // date formatter...duh
  eleventyConfig.addFilter("dateFormat", dateFormatter);

  ////////////////////////////////////////////////////
  // Shortcodes
  ////////////////////////////////////////////////////

  // json-ld data creation
  eleventyConfig.addShortcode("schemaDataShortCode", createData);

  ////////////////////////////////////////////////////
  // Utilities
  ////////////////////////////////////////////////////

  // minify html for production build
  eleventyConfig.addTransform("htmlmin", htmlMinifier);


}; // end export

// Build Config
export const config = {
  dir: {
    input: "src",
    output: "dist"
  },
  htmlTemplateEngine: "njk",
  templateFormats: ["html", "njk"]
};
