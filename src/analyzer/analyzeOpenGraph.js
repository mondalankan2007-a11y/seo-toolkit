import { findTags } from "./htmlParser.js";

/**
 * Analyzes Open Graph metadata tags in HTML.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeOpenGraph(html) {
  const metaTags = findTags(html, "meta");
  const properties = {};
  const issues = [];

  for (const m of metaTags) {
    const prop = m.attributes.property || m.attributes.name;
    if (prop && prop.toLowerCase().startsWith("og:")) {
      properties[prop.toLowerCase()] = m.attributes.content || "";
    }
  }

  const keys = Object.keys(properties);
  const present = keys.length > 0;

  if (!present) {
    issues.push({
      type: "warning",
      code: "OPEN_GRAPH_MISSING",
      message: "Webpage does not define Open Graph metadata tags for social sharing."
    });
  } else {
    if (!properties["og:title"]) {
      issues.push({ type: "warning", code: "OG_TITLE_MISSING", message: "Missing 'og:title' property." });
    }
    if (!properties["og:description"]) {
      issues.push({ type: "warning", code: "OG_DESCRIPTION_MISSING", message: "Missing 'og:description' property." });
    }
    if (!properties["og:image"]) {
      issues.push({ type: "warning", code: "OG_IMAGE_MISSING", message: "Missing 'og:image' property." });
    }
    if (!properties["og:url"]) {
      issues.push({ type: "warning", code: "OG_URL_MISSING", message: "Missing 'og:url' property." });
    }
  }

  return {
    present,
    count: keys.length,
    properties,
    issues
  };
}
