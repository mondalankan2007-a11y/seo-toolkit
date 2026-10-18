import { test } from "node:test";
import assert from "node:assert/strict";
import { VERSION } from "../src/index.js";

test("package exports version", () => {
  assert.equal(typeof VERSION, "string");
  assert.equal(VERSION, "0.1.0");
});
