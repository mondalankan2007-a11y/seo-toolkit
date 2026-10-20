import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { formatAuditReport } from "../cli/formatOutput.js";

const execFileAsync = promisify(execFile);
const cliPath = new URL("../cli/index.js", import.meta.url).pathname;

test("formatAuditReport produces clean formatted terminal output", () => {
  const mockAudit = {
    url: "https://example.com",
    finalUrl: "https://example.com",
    statusCode: 200,
    responseTimeMs: 120,
    title: { present: true, status: "optimal", length: 45 },
    description: { present: true, status: "optimal", length: 120 },
    canonical: { present: true, isValid: true },
    headings: { h1Count: 1, h1Text: ["Main Heading"] },
    openGraph: { present: true },
    images: { total: 4, missingAlt: 1 },
    score: {
      score: 84,
      rating: "Good",
      breakdown: { openGraph: { passed: true } }
    },
    issues: {
      warnings: [{ message: "1 image missing alt attribute" }],
      errors: [{ message: "robots.txt not found" }]
    }
  };

  const report = formatAuditReport(mockAudit);
  assert.ok(report.includes("SEO TOOLKIT"));
  assert.ok(report.includes("URL: https://example.com"));
  assert.ok(report.includes("SEO HEALTH SCORE:"));
  assert.ok(report.includes("84/100"));
  assert.ok(report.includes("PASS"));
  assert.ok(report.includes("✓ Title"));
  assert.ok(report.includes("✓ Meta description"));
  assert.ok(report.includes("WARNINGS"));
  assert.ok(report.includes("⚠ 1 image missing alt attribute"));
  assert.ok(report.includes("ERRORS"));
  assert.ok(report.includes("✗ robots.txt not found"));
});

test("CLI --version returns version string", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "--version"]);
  assert.ok(stdout.includes("seo-toolkit v"));
});

test("CLI --help displays help text", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "--help"]);
  assert.ok(stdout.includes("COMMANDS:"));
  assert.ok(stdout.includes("analyze <url>"));
  assert.ok(stdout.includes("sitemap"));
  assert.ok(stdout.includes("robots"));
});

test("CLI robots generates robots.txt", async () => {
  const { stdout } = await execFileAsync("node", [
    cliPath,
    "robots",
    "--sitemap",
    "https://example.com/sitemap.xml",
    "--disallow",
    "/admin"
  ]);

  assert.ok(stdout.includes("User-agent: *"));
  assert.ok(stdout.includes("Disallow: /admin"));
  assert.ok(stdout.includes("Sitemap: https://example.com/sitemap.xml"));
});

test("CLI sitemap generates sitemap.xml", async () => {
  const { stdout } = await execFileAsync("node", [
    cliPath,
    "sitemap",
    "--hostname",
    "https://example.com",
    "--routes",
    "/home,/docs"
  ]);

  assert.ok(stdout.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(stdout.includes("<loc>https://example.com/home</loc>"));
  assert.ok(stdout.includes("<loc>https://example.com/docs</loc>"));
});

test("CLI --help displays check and --min-score options", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "--help"]);
  assert.ok(stdout.includes("check <url>"));
  assert.ok(stdout.includes("--min-score <n>"));
});
