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

async function createExistingProject(projectDirectory) {
  await mkdir(join(projectDirectory, "src/pages"), { recursive: true });
  await writeFile(
    join(projectDirectory, "package.json"),
    `${JSON.stringify(
      {
        name: "lr-existing-project",
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          build: "old-build-command",
          custom: "node custom-task.js",
        },
        devDependencies: {
          "@lenremont/landing-kit": "0.1.0",
          "custom-development-tool": "1.2.3",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    join(projectDirectory, "astro.config.mjs"),
    "// existing infrastructure\n",
    "utf8",
  );
  await writeFile(
    join(projectDirectory, "AGENTS.md"),
    "# Existing project rules\n\nRead [the master prompt](docs/MASTER_DEVELOPMENT_PROMPT.md).\n",
    "utf8",
  );
  await writeFile(
    join(projectDirectory, "src/pages/index.astro"),
    "<!-- user landing page -->\n",
    "utf8",
  );
}

test("update warns and leaves the project unchanged when the user declines", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-update-no-"));
  const projectDirectory = join(workspace, "lr-existing-project");

  try {
    await createExistingProject(projectDirectory);
    const packageBefore = await readFile(
      join(projectDirectory, "package.json"),
      "utf8",
    );

    const result = runCli(["update", "--no-install"], {
      cwd: projectDirectory,
      input: "n\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Продолжить\? \(y\/N\)/u);
    assert.match(result.stdout, /Обновление отменено/u);
    assert.equal(
      await readFile(join(projectDirectory, "package.json"), "utf8"),
      packageBefore,
    );
    assert.equal(
      await readFile(join(projectDirectory, "astro.config.mjs"), "utf8"),
      "// existing infrastructure\n",
    );
    assert.equal(
      await readFile(join(projectDirectory, "src/pages/index.astro"), "utf8"),
      "<!-- user landing page -->\n",
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("update refreshes infrastructure and preserves user source files", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-update-yes-"));
  const projectDirectory = join(workspace, "lr-existing-project");
  const customMediaPath = join(projectDirectory, "public/media/custom.webp");

  try {
    await createExistingProject(projectDirectory);
    await mkdir(join(projectDirectory, "public/media"), { recursive: true });
    await writeFile(customMediaPath, "user media\n", "utf8");
    const chapters = join(projectDirectory, "docs/landing-kit");
    await mkdir(chapters, { recursive: true });
    await writeFile(join(chapters, "brief.md"), "# Local brief\n");

    const result = runCli(["update", "--no-install"], {
      cwd: projectDirectory,
      input: "y\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Проект обновлён/u);

    const packageJson = JSON.parse(
      await readFile(join(projectDirectory, "package.json"), "utf8"),
    );

    assert.equal(packageJson.version, "0.1.0");
    assert.equal(packageJson.scripts.build, "astro build");
    assert.equal(packageJson.scripts.custom, "node custom-task.js");
    assert.equal(
      packageJson.devDependencies["@lenremont/landing-kit"],
      "0.3.1",
    );
    assert.equal(packageJson.devDependencies.astro, "7.1.6");
    assert.equal(
      packageJson.devDependencies["custom-development-tool"],
      "1.2.3",
    );

    assert.match(
      await readFile(join(projectDirectory, "astro.config.mjs"), "utf8"),
      /output: "static"/u,
    );
    await access(join(projectDirectory, ".gitignore"));
    await access(join(projectDirectory, "docs/MASTER_DEVELOPMENT_PROMPT.md"));
    const originals = new URL(
      "../../templates/base/docs/landing-kit/",
      import.meta.url,
    );
    for (const chapter of await readdir(originals)) {
      assert.deepEqual(
        await readFile(join(chapters, chapter)),
        await readFile(new URL(chapter, originals)),
        chapter,
      );
    }
    assert.equal(
      await readFile(join(chapters, "brief.md"), "utf8"),
      "# Local brief\n",
    );
    assert.equal(
      await readFile(join(projectDirectory, "AGENTS.md"), "utf8"),
      "# Existing project rules\n\nRead [the master prompt](docs/MASTER_DEVELOPMENT_PROMPT.md).\n",
    );
    await assert.rejects(
      access(join(projectDirectory, "docs/landing-workflow.md")),
      { code: "ENOENT" },
    );
    await assert.rejects(access(join(projectDirectory, ".agents")), {
      code: "ENOENT",
    });
    assert.equal(
      await readFile(join(projectDirectory, "src/pages/index.astro"), "utf8"),
      "<!-- user landing page -->\n",
    );
    assert.equal(await readFile(customMediaPath, "utf8"), "user media\n");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("update preserves a project document at the path of a new reference chapter", async () => {
  const workspace = await mkdtemp(
    join(tmpdir(), "landing-kit-update-conflict-"),
  );
  const projectDirectory = join(workspace, "lr-existing-project");
  try {
    await createExistingProject(projectDirectory);
    const chapters = join(projectDirectory, "docs/landing-kit");
    await mkdir(chapters, { recursive: true });
    const localFile = join(chapters, "forms.md");
    await writeFile(localFile, "# Local form rules\n");
    const result = runCli(["update", "--no-install"], {
      cwd: projectDirectory,
      input: "y\n",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Путь главы занят.*forms\.md/u);
    assert.equal(await readFile(localFile, "utf8"), "# Local form rules\n");
    assert.deepEqual(await readdir(chapters), ["forms.md"]);
    assert.equal(
      await readFile(join(projectDirectory, "astro.config.mjs"), "utf8"),
      "// existing infrastructure\n",
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("update refuses to run outside a Landing Kit project", async () => {
  const workspace = await mkdtemp(
    join(tmpdir(), "landing-kit-update-missing-"),
  );

  try {
    const result = runCli(["update", "--no-install"], {
      cwd: workspace,
      input: "y\n",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /не найден проект Landing Kit/u);
    assert.doesNotMatch(result.stdout, /Продолжить/u);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
