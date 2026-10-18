import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Generates Twitter/X Card metadata tags.
 *
 * @param {Object} options
 * @param {'summary'|'summary_large_image'|'app'|'player'} [options.card='summary_large_image'] - Twitter card type
 * @param {string} [options.title] - twitter:title
 * @param {string} [options.description] - twitter:description
 * @param {string|Object} [options.image] - twitter:image or { url, alt }
 * @param {string} [options.imageAlt] - twitter:image:alt
 * @param {string} [options.site] - twitter:site (@username)
 * @param {string} [options.creator] - twitter:creator (@username)
 * @param {Object} [options.extra] - Additional Twitter properties
 * @returns {{ tags: Array<Object>, toHtml: () => string, toString: () => string }}
 */
export function generateTwitterCard(options = {}) {
  const {
    card = "summary_large_image",
    title,
    description,
    image,
    imageAlt,
    site,
    creator,
    extra = {}
  } = options;

  const tags = [];

  if (card) {
    tags.push({ name: "twitter:card", content: String(card) });
  }

  if (title) {
    tags.push({ name: "twitter:title", content: String(title) });
  }

  if (description) {
    tags.push({ name: "twitter:description", content: String(description) });
  }

  if (site) {
    const formattedSite = site.startsWith("@") ? site : `@${site}`;
    tags.push({ name: "twitter:site", content: formattedSite });
  }

  if (creator) {
    const formattedCreator = creator.startsWith("@") ? creator : `@${creator}`;
    tags.push({ name: "twitter:creator", content: formattedCreator });
  }

  if (image) {
    if (typeof image === "string") {
      tags.push({ name: "twitter:image", content: image });
    } else if (typeof image === "object" && image !== null) {
      if (image.url) {
        tags.push({ name: "twitter:image", content: String(image.url) });
      }
      if (image.alt) {
        tags.push({ name: "twitter:image:alt", content: String(image.alt) });
      }
    }
  }

  if (imageAlt && (!image || typeof image === "string" || !image.alt)) {
    tags.push({ name: "twitter:image:alt", content: String(imageAlt) });
  }

  if (extra && typeof extra === "object") {
    for (const [key, val] of Object.entries(extra)) {
      if (val !== undefined && val !== null) {
        const prop = key.startsWith("twitter:") ? key : `twitter:${key}`;
        tags.push({ name: prop, content: String(val) });
      }
    }
  }

  function toHtml() {
    return tags
      .map(
        (t) =>
          `<meta name="${escapeHtml(t.name)}" content="${escapeHtml(t.content)}">`
      )
      .join("\n");
  }

  return {
    tags,
    toHtml,
    toString: toHtml
  };
}
