# SEO Toolkit

> A production-grade, zero-dependency technical SEO suite for Node.js and modern web applications. Generate metadata, sitemaps, robots.txt, Schema.org JSON-LD structured data, and perform automated technical SEO audits via code or CLI.

[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/@ankan_/seo-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Meta Generation](#meta-generation)
- [Sitemap Generation](#sitemap-generation)
- [robots.txt](#robotstxt)
- [Structured Data](#structured-data)
- [SEO Analyzer](#seo-analyzer)
- [CLI](#cli)
- [API Reference](#api-reference)
- [Examples](#examples)
- [SEO Concepts](#seo-concepts)
- [Error Handling](#error-handling)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Standard & Social Meta Generation**: Generate `<title>`, meta descriptions, canonical URLs, Open Graph tags, and Twitter Cards with automatic XSS-safe HTML escaping.
- **Strict Metadata Validation**: Automated verification of title length (30–60 chars), description length (70–160 chars), absolute URL syntax, and image assets.
- **XML Sitemaps & Indexing**: Generates standards-compliant `sitemap.xml` conforming to sitemaps.org protocols (supporting `loc`, `lastmod`, `changefreq`, and `priority`).
- **Flexible robots.txt**: Define crawl rules, user-agents, disallow directives, crawl delays, and sitemap references.
- **Schema.org Structured Data**: Pre-configured JSON-LD generators for `Person`, `Organization`, `Article`, `Product`, and `BreadcrumbList`.
- **In-Depth Webpage SEO Analyzer**: Inspects HTML documents for critical SEO markers including single H1 hierarchy, missing alt attributes, and social metadata.
- **Transparent Health Scoring**: 100-point Technical SEO Health Score evaluating 10 key technical ranking and accessibility criteria.
- **Built-in Webpage Crawler**: Audit live websites directly over HTTP/HTTPS with redirect tracking, timeouts, and network failure resiliency.
- **Interactive CLI**: Instant audits in your terminal via `npx @ankan_/seo-toolkit analyze <url>` with clear colored diagnostic reports.
- **First-Class TypeScript Support**: Full typings provided in `.d.ts` definitions.
- **Zero Runtime Dependencies**: Ultra-fast execution, negligible bundle footprint, and zero third-party supply-chain risk.

---

## Installation

Install using npm, yarn, or pnpm:

```bash
npm install @ankan_/seo-toolkit
```

Or run directly without installation via `npx`:

```bash
npx @ankan_/seo-toolkit analyze https://example.com
```

---

## Quick Start

```javascript
import {
  generateMeta,
  generateSitemap,
  generateRobots,
  generateJsonLd,
  analyzePage
} from "seo-toolkit";

// 1. Generate SEO meta tags
const meta = generateMeta({
  title: "SEO Toolkit - Modern Technical SEO for Node.js",
  description: "Production-ready meta tags, sitemaps, robots.txt, Schema.org data, and SEO analysis.",
  canonical: "https://example.com/seo-toolkit",
  openGraph: {
    title: "SEO Toolkit",
    image: "https://example.com/banner.png"
  }
});

console.log(meta.toHtml());
```

---

## Meta Generation

The `generateMeta` function creates standard HTML `<meta>`, `<title>`, and `<link>` tags with safe attribute escaping.

```javascript
import { generateMeta, generateOpenGraph, generateTwitterCard } from "seo-toolkit";

const meta = generateMeta({
  title: "Modern Web Engineering Guide",
  description: "Master Node.js, TypeScript, and technical search engine optimization.",
  canonical: "https://example.com/guide",
  robots: "index, follow",
  author: "Mondal Ankan",
  keywords: ["seo", "javascript", "nodejs"],
  openGraph: {
    title: "Modern Web Engineering Guide",
    description: "Master Node.js and search engine optimization.",
    url: "https://example.com/guide",
    image: {
      url: "https://example.com/cover.jpg",
      width: 1200,
      height: 630,
      alt: "Book cover"
    },
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    site: "@seotoolkit",
    creator: "@ankandev",
    image: "https://example.com/cover.jpg"
  }
});

// Render as HTML string in SSR / templates
console.log(meta.toHtml());

// Or inspect structured tag objects (for React, Vue, Svelte, Next.js)
console.log(meta.tags);
```

### Standalone Open Graph & Twitter Cards

```javascript
const og = generateOpenGraph({
  title: "Product Launch",
  url: "https://example.com/launch",
  image: "https://example.com/og.png"
});
console.log(og.toHtml());

const twitter = generateTwitterCard({
  card: "summary_large_image",
  title: "Product Launch",
  image: "https://example.com/og.png"
});
console.log(twitter.toHtml());
```

---

## Sitemap Generation

Create compliant XML sitemaps following the [sitemaps.org standard](https://www.sitemaps.org/protocol.html):

```javascript
import { generateSitemap, generateSitemapIndex } from "seo-toolkit";

const sitemapXml = generateSitemap([
  {
    loc: "https://example.com/",
    lastmod: "2026-10-18",
    changefreq: "daily",
    priority: 1.0
  },
  {
    loc: "https://example.com/blog",
    lastmod: new Date(),
    changefreq: "weekly",
    priority: 0.8
  },
  {
    loc: "/pricing", // Resolved automatically if hostname is supplied
    changefreq: "monthly",
    priority: 0.7
  }
], {
  hostname: "https://example.com",
  pretty: true,
  strict: true
});

console.log(sitemapXml);
```

### Sitemap Index Generation

When your site has more than 50,000 URLs, split them across multiple sitemaps and create an index:

```javascript
const indexXml = generateSitemapIndex([
  { loc: "https://example.com/sitemap-main.xml", lastmod: "2026-10-18" },
  { loc: "https://example.com/sitemap-posts.xml", lastmod: "2026-10-17" }
]);
```

---

## robots.txt

Generate custom `robots.txt` files supporting single or multi-agent rule groups, crawl delays, and sitemap directives:

```javascript
import { generateRobots } from "seo-toolkit";

const robots = generateRobots({
  rules: [
    {
      userAgent: "*",
      allow: ["/public", "/blog"],
      disallow: ["/admin", "/private", "/api/"],
      crawlDelay: 2
    },
    {
      userAgent: "BadBot",
      disallow: ["/"]
    }
  ],
  sitemap: "https://example.com/sitemap.xml",
  host: "https://example.com"
});

console.log(robots);
```

---

## Structured Data

Boost rich snippets in Google search results with Schema.org JSON-LD structured data generators.

```javascript
import {
  generateJsonLd,
  generateArticle,
  generateProduct,
  generateBreadcrumbList,
  generateOrganization,
  generatePerson
} from "seo-toolkit";

// Article
const article = generateArticle({
  headline: "Understanding Technical SEO in 2026",
  description: "A comprehensive developer guide to modern web crawling and auditing.",
  image: "https://example.com/seo-article.jpg",
  datePublished: "2026-10-18T10:00:00Z",
  author: "Mondal Ankan",
  publisher: "Tech Daily",
  url: "https://example.com/articles/technical-seo"
});

// Render as <script type="application/ld+json"> tag
console.log(article.toScript({ pretty: true }));

// Product
const product = generateProduct({
  name: "Developer Mechanical Keyboard",
  image: "https://example.com/keyboard.jpg",
  description: "Wireless mechanical keyboard optimized for coding productivity.",
  sku: "KB-DEV-01",
  brand: "TechCraft",
  offers: {
    price: 149.99,
    priceCurrency: "USD",
    availability: "InStock",
    url: "https://example.com/products/keyboard"
  },
  aggregateRating: {
    ratingValue: 4.9,
    reviewCount: 128
  }
});

// BreadcrumbList
const breadcrumbs = generateBreadcrumbList([
  { name: "Home", url: "https://example.com" },
  { name: "Store", url: "https://example.com/store" },
  { name: "Keyboards" }
]);
```

---

## SEO Analyzer

Audit any raw HTML string for SEO compliance:

```javascript
import { analyzeHtml, calculateScore } from "seo-toolkit";

const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>My Webpage</title>
      <meta name="description" content="This is a test webpage description for auditing.">
      <link rel="canonical" href="https://example.com/my-page">
    </head>
    <body>
      <h1>Main Headline</h1>
      <img src="/logo.png" alt="Company Logo">
      <img src="/tracker.png">
    </body>
  </html>
`;

const audit = analyzeHtml(html);

console.log(`Title: ${audit.title.text} (${audit.title.status})`);
console.log(`H1 count: ${audit.headings.h1Count}`);
console.log(`Images missing alt: ${audit.images.missingAlt}`);
console.log(`Health Score: ${audit.score.score}/100 (${audit.score.rating})`);
```

### Crawl and Audit Online Pages

```javascript
import { analyzePage } from "seo-toolkit";

const result = await analyzePage("https://example.com", {
  timeout: 10000,
  userAgent: "MyCustomAuditor/1.0"
});

console.log(`Audited: ${result.finalUrl}`);
console.log(`Score: ${result.score.score}/100`);
console.log("Warnings:", result.issues.warnings);
```

---

## CLI

`seo-toolkit` includes a command-line interface for running audits and generating SEO assets.

```bash
# Analyze a live website
npx @ankan_/seo-toolkit analyze https://example.com

# Output audit as JSON
npx @ankan_/seo-toolkit analyze https://example.com --json

# Generate a sitemap.xml
npx @ankan_/seo-toolkit sitemap --hostname https://example.com --routes /,/about,/pricing --out public/sitemap.xml

# Generate robots.txt
npx @ankan_/seo-toolkit robots --sitemap https://example.com/sitemap.xml --disallow /admin --out public/robots.txt
```

### Sample CLI Terminal Output

```
SEO TOOLKIT
────────────────────────────────────────
URL: https://example.com
Response time: 142ms | Status: 200

SEO HEALTH SCORE: 90/100 (Excellent)

PASS
  ✓ Title (48 chars)
  ✓ Meta description (132 chars)
  ✓ Canonical URL
  ✓ H1 ("Modern Developer Tools")
  ✓ Open Graph metadata
  ✓ All 6 images have alt attributes
  ✓ Mobile viewport

WARNINGS
  ⚠ Title is close to maximum snippet boundary (58 chars)

ERRORS
  ✗ Missing Open Graph 'og:image' tag

────────────────────────────────────────
Diagnostic technical health score. Does not represent ranking algorithms.
```

---

## API Reference

### `generateMeta(options, config)`
Generates HTML meta and link tags. Returns `{ tags, toHtml(), toString() }`.

### `validateMeta(options, config)`
Validates metadata for completeness, character limits, URL validity, and returns `{ valid, errors, warnings }`.

### `generateSitemap(routes, options)`
Generates valid XML sitemap string.
- `options.hostname`: Base URL string.
- `options.pretty`: Format with indentation (default `true`).
- `options.strict`: Throw on invalid URLs (default `true`).

### `generateRobots(options)`
Generates formatted plain text `robots.txt` string.

### `generateJsonLd(schemaData, options)`
Generates Schema.org JSON-LD structure with `.toScript()` and `.toJSON()`.

### `analyzeHtml(html)`
Performs comprehensive technical SEO audit on an HTML string.

### `calculateScore(analysis)`
Computes a transparent 100-point Technical SEO Health Score based on 10 evaluation categories.

### `fetchPage(url, options)`
Asynchronously downloads a webpage with timeout and redirect handling.

### `analyzePage(url, options)`
Fetches an online page and returns full technical SEO analysis and score.

---

## Examples

### Next.js App Router Integration

```tsx
// app/layout.tsx
import { generateMeta } from "seo-toolkit";

const seo = generateMeta({
  title: "My Next.js Application",
  description: "Built with SEO Toolkit and Next.js App Router.",
  canonical: "https://example.com",
  openGraph: {
    title: "My Next.js Application",
    image: "https://example.com/og.png"
  }
});

export const metadata = {
  title: "My Next.js Application",
  description: "Built with SEO Toolkit and Next.js App Router."
};
```

### Express.js Dynamic Sitemap Route

```javascript
import express from "express";
import { generateSitemap } from "seo-toolkit";

const app = express();

app.get("/sitemap.xml", (req, res) => {
  const routes = [
    { loc: "/", changefreq: "daily", priority: 1.0 },
    { loc: "/products", changefreq: "weekly", priority: 0.8 }
  ];

  const xml = generateSitemap(routes, { hostname: "https://example.com" });
  res.header("Content-Type", "application/xml");
  res.send(xml);
});
```

---

## SEO Concepts

- **Title Tags**: Recommended length is 30–60 characters. Search engines typically truncate titles exceeding ~600 pixels (~60 characters).
- **Meta Descriptions**: Recommended length is 70–160 characters. Provides the snippet preview beneath the search result title.
- **Canonical URLs**: Specifies the authoritative URL for a page, preventing duplicate content dilution across parameterized or multi-domain routes.
- **Heading Hierarchy**: Each page should have exactly one descriptive `<h1>` representing the main subject, followed sequentially by `<h2>` through `<h6>` without skipping hierarchy levels.
- **Image Alt Attributes**: Essential for web accessibility (WCAG) and Google image search indexing.
- **Open Graph & Twitter Cards**: Controls preview cards when links are shared on LinkedIn, Twitter/X, Facebook, Slack, and Discord.
- **Schema.org Structured Data**: Communicates explicit semantic entity meanings to search engines to power rich snippets (ratings, pricing, FAQs, breadcrumbs).

---

## Error Handling

`seo-toolkit` exposes specialized error classes for predictable error handling:

```javascript
import { generateSitemap, SeoError, SeoValidationError } from "seo-toolkit";

try {
  generateSitemap(["not-a-valid-url"], { strict: true });
} catch (err) {
  if (err instanceof SeoValidationError) {
    console.error("Validation error:", err.message);
    console.error("Error details:", err.errors);
  } else if (err instanceof SeoError) {
    console.error("SEO Error:", err.code, err.message);
  }
}
```

---

## Development

Clone and install dependencies:

```bash
git clone https://github.com/mondalankan2007-a11y/seo-toolkit.git
cd seo-toolkit
```

Run test suite:

```bash
npm test
```

---

## Testing

The project uses Node.js native test runner (`node:test`) for fast, zero-dependency testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
node --test --watch
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes using conventional commit messages (`git commit -m 'feat: add new feature'`).
4. Ensure all tests pass (`npm test`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

## License

MIT © [Mondal Ankan](https://github.com/mondalankan2007-a11y)
