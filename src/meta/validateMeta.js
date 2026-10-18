import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";

/**
 * Validates metadata options and returns errors, warnings, and validity status.
 *
 * @param {Object} options
 * @param {Object} [config]
 * @param {boolean} [config.throwOnError=false] - If true, throws SeoValidationError when errors occur.
 * @param {boolean} [config.requireTitle=true] - Whether title is strictly required.
 * @param {boolean} [config.requireDescription=true] - Whether description is strictly required.
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateMeta(options, config = {}) {
  const {
    throwOnError = false,
    requireTitle = true,
    requireDescription = true
  } = config;

  const errors = [];
  const warnings = [];

  // 1. Invalid input types
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    errors.push("Invalid input: options must be a non-null object.");
    if (throwOnError) {
      throw new SeoValidationError("SEO Metadata Validation Failed", errors, warnings);
    }
    return { valid: false, errors, warnings };
  }

  // 2. Validate Title
  if (options.title !== undefined) {
    if (typeof options.title !== "string") {
      errors.push("Invalid input type: 'title' must be a string.");
    } else if (!options.title.trim()) {
      errors.push("Missing title: 'title' cannot be empty.");
    } else {
      const len = options.title.trim().length;
      if (len < 10) {
        warnings.push(`Title is too short (${len} chars). Recommended length is 30–60 characters.`);
      } else if (len > 60) {
        warnings.push(`Title is too long (${len} chars). It may be truncated in search results (max recommended 60 characters).`);
      }
    }
  } else if (requireTitle) {
    errors.push("Missing title: 'title' is required for valid technical SEO.");
  }

  // 3. Validate Description
  if (options.description !== undefined) {
    if (typeof options.description !== "string") {
      errors.push("Invalid input type: 'description' must be a string.");
    } else if (!options.description.trim()) {
      errors.push("Missing description: 'description' cannot be empty.");
    } else {
      const len = options.description.trim().length;
      if (len < 50) {
        warnings.push(`Meta description is too short (${len} chars). Recommended length is 70–160 characters.`);
      } else if (len > 160) {
        warnings.push(`Meta description is too long (${len} chars). It may be truncated in search results (max recommended 160 characters).`);
      }
    }
  } else if (requireDescription) {
    errors.push("Missing description: 'description' is required for valid technical SEO.");
  }

  // 4. Validate Canonical URL
  if (options.canonical !== undefined) {
    if (typeof options.canonical !== "string") {
      errors.push("Invalid input type: 'canonical' must be a string.");
    } else if (!isValidUrl(options.canonical)) {
      errors.push(`Invalid canonical URL: '${options.canonical}' is not a valid absolute HTTP/HTTPS URL.`);
    }
  }

  // 5. Validate Open Graph
  if (options.openGraph !== undefined) {
    if (typeof options.openGraph !== "object" || options.openGraph === null || Array.isArray(options.openGraph)) {
      errors.push("Invalid input type: 'openGraph' must be an object.");
    } else {
      const og = options.openGraph;
      if (og.url && !isValidUrl(og.url)) {
        errors.push(`Invalid Open Graph URL: '${og.url}' is not a valid absolute HTTP/HTTPS URL.`);
      }
      if (og.image) {
        validateImageField(og.image, "Open Graph", errors, warnings);
      }
    }
  }

  // 6. Validate Twitter Card
  if (options.twitter !== undefined) {
    if (typeof options.twitter !== "object" || options.twitter === null || Array.isArray(options.twitter)) {
      errors.push("Invalid input type: 'twitter' must be an object.");
    } else {
      const tw = options.twitter;
      const validCards = ["summary", "summary_large_image", "app", "player"];
      if (tw.card && !validCards.includes(tw.card)) {
        warnings.push(`Unrecognized Twitter card type '${tw.card}'. Expected one of: ${validCards.join(", ")}`);
      }
      if (tw.image) {
        validateImageField(tw.image, "Twitter", errors, warnings);
      }
    }
  }

  // 7. Validate keywords
  if (options.keywords !== undefined) {
    if (typeof options.keywords !== "string" && !Array.isArray(options.keywords)) {
      errors.push("Invalid input type: 'keywords' must be a string or an array of strings.");
    } else if (Array.isArray(options.keywords) && options.keywords.some((k) => typeof k !== "string")) {
      errors.push("Invalid input type: all items in 'keywords' array must be strings.");
    }
  }

  const valid = errors.length === 0;

  if (!valid && throwOnError) {
    throw new SeoValidationError("SEO Metadata Validation Failed", errors, warnings);
  }

  return { valid, errors, warnings };
}

function validateImageField(image, context, errors, warnings) {
  if (typeof image === "string") {
    if (!isValidUrl(image)) {
      errors.push(`Invalid ${context} image URL: '${image}' is not a valid absolute HTTP/HTTPS URL.`);
    }
  } else if (typeof image === "object" && image !== null && !Array.isArray(image)) {
    if (!image.url) {
      errors.push(`Invalid ${context} image: missing 'url' property in image object.`);
    } else if (!isValidUrl(image.url)) {
      errors.push(`Invalid ${context} image URL: '${image.url}' is not a valid absolute HTTP/HTTPS URL.`);
    }

    if (image.width !== undefined && (typeof image.width !== "number" || image.width <= 0)) {
      warnings.push(`${context} image width should be a positive number.`);
    }
    if (image.height !== undefined && (typeof image.height !== "number" || image.height <= 0)) {
      warnings.push(`${context} image height should be a positive number.`);
    }
  } else {
    errors.push(`Invalid ${context} image: image must be a string URL or an object with a 'url' property.`);
  }
}
