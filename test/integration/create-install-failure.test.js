import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

test("create preserves generated files when npm install fails", async () => {
  const workspace = await mkdtemp(
    join(tmpdir(), "landing-kit-install-failure-"),
  );
  const projectDirectory = join(workspace, "lr-install-failure");

  try {
    const result = runCli(["create", "lr-install-failure", "--no-git"], {
      cwd: workspace,
      env: {
        npm_config_registry: "http://127.0.0.1:9/",
        npm_config_fetch_retries: "0",
        npm_config_fetch_timeout: "1000",
      },
    });

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Проект создан, но зависимости не установлены/u,
    );
    assert.match(result.stderr, /npm install/u);
    await access(join(projectDirectory, "package.json"));
    await access(join(projectDirectory, "src", "pages", "index.astro"));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
