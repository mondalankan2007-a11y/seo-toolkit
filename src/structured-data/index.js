import { SeoValidationError } from "../errors/SeoError.js";
import { formatJsonLdScript, createSchemaResult } from "./schemaHelper.js";
import { generatePerson } from "./person.js";
import { generateOrganization } from "./organization.js";
import { generateArticle } from "./article.js";
import { generateProduct } from "./product.js";
import { generateBreadcrumbList } from "./breadcrumb.js";
import { generateFAQPage } from "./faq.js";
import { generateHowTo } from "./howto.js";

/**
 * Universal JSON-LD Schema.org structured data generator.
 * Accepts typed input (Person, Organization, Article, Product, BreadcrumbList, FAQPage, HowTo) or custom schema data.
 *
 * @param {Object|Array} schemaData
 * @param {Object} [options]
 * @param {boolean} [options.pretty=false]
 * @returns {Object} Schema result with .toScript(), .toJSON(), and .toString()
 */
export function generateJsonLd(schemaData, options = {}) {
  if (!schemaData || typeof schemaData !== "object") {
    throw new SeoValidationError("generateJsonLd: schemaData must be a non-null object or array.");
  }

  // If array of breadcrumbs passed directly
  if (Array.isArray(schemaData)) {
    return createSchemaResult(schemaData);
  }

  const type = schemaData["@type"] || schemaData.type;

  let result;
  switch (type) {
    case "Person":
      result = generatePerson(schemaData);
      break;
    case "Organization":
    case "Corporation":
    case "LocalBusiness":
      result = generateOrganization(schemaData);
      break;
    case "Article":
    case "NewsArticle":
    case "BlogPosting":
      result = generateArticle(schemaData);
      break;
    case "Product":
      result = generateProduct(schemaData);
      break;
    case "BreadcrumbList":
      result = generateBreadcrumbList(schemaData.items || schemaData.itemListElement || []);
      break;
    case "FAQPage":
      result = generateFAQPage(schemaData.questions || schemaData.items || schemaData.mainEntity || schemaData);
      break;
    case "HowTo":
      result = generateHowTo(schemaData);
      break;
    default: {
      const normalized = {
        "@context": "https://schema.org",
        ...schemaData
      };
      if (schemaData.type && !schemaData["@type"]) {
        normalized["@type"] = schemaData.type;
        delete normalized.type;
      }
      result = createSchemaResult(normalized);
      break;
    }
  }

  return result;
}

export {
  generatePerson,
  generateOrganization,
  generateArticle,
  generateProduct,
  generateBreadcrumbList,
  generateFAQPage,
  generateHowTo,
  formatJsonLdScript
};
