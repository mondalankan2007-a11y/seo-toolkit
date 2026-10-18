import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateMeta,
  generateOpenGraph,
  generateTwitterCard,
  validateMeta,
  generateSitemap,
  generateRobots,
  generateJsonLd,
  generateArticle,
  generatePerson,
  analyzeHtml,
  fetchPage,
  SeoError,
  SeoValidationError
} from "../src/index.js";

test("Edge Case: Empty or undefined inputs across generators", () => {
  // Empty meta returns empty string
  const m1 = generateMeta();
  assert.equal(typeof m1.toHtml(), "string");
  assert.ok(m1.tags.some((t) => t.charset === "utf-8"));

  const og = generateOpenGraph();
  assert.equal(og.tags[0].property, "og:type");
  assert.equal(og.tags[0].content, "website");

  const tw = generateTwitterCard();
  assert.equal(tw.tags[0].name, "twitter:card");
  assert.equal(tw.tags[0].content, "summary_large_image");

  const sitemap = generateSitemap([]);
  assert.ok(sitemap.includes("<urlset"));
  assert.ok(sitemap.includes("</urlset>"));

  const robots = generateRobots();
  assert.ok(robots.includes("User-agent: *"));
  assert.ok(robots.includes("Allow: /"));
});

test("Edge Case: Invalid and dangerous URL protocols", () => {
  const dangerousUrls = [
    "javascript:alert(1)",
    "data:text/html,<html></html>",
    "ftp://example.com/file",
    "file:///etc/passwd",
    "http://",
    "//example.com/path",
    "not a url"
  ];

  for (const url of dangerousUrls) {
    const valResult = validateMeta({
      title: "Test Safe Title Length Is Good",
      description: "Test description that fulfills minimum length requirements for testing.",
      canonical: url
    });
    assert.equal(valResult.valid, false, `Expected ${url} to fail validation`);

    assert.throws(
      () => generateSitemap([url], { strict: true }),
      SeoValidationError,
      `Expected ${url} to throw in sitemap generator`
    );
  }
});

test("Edge Case: Malformed and unclosed HTML parsing", () => {
  const malformed = `
    <TITLE>Uppercase Unclosed Title
    <META NAME="DESCRIPTION" CONTENT="Uppercase description that is long enough to meet optimal length criteria here.">
    <H1>Heading without close
    <IMG SRC="unclosed.jpg" ALT="Test">
    <IMG SRC="noalt.jpg">
    <SCRIPT TYPE="application/ld+json">
      { "unclosed_json": true
  `;

  const report = analyzeHtml(malformed);
  assert.equal(report.title.present, true);
  assert.equal(report.description.present, true);
  assert.equal(report.headings.h1Count, 1);
  assert.equal(report.images.total, 2);
  assert.equal(report.images.missingAlt, 1);
  // Unclosed JSON should register syntax error rather than crash
  assert.ok(report.jsonLd.syntaxErrors.length > 0);
  assert.ok(report.issues.errors.some((e) => e.code === "JSON_LD_SYNTAX_ERROR"));
});

test("Edge Case: Completely null or non-string HTML inputs", () => {
  const r1 = analyzeHtml(null);
  assert.equal(r1.title.present, false);
  assert.equal(r1.score.score, 0);

  const r2 = analyzeHtml(undefined);
  assert.equal(r2.description.present, false);

  const r3 = analyzeHtml(12345);
  assert.equal(r3.headings.totalHeadings, 0);
});

test("Edge Case: Network DNS and unreachable host failures", async () => {
  await assert.rejects(
    async () => {
      await fetchPage("https://this-subdomain-does-not-exist-at-all-xyz123.com");
    },
    (err) => {
      return err instanceof SeoError && err.code === "NETWORK_ERROR";
    }
  );
});

test("Edge Case: Invalid sitemap date inputs", () => {
  assert.throws(
    () =>
      generateSitemap([
        { loc: "https://example.com", lastmod: "completely-invalid-date" }
      ]),
    SeoValidationError
  );

  assert.throws(
    () =>
      generateSitemap([
        { loc: "https://example.com", priority: "not-a-number" }
      ]),
    SeoValidationError
  );
});

test("Edge Case: Invalid structured data inputs", () => {
  assert.throws(() => generatePerson({ name: "" }), SeoValidationError);
  assert.throws(() => generateArticle({ headline: "" }), SeoValidationError);
  assert.throws(() => generateJsonLd(null), SeoValidationError);
  assert.throws(() => generateJsonLd(123), SeoValidationError);
});
