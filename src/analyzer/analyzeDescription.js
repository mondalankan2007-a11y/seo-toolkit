import { findTags } from "./htmlParser.js";

/**
 * Analyzes HTML meta description for SEO best practices.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeDescription(html) {
  const metaTags = findTags(html, "meta");
  const descMetas = metaTags.filter(
    (m) => (m.attributes.name || "").toLowerCase() === "description"
  );

  const present = descMetas.length > 0;
  const count = descMetas.length;
  const issues = [];

  if (!present) {
    issues.push({
      type: "error",
      code: "DESCRIPTION_MISSING",
      message: "Webpage is missing a meta description tag."
    });
    return { present: false, count: 0, text: "", length: 0, status: "missing", issues };
  }

  if (count > 1) {
    issues.push({
      type: "warning",
      code: "DESCRIPTION_MULTIPLE",
      message: `Found ${count} meta description tags. Only one should be present.`
    });
  }

  const text = (descMetas[0].attributes.content || "").trim();
  const length = text.length;

  let status = "optimal";
  if (length === 0) {
    status = "empty";
    issues.push({
      type: "error",
      code: "DESCRIPTION_EMPTY",
      message: "Meta description tag content is empty."
    });
  } else if (length < 70) {
    status = "too-short";
    issues.push({
      type: "warning",
      code: "DESCRIPTION_TOO_SHORT",
      message: `Meta description is too short (${length} characters). 70–160 characters is recommended.`
    });
  } else if (length > 160) {
    status = "too-long";
    issues.push({
      type: "warning",
      code: "DESCRIPTION_TOO_LONG",
      message: `Meta description is too long (${length} characters). It may be truncated in search snippets (max 160 recommended).`
    });
  }

  return {
    present: true,
    count,
    text,
    length,
    status,
    issues
  };
}
