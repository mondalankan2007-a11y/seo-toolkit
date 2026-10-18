import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org BreadcrumbList JSON-LD object.
 *
 * @param {Array<{ name: string, url?: string, item?: string }>} items
 * @returns {Object} Schema.org BreadcrumbList object with .toScript() and .toJSON()
 */
export function generateBreadcrumbList(items = []) {
  if (!Array.isArray(items)) {
    throw new SeoValidationError("generateBreadcrumbList: items parameter must be an array.");
  }

  if (items.length === 0) {
    throw new SeoValidationError("generateBreadcrumbList: items array cannot be empty.");
  }

  const itemListElement = [];

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    if (!entry || typeof entry !== "object") {
      throw new SeoValidationError(`generateBreadcrumbList: item at index ${i} must be an object.`);
    }

    const name = entry.name ? String(entry.name).trim() : "";
    if (!name) {
      throw new SeoValidationError(`generateBreadcrumbList: item at index ${i} is missing required 'name' property.`);
    }

    const itemUrl = entry.url || entry.item;
    if (itemUrl && !isValidUrl(itemUrl)) {
      throw new SeoValidationError(`generateBreadcrumbList: item at index ${i} has invalid URL '${itemUrl}'. Must be an absolute HTTP/HTTPS URL.`);
    }

    const listItem = {
      "@type": "ListItem",
      position: i + 1,
      name
    };

    if (itemUrl) {
      listItem.item = itemUrl.trim();
    }

    itemListElement.push(listItem);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };

  return createSchemaResult(schema);
}
