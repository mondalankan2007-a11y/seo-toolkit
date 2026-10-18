import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Generates Open Graph metadata tags for social sharing.
 *
 * @param {Object} options
 * @param {string} [options.title] - og:title
 * @param {string} [options.description] - og:description
 * @param {string} [options.url] - og:url
 * @param {string|Object} [options.image] - og:image (URL string or object with url, alt, width, height, type)
 * @param {string} [options.type='website'] - og:type (website, article, etc.)
 * @param {string} [options.siteName] - og:site_name
 * @param {string} [options.locale='en_US'] - og:locale
 * @param {Object} [options.extra] - Additional Open Graph properties
 * @returns {{ tags: Array<Object>, toHtml: () => string, toString: () => string }}
 */
export function generateOpenGraph(options = {}) {
  const {
    title,
    description,
    url,
    image,
    type = "website",
    siteName,
    locale,
    extra = {}
  } = options;

  const tags = [];

  if (type) {
    tags.push({ property: "og:type", content: String(type) });
  }

  if (title) {
    tags.push({ property: "og:title", content: String(title) });
  }

  if (description) {
    tags.push({ property: "og:description", content: String(description) });
  }

  if (url) {
    tags.push({ property: "og:url", content: String(url) });
  }

  if (siteName) {
    tags.push({ property: "og:site_name", content: String(siteName) });
  }

  if (locale) {
    tags.push({ property: "og:locale", content: String(locale) });
  }

  if (image) {
    if (typeof image === "string") {
      tags.push({ property: "og:image", content: image });
    } else if (typeof image === "object" && image !== null) {
      if (image.url) {
        tags.push({ property: "og:image", content: String(image.url) });
      }
      if (image.secureUrl) {
        tags.push({ property: "og:image:secure_url", content: String(image.secureUrl) });
      }
      if (image.type) {
        tags.push({ property: "og:image:type", content: String(image.type) });
      }
      if (image.width) {
        tags.push({ property: "og:image:width", content: String(image.width) });
      }
      if (image.height) {
        tags.push({ property: "og:image:height", content: String(image.height) });
      }
      if (image.alt) {
        tags.push({ property: "og:image:alt", content: String(image.alt) });
      }
    }
  }

  if (extra && typeof extra === "object") {
    for (const [key, val] of Object.entries(extra)) {
      if (val !== undefined && val !== null) {
        const prop = key.startsWith("og:") ? key : `og:${key}`;
        tags.push({ property: prop, content: String(val) });
      }
    }
  }

  function toHtml() {
    return tags
      .map(
        (t) =>
          `<meta property="${escapeHtml(t.property)}" content="${escapeHtml(t.content)}">`
      )
      .join("\n");
  }

  return {
    tags,
    toHtml,
    toString: toHtml
  };
}
