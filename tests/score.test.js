import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml, calculateScore } from "../src/index.js";

test("calculateScore computes high health score for complete page", () => {
  const html = `
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
    </body>
    </html>
  `;

  const analysis = analyzeHtml(html);
  const scoreResult = calculateScore(analysis);

  assert.equal(typeof scoreResult.score, "number");
  assert.equal(scoreResult.maxScore, 100);
  assert.ok(scoreResult.score >= 90);
  assert.equal(scoreResult.rating, "Excellent");

  // Category breakdown checks
  assert.equal(scoreResult.breakdown.title.score, 10);
  assert.equal(scoreResult.breakdown.description.score, 10);
  assert.equal(scoreResult.breakdown.h1.score, 10);
  assert.equal(scoreResult.breakdown.canonical.score, 10);
  assert.equal(scoreResult.breakdown.images.score, 10);
  assert.equal(scoreResult.breakdown.openGraph.score, 10);
  assert.equal(scoreResult.breakdown.structuredData.score, 10);
  assert.ok(scoreResult.disclaimer.includes("Technical SEO Health Score"));
});

test("calculateScore reflects deductions for missing elements", () => {
  const poorHtml = `
    <html>
    <body>
      <img src="/test.jpg">
      <img src="/test2.jpg">
    </body>
    </html>
  `;

  const analysis = analyzeHtml(poorHtml);
  assert.equal(analysis.score.breakdown.title.score, 0);
  assert.equal(analysis.score.breakdown.description.score, 0);
  assert.equal(analysis.score.breakdown.h1.score, 0);
  assert.equal(analysis.score.breakdown.canonical.score, 0);
  assert.equal(analysis.score.breakdown.images.score, 0);
  assert.ok(analysis.score.score < 50);
  assert.equal(analysis.score.rating, "Poor");
});
