import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

test("create skips git init inside an existing worktree", async (context) => {
  const gitVersion = spawnSync("git", ["--version"], { encoding: "utf8" });
  if (gitVersion.status !== 0) {
    context.skip("Git недоступен в тестовой среде");
    return;
  }

  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-parent-git-"));
  const projectDirectory = join(workspace, "lr-nested");

  try {
    const gitInit = spawnSync("git", ["init", "--quiet"], {
      cwd: workspace,
      encoding: "utf8",
    });
    assert.equal(gitInit.status, 0, gitInit.stderr);

    const result = runCli(["create", "lr-nested", "--no-install"], {
      cwd: workspace,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /Git не инициализирован: найден родительский репозиторий/u,
    );
    await access(join(projectDirectory, "package.json"));
    await assert.rejects(access(join(projectDirectory, ".git")));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
