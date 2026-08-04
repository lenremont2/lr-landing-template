import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

const cliPath = fileURLToPath(
  new URL("../../bin/landing-kit.js", import.meta.url),
);

function quotePowerShellLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

test("create dot writes the project directly into the current empty directory", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-current-"));
  const projectDirectory = join(workspace, "lr-current-project");

  try {
    await mkdir(projectDirectory);

    const result = runCli(["create", ".", "--no-install", "--no-git"], {
      cwd: projectDirectory,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Проект lr-current-project создан/u);
    await access(join(projectDirectory, "src/pages/index.astro"));

    const packageJson = JSON.parse(
      await readFile(join(projectDirectory, "package.json"), "utf8"),
    );

    assert.equal(packageJson.name, "lr-current-project");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("create dot refuses a non-empty current directory without changing it", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-current-busy-"));
  const projectDirectory = join(workspace, "lr-current-project");
  const markerPath = join(projectDirectory, "keep.txt");

  try {
    await mkdir(projectDirectory);
    await writeFile(markerPath, "do not change\n", "utf8");

    const result = runCli(["create", ".", "--no-install", "--no-git"], {
      cwd: projectDirectory,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Целевая папка не пуста/u);
    assert.equal(await readFile(markerPath, "utf8"), "do not change\n");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test(
  "create dot works when the parent PowerShell is inside the target directory",
  { skip: process.platform !== "win32" },
  async () => {
    const workspace = await mkdtemp(join(tmpdir(), "landing-kit-powershell-"));
    const projectDirectory = join(workspace, "lr-powershell-project");

    try {
      await mkdir(projectDirectory);

      const command = [
        "&",
        quotePowerShellLiteral(process.execPath),
        quotePowerShellLiteral(cliPath),
        "create . --no-install --no-git",
      ].join(" ");
      const result = spawnSync(
        "powershell.exe",
        ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", command],
        {
          cwd: projectDirectory,
          encoding: "utf8",
          env: {
            ...process.env,
            NO_COLOR: "1",
          },
        },
      );

      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /Проект lr-powershell-project создан/u);
      await access(join(projectDirectory, "package.json"));
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  },
);
