import { analyzeTitle } from "./analyzeTitle.js";
import { analyzeDescription } from "./analyzeDescription.js";
import { analyzeHeadings } from "./analyzeHeadings.js";
import { analyzeImages } from "./analyzeImages.js";
import { analyzeCanonical } from "./analyzeCanonical.js";
import { analyzeOpenGraph } from "./analyzeOpenGraph.js";
import { analyzeJsonLd } from "./analyzeJsonLd.js";
import { findTags } from "./htmlParser.js";

/**
 * Performs full technical SEO analysis on an HTML document string.
 *
 * @param {string} html - Raw HTML source code of the webpage.
 * @returns {Object} Comprehensive analysis object containing results and issues.
 */
export function analyzeHtml(html) {
  if (typeof html !== "string") {
    html = "";
  }

  const title = analyzeTitle(html);
  const description = analyzeDescription(html);
  const headings = analyzeHeadings(html);
  const canonical = analyzeCanonical(html);
  const images = analyzeImages(html);
  const openGraph = analyzeOpenGraph(html);
  const jsonLd = analyzeJsonLd(html);

  // Meta robots
  const metaTags = findTags(html, "meta");
  const robotsMeta = metaTags.find(
    (m) => (m.attributes.name || "").toLowerCase() === "robots"
  );
  const robotsDirective = robotsMeta ? robotsMeta.attributes.content || "" : "";

  // Viewport
  const viewportMeta = metaTags.find(
    (m) => (m.attributes.name || "").toLowerCase() === "viewport"
  );
  const viewport = viewportMeta ? viewportMeta.attributes.content || "" : "";

  // Charset
  const charsetMeta = metaTags.find((m) => m.attributes.charset);
  const charset = charsetMeta ? charsetMeta.attributes.charset : "";

  // Combine issues into errors, warnings, and info
  const allIssues = [
    ...title.issues,
    ...description.issues,
    ...headings.issues,
    ...canonical.issues,
    ...images.issues,
    ...openGraph.issues,
    ...jsonLd.issues
  ];

  if (!viewport) {
    allIssues.push({
      type: "warning",
      code: "VIEWPORT_MISSING",
      message: "Missing mobile viewport meta tag (<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">)."
    });
  }

  const errors = allIssues.filter((i) => i.type === "error");
  const warnings = allIssues.filter((i) => i.type === "warning");
  const info = allIssues.filter((i) => i.type === "info");

  return {
    title,
    description,
    headings,
    canonical,
    images,
    openGraph,
    jsonLd,
    meta: {
      robots: robotsDirective,
      viewport,
      charset
    },
    issues: {
      errors,
      warnings,
      info,
      all: allIssues
    }
  };
}
