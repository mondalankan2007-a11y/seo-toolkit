/**
 * seo-toolkit
 * Technical SEO generation, analysis, and validation toolkit.
 */

export const VERSION = "0.1.0";

export { generateMeta } from "./meta/generateMeta.js";
export { generateOpenGraph } from "./meta/openGraph.js";
export { generateTwitterCard } from "./meta/twitter.js";
export { validateMeta } from "./meta/validateMeta.js";
export { generateSitemap, generateSitemapIndex } from "./sitemap/generateSitemap.js";
export { SeoError, SeoValidationError } from "./errors/SeoError.js";
