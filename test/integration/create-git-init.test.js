import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

test("create initializes Git for a standalone project", async (context) => {
  const gitVersion = spawnSync("git", ["--version"], { encoding: "utf8" });
  if (gitVersion.status !== 0) {
    context.skip("Git недоступен в тестовой среде");
    return;
  }

  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-git-init-"));
  const projectDirectory = join(workspace, "lr-git");

  try {
    const result = runCli(["create", "lr-git", "--no-install"], {
      cwd: workspace,
    });

    assert.equal(result.status, 0, result.stderr);
    await access(join(projectDirectory, ".git", "HEAD"));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
