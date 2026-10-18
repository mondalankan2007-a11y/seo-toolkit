import { test } from "node:test";
import assert from "node:assert/strict";
import { generateTwitterCard, generateMeta } from "../src/index.js";

test("generateTwitterCard produces summary_large_image card tags", () => {
  const tw = generateTwitterCard({
    card: "summary_large_image",
    title: "Awesome Launch",
    description: "Discover new SEO tools",
    image: "https://example.com/banner.png",
    site: "@seotoolkit",
    creator: "ankandev"
  });

  const html = tw.toHtml();
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<meta name="twitter:title" content="Awesome Launch">/);
  assert.match(html, /<meta name="twitter:description" content="Discover new SEO tools">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/example\.com\/banner\.png">/);
  assert.match(html, /<meta name="twitter:site" content="@seotoolkit">/);
  assert.match(html, /<meta name="twitter:creator" content="@ankandev">/);
});

test("generateTwitterCard supports image object and image alt", () => {
  const tw = generateTwitterCard({
    image: {
      url: "https://example.com/photo.jpg",
      alt: "A scenic preview"
    }
  });

  const html = tw.toHtml();
  assert.match(html, /<meta name="twitter:image" content="https:\/\/example\.com\/photo\.jpg">/);
  assert.match(html, /<meta name="twitter:image:alt" content="A scenic preview">/);
});

test("generateMeta bundles twitter card metadata", () => {
  const result = generateMeta({
    title: "Page Title",
    twitter: {
      card: "summary",
      title: "Twitter Custom Title"
    }
  });

  const html = result.toHtml();
  assert.match(html, /<meta name="twitter:card" content="summary">/);
  assert.match(html, /<meta name="twitter:title" content="Twitter Custom Title">/);
});
