/**
 * Lightweight, zero-dependency HTML tokenizer and extractor for SEO analysis.
 */

/**
 * Decodes common HTML entities in text.
 * @param {string} str
 * @returns {string}
 */
export function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Strips HTML tags from a string.
 * @param {string} html
 * @returns {string}
 */
export function stripTags(html) {
  if (!html) return "";
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/**
 * Parses attributes from an HTML tag string into a key-value object (keys in lowercase).
 * Handles double quotes, single quotes, and unquoted attributes.
 *
 * @param {string} tagString
 * @returns {Record<string, string>}
 */
export function parseTagAttributes(tagString) {
  const attrs = {};
  if (!tagString) return attrs;

  // Regex matches: attrName="attrVal" | attrName='attrVal' | attrName=attrVal | attrName
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(tagString)) !== null) {
    const key = match[1].toLowerCase();
    // match[2] is double-quoted, match[3] is single-quoted, match[4] is unquoted
    const val = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : "";
    attrs[key] = decodeHtmlEntities(val);
  }

  return attrs;
}

/**
 * Finds all occurrences of a specific tag and parses them.
 *
 * @param {string} html
 * @param {string} tagName
 * @returns {Array<{ raw: string, attributes: Record<string, string>, innerHtml: string, text: string }>}
 */
export function findTags(html, tagName) {
  if (typeof html !== "string") return [];
  const results = [];
  const lowerTag = tagName.toLowerCase();

  // Self-closing or void tags like <img>, <meta>, <link>
  const voidTags = new Set(["meta", "link", "img", "br", "hr", "input"]);

  if (voidTags.has(lowerTag)) {
    const regex = new RegExp(`<${lowerTag}(\\s+[^>]*?)?\\s*\\/?>`, "gi");
    let match;
    while ((match = regex.exec(html)) !== null) {
      const rawAttrs = match[1] || "";
      results.push({
        raw: match[0],
        attributes: parseTagAttributes(rawAttrs),
        innerHtml: "",
        text: ""
      });
    }
  } else {
    // Tags with closing counterpart like <title>...</title>, <h1>...</h1>, <script>...</script>
    const regex = new RegExp(`<${lowerTag}(\\s+[^>]*?)?>([\\s\\S]*?)<\\/${lowerTag}>`, "gi");
    let match;
    while ((match = regex.exec(html)) !== null) {
      const rawAttrs = match[1] || "";
      const innerHtml = match[2] || "";
      results.push({
        raw: match[0],
        attributes: parseTagAttributes(rawAttrs),
        innerHtml,
        text: stripTags(innerHtml)
      });
    }
  }

  return results;
}
