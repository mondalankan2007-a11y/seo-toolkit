# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-18

### Added
- **Meta Tag Generator**: Production-grade `<title>`, `<meta name="description">`, `<link rel="canonical">`, and robot directives.
- **Open Graph Metadata**: Full support for `og:title`, `og:description`, `og:url`, `og:image` (with dimensions, alt, secure URL), `og:type`, and custom OG properties.
- **Twitter Card Metadata**: Support for `summary`, `summary_large_image`, `app`, and `player` cards with image alt and handle attribution.
- **Metadata Validation**: Automatic checking of title length (30–60 chars), description length (70–160 chars), valid HTTP/HTTPS URLs, and image syntax.
- **XML Sitemap Generator**: Full support for sitemaps.org XML protocol with `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>`.
- **Sitemap Index Generator**: Support for `<sitemapindex>` grouping multiple sitemaps.
- **robots.txt Generator**: Flexible rule definition for multiple user-agents, allow, disallow, crawl delays, and sitemap directives.
- **Schema.org Structured Data**: Pre-configured JSON-LD generators for `Person`, `Organization`, `Article`, `Product`, and `BreadcrumbList`.
- **Webpage SEO Analyzer**: Zero-dependency HTML tokenizer and diagnostic auditor inspecting titles, descriptions, headings, images, canonicals, Open Graph, and JSON-LD.
- **Technical SEO Health Score**: Transparent 100-point audit score evaluating 10 key technical categories.
- **Live Webpage Crawler**: `fetchPage` and `analyzePage` functions to crawl and audit remote webpages with redirect handling, timeouts, and network failure recovery.
- **Command Line Interface (CLI)**: Executable CLI via `npx seo-toolkit analyze <url>`, `npx seo-toolkit sitemap`, and `npx seo-toolkit robots`.
- **TypeScript Support**: Complete `.d.ts` declaration file covering all APIs, options, and result interfaces.
- **Comprehensive Test Suite**: 70 automated tests covering all modules, edge cases, malformed HTML, network failures, and release packaging.
