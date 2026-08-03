import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

test("create refuses a non-empty target without changing it", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-non-empty-"));
  const projectDirectory = join(workspace, "lr-existing");
  const markerPath = join(projectDirectory, "keep.txt");

  try {
    await mkdir(projectDirectory);
    await writeFile(markerPath, "do not change\n", "utf8");

    const result = runCli(
      ["create", "lr-existing", "--no-install", "--no-git"],
      { cwd: workspace },
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Целевая папка не пуста/u);
    assert.equal(await readFile(markerPath, "utf8"), "do not change\n");
    assert.deepEqual(await readdir(workspace), ["lr-existing"]);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("create accepts an existing empty target", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-empty-"));
  const projectDirectory = join(workspace, "lr-empty");

  try {
    await mkdir(projectDirectory);
    const result = runCli(["create", "lr-empty", "--no-install", "--no-git"], {
      cwd: workspace,
    });

    assert.equal(result.status, 0, result.stderr);
    await access(join(projectDirectory, "package.json"));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
