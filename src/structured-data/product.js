import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org Product JSON-LD object.
 *
 * @param {Object} data
 * @param {string} data.name - Product name (required).
 * @param {string|string[]} [data.image] - Product image URL(s).
 * @param {string} [data.description] - Product description.
 * @param {string} [data.sku] - Stock Keeping Unit (SKU).
 * @param {string|Object} [data.brand] - Brand name or Brand object.
 * @param {Object} [data.offers] - Pricing and availability details.
 * @param {Object} [data.aggregateRating] - Rating values.
 * @returns {Object} Schema.org Product object with .toScript() and .toJSON()
 */
export function generateProduct(data = {}) {
  if (!data || typeof data !== "object") {
    throw new SeoValidationError("generateProduct: data must be a non-null object.");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new SeoValidationError("generateProduct: 'name' is required and must be a non-empty string.");
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name.trim()
  };

  if (data.image) {
    schema.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.description) schema.description = String(data.description).trim();
  if (data.sku) schema.sku = String(data.sku).trim();

  if (data.brand) {
    schema.brand = typeof data.brand === "string"
      ? { "@type": "Brand", name: data.brand.trim() }
      : data.brand;
  }

  if (data.offers) {
    const rawOffers = data.offers;
    const offerObj = {
      "@type": "Offer",
      price: rawOffers.price !== undefined ? String(rawOffers.price) : undefined,
      priceCurrency: rawOffers.priceCurrency || "USD",
      availability: rawOffers.availability
        ? (rawOffers.availability.startsWith("http") ? rawOffers.availability : `https://schema.org/${rawOffers.availability}`)
        : undefined,
      url: rawOffers.url,
      validThrough: rawOffers.validThrough
    };

    // Filter out undefined fields
    schema.offers = Object.fromEntries(
      Object.entries(offerObj).filter(([_, v]) => v !== undefined)
    );
  }

  if (data.aggregateRating) {
    const rawRating = data.aggregateRating;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rawRating.ratingValue,
      reviewCount: rawRating.reviewCount,
      bestRating: rawRating.bestRating || "5",
      worstRating: rawRating.worstRating || "1"
    };
  }

  return createSchemaResult(schema);
}
