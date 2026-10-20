/**
 * seo-toolkit
 * Technical SEO generation, analysis, and validation toolkit.
 */

export const VERSION = "1.1.0";

export { generateMeta } from "./meta/generateMeta.js";
export { generateOpenGraph } from "./meta/openGraph.js";
export { generateTwitterCard } from "./meta/twitter.js";
export { validateMeta } from "./meta/validateMeta.js";
export { generateSitemap, generateSitemapIndex } from "./sitemap/generateSitemap.js";
export { generateRobots } from "./robots/generateRobots.js";
export {
  generateJsonLd,
  generatePerson,
  generateOrganization,
  generateArticle,
  generateProduct,
  generateBreadcrumbList,
  generateFAQPage,
  generateHowTo
} from "./structured-data/index.js";
export {
  analyzeHtml,
  analyzeTitle,
  analyzeDescription,
  analyzeHeadings,
  analyzeImages,
  analyzeCanonical,
  analyzeOpenGraph,
  analyzeJsonLd,
  calculateScore
} from "./analyzer/index.js";
export { fetchPage, analyzePage } from "./crawler/index.js";
export { SeoError, SeoValidationError } from "./errors/SeoError.js";
