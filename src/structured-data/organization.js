import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org Organization JSON-LD object.
 *
 * @param {Object} data
 * @param {string} data.name - Organization name (required).
 * @param {string} [data.url] - Official website URL.
 * @param {string} [data.logo] - Official logo URL.
 * @param {string[]} [data.sameAs] - Social links or profiles.
 * @param {string} [data.description] - Description of organization.
 * @param {Object|Array<Object>} [data.contactPoint] - Customer service or contact points.
 * @param {Object|string} [data.address] - Physical or postal address.
 * @param {string} [data.type='Organization'] - Specific organization type.
 * @returns {Object} Schema.org Organization object with .toScript() and .toJSON()
 */
export function generateOrganization(data = {}) {
  if (!data || typeof data !== "object") {
    throw new SeoValidationError("generateOrganization: data must be a non-null object.");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new SeoValidationError("generateOrganization: 'name' is required and must be a non-empty string.");
  }

  if (data.url && !isValidUrl(data.url)) {
    throw new SeoValidationError(`generateOrganization: 'url' must be a valid absolute HTTP/HTTPS URL, received '${data.url}'.`);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": data.type || "Organization",
    name: data.name.trim()
  };

  if (data.url) schema.url = data.url.trim();
  if (data.logo) schema.logo = data.logo;
  if (data.description) schema.description = String(data.description).trim();

  if (Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs.filter(url => typeof url === "string" && url.trim());
  }

  if (data.contactPoint) {
    schema.contactPoint = data.contactPoint;
  }

  if (data.address) {
    schema.address = typeof data.address === "string"
      ? { "@type": "PostalAddress", streetAddress: data.address }
      : data.address;
  }

  return createSchemaResult(schema);
}
