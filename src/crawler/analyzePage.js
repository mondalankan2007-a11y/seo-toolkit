import { fetchPage } from "./fetchPage.js";
import { analyzeHtml } from "../analyzer/analyzeHtml.js";

/**
 * Fetches an online webpage and performs complete technical SEO analysis.
 *
 * @param {string} url - Target webpage URL.
 * @param {Object} [options] - Crawl options (timeout, headers, userAgent).
 * @returns {Promise<Object>} Complete webpage SEO audit result with crawl details.
 */
export async function analyzePage(url, options = {}) {
  const crawl = await fetchPage(url, options);
  const analysis = analyzeHtml(crawl.html);

  // Check if canonical matches current URL
  if (analysis.canonical.present && analysis.canonical.url) {
    try {
      const canonicalClean = new URL(analysis.canonical.url).href;
      const finalUrlClean = new URL(crawl.finalUrl).href;
      if (canonicalClean !== finalUrlClean) {
        analysis.issues.warnings.push({
          type: "warning",
          code: "CANONICAL_MISMATCH",
          message: `Canonical URL '${analysis.canonical.url}' does not match current fetched URL '${crawl.finalUrl}'.`
        });
        analysis.issues.all.push({
          type: "warning",
          code: "CANONICAL_MISMATCH",
          message: `Canonical URL '${analysis.canonical.url}' does not match current fetched URL '${crawl.finalUrl}'.`
        });
      }
    } catch {
      // already caught by canonical validator
    }
  }

  // Response time check (> 1500ms warning)
  if (crawl.responseTimeMs > 2000) {
    analysis.issues.warnings.push({
      type: "warning",
      code: "SLOW_RESPONSE_TIME",
      message: `Initial server response time was slow (${crawl.responseTimeMs}ms). Target < 1000ms for optimal crawl performance.`
    });
    analysis.issues.all.push({
      type: "warning",
      code: "SLOW_RESPONSE_TIME",
      message: `Initial server response time was slow (${crawl.responseTimeMs}ms). Target < 1000ms for optimal crawl performance.`
    });
  }

  return {
    url: crawl.url,
    finalUrl: crawl.finalUrl,
    statusCode: crawl.statusCode,
    redirected: crawl.redirected,
    responseTimeMs: crawl.responseTimeMs,
    contentType: crawl.contentType,
    ...analysis
  };
}
