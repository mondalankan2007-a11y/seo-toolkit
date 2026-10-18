import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateJsonLd,
  generatePerson,
  generateOrganization,
  generateArticle,
  generateProduct,
  generateBreadcrumbList,
  SeoValidationError
} from "../src/index.js";

test("generatePerson creates valid Schema.org Person", () => {
  const person = generatePerson({
    name: "Tim Berners-Lee",
    url: "https://example.com/tim",
    jobTitle: "Computer Scientist",
    worksFor: "W3C",
    sameAs: ["https://twitter.com/timberners_lee"]
  });

  const json = person.toJSON();
  assert.equal(json["@context"], "https://schema.org");
  assert.equal(json["@type"], "Person");
  assert.equal(json.name, "Tim Berners-Lee");
  assert.equal(json.url, "https://example.com/tim");
  assert.equal(json.jobTitle, "Computer Scientist");
  assert.deepEqual(json.worksFor, { "@type": "Organization", name: "W3C" });
  assert.deepEqual(json.sameAs, ["https://twitter.com/timberners_lee"]);

  const script = person.toScript();
  assert.ok(script.startsWith('<script type="application/ld+json">'));
  assert.ok(script.endsWith("</script>"));
  assert.ok(script.includes("Tim Berners-Lee"));
});

test("generatePerson validates missing name and invalid URL", () => {
  assert.throws(() => generatePerson({}), SeoValidationError);
  assert.throws(() => generatePerson({ name: "Alice", url: "bad-url" }), SeoValidationError);
});

test("generateOrganization creates valid Schema.org Organization", () => {
  const org = generateOrganization({
    name: "Acme Corp",
    url: "https://acme.example.com",
    logo: "https://acme.example.com/logo.png",
    sameAs: ["https://facebook.com/acmecorp", "https://linkedin.com/company/acmecorp"]
  });

  const json = org.toJSON();
  assert.equal(json["@type"], "Organization");
  assert.equal(json.name, "Acme Corp");
  assert.equal(json.logo, "https://acme.example.com/logo.png");
});

test("generateArticle creates valid Schema.org Article", () => {
  const article = generateArticle({
    headline: "The Future of Web Performance and SEO",
    description: "An in-depth guide on modern core web vitals.",
    image: "https://example.com/cover.jpg",
    datePublished: "2026-10-18T10:00:00Z",
    author: "Jane Doe",
    publisher: "Tech Daily",
    url: "https://example.com/posts/future-seo"
  });

  const json = article.toJSON();
  assert.equal(json["@type"], "Article");
  assert.equal(json.headline, "The Future of Web Performance and SEO");
  assert.deepEqual(json.author, { "@type": "Person", name: "Jane Doe" });
  assert.deepEqual(json.publisher, { "@type": "Organization", name: "Tech Daily" });
  assert.deepEqual(json.mainEntityOfPage, {
    "@type": "WebPage",
    "@id": "https://example.com/posts/future-seo"
  });
});

test("generateProduct creates valid Schema.org Product", () => {
  const product = generateProduct({
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear headphones with 30-hour battery life.",
    brand: "SoundMaster",
    sku: "SM-NC-100",
    offers: {
      price: "199.99",
      priceCurrency: "USD",
      availability: "InStock",
      url: "https://example.com/products/headphones"
    },
    aggregateRating: {
      ratingValue: "4.8",
      reviewCount: 350
    }
  });

  const json = product.toJSON();
  assert.equal(json["@type"], "Product");
  assert.equal(json.name, "Wireless Noise-Canceling Headphones");
  assert.deepEqual(json.brand, { "@type": "Brand", name: "SoundMaster" });
  assert.equal(json.offers["@type"], "Offer");
  assert.equal(json.offers.price, "199.99");
  assert.equal(json.offers.priceCurrency, "USD");
  assert.equal(json.offers.availability, "https://schema.org/InStock");
  assert.equal(json.aggregateRating["@type"], "AggregateRating");
  assert.equal(json.aggregateRating.ratingValue, "4.8");
});

test("generateBreadcrumbList creates valid Schema.org BreadcrumbList", () => {
  const breadcrumbs = generateBreadcrumbList([
    { name: "Home", url: "https://example.com" },
    { name: "Clothing", url: "https://example.com/clothing" },
    { name: "Jackets" }
  ]);

  const json = breadcrumbs.toJSON();
  assert.equal(json["@type"], "BreadcrumbList");
  assert.equal(json.itemListElement.length, 3);
  assert.equal(json.itemListElement[0].position, 1);
  assert.equal(json.itemListElement[0].name, "Home");
  assert.equal(json.itemListElement[0].item, "https://example.com");
  assert.equal(json.itemListElement[2].position, 3);
  assert.equal(json.itemListElement[2].name, "Jackets");
});

test("generateBreadcrumbList throws on empty array", () => {
  assert.throws(() => generateBreadcrumbList([]), SeoValidationError);
});

test("generateJsonLd dispatches correctly and protects against XSS closing tags", () => {
  const schema = generateJsonLd({
    type: "Person",
    name: "Hacker </script><script>alert('xss')</script>"
  });

  const script = schema.toScript();
  assert.ok(!script.includes("</script><script>"));
  assert.ok(script.includes("<\\/script>"));
});
