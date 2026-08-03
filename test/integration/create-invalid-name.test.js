import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

test("create rejects an invalid project name without writing files", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-invalid-name-"));

  try {
    const result = runCli(
      ["create", "LR Polishing", "--no-install", "--no-git"],
      {
        cwd: workspace,
      },
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Некорректное имя проекта/u);
    assert.match(result.stderr, /lr-polishing/u);
    assert.deepEqual(await readdir(workspace), []);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
