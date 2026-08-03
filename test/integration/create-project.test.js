import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "../helpers/run-cli.js";

const REQUIRED_FILES = [
  ".gitignore",
  "AGENTS.md",
  "astro.config.mjs",
  "docs/MASTER_DEVELOPMENT_PROMPT.md",
  "src/layouts/LandingLayout.astro",
  "src/pages/index.astro",
  "src/scripts/landing.js",
  "src/styles/landing.scss",
  "tsconfig.json",
];

test("create writes a complete versioned project without optional side effects", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-create-"));
  const projectDirectory = join(workspace, "lr-polishing");

  try {
    const result = runCli(
      ["create", "lr-polishing", "--no-install", "--no-git"],
      { cwd: workspace },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Проект lr-polishing создан/u);

    await Promise.all(
      REQUIRED_FILES.map((relativePath) =>
        access(join(projectDirectory, relativePath)),
      ),
    );

    const packageJson = JSON.parse(
      await readFile(join(projectDirectory, "package.json"), "utf8"),
    );

    assert.equal(packageJson.name, "lr-polishing");
    assert.equal(packageJson.private, true);
    assert.deepEqual(packageJson.engines, {
      node: "^22.12.0 || ^24.0.0",
      npm: ">=10",
    });
    assert.deepEqual(packageJson.devDependencies, {
      "@astrojs/check": "0.9.10",
      "@lenremont/landing-kit": "0.1.0",
      astro: "7.1.6",
      prettier: "3.9.6",
      "prettier-plugin-astro": "0.14.1",
      sass: "1.102.0",
      typescript: "6.0.3",
    });
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
