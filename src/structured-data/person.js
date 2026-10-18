import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org Person JSON-LD object.
 *
 * @param {Object} data
 * @param {string} data.name - Person's name (required).
 * @param {string} [data.url] - URL to profile/homepage.
 * @param {string} [data.image] - Image/avatar URL.
 * @param {string} [data.jobTitle] - Job title.
 * @param {string|Object} [data.worksFor] - Organization name or Organization object.
 * @param {string[]} [data.sameAs] - Array of social profiles or external links.
 * @param {string} [data.description] - Short biography or description.
 * @param {string} [data.email] - Email address.
 * @returns {Object} Schema.org Person object with .toScript() and .toJSON()
 */
export function generatePerson(data = {}) {
  if (!data || typeof data !== "object") {
    throw new SeoValidationError("generatePerson: data must be a non-null object.");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new SeoValidationError("generatePerson: 'name' is required and must be a non-empty string.");
  }

  if (data.url && !isValidUrl(data.url)) {
    throw new SeoValidationError(`generatePerson: 'url' must be a valid absolute HTTP/HTTPS URL, received '${data.url}'.`);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name.trim()
  };

  if (data.url) schema.url = data.url.trim();
  if (data.image) schema.image = data.image;
  if (data.jobTitle) schema.jobTitle = String(data.jobTitle).trim();

  if (data.worksFor) {
    schema.worksFor = typeof data.worksFor === "string"
      ? { "@type": "Organization", name: data.worksFor }
      : data.worksFor;
  }

  if (Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs.filter(url => typeof url === "string" && url.trim());
  }

  if (data.description) schema.description = String(data.description).trim();
  if (data.email) schema.email = String(data.email).trim();

  return createSchemaResult(schema);
}
