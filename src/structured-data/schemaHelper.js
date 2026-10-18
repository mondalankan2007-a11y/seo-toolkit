/**
 * Wraps JSON-LD schema data into safe HTML script tag.
 * Prevents XSS by escaping closing script tags and HTML comment tags.
 *
 * @param {Object|Array} schemaData
 * @param {Object} [options]
 * @param {boolean} [options.pretty=false]
 * @returns {string}
 */
export function formatJsonLdScript(schemaData, options = {}) {
  const { pretty = false } = options;
  const json = JSON.stringify(schemaData, null, pretty ? 2 : 0);
  const safeJson = json.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");
  return `<script type="application/ld+json">${safeJson}</script>`;
}

/**
 * Creates standard structured schema wrapper.
 * @param {Object} schema
 */
export function createSchemaResult(schema) {
  return {
    ...schema,
    toJSON: () => schema,
    toScript: (opts) => formatJsonLdScript(schema, opts),
    toString: (opts) => formatJsonLdScript(schema, opts)
  };
}
