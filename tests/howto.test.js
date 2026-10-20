import { test } from "node:test";
import assert from "node:assert/strict";
import { generateHowTo, generateJsonLd, SeoValidationError } from "../src/index.js";

test("generateHowTo creates valid Schema.org HowTo object", () => {
  const result = generateHowTo({
    name: "How to tie a Windsor Knot",
    description: "Step-by-step guide to tying a full Windsor knot.",
    totalTime: "PT5M",
    steps: [
      { name: "Step 1", text: "Drape the tie around your neck." },
      { name: "Step 2", text: "Cross wide end over narrow end." },
      { name: "Step 3", text: "Pull wide end up and through loop." }
    ],
    supply: ["Silk necktie"],
    tool: ["Mirror"]
  });

  assert.equal(result["@context"], "https://schema.org");
  assert.equal(result["@type"], "HowTo");
  assert.equal(result.name, "How to tie a Windsor Knot");
  assert.equal(result.description, "Step-by-step guide to tying a full Windsor knot.");
  assert.equal(result.totalTime, "PT5M");
  assert.equal(result.step.length, 3);
  assert.equal(result.step[0]["@type"], "HowToStep");
  assert.equal(result.step[0].position, 1);
  assert.equal(result.step[0].name, "Step 1");
  assert.equal(result.step[0].text, "Drape the tie around your neck.");
  assert.equal(result.supply[0]["@type"], "HowToSupply");
  assert.equal(result.supply[0].name, "Silk necktie");
  assert.equal(result.tool[0]["@type"], "HowToTool");
  assert.equal(result.tool[0].name, "Mirror");

  const script = result.toScript();
  assert.ok(script.includes('"@type":"HowTo"'));
  assert.ok(script.includes('"HowToStep"'));
});

test("generateHowTo accepts plain string steps", () => {
  const result = generateHowTo({
    name: "Quick HowTo",
    steps: ["First step", "Second step"]
  });

  assert.equal(result.step.length, 2);
  assert.equal(result.step[0].text, "First step");
  assert.equal(result.step[0].position, 1);
  assert.equal(result.step[1].text, "Second step");
  assert.equal(result.step[1].position, 2);
});

test("generateHowTo validates missing name or empty steps", () => {
  assert.throws(() => generateHowTo(), SeoValidationError);
  assert.throws(() => generateHowTo({ steps: ["Step 1"] }), SeoValidationError);
  assert.throws(() => generateHowTo({ name: "Title", steps: [] }), SeoValidationError);
  assert.throws(() => generateHowTo({ name: "Title", steps: [""] }), SeoValidationError);
});

test("generateJsonLd dispatches HowTo type correctly", () => {
  const result = generateJsonLd({
    "@type": "HowTo",
    name: "Cook Rice",
    steps: ["Rinse rice", "Boil water"]
  });

  assert.equal(result["@type"], "HowTo");
  assert.equal(result.name, "Cook Rice");
  assert.equal(result.step.length, 2);
});
