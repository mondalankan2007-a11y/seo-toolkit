import { findTags } from "./htmlParser.js";

/**
 * Analyzes HTML <img> tags for alt attributes and accessibility/SEO best practices.
 * @param {string} html
 * @returns {Object}
 */
export function analyzeImages(html) {
  const imgTags = findTags(html, "img");
  const total = imgTags.length;
  const issues = [];

  let withAlt = 0;
  let missingAlt = 0;
  let emptyAlt = 0;
  const missingAltSources = [];

  for (const img of imgTags) {
    const hasAlt = Object.prototype.hasOwnProperty.call(img.attributes, "alt");
    const src = img.attributes.src || "(no src)";

    if (!hasAlt) {
      missingAlt++;
      missingAltSources.push(src);
    } else if (img.attributes.alt.trim() === "") {
      emptyAlt++; // Decorative images
      withAlt++;
    } else {
      withAlt++;
    }
  }

  if (missingAlt > 0) {
    issues.push({
      type: "warning",
      code: "IMAGES_MISSING_ALT",
      message: `${missingAlt} of ${total} image(s) are missing an 'alt' attribute.`,
      missingSources: missingAltSources
    });
  }

  return {
    total,
    withAlt,
    missingAlt,
    emptyAlt,
    missingAltSources,
    issues
  };
}
