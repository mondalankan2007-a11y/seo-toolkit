import { findTags } from "./htmlParser.js";
import { isValidUrl } from "../utils/url.js";

/**
 * Analyzes HTML <link rel="canonical"> tag.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeCanonical(html) {
  const linkTags = findTags(html, "link");
  const canonicalLinks = linkTags.filter(
    (l) => (l.attributes.rel || "").toLowerCase() === "canonical"
  );

  const present = canonicalLinks.length > 0;
  const count = canonicalLinks.length;
  const issues = [];

  if (!present) {
    issues.push({
      type: "warning",
      code: "CANONICAL_MISSING",
      message: "Webpage is missing a canonical URL link tag (<link rel=\"canonical\" href=\"...\">)."
    });
    return { present: false, count: 0, url: "", isValid: false, issues };
  }

  if (count > 1) {
    issues.push({
      type: "error",
      code: "CANONICAL_MULTIPLE",
      message: `Found ${count} canonical link tags. Exactly one canonical link tag should be present.`
    });
  }

  const url = canonicalLinks[0].attributes.href || "";
  const isValid = isValidUrl(url);

  if (!url) {
    issues.push({
      type: "error",
      code: "CANONICAL_EMPTY",
      message: "Canonical link tag exists but has an empty href attribute."
    });
  } else if (!isValid) {
    issues.push({
      type: "error",
      code: "CANONICAL_INVALID",
      message: `Canonical link href '${url}' is not a valid absolute HTTP/HTTPS URL.`
    });
  }

  return {
    present: true,
    count,
    url,
    isValid,
    issues
  };
}
