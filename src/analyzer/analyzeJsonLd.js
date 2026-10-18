import { findTags } from "./htmlParser.js";

/**
 * Analyzes Schema.org JSON-LD structured data in HTML.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeJsonLd(html) {
  const scriptTags = findTags(html, "script");
  const ldScripts = scriptTags.filter(
    (s) => (s.attributes.type || "").toLowerCase() === "application/ld+json"
  );

  const count = ldScripts.length;
  const schemas = [];
  const types = [];
  const syntaxErrors = [];
  const issues = [];

  for (let i = 0; i < ldScripts.length; i++) {
    const rawContent = ldScripts[i].innerHtml.trim();
    if (!rawContent) {
      syntaxErrors.push(`Empty JSON-LD script block at index ${i}.`);
      continue;
    }

    try {
      const parsed = JSON.parse(rawContent);
      schemas.push(parsed);

      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && item["@type"]) {
          types.push(item["@type"]);
        }
      }
    } catch (err) {
      syntaxErrors.push(`Failed to parse JSON-LD at index ${i}: ${err.message}`);
    }
  }

  const present = schemas.length > 0;

  if (count === 0) {
    issues.push({
      type: "info",
      code: "JSON_LD_MISSING",
      message: "Webpage has no Schema.org JSON-LD structured data."
    });
  }

  if (syntaxErrors.length > 0) {
    for (const err of syntaxErrors) {
      issues.push({
        type: "error",
        code: "JSON_LD_SYNTAX_ERROR",
        message: err
      });
    }
  }

  return {
    present,
    count,
    schemas,
    types,
    syntaxErrors,
    issues
  };
}
