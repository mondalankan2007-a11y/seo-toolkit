import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { formatLastmod } from "../sitemap/generateSitemap.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org Article JSON-LD object.
 *
 * @param {Object} data
 * @param {string} data.headline - Article headline (required).
 * @param {string} [data.description] - Summary of the article.
 * @param {string|string[]} [data.image] - Article image URL(s).
 * @param {string|Date} [data.datePublished] - Publication date.
 * @param {string|Date} [data.dateModified] - Last modification date.
 * @param {string|Object} [data.author] - Author name or Person/Organization object.
 * @param {string|Object} [data.publisher] - Publisher name or Organization object.
 * @param {string} [data.url] - URL to the article.
 * @param {'Article'|'NewsArticle'|'BlogPosting'} [data.type='Article'] - Article type.
 * @returns {Object} Schema.org Article object with .toScript() and .toJSON()
 */
export function generateArticle(data = {}) {
  if (!data || typeof data !== "object") {
    throw new SeoValidationError("generateArticle: data must be a non-null object.");
  }

  if (!data.headline || typeof data.headline !== "string" || !data.headline.trim()) {
    throw new SeoValidationError("generateArticle: 'headline' is required and must be a non-empty string.");
  }

  if (data.url && !isValidUrl(data.url)) {
    throw new SeoValidationError(`generateArticle: 'url' must be a valid absolute HTTP/HTTPS URL, received '${data.url}'.`);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": data.type || "Article",
    headline: data.headline.trim()
  };

  if (data.description) schema.description = String(data.description).trim();
  if (data.image) {
    schema.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.datePublished) {
    schema.datePublished = data.datePublished instanceof Date
      ? data.datePublished.toISOString()
      : String(data.datePublished);
  }

  if (data.dateModified) {
    schema.dateModified = data.dateModified instanceof Date
      ? data.dateModified.toISOString()
      : String(data.dateModified);
  }

  if (data.author) {
    if (typeof data.author === "string") {
      schema.author = { "@type": "Person", name: data.author.trim() };
    } else {
      schema.author = data.author;
    }
  }

  if (data.publisher) {
    if (typeof data.publisher === "string") {
      schema.publisher = { "@type": "Organization", name: data.publisher.trim() };
    } else {
      schema.publisher = data.publisher;
    }
  }

  if (data.url) {
    schema.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": data.url.trim()
    };
  }

  return createSchemaResult(schema);
}
