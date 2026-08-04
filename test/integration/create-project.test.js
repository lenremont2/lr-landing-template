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
  "src/components/sections/LeadCapture.astro",
  "src/components/sections/SocialLinks.astro",
  "public/media/lr-qr-tg.webp",
  "public/media/lr-qr-vk.webp",
  "public/media/lr-qr-max.webp",
  "src/components/ui/LeadModal.astro",
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
      "@lenremont/landing-kit": "0.3.1",
      astro: "7.1.6",
      prettier: "3.9.6",
      "prettier-plugin-astro": "0.14.1",
      sass: "1.102.0",
      typescript: "6.0.3",
    });

    const leadCapture = await readFile(
      join(projectDirectory, "src/components/sections/LeadCapture.astro"),
      "utf8",
    );
    const landingScript = await readFile(
      join(projectDirectory, "src/scripts/landing.js"),
      "utf8",
    );
    const socialLinks = await readFile(
      join(projectDirectory, "src/components/sections/SocialLinks.astro"),
      "utf8",
    );

    assert.match(leadCapture, /data-lr-modal-open="quiz"/u);
    assert.match(leadCapture, /data-lr-lead-form/u);
    assert.match(leadCapture, /Вопрос номер 1\?/u);
    assert.match(leadCapture, /Выберите способ связи/u);
    assert.match(leadCapture, /По телефону/u);
    assert.match(leadCapture, /ВКонтакте/u);
    assert.match(leadCapture, /label: "MAX"/u);
    assert.match(leadCapture, /name="contact_method"/u);
    assert.match(leadCapture, /name="phone"/u);
    assert.match(leadCapture, /data-lr-quiz-loading/u);
    assert.match(leadCapture, /Расчёт готов/u);
    assert.match(landingScript, /showModal\(\)/u);
    assert.match(landingScript, /data-lr-quiz-calculate/u);
    assert.match(socialLinks, /qrSrc\?: string/u);
    assert.match(socialLinks, /target="_blank"/u);
    assert.match(socialLinks, /loading="lazy"/u);
    assert.match(socialLinks, /label: "MAX"/u);
    assert.match(socialLinks, /https:\/\/telegram\.me\/lenremont_bot/u);
    assert.match(socialLinks, /https:\/\/vk\.com\/lenremont/u);
    assert.match(socialLinks, /https:\/\/max\.ru\/id471902475874_3_bot/u);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
