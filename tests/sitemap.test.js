import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSitemap, generateSitemapIndex, SeoValidationError } from "../src/index.js";

test("generateSitemap produces valid XML with full properties", () => {
  const routes = [
    {
      loc: "https://example.com/",
      lastmod: new Date("2026-10-01T00:00:00Z"),
      changefreq: "daily",
      priority: 1.0
    },
    {
      loc: "https://example.com/about",
      lastmod: "2026-09-15",
      changefreq: "monthly",
      priority: 0.8
    }
  ];

  const xml = generateSitemap(routes);

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(xml.includes("<loc>https://example.com/</loc>"));
  assert.ok(xml.includes("<lastmod>2026-10-01</lastmod>"));
  assert.ok(xml.includes("<changefreq>daily</changefreq>"));
  assert.ok(xml.includes("<priority>1.0</priority>"));
  assert.ok(xml.includes("<loc>https://example.com/about</loc>"));
  assert.ok(xml.includes("<lastmod>2026-09-15</lastmod>"));
  assert.ok(xml.includes("</urlset>"));
});

test("generateSitemap resolves relative URLs when hostname is provided", () => {
  const routes = ["/pricing", "/features", "https://example.com/blog"];
  const xml = generateSitemap(routes, { hostname: "https://example.com" });

  assert.ok(xml.includes("<loc>https://example.com/pricing</loc>"));
  assert.ok(xml.includes("<loc>https://example.com/features</loc>"));
  assert.ok(xml.includes("<loc>https://example.com/blog</loc>"));
});

test("generateSitemap throws on invalid URL in strict mode", () => {
  assert.throws(
    () => {
      generateSitemap(["not-a-valid-url"], { strict: true });
    },
    SeoValidationError
  );
});

test("generateSitemap filters invalid URL in non-strict mode", () => {
  const routes = ["https://example.com/valid", "bad-url"];
  const xml = generateSitemap(routes, { strict: false });

  assert.ok(xml.includes("<loc>https://example.com/valid</loc>"));
  assert.ok(!xml.includes("bad-url"));
});

test("generateSitemap handles empty routes array", () => {
  const xml = generateSitemap([]);
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(xml.includes("</urlset>"));
  assert.ok(!xml.includes("<url>"));
});

test("generateSitemap throws if routes is not an array", () => {
  assert.throws(() => generateSitemap(null), SeoValidationError);
  assert.throws(() => generateSitemap("https://example.com"), SeoValidationError);
});

test("generateSitemap validates optional properties", () => {
  // Invalid changefreq
  assert.throws(
    () => generateSitemap([{ loc: "https://example.com", changefreq: "invalid-freq" }]),
    SeoValidationError
  );

  // Invalid priority (> 1.0)
  assert.throws(
    () => generateSitemap([{ loc: "https://example.com", priority: 1.5 }]),
    SeoValidationError
  );

  // Invalid priority (< 0.0)
  assert.throws(
    () => generateSitemap([{ loc: "https://example.com", priority: -0.2 }]),
    SeoValidationError
  );
});

test("generateSitemap escapes XML characters in URLs", () => {
  const routes = ["https://example.com/search?category=books&sort=desc"];
  const xml = generateSitemap(routes);

  assert.ok(xml.includes("category=books&amp;sort=desc"));
});

test("generateSitemapIndex generates valid sitemap index", () => {
  const indexXml = generateSitemapIndex([
    "https://example.com/sitemap-1.xml",
    { loc: "https://example.com/sitemap-2.xml", lastmod: "2026-10-18" }
  ]);

  assert.ok(indexXml.includes("<sitemapindex"));
  assert.ok(indexXml.includes("<loc>https://example.com/sitemap-1.xml</loc>"));
  assert.ok(indexXml.includes("<loc>https://example.com/sitemap-2.xml</loc>"));
  assert.ok(indexXml.includes("<lastmod>2026-10-18</lastmod>"));
  assert.ok(indexXml.includes("</sitemapindex>"));
});
