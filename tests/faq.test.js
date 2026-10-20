import { test } from "node:test";
import assert from "node:assert/strict";
import { generateFAQPage, generateJsonLd, SeoValidationError } from "../src/index.js";

test("generateFAQPage creates valid Schema.org FAQPage from array", () => {
  const result = generateFAQPage([
    {
      question: "What is seo-toolkit?",
      answer: "A comprehensive technical SEO toolkit for modern web applications."
    },
    {
      question: "Is it zero-dependency?",
      answer: "Yes, it runs entirely on Node.js native APIs."
    }
  ]);

  assert.equal(result["@context"], "https://schema.org");
  assert.equal(result["@type"], "FAQPage");
  assert.equal(result.mainEntity.length, 2);

  assert.equal(result.mainEntity[0]["@type"], "Question");
  assert.equal(result.mainEntity[0].name, "What is seo-toolkit?");
  assert.equal(result.mainEntity[0].acceptedAnswer["@type"], "Answer");
  assert.equal(result.mainEntity[0].acceptedAnswer.text, "A comprehensive technical SEO toolkit for modern web applications.");

  const script = result.toScript();
  assert.ok(script.startsWith('<script type="application/ld+json">'));
  assert.ok(script.includes('"@type":"FAQPage"'));
  assert.ok(script.endsWith("</script>"));
});

test("generateFAQPage accepts object with questions array", () => {
  const result = generateFAQPage({
    questions: [
      {
        question: "How do I install it?",
        answer: "Run npm install @ankan_/seo-toolkit"
      }
    ]
  });

  assert.equal(result["@type"], "FAQPage");
  assert.equal(result.mainEntity.length, 1);
  assert.equal(result.mainEntity[0].name, "How do I install it?");
});

test("generateFAQPage throws on invalid or empty inputs", () => {
  assert.throws(() => generateFAQPage(), SeoValidationError);
  assert.throws(() => generateFAQPage([]), SeoValidationError);
  assert.throws(() => generateFAQPage([{ question: "" }]), SeoValidationError);
  assert.throws(() => generateFAQPage([{ question: "Valid?", answer: "" }]), SeoValidationError);
});

test("generateJsonLd dispatches FAQPage type correctly", () => {
  const result = generateJsonLd({
    "@type": "FAQPage",
    questions: [
      {
        question: "Does generateJsonLd support FAQPage?",
        answer: "Yes, seamlessly."
      }
    ]
  });

  assert.equal(result["@type"], "FAQPage");
  assert.equal(result.mainEntity[0].name, "Does generateJsonLd support FAQPage?");
});
