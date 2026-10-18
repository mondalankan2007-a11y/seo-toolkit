import { SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";

/**
 * Generates a standard, valid robots.txt file.
 *
 * @param {Object} options
 * @param {Array<Object>|Object} [options.rules] - List of rule groups or a single rule group.
 * @param {string|string[]} [options.userAgent='*'] - Default User-agent if top-level rules are used.
 * @param {string|string[]} [options.allow] - Top-level allow paths.
 * @param {string|string[]} [options.disallow] - Top-level disallow paths.
 * @param {number} [options.crawlDelay] - Top-level crawl-delay in seconds.
 * @param {string|string[]} [options.sitemap] - URL(s) to sitemap.xml.
 * @param {string} [options.host] - Preferred host directive.
 * @param {boolean} [options.strict=true] - Whether to validate URLs strictly.
 * @returns {string} Formatted robots.txt content.
 */
export function generateRobots(options = {}) {
  if (typeof options !== "object" || options === null || Array.isArray(options)) {
    throw new SeoValidationError("generateRobots: options must be a valid non-null object.");
  }

  const {
    rules,
    userAgent = "*",
    allow,
    disallow,
    crawlDelay,
    sitemap,
    host,
    strict = true
  } = options;

  const ruleGroups = [];

  if (Array.isArray(rules)) {
    for (const r of rules) {
      if (r && typeof r === "object") {
        ruleGroups.push(r);
      }
    }
  } else if (rules && typeof rules === "object") {
    ruleGroups.push(rules);
  } else if (allow !== undefined || disallow !== undefined || crawlDelay !== undefined || options.userAgent !== undefined) {
    ruleGroups.push({
      userAgent,
      allow,
      disallow,
      crawlDelay
    });
  } else {
    // Default fallback: allow all
    ruleGroups.push({
      userAgent: "*",
      allow: ["/"],
      disallow: []
    });
  }

  const sections = [];

  for (const group of ruleGroups) {
    const lines = [];

    // User-agent (can be string or array)
    const agents = group.userAgent || group.userAgents || "*";
    const agentList = Array.isArray(agents) ? agents : [agents];
    for (const ag of agentList) {
      lines.push(`User-agent: ${String(ag).trim()}`);
    }

    // Disallow directives
    if (group.disallow !== undefined) {
      const disallows = Array.isArray(group.disallow) ? group.disallow : [group.disallow];
      for (const d of disallows) {
        lines.push(`Disallow: ${d !== undefined && d !== null ? String(d).trim() : ""}`);
      }
    }

    // Allow directives
    if (group.allow !== undefined) {
      const allows = Array.isArray(group.allow) ? group.allow : [group.allow];
      for (const a of allows) {
        lines.push(`Allow: ${a !== undefined && a !== null ? String(a).trim() : ""}`);
      }
    }

    // Crawl-delay
    if (group.crawlDelay !== undefined && group.crawlDelay !== null) {
      const cd = Number(group.crawlDelay);
      if (!isNaN(cd) && cd >= 0) {
        lines.push(`Crawl-delay: ${cd}`);
      } else if (strict) {
        throw new SeoValidationError(`generateRobots: crawlDelay must be a positive number, got '${group.crawlDelay}'.`);
      }
    }

    if (lines.length > 0) {
      sections.push(lines.join("\n"));
    }
  }

  // Host directive
  if (host) {
    sections.push(`Host: ${String(host).trim()}`);
  }

  // Sitemap directives
  if (sitemap) {
    const sitemaps = Array.isArray(sitemap) ? sitemap : [sitemap];
    const sitemapLines = [];
    for (const sm of sitemaps) {
      const smUrl = String(sm).trim();
      if (!isValidUrl(smUrl) && strict) {
        throw new SeoValidationError(`generateRobots: invalid Sitemap URL '${smUrl}'.`);
      }
      sitemapLines.push(`Sitemap: ${smUrl}`);
    }
    if (sitemapLines.length > 0) {
      sections.push(sitemapLines.join("\n"));
    }
  }

  return sections.join("\n\n") + "\n";
}
