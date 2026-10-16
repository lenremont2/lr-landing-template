import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";

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
    const [, finalForm] = leadCapture.match(/<form\b[^>]*>([\s\S]*?)<\/form>/u);
    assert.match(finalForm, /name="quiz_answer" type="hidden"/u);
    assert.match(finalForm, /name="contact_method" type="hidden"/u);
    assert.match(finalForm, /name="quiz_service" type="hidden"/u);
    assert.match(finalForm, /name="phone"\s+type="tel"/u);
    assert.match(finalForm, /<button[^>]*type="submit"/u);
    assert.match(leadCapture, /data-lead-success hidden/u);
    const rules = await readFile(
      join(projectDirectory, "docs/MASTER_DEVELOPMENT_PROMPT.md"),
      "utf8",
    );
    assert.match(rules, /`data-lead-ignore`/u);
    assert.doesNotMatch(rules, /data-hop-lead-ignore/u);
    assert.match(leadCapture, /data-lr-quiz-loading/u);
    assert.match(leadCapture, /Расчёт готов/u);
    assert.match(landingScript, /showModal\(\)/u);
    assert.match(landingScript, /data-lr-quiz-calculate/u);

    // Run the generated script through the final quiz transition with two forms.
    class Element {}
    const root = new Element();
    root.dataset = {};
    root.querySelector = () => null;
    const otherFormField = { value: "other quiz answer" };
    root.querySelectorAll = (selector) =>
      selector === "[data-lr-quiz-result]" ? [otherFormField] : [];
    let click;
    root.addEventListener = (_event, listener) => {
      click = listener;
    };
    const fields = {
      quiz_answer: { value: "" },
      contact_method: { value: "" },
    };
    const answers = [
      { name: "quiz_answer", value: "answer-2" },
      { name: "contact_method", value: "telegram" },
    ];
    const form = { elements: { namedItem: (name) => fields[name] } };
    const loading = { hidden: true };
    const ready = {
      hidden: true,
      querySelector: () => ({ focus() {} }),
    };
    const quiz = new Element();
    quiz.querySelectorAll = () => answers;
    quiz.querySelector = (selector) =>
      ({
        "[data-hop-lead-form]": form,
        "[data-lr-quiz-loading]": loading,
        "[data-lr-quiz-ready]": ready,
      })[selector];
    const step = { hidden: false, querySelector: () => answers[1] };
    const calculate = new Element();
    calculate.closest = (selector) =>
      ({
        "[data-lr-quiz-calculate]": calculate,
        "[data-lr-quiz-step]": step,
        "[data-lr-quiz]": quiz,
      })[selector] || null;
    runInNewContext(landingScript, {
      document: { readyState: "complete", querySelector: () => root },
      Element,
      HTMLElement: Element,
      window: { setTimeout: (callback) => callback() },
    });
    click({ target: calculate });
    assert.equal(fields.quiz_answer.value, "answer-2");
    assert.equal(fields.contact_method.value, "telegram");
    assert.equal(otherFormField.value, "other quiz answer");
    assert.equal(ready.hidden, false);
    assert.equal(loading.hidden, true);

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
