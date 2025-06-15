// const htmlmin = require("html-minifier");

// import minify from 'html-minifier';
import htmlmin from "html-minifier-terser";

export function htmlMinifier(content) {

  if (process.env.ELEVENTY_RUN_MODE == "build") {
    
		if ((this.page.outputPath || "").endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				collapseWhitespace: true,
			});

			return minified;
		}
  };

  return content;
};