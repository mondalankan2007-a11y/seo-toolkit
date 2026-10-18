import { test } from "node:test";
import assert from "node:assert/strict";
import { generateOpenGraph, generateMeta } from "../src/index.js";

test("generateOpenGraph creates required og tags", () => {
  const og = generateOpenGraph({
    title: "Launch of SEO Toolkit",
    description: "The complete technical SEO package for Node.js developers.",
    url: "https://example.com/launch",
    image: "https://example.com/og-banner.png",
    type: "article",
    siteName: "SEO Toolkit Blog"
  });

  const html = og.toHtml();
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta property="og:title" content="Launch of SEO Toolkit">/);
  assert.match(html, /<meta property="og:description" content="The complete technical SEO package for Node\.js developers\.">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/example\.com\/launch">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.com\/og-banner\.png">/);
  assert.match(html, /<meta property="og:site_name" content="SEO Toolkit Blog">/);
});

test("generateOpenGraph handles rich image object", () => {
  const og = generateOpenGraph({
    title: "Product Page",
    image: {
      url: "https://example.com/img.jpg",
      secureUrl: "https://example.com/img.jpg",
      type: "image/jpeg",
      width: 1200,
      height: 630,
      alt: "Product preview image"
    }
  });

  const html = og.toHtml();
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.com\/img\.jpg">/);
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta property="og:image:alt" content="Product preview image">/);
});

test("generateMeta bundles openGraph seamlessly", () => {
  const result = generateMeta({
    title: "Home",
    description: "Welcome to our store",
    openGraph: {
      title: "Home - OG",
      image: "https://example.com/logo.png"
    }
  });

  const html = result.toHtml();
  assert.match(html, /<title>Home<\/title>/);
  assert.match(html, /<meta property="og:title" content="Home - OG">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.com\/logo\.png">/);
});
