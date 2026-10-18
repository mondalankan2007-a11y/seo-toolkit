import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRobots, SeoValidationError } from "../src/index.js";

test("generateRobots creates default robots.txt", () => {
  const robots = generateRobots();
  assert.ok(robots.includes("User-agent: *"));
  assert.ok(robots.includes("Allow: /"));
});

test("generateRobots supports User-agent, Allow, Disallow, Sitemap", () => {
  const robots = generateRobots({
    userAgent: "*",
    allow: ["/", "/public/"],
    disallow: ["/admin/", "/private/", "/api/"],
    crawlDelay: 2,
    sitemap: "https://example.com/sitemap.xml",
    host: "https://example.com"
  });

  assert.ok(robots.includes("User-agent: *"));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(robots.includes("Allow: /public/"));
  assert.ok(robots.includes("Disallow: /admin/"));
  assert.ok(robots.includes("Disallow: /private/"));
  assert.ok(robots.includes("Disallow: /api/"));
  assert.ok(robots.includes("Crawl-delay: 2"));
  assert.ok(robots.includes("Host: https://example.com"));
  assert.ok(robots.includes("Sitemap: https://example.com/sitemap.xml"));
});

test("generateRobots supports multiple rule groups", () => {
  const robots = generateRobots({
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/nocrawl/"]
      },
      {
        userAgent: ["BadBot", "ScraperBot"],
        disallow: ["/"]
      }
    ],
    sitemap: [
      "https://example.com/sitemap-main.xml",
      "https://example.com/sitemap-posts.xml"
    ]
  });

  assert.ok(robots.includes("User-agent: Googlebot"));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(robots.includes("Disallow: /nocrawl/"));
  assert.ok(robots.includes("User-agent: BadBot"));
  assert.ok(robots.includes("User-agent: ScraperBot"));
  assert.ok(robots.includes("Sitemap: https://example.com/sitemap-main.xml"));
  assert.ok(robots.includes("Sitemap: https://example.com/sitemap-posts.xml"));
});

test("generateRobots validates invalid sitemap URL in strict mode", () => {
  assert.throws(
    () => {
      generateRobots({ sitemap: "invalid-url", strict: true });
    },
    SeoValidationError
  );
});
