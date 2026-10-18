/**
 * Safely escapes characters for HTML text and attribute content.
 * @param {string|number} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
