import assert from "node:assert/strict";
import test from "node:test";

import { isSupportedNodeVersion } from "../../src/core/node-version.js";

test("Node support follows the Landing Kit runtime contract", () => {
  const examples = new Map([
    ["22.11.0", false],
    ["22.12.0", true],
    ["22.23.1", true],
    ["23.0.0", false],
    ["24.0.0", true],
    ["24.18.0", true],
    ["25.0.0", false],
    ["26.0.0", false],
  ]);

  for (const [version, expected] of examples) {
    assert.equal(isSupportedNodeVersion(version), expected, version);
  }
});
