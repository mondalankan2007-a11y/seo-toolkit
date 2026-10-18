/**
 * Terminal formatter for seo-toolkit CLI.
 * Supports clean, beautiful box & status formatting with ANSI color codes.
 */

const useColor = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

const colors = {
  reset: useColor ? "\x1b[0m" : "",
  bold: useColor ? "\x1b[1m" : "",
  dim: useColor ? "\x1b[2m" : "",
  green: useColor ? "\x1b[32m" : "",
  yellow: useColor ? "\x1b[33m" : "",
  red: useColor ? "\x1b[31m" : "",
  cyan: useColor ? "\x1b[36m" : "",
  blue: useColor ? "\x1b[34m" : ""
};

/**
 * Formats full CLI audit output for analyze command.
 * @param {Object} audit
 * @returns {string}
 */
export function formatAuditReport(audit) {
  const line = "─".repeat(40);
  const lines = [];

  lines.push("");
  lines.push(`${colors.bold}${colors.cyan}SEO TOOLKIT${colors.reset}`);
  lines.push(`${colors.dim}${line}${colors.reset}`);
  lines.push(`${colors.bold}URL:${colors.reset} ${audit.finalUrl || audit.url}`);
  if (audit.responseTimeMs) {
    lines.push(`${colors.dim}Response time: ${audit.responseTimeMs}ms | Status: ${audit.statusCode}${colors.reset}`);
  }
  lines.push("");

  // Score
  const score = audit.score?.score ?? 0;
  let scoreColor = colors.red;
  if (score >= 90) scoreColor = colors.green;
  else if (score >= 70) scoreColor = colors.yellow;

  lines.push(`${colors.bold}SEO HEALTH SCORE:${colors.reset} ${scoreColor}${colors.bold}${score}/100${colors.reset} (${audit.score?.rating || "Audited"})`);
  lines.push("");

  // Passed items
  const passes = [];
  if (audit.title?.present && audit.title?.status === "optimal") {
    passes.push(`Title (${audit.title.length} chars)`);
  }
  if (audit.description?.present && audit.description?.status === "optimal") {
    passes.push(`Meta description (${audit.description.length} chars)`);
  }
  if (audit.canonical?.present && audit.canonical?.isValid) {
    passes.push("Canonical URL");
  }
  if (audit.headings?.h1Count === 1) {
    passes.push(`H1 ("${audit.headings.h1Text[0]}")`);
  }
  if (audit.openGraph?.present && audit.score?.breakdown?.openGraph?.passed) {
    passes.push("Open Graph metadata");
  }
  if (audit.images && audit.images.missingAlt === 0 && audit.images.total > 0) {
    passes.push(`All ${audit.images.total} images have alt attributes`);
  }
  if (audit.jsonLd?.present) {
    passes.push(`Structured data (${audit.jsonLd.types?.join(", ") || "Schema.org"})`);
  }
  if (audit.meta?.viewport) {
    passes.push("Mobile viewport");
  }

  if (passes.length > 0) {
    lines.push(`${colors.bold}${colors.green}PASS${colors.reset}`);
    for (const p of passes) {
      lines.push(`  ${colors.green}✓${colors.reset} ${p}`);
    }
    lines.push("");
  }

  // Warnings
  const warnings = audit.issues?.warnings || [];
  if (warnings.length > 0) {
    lines.push(`${colors.bold}${colors.yellow}WARNINGS${colors.reset}`);
    for (const w of warnings) {
      lines.push(`  ${colors.yellow}⚠${colors.reset} ${w.message}`);
    }
    lines.push("");
  }

  // Errors
  const errors = audit.issues?.errors || [];
  if (errors.length > 0) {
    lines.push(`${colors.bold}${colors.red}ERRORS${colors.reset}`);
    for (const e of errors) {
      lines.push(`  ${colors.red}✗${colors.reset} ${e.message}`);
    }
    lines.push("");
  }

  lines.push(`${colors.dim}${line}${colors.reset}`);
  lines.push(`${colors.dim}Diagnostic technical health score. Does not represent ranking algorithms.${colors.reset}`);
  lines.push("");

  return lines.join("\n");
}
