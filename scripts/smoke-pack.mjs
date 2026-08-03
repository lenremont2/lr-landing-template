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
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    cwd: options.cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
    },
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} ${arguments_.join(" ")} завершился с кодом ${result.status}.`,
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

try {
  const packResult = runNpm(
    ["pack", "--json", "--pack-destination", workspace],
    { cwd: repositoryDirectory, capture: true },
  );
  const [packMetadata] = JSON.parse(packResult.stdout);
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

  const packedCli = join(
    runnerDirectory,
    "node_modules",
    "@lenremont2",
    "landing-kit",
    "bin",
    "landing-kit.js",
  );
  run(
    process.execPath,
    [packedCli, "create", "lr-smoke", "--no-install", "--no-git"],
    { cwd: workspace },
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

  process.stdout.write(
    `Smoke test пройден: ${packMetadata.filename} создает проверяемую Astro-сборку.\n`,
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}
