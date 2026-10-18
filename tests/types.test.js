import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import * as SeoToolkit from "../src/index.js";

test("TypeScript definition file exists and contains all primary API symbols", () => {
  const dtsPath = new URL("../types/index.d.ts", import.meta.url).pathname;
  assert.ok(existsSync(dtsPath), "types/index.d.ts should exist");

  const content = readFileSync(dtsPath, "utf-8");

  // Verify all exported runtime functions from src/index.js are typed in index.d.ts
  const exports = Object.keys(SeoToolkit);
  for (const exp of exports) {
    assert.ok(
      content.includes(exp),
      `types/index.d.ts should declare exported member '${exp}'`
    );
  }
});
