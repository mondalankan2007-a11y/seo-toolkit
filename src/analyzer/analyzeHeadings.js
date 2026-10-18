import { findTags } from "./htmlParser.js";

/**
 * Analyzes HTML headings (H1-H6) for SEO hierarchy and structure.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeHeadings(html) {
  const issues = [];
  const headingList = [];

  for (let level = 1; level <= 6; level++) {
    const tags = findTags(html, `h${level}`);
    for (const t of tags) {
      headingList.push({
        level,
        text: t.text.trim()
      });
    }
  }

  const h1s = headingList.filter((h) => h.level === 1);
  const h1Count = h1s.length;
  const h1Text = h1s.map((h) => h.text);

  if (h1Count === 0) {
    issues.push({
      type: "error",
      code: "H1_MISSING",
      message: "Webpage is missing an <h1> heading."
    });
  } else if (h1Count > 1) {
    issues.push({
      type: "warning",
      code: "H1_MULTIPLE",
      message: `Found ${h1Count} <h1> headings. Exactly one primary <h1> heading is recommended.`
    });
  }

  // Check for empty headings
  const emptyHeadings = headingList.filter((h) => !h.text);
  if (emptyHeadings.length > 0) {
    issues.push({
      type: "warning",
      code: "HEADING_EMPTY",
      message: `Found ${emptyHeadings.length} empty heading tag(s).`
    });
  }

  // Check hierarchy skips (e.g. H1 followed directly by H3 without H2)
  let lastLevel = 0;
  for (const h of headingList) {
    if (lastLevel > 0 && h.level > lastLevel + 1) {
      issues.push({
        type: "warning",
        code: "HEADING_HIERARCHY_SKIPPED",
        message: `Heading hierarchy skipped from <h${lastLevel}> to <h${h.level}> ('${h.text}').`
      });
      break;
    }
    lastLevel = h.level;
  }

  return {
    h1Count,
    h1Text,
    totalHeadings: headingList.length,
    headings: headingList,
    issues
  };
}
