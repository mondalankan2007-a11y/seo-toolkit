import { SeoError, SeoValidationError } from "../errors/SeoError.js";
import { isValidUrl } from "../utils/url.js";

/**
 * Fetches the HTML content of a webpage with timeout, redirect, and error handling.
 *
 * @param {string} url - Target webpage URL.
 * @param {Object} [options]
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds.
 * @param {string} [options.userAgent] - Custom User-Agent header.
 * @param {Object} [options.headers] - Additional HTTP headers.
 * @param {RequestRedirect} [options.redirect='follow'] - Redirect policy.
 * @returns {Promise<{ url: string, finalUrl: string, statusCode: number, statusText: string, html: string, redirected: boolean, responseTimeMs: number, contentType: string }>}
 */
export async function fetchPage(url, options = {}) {
  const {
    timeout = 10000,
    userAgent = "seo-toolkit-crawler/1.0 (+https://github.com/mondalankan2007-a11y/seo-toolkit)",
    headers = {},
    redirect = "follow"
  } = options;

  if (!url || typeof url !== "string") {
    throw new SeoValidationError("fetchPage: URL must be a non-empty string.");
  }

  const trimmedUrl = url.trim();
  if (!isValidUrl(trimmedUrl)) {
    throw new SeoValidationError(
      `fetchPage: '${trimmedUrl}' is not a valid absolute HTTP or HTTPS URL.`,
      ["INVALID_URL"]
    );
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(trimmedUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...headers
      },
      redirect,
      signal: controller.signal
    });

    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      throw new SeoError(
        `HTTP Error ${response.status} (${response.statusText}) when fetching '${trimmedUrl}'.`,
        "HTTP_ERROR"
      );
    }

    const html = await response.text();

    return {
      url: trimmedUrl,
      finalUrl: response.url || trimmedUrl,
      statusCode: response.status,
      statusText: response.statusText,
      redirected: response.redirected || (Boolean(response.url) && response.url !== trimmedUrl),
      contentType,
      responseTimeMs,
      html
    };
  } catch (err) {
    if (err.name === "AbortError" || controller.signal.aborted) {
      throw new SeoError(`Request to '${trimmedUrl}' timed out after ${timeout}ms.`, "REQUEST_TIMEOUT");
    }

    if (err instanceof SeoError) {
      throw err;
    }

    throw new SeoError(`Network error while fetching '${trimmedUrl}': ${err.message}`, "NETWORK_ERROR");
  } finally {
    clearTimeout(timer);
  }
}
