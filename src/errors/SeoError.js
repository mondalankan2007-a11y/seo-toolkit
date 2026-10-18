/**
 * Base error class for seo-toolkit.
 */
export class SeoError extends Error {
  constructor(message, code = "SEO_ERROR") {
    super(message);
    this.name = "SeoError";
    this.code = code;
  }
}

/**
 * Validation error thrown when SEO input fails validation rules.
 */
export class SeoValidationError extends SeoError {
  constructor(message, errors = [], warnings = []) {
    super(message, "SEO_VALIDATION_ERROR");
    this.name = "SeoValidationError";
    this.errors = errors;
    this.warnings = warnings;
  }
}
