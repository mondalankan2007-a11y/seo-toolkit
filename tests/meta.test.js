import { test } from "node:test";
import assert from "node:assert/strict";
import { generateMeta } from "../src/index.js";

test("generateMeta produces title, description, and canonical", () => {
  const result = generateMeta({
    title: "Awesome Tech & Gadgets",
    description: "Discover the best tech accessories and reviews.",
    canonical: "https://example.com/products"
  });

  const html = result.toHtml();
  assert.match(html, /<title>Awesome Tech &amp; Gadgets<\/title>/);
  assert.match(html, /<meta name="description" content="Discover the best tech accessories and reviews.">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/example.com\/products">/);
  assert.equal(String(result), html);
  assert.ok(Array.isArray(result.tags));
  assert.ok(result.tags.some(t => t.tag === "title" && t.text === "Awesome Tech & Gadgets"));
  assert.ok(result.tags.some(t => t.tag === "meta" && t.name === "description"));
  assert.ok(result.tags.some(t => t.tag === "link" && t.rel === "canonical"));
});
