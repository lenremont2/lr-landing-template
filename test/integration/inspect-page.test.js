import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCli } from "../helpers/run-cli.js";
import { findChrome } from "../../templates/base/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";

test(
  "inspector separates styling advice from rendered failures",
  { skip: findChrome() ? false : "Chrome is unavailable" },
  async () => {
    const folder = await mkdtemp(join(tmpdir(), "landing-inspector-"));
    const project = join(folder, "lr-review");
    const out = join(folder, "report");
    const inspect = async (markup, expectedStatus) => {
      await writeFile(join(project, "dist/index.html"), markup);
      const result = spawnSync(
        process.execPath,
        ["scripts/inspect-home.mjs", "--widths", "390", "--out", out, "--json"],
        { cwd: project, encoding: "utf8", timeout: 90000 },
      );
      if (result.error) throw result.error;
      assert.equal(
        result.status,
        expectedStatus,
        result.stderr || result.stdout,
      );
      return JSON.parse(await readFile(join(out, "report.json"), "utf8"))
        .findings;
    };
    const page =
      '<!doctype html><meta name="viewport" content="width=device-width"><style>body{margin:24px;color:#111;background:white;font:18px Arial}section{padding:24px;box-shadow:0 2px 8px #555}</style><main><section><h1>Workshop</h1><p>Check the repair schedule for the coming week.</p></section></main>';
    try {
      const created = runCli(
        ["create", "lr-review", "--no-install", "--no-git"],
        { cwd: folder },
      );
      assert.equal(created.status, 0, created.stderr);
      await mkdir(join(project, "dist"));
      const advice = await inspect(page, 0);
      assert.ok(advice.some((f) => f.id === "shadow" && f.level === "WARN"));
      const defects = await inspect(
        page +
          '<img src="missing.png" alt="Parts" width="100" height="80"><div style="width:800px">Schedule</div><style>@media(prefers-reduced-motion:reduce){h1{opacity:0}}</style>',
        1,
      );
      for (const id of ["broken-image", "overflow", "reduced-hidden"])
        assert.ok(
          defects.some((f) => f.id === id && f.level === "FAIL"),
          id,
        );
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  },
);
