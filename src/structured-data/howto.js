import { SeoValidationError } from "../errors/SeoError.js";
import { createSchemaResult } from "./schemaHelper.js";

/**
 * Generates Schema.org HowTo JSON-LD object.
 *
 * @param {Object} data
 * @param {string} data.name - The title of the HowTo (required).
 * @param {string} [data.description] - Description of the how-to.
 * @param {Array<Object|string>} data.steps - Array of steps (required).
 * @param {string} [data.totalTime] - ISO 8601 duration (e.g. 'PT30M').
 * @param {string|string[]} [data.image] - Image URL(s).
 * @param {string|string[]} [data.supply] - Supplies needed.
 * @param {string|string[]} [data.tool] - Tools needed.
 * @returns {Object} Schema.org HowTo object with .toScript(), .toJSON(), and .toString()
 */
export function generateHowTo(data = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new SeoValidationError("generateHowTo: data must be a non-null object.");
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new SeoValidationError("generateHowTo: 'name' is required and must be a non-empty string.");
  }

  const rawSteps = data.steps || data.step;
  if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
    throw new SeoValidationError("generateHowTo: 'steps' is required and must be a non-empty array.");
  }

  const stepList = rawSteps.map((step, idx) => {
    if (typeof step === "string") {
      if (!step.trim()) {
        throw new SeoValidationError(`generateHowTo: step at index ${idx} must not be empty.`);
      }
      return {
        "@type": "HowToStep",
        position: idx + 1,
        text: step.trim()
      };
    }

    if (!step || typeof step !== "object") {
      throw new SeoValidationError(`generateHowTo: step at index ${idx} must be an object or string.`);
    }

    const text = step.text || step.description || step.name;
    if (!text || typeof text !== "string" || !text.trim()) {
      throw new SeoValidationError(`generateHowTo: step at index ${idx} must contain 'text' or 'name'.`);
    }

    const stepObj = {
      "@type": "HowToStep",
      position: idx + 1,
      text: text.trim()
    };

    if (step.name && step.name.trim() !== text.trim()) {
      stepObj.name = step.name.trim();
    }
    if (step.url) {
      stepObj.url = String(step.url).trim();
    }
    if (step.image) {
      stepObj.image = step.image;
    }

    return stepObj;
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name.trim(),
    step: stepList
  };

  if (data.description) schema.description = String(data.description).trim();
  if (data.totalTime) schema.totalTime = String(data.totalTime).trim();
  if (data.image) schema.image = Array.isArray(data.image) ? data.image : [data.image];

  if (data.supply) {
    const supplies = Array.isArray(data.supply) ? data.supply : [data.supply];
    schema.supply = supplies.map((s) =>
      typeof s === "string" ? { "@type": "HowToSupply", name: s.trim() } : s
    );
  }

  if (data.tool) {
    const tools = Array.isArray(data.tool) ? data.tool : [data.tool];
    schema.tool = tools.map((t) =>
      typeof t === "string" ? { "@type": "HowToTool", name: t.trim() } : t
    );
  }

  return createSchemaResult(schema);
}
