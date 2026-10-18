import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeHtml,
  analyzeTitle,
  analyzeDescription,
  analyzeHeadings,
  analyzeImages,
  analyzeCanonical,
  analyzeOpenGraph,
  analyzeJsonLd
} from "../src/index.js";

const sampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEO Toolkit - The Modern SEO Package for Node.js Developers</title>
  <meta name="description" content="Generate and audit technical SEO meta tags, Open Graph, Twitter cards, sitemaps, robots.txt, and Schema.org structured data.">
  <link rel="canonical" href="https://example.com/seo-toolkit">
  <meta property="og:title" content="SEO Toolkit">
  <meta property="og:description" content="Generate and audit technical SEO easily.">
  <meta property="og:url" content="https://example.com/seo-toolkit">
  <meta property="og:image" content="https://example.com/og.png">
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "seo-toolkit"
    }
  </script>
</head>
<body>
  <h1>Technical SEO Toolkit</h1>
  <h2>Features</h2>
  <img src="/hero.png" alt="SEO Toolkit Hero Banner">
  <img src="/tracker.png">
</body>
</html>
`;

test("analyzeTitle extracts title, length, and optimal status", () => {
  const result = analyzeTitle(sampleHtml);
  assert.equal(result.present, true);
  assert.equal(result.count, 1);
  assert.equal(result.text, "SEO Toolkit - The Modern SEO Package for Node.js Developers");
  assert.equal(result.status, "optimal");
  assert.equal(result.issues.length, 0);
});

test("analyzeTitle handles missing and short titles", () => {
  const missing = analyzeTitle("<html><body>No title here</body></html>");
  assert.equal(missing.present, false);
  assert.equal(missing.status, "missing");
  assert.ok(missing.issues.some((i) => i.code === "TITLE_MISSING"));

  const short = analyzeTitle("<title>Short</title>");
  assert.equal(short.status, "too-short");
  assert.ok(short.issues.some((i) => i.code === "TITLE_TOO_SHORT"));
});

test("analyzeDescription extracts meta description and evaluates length", () => {
  const result = analyzeDescription(sampleHtml);
  assert.equal(result.present, true);
  assert.equal(result.status, "optimal");
  assert.ok(result.length >= 70 && result.length <= 160);
});

test("analyzeHeadings detects single H1 and heading tree", () => {
  const result = analyzeHeadings(sampleHtml);
  assert.equal(result.h1Count, 1);
  assert.deepEqual(result.h1Text, ["Technical SEO Toolkit"]);
  assert.equal(result.totalHeadings, 2);
  assert.equal(result.issues.length, 0);
});

test("analyzeHeadings flags multiple or missing H1s", () => {
  const noH1 = analyzeHeadings("<h2>Only H2</h2>");
  assert.equal(noH1.h1Count, 0);
  assert.ok(noH1.issues.some((i) => i.code === "H1_MISSING"));

  const multiH1 = analyzeHeadings("<h1>First</h1><h1>Second</h1>");
  assert.equal(multiH1.h1Count, 2);
  assert.ok(multiH1.issues.some((i) => i.code === "H1_MULTIPLE"));
});

test("analyzeImages tracks total, withAlt, and missingAlt", () => {
  const result = analyzeImages(sampleHtml);
  assert.equal(result.total, 2);
  assert.equal(result.withAlt, 1);
  assert.equal(result.missingAlt, 1);
  assert.deepEqual(result.missingAltSources, ["/tracker.png"]);
  assert.ok(result.issues.some((i) => i.code === "IMAGES_MISSING_ALT"));
});

test("analyzeCanonical validates canonical link presence and URL", () => {
  const result = analyzeCanonical(sampleHtml);
  assert.equal(result.present, true);
  assert.equal(result.url, "https://example.com/seo-toolkit");
  assert.equal(result.isValid, true);
});

test("analyzeOpenGraph extracts social properties", () => {
  const result = analyzeOpenGraph(sampleHtml);
  assert.equal(result.present, true);
  assert.equal(result.properties["og:title"], "SEO Toolkit");
  assert.equal(result.properties["og:image"], "https://example.com/og.png");
});

test("analyzeJsonLd parses embedded structured data", () => {
  const result = analyzeJsonLd(sampleHtml);
  assert.equal(result.present, true);
  assert.equal(result.count, 1);
  assert.deepEqual(result.types, ["SoftwareApplication"]);
  assert.equal(result.syntaxErrors.length, 0);
});

test("analyzeHtml returns complete aggregated SEO report", () => {
  const report = analyzeHtml(sampleHtml);
  assert.ok(report.title.present);
  assert.ok(report.description.present);
  assert.ok(report.canonical.present);
  assert.ok(report.headings.h1Count === 1);
  assert.ok(report.openGraph.present);
  assert.ok(report.jsonLd.present);
  assert.equal(report.meta.charset, "utf-8");
  assert.ok(report.meta.viewport.includes("width=device-width"));
  assert.ok(Array.isArray(report.issues.all));
});
