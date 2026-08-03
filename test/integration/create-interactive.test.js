import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCliInteractive } from "../helpers/run-cli.js";

test("create without a name asks for the project options", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "landing-kit-interactive-"));

  try {
    const result = await runCliInteractive(["create"], {
      cwd: workspace,
      answers: [
        { prompt: "Название проекта:", answer: "lr-interactive" },
        { prompt: "Установить зависимости", answer: "нет" },
        { prompt: "Инициализировать Git", answer: "нет" },
      ],
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Название проекта:/u);
    assert.match(result.stdout, /Установить зависимости/u);
    assert.match(result.stdout, /Инициализировать Git/u);
    assert.match(result.stdout, /Проект lr-interactive создан/u);
    await access(join(workspace, "lr-interactive", "package.json"));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
