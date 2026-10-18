import { escapeHtml } from "../utils/escapeHtml.js";
import { generateOpenGraph } from "./openGraph.js";
import { generateTwitterCard } from "./twitter.js";

/**
 * Generates standard SEO HTML meta and link tags.
 *
 * @param {Object} options
 * @param {string} [options.title] - The webpage title.
 * @param {string} [options.description] - The meta description.
 * @param {string} [options.canonical] - The canonical URL of the webpage.
 * @param {string} [options.robots] - Robots directive (e.g., 'index, follow').
 * @param {string} [options.charset='utf-8'] - Character encoding.
 * @param {string} [options.viewport] - Viewport setting.
 * @param {string|string[]} [options.keywords] - Keywords for the page.
 * @param {string} [options.author] - Author name.
 * @param {Object} [options.openGraph] - Open Graph options.
 * @param {Object} [options.twitter] - Twitter Card options.
 * @param {Array<Object>} [options.extra] - Additional arbitrary meta tags.
 * @returns {{ tags: Array<Object>, toHtml: () => string, toString: () => string }}
 */
export function generateMeta(options = {}) {
  const {
    title,
    description,
    canonical,
    robots,
    charset = "utf-8",
    viewport,
    keywords,
    author,
    openGraph,
    twitter,
    extra = []
  } = options;

  const tags = [];

  if (charset) {
    tags.push({ tag: "meta", charset });
  }

  if (viewport) {
    tags.push({ tag: "meta", name: "viewport", content: viewport });
  }

  if (title) {
    tags.push({ tag: "title", text: title });
  }

  if (description) {
    tags.push({ tag: "meta", name: "description", content: description });
  }

  if (canonical) {
    tags.push({ tag: "link", rel: "canonical", href: canonical });
  }

  if (robots) {
    tags.push({ tag: "meta", name: "robots", content: robots });
  }

  if (author) {
    tags.push({ tag: "meta", name: "author", content: author });
  }

  if (keywords) {
    const kwValue = Array.isArray(keywords) ? keywords.join(", ") : keywords;
    tags.push({ tag: "meta", name: "keywords", content: kwValue });
  }

  if (openGraph && typeof openGraph === "object") {
    const ogResult = generateOpenGraph(openGraph);
    for (const ogTag of ogResult.tags) {
      tags.push({ tag: "meta", ...ogTag });
    }
  }

  if (twitter && typeof twitter === "object") {
    const twitterResult = generateTwitterCard(twitter);
    for (const twTag of twitterResult.tags) {
      tags.push({ tag: "meta", ...twTag });
    }
  }

  if (Array.isArray(extra)) {
    for (const item of extra) {
      if (item && typeof item === "object") {
        tags.push({ ...item });
      }
    }
  }

  function toHtml() {
    return tags
      .map((tag) => {
        if (tag.tag === "title") {
          return `<title>${escapeHtml(tag.text)}</title>`;
        }
        if (tag.tag === "link") {
          const attrs = Object.entries(tag)
            .filter(([k]) => k !== "tag")
            .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
            .join(" ");
          return `<link ${attrs}>`;
        }
        if (tag.tag === "meta") {
          const attrs = Object.entries(tag)
            .filter(([k]) => k !== "tag")
            .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
            .join(" ");
          return `<meta ${attrs}>`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return {
    tags,
    toHtml,
    toString: toHtml
  };
}
