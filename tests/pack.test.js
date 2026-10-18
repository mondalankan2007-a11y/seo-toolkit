import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("npm pack --dry-run packages only production files", async () => {
  const { stdout, stderr } = await execFileAsync("npm", ["pack", "--dry-run", "--json"]);
  const packInfo = JSON.parse(stdout);
  assert.ok(Array.isArray(packInfo) && packInfo.length > 0);

  const files = packInfo[0].files.map((f) => f.path);

  // Required files
  assert.ok(files.includes("package.json"), "package.json must be packed");
  assert.ok(files.includes("README.md"), "README.md must be packed");
  assert.ok(files.includes("LICENSE"), "LICENSE must be packed");
  assert.ok(files.includes("types/index.d.ts"), "types/index.d.ts must be packed");
  assert.ok(files.includes("src/index.js"), "src/index.js must be packed");
  assert.ok(files.includes("cli/index.js"), "cli/index.js must be packed");

  // Forbidden files in npm release package
  for (const f of files) {
    assert.ok(!f.startsWith("tests/"), `Test file '${f}' must not be in published package`);
    assert.ok(!f.includes(".env"), `Secrets file '${f}' must not be in published package`);
    assert.ok(!f.startsWith("scratch/"), `Scratch file '${f}' must not be in published package`);
  }
});
