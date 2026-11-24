import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    env: {
      ...process.env,
      NO_COLOR: "1",
      ...options.env,
    },
    stdio: options.capture || options.input !== undefined ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const details = result.stderr?.trim();
    throw new Error(
      `${command} ${arguments_.join(" ")} завершился с кодом ${result.status}.${details ? `\n${details}` : ""}`,
    );
  }

  return result;
}

function npmArguments(arguments_) {
  const npmExecPath =
    process.env.npm_execpath ||
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  return [process.execPath, [npmExecPath, ...arguments_]];
}

function runNpm(arguments_, options = {}) {
  const [command, npmArguments_] = npmArguments(arguments_);
  return run(command, npmArguments_, options);
}

const workspace = await mkdtemp(join(tmpdir(), "landing-kit-pack-smoke-"));
const runnerDirectory = join(workspace, "runner");
const projectDirectory = join(workspace, "lr-smoke");
const masterPath = "docs/MASTER_DEVELOPMENT_PROMPT.md";
const projectGuides = [
  "DESIGN.md",
  "DEVELOPMENT.md",
  "LENREMONT.md",
  "HANDLER.md",
];

async function checkLocalLinks(path, markdown) {
  for (const [, target] of markdown.matchAll(/\]\(([^)\s]+)\)/gu)) {
    if (/^[\w+.-]+:/u.test(target)) continue;
    const [file, fragment] = target.split("#");
    const resolved = file
      ? resolve(dirname(path), decodeURIComponent(file))
      : path;
    assert.ok(resolved.startsWith(projectDirectory + sep), target);
    await access(resolved);
    if (fragment && resolved.endsWith(".md")) {
      const document = await readFile(resolved, "utf8");
      const id = decodeURIComponent(fragment);
      const headingIds = Array.from(
        document.matchAll(/^#{1,6} (.+)$/gmu),
        ([, heading]) =>
          heading
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}_ -]/gu, "")
            .replaceAll(" ", "-"),
      );
      assert.ok(
        document.includes(`<a id="${id}"></a>`) || headingIds.includes(id),
        target,
      );
    }
  }
}

async function verifyPackedHarness() {
  const templateDirectory = join(repositoryDirectory, "templates", "base");
  const skillsPath = ".agents/skills";
  const skillEntries = await readdir(join(templateDirectory, skillsPath), {
    recursive: true,
    withFileTypes: true,
  });
  const workflowPath = ".agents/workflows/landing.md";
  const chapterDirectory = "docs/landing-kit";
  const chapters = await readdir(join(templateDirectory, chapterDirectory));
  const index = await readFile(join(projectDirectory, masterPath), "utf8");
  for (const name of chapters) {
    assert.ok(index.includes(`(landing-kit/${name}`), name);
  }
  const workflow = await readFile(join(projectDirectory, workflowPath), "utf8");
  for (const skill of [
    "landing-research",
    "landing-scaffold",
    "design-taste-frontend",
    "project-ui",
    "form-formatter",
    "quiz-generator",
    "family-pages-contract",
    "find-skills",
    "web-quality-audit",
    "accessibility",
    "seo",
    "performance",
    "core-web-vitals",
    "best-practices",
  ]) {
    assert.ok(workflow.includes(`../skills/${skill}/SKILL.md`), skill);
  }

  for (const file of [
    "AGENTS.md",
    "README.md",
    "CLAUDE.md",
    ".claude/agents/landing-reviewer.md",
    ".cursor/rules/landing-review.mdc",
    ".agents/workflows/learning-loop.md",
    ".agents/roles/team.md",
    ".agents/evals/routing.md",
    "docs/product/brief.md",
    "docs/architecture/overview.md",
    "docs/design/README.md",
    "docs/decisions/README.md",
    "docs/tasks/task-template.md",
    "docs/landing-workflow.md",
    "tests/acceptance.md",
    "scripts/inspect-home.mjs",
    workflowPath,
    ...projectGuides,
    "public/media/lenremont-logo.svg",
    "docs/agent-roles.md",
    ".codex/agents/landing_reviewer.toml",
    "docs/pi-harness.md",
    masterPath,
    ...chapters.map((name) => join(chapterDirectory, name)),
    ...skillEntries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(templateDirectory, join(entry.parentPath, entry.name)),
      ),
  ]) {
    const path = join(projectDirectory, file);
    const content = await readFile(path);
    assert.deepEqual(
      content,
      await readFile(join(templateDirectory, file)),
      file,
    );
    const markdown = content.toString("utf8");
    if (file.endsWith(".md") || file.endsWith(".mdc"))
      await checkLocalLinks(path, markdown);
    if (file.endsWith("SKILL.md")) {
      const header = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/u.exec(markdown)?.[1];
      assert.ok(header, file);
      assert.equal(
        /^name: (.+)$/mu.exec(header)?.[1].trim(),
        dirname(path).split(sep).pop(),
      );
      assert.match(header, /^description: ["']?[^\s"'|>].+/mu, file);
    }
  }

  const rules = await readFile(join(projectDirectory, "AGENTS.md"), "utf8");
  for (const guide of projectGuides)
    assert.ok(rules.includes(`(${guide})`), guide);
  assert.ok(rules.includes(`(${workflowPath})`));
  assert.ok(rules.includes("(docs/MASTER_DEVELOPMENT_PROMPT.md)"));
}

try {
  const packResult = runNpm(
    ["pack", "--json", "--pack-destination", workspace],
    { cwd: repositoryDirectory, capture: true },
  );
  const [packMetadata] = JSON.parse(packResult.stdout);
  assert.ok(
    !packMetadata.files.some(({ path }) => path.split("/").includes("pilots")),
    "Pilot fixtures in archive",
  );
  const archivePath = join(workspace, packMetadata.filename);
  await access(archivePath);

  await mkdir(runnerDirectory);
  await writeFile(
    join(runnerDirectory, "package.json"),
    '{"name":"landing-kit-smoke-runner","private":true}\n',
    "utf8",
  );
  runNpm(
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", archivePath],
    {
      cwd: runnerDirectory,
    },
  );

  const binShim = join(
    runnerDirectory,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "landing-kit.cmd" : "landing-kit",
  );
  await access(binShim);

  const packedCli = join(
    runnerDirectory,
    "node_modules",
    ...packMetadata.name.split("/"),
    "bin",
    "landing-kit.js",
  );
  await mkdir(projectDirectory);
  run(
    process.execPath,
    [packedCli, "create", ".", "--no-install", "--no-git"],
    { cwd: projectDirectory },
  );
  await verifyPackedHarness();
  await assert.rejects(access(join(projectDirectory, "test/pilots")), {
    code: "ENOENT",
  });

  const tasteOutput = join(workspace, "taste");
  run(
    process.execPath,
    [
      ".agents/skills/design-taste-frontend/scripts/draw.mjs",
      "--sector",
      "other",
      "--sections",
      "hero,list,cta,footer",
      "--direction",
      "name-as-monument",
      "--seed",
      "1",
      "--out",
      tasteOutput,
    ],
    {
      cwd: projectDirectory,
      capture: true,
      env: { TASTE_SKILL_HISTORY: join(tasteOutput, "history.json") },
    },
  );
  const direction = JSON.parse(
    await readFile(join(tasteOutput, "direction.json"), "utf8"),
  );
  assert.deepEqual(
    direction.sections.map((section) => section.role),
    ["list", "cta"],
  );

  const preservedHarnessFiles = new Map();
  const extra = join(
    projectDirectory,
    ".agents/skills/lr-price-table/SKILL.md",
  );
  await mkdir(dirname(extra));
  const custom =
    "---\nname: lr-price-table\ndescription: Проверяет цены по прайсу.\n---\n";
  await writeFile(extra, custom);
  preservedHarnessFiles.set(extra, custom);
  for (const file of [
    "AGENTS.md",
    "docs/landing-workflow.md",
    ".agents/workflows/landing.md",
    ".agents/roles/team.md",
    ...projectGuides,
    "docs/agent-roles.md",
    "docs/pi-harness.md",
    ".agents/skills/project-ui/SKILL.md",
  ]) {
    const path = join(projectDirectory, file);
    const localRule =
      file === "docs/landing-workflow.md"
        ? [
            "[Адаптивность](MASTER_DEVELOPMENT_PROMPT.md#14-адаптивность)",
            "[Телефон](MASTER_DEVELOPMENT_PROMPT.md#phone)",
            "[Сдача](MASTER_DEVELOPMENT_PROMPT.md#verification)",
          ].join("\n")
        : "User project rule.";
    const content = `${await readFile(path, "utf8")}\n${localRule}\n`;
    await writeFile(path, content, "utf8");
    preservedHarnessFiles.set(path, content);
  }

  const preservedSourcePath = join(
    projectDirectory,
    "src",
    "preserved-by-update.txt",
  );
  await writeFile(preservedSourcePath, "user source\n", "utf8");
  const chapter = join(projectDirectory, "docs/landing-kit/forms.md");
  const formRules = await readFile(chapter, "utf8");
  await writeFile(chapter, formRules + "\nStale chapter text.\n");
  await writeFile(
    join(projectDirectory, "astro.config.mjs"),
    "// stale infrastructure\n",
    "utf8",
  );
  const updateResult = run(
    process.execPath,
    [packedCli, "update", "--no-install"],
    { cwd: projectDirectory, input: "y\n" },
  );
  assert.match(updateResult.stdout, /Проект обновлён/u);
  assert.equal(await readFile(chapter, "utf8"), formRules);
  for (const [path, content] of preservedHarnessFiles) {
    assert.equal(await readFile(path, "utf8"), content, path);
    await checkLocalLinks(path, content);
  }
  await access(join(projectDirectory, "docs/MASTER_DEVELOPMENT_PROMPT.md"));
  assert.equal(await readFile(preservedSourcePath, "utf8"), "user source\n");
  assert.match(
    await readFile(join(projectDirectory, "astro.config.mjs"), "utf8"),
    /output: "static"/u,
  );

  runNpm(
    [
      "install",
      "--save-dev",
      "--save-exact",
      "--no-audit",
      "--no-fund",
      archivePath,
    ],
    { cwd: projectDirectory },
  );
  runNpm(["run", "quality"], { cwd: projectDirectory });

  const outputHtmlPath = join(projectDirectory, "dist", "index.html");
  const outputHtml = await readFile(outputHtmlPath, "utf8");
  assert.match(outputHtml, /id="hop-landing"/u);
  assert.match(outputHtml, /Диагностический экран подключён/u);
  const [, leadForm] = outputHtml.match(/<form\b([^]*?)<\/form>/u);
  assert.match(leadForm, /data-hop-lead-form/u);
  assert.match(leadForm, /name="phone" type="tel"/u);
  assert.match(leadForm, /name="contact_method" type="hidden"/u);
  assert.match(leadForm, /name="quiz_answer" type="hidden"/u);
  assert.match(leadForm, /name="quiz_service" type="hidden"/u);
  assert.match(leadForm, /type="submit"/u);
  assert.doesNotMatch(leadForm, /data-lr-demo-form/u);
  assert.match(outputHtml, /data-lead-success hidden/u);

  process.stdout.write(
    `Smoke test пройден: ${packMetadata.filename} создаёт Astro-сборку и харнес Pi.\n`,
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}
