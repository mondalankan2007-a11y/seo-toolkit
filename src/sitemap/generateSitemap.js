import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";
import { escapeHtml } from "../utils/escapeHtml.js";

const VALID_CHANGEFREQS = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never"
]);

/**
 * Formats a Date object or date string into standard W3C/ISO 8601 date (YYYY-MM-DD).
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatLastmod(date) {
  if (!date) return "";
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  }
  if (typeof date === "number") {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  }
  if (typeof date === "string") {
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }
  return "";
}

/**
 * Generates standard sitemap.xml content conforming to sitemaps.org schema.
 *
 * @param {Array<string|Object>} routes - List of URL paths or route objects.
 * @param {Object} [options]
 * @param {string} [options.hostname] - Base hostname to resolve relative paths (e.g., https://example.com).
 * @param {boolean} [options.pretty=true] - Format XML with indentation and line breaks.
 * @param {boolean} [options.strict=true] - Throw error on invalid routes instead of omitting them.
 * @returns {string} Valid XML sitemap string.
 */
export function generateSitemap(routes = [], options = {}) {
  const { hostname, pretty = true, strict = true } = options;

  if (!Array.isArray(routes)) {
    throw new SeoValidationError("generateSitemap: 'routes' parameter must be an array.");
  }

  const nl = pretty ? "\n" : "";
  const indent1 = pretty ? "  " : "";
  const indent2 = pretty ? "    " : "";

  const xmlEntries = [];

  for (let i = 0; i < routes.length; i++) {
    const item = routes[i];
    let loc = "";
    let lastmod = "";
    let changefreq = "";
    let priority;

    if (typeof item === "string") {
      loc = item;
    } else if (item && typeof item === "object") {
      loc = item.loc || item.url || "";
      lastmod = item.lastmod || item.lastModified || "";
      changefreq = item.changefreq || item.changeFrequency || "";
      priority = item.priority;
    } else {
      if (strict) {
        throw new SeoValidationError(`generateSitemap: route at index ${i} must be a string or object.`);
      }
      continue;
    }

    // Resolve relative URL if hostname provided
    if (hostname && !isValidUrl(loc)) {
      try {
        const base = hostname.endsWith("/") ? hostname : `${hostname}/`;
        const cleanLoc = loc.startsWith("/") ? loc.slice(1) : loc;
        loc = new URL(cleanLoc, base).toString();
      } catch {
        // will fail validation below
      }
    }

    if (!isValidUrl(loc)) {
      if (strict) {
        throw new SeoValidationError(
          `generateSitemap: invalid URL '${loc}' at index ${i}. URLs must be valid absolute HTTP/HTTPS addresses.`
        );
      }
      continue;
    }

    const lines = [];
    lines.push(`${indent2}<loc>${escapeHtml(loc)}</loc>`);

    if (lastmod) {
      const formattedDate = formatLastmod(lastmod);
      if (formattedDate) {
        lines.push(`${indent2}<lastmod>${formattedDate}</lastmod>`);
      } else if (strict) {
        throw new SeoValidationError(
          `generateSitemap: invalid lastmod date '${lastmod}' at index ${i}. Must be a valid Date or ISO string.`
        );
      }
    }

    if (changefreq) {
      const freqLower = String(changefreq).toLowerCase();
      if (VALID_CHANGEFREQS.has(freqLower)) {
        lines.push(`${indent2}<changefreq>${freqLower}</changefreq>`);
      } else if (strict) {
        throw new SeoValidationError(
          `generateSitemap: invalid changefreq '${changefreq}' at index ${i}. Valid options: ${Array.from(VALID_CHANGEFREQS).join(", ")}`
        );
      }
    }

    if (priority !== undefined && priority !== null) {
      const pNum = Number(priority);
      if (!isNaN(pNum) && pNum >= 0.0 && pNum <= 1.0) {
        lines.push(`${indent2}<priority>${pNum.toFixed(1)}</priority>`);
      } else if (strict) {
        throw new SeoValidationError(
          `generateSitemap: invalid priority '${priority}' at index ${i}. Priority must be a number between 0.0 and 1.0.`
        );
      }
    }

    xmlEntries.push(`${indent1}<url>${nl}${lines.join(nl)}${nl}${indent1}</url>`);
  }

  const output = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    xmlEntries.join(nl),
    `</urlset>`
  ].filter(Boolean);

  return output.join(nl);
}

/**
 * Generates a sitemap index file linking multiple sitemaps.
 *
 * @param {Array<string|{ loc: string, lastmod?: string|Date }>} sitemaps
 * @param {Object} [options]
 * @returns {string} Valid XML sitemap index.
 */
export function generateSitemapIndex(sitemaps = [], options = {}) {
  const { pretty = true, strict = true } = options;
  if (!Array.isArray(sitemaps)) {
    throw new SeoValidationError("generateSitemapIndex: 'sitemaps' must be an array.");
  }

  const nl = pretty ? "\n" : "";
  const indent1 = pretty ? "  " : "";
  const indent2 = pretty ? "    " : "";

  const entries = [];
  for (let i = 0; i < sitemaps.length; i++) {
    const item = sitemaps[i];
    const loc = typeof item === "string" ? item : item?.loc;
    const lastmod = item?.lastmod ? formatLastmod(item.lastmod) : "";

    if (!isValidUrl(loc)) {
      if (strict) {
        throw new SeoValidationError(`generateSitemapIndex: invalid sitemap URL '${loc}' at index ${i}.`);
      }
      continue;
    }

    const lines = [`${indent2}<loc>${escapeHtml(loc)}</loc>`];
    if (lastmod) {
      lines.push(`${indent2}<lastmod>${lastmod}</lastmod>`);
    }
    entries.push(`${indent1}<sitemap>${nl}${lines.join(nl)}${nl}${indent1}</sitemap>`);
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    entries.join(nl),
    `</sitemapindex>`
  ].join(nl);
}
