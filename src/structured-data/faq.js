import { SeoValidationError } from "../errors/SeoError.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org FAQPage JSON-LD object.
 *
 * @param {Array<Object>|Object} data - Array of FAQ items or object containing items / questions.
 * @returns {Object} Schema.org FAQPage object with .toScript(), .toJSON(), and .toString()
 */
export function generateFAQPage(data) {
  if (!data) {
    throw new SeoValidationError("generateFAQPage: data is required.");
  }

  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === "object") {
    items = data.questions || data.items || data.mainEntity || [];
  } else {
    throw new SeoValidationError("generateFAQPage: data must be an array of FAQ items or an object containing items.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new SeoValidationError("generateFAQPage: at least one FAQ item (question and answer) is required.");
  }

  const mainEntity = items.map((item, idx) => {
    if (!item || typeof item !== "object") {
      throw new SeoValidationError(`generateFAQPage: item at index ${idx} must be an object.`);
    }

    const questionText = item.question || item.name;
    const answerText = item.answer || item.text || (item.acceptedAnswer && (item.acceptedAnswer.text || item.acceptedAnswer.name));

    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      throw new SeoValidationError(`generateFAQPage: item at index ${idx} must have a non-empty 'question'.`);
    }

    if (!answerText || typeof answerText !== "string" || !answerText.trim()) {
      throw new SeoValidationError(`generateFAQPage: item at index ${idx} must have a non-empty 'answer'.`);
    }

    return {
      "@type": "Question",
      name: questionText.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: answerText.trim()
      }
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity
  };

  return createSchemaResult(schema);
}
