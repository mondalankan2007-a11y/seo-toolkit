/**
 * Checks whether a given string is a valid absolute HTTP or HTTPS URL.
 * @param {string} string
 * @returns {boolean}
 */
export function isValidUrl(string) {
  if (typeof string !== "string" || !string.trim()) {
    return false;
  }
  try {
    const parsed = new URL(string.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
