import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMeta, generateMeta, SeoValidationError } from "../src/index.js";

test("validateMeta detects missing title and description", () => {
  const result = validateMeta({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Missing title")));
  assert.ok(result.errors.some(e => e.includes("Missing description")));
});

test("validateMeta catches non-object options", () => {
  const result1 = validateMeta(null);
  assert.equal(result1.valid, false);
  assert.ok(result1.errors.some(e => e.includes("must be a non-null object")));

  const result2 = validateMeta("not an object");
  assert.equal(result2.valid, false);
});

test("validateMeta validates invalid input types", () => {
  const result = validateMeta({
    title: 12345,
    description: ["array description"],
    canonical: true,
    keywords: 42
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("'title' must be a string")));
  assert.ok(result.errors.some(e => e.includes("'description' must be a string")));
  assert.ok(result.errors.some(e => e.includes("'canonical' must be a string")));
  assert.ok(result.errors.some(e => e.includes("'keywords' must be a string or an array")));
});

test("validateMeta checks invalid canonical URL", () => {
  const result = validateMeta({
    title: "A valid title for test page",
    description: "A valid description for test page that exceeds recommended minimum length.",
    canonical: "not-a-valid-url"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Invalid canonical URL")));
});

test("validateMeta checks invalid Open Graph and Twitter image URLs", () => {
  const result = validateMeta({
    title: "A valid title for test page",
    description: "A valid description for test page that exceeds recommended minimum length.",
    canonical: "https://example.com/page",
    openGraph: {
      url: "ftp://invalid-scheme.com",
      image: "invalid-image-url"
    },
    twitter: {
      image: { url: "not-an-url", width: -50 }
    }
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Invalid Open Graph URL")));
  assert.ok(result.errors.some(e => e.includes("Invalid Open Graph image URL")));
  assert.ok(result.errors.some(e => e.includes("Invalid Twitter image URL")));
  assert.ok(result.warnings.some(w => w.includes("width should be a positive number")));
});

test("validateMeta warns on suboptimal title and description lengths", () => {
  const result = validateMeta({
    title: "Short", // < 10 chars
    description: "Too short description." // < 50 chars
  });

  assert.ok(result.warnings.some(w => w.includes("Title is too short")));
  assert.ok(result.warnings.some(w => w.includes("Meta description is too short")));
});

test("validateMeta throws SeoValidationError when throwOnError is enabled", () => {
  assert.throws(
    () => {
      validateMeta({}, { throwOnError: true });
    },
    (err) => {
      return (
        err instanceof SeoValidationError &&
        err.name === "SeoValidationError" &&
        err.errors.length > 0
      );
    }
  );
});

test("generateMeta with validate: true throws on invalid metadata", () => {
  assert.throws(
    () => {
      generateMeta({ canonical: "invalid" }, { validate: true });
    },
    SeoValidationError
  );
});

test("validateMeta passes for well-formed metadata", () => {
  const result = validateMeta({
    title: "SEO Toolkit - The Modern SEO Package for Node.js",
    description: "Generate and audit metadata, sitemaps, robots.txt, schema markup, and technical SEO health effortlessly.",
    canonical: "https://example.com/seo-toolkit",
    openGraph: {
      url: "https://example.com/seo-toolkit",
      image: "https://example.com/og.png"
    },
    twitter: {
      card: "summary_large_image",
      image: "https://example.com/og.png"
    }
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.warnings.length, 0);
});
