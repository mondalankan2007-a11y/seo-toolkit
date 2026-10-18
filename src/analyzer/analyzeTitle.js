import { findTags } from "./htmlParser.js";

/**
 * Analyzes HTML <title> tag for SEO best practices.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeTitle(html) {
  const titleTags = findTags(html, "title");
  const present = titleTags.length > 0;
  const count = titleTags.length;
  const issues = [];

  if (!present) {
    issues.push({ type: "error", code: "TITLE_MISSING", message: "Webpage is missing a <title> tag." });
    return { present: false, count: 0, text: "", length: 0, status: "missing", issues };
  }

  if (count > 1) {
    issues.push({ type: "warning", code: "TITLE_MULTIPLE", message: `Found ${count} <title> tags. Only one is recommended.` });
  }

  const text = titleTags[0].text.trim();
  const length = text.length;

  let status = "optimal";
  if (length === 0) {
    status = "empty";
    issues.push({ type: "error", code: "TITLE_EMPTY", message: "<title> tag is empty." });
  } else if (length < 30) {
    status = "too-short";
    issues.push({
      type: "warning",
      code: "TITLE_TOO_SHORT",
      message: `Title is too short (${length} characters). 30–60 characters is recommended.`
    });
  } else if (length > 60) {
    status = "too-long";
    issues.push({
      type: "warning",
      code: "TITLE_TOO_LONG",
      message: `Title is too long (${length} characters). It may be truncated in search results (max 60 recommended).`
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
