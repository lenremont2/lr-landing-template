import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../", import.meta.url);

test("generated rules identify the current Landing Kit version", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", repositoryRoot), "utf8"),
  );
  assert.equal(packageJson.name, "@lenremont/landing-kit");
  assert.deepEqual(packageJson.bin, {
    "landing-kit": "bin/landing-kit.js",
  });
  const expectedMarker = `${packageJson.name} ${packageJson.version}`;
  const [agentRules, masterPrompt] = await Promise.all([
    readFile(new URL("templates/base/AGENTS.md", repositoryRoot), "utf8"),
    readFile(
      new URL(
        "templates/base/docs/MASTER_DEVELOPMENT_PROMPT.md",
        repositoryRoot,
      ),
      "utf8",
    ),
  ]);

  assert.match(agentRules, new RegExp(expectedMarker.replace(".", "\\."), "u"));
  assert.match(
    masterPrompt,
    new RegExp(expectedMarker.replace(".", "\\."), "u"),
  );
});
