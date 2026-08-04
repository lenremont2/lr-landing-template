import { basename, dirname } from "node:path";

import {
  parseCreateArguments,
  parseUpdateArguments,
} from "./core/arguments.js";
import { createProject } from "./commands/create.js";
import { assertLandingKitProject, updateProject } from "./commands/update.js";
import { validateProjectName } from "./core/project-name.js";
import {
  promptForCreateOptions,
  promptForUpdateConfirmation,
} from "./core/prompts.js";
import { assertSupportedNodeVersion } from "./core/node-version.js";

async function runCreate(commandArguments) {
  let { projectName, install, git } = parseCreateArguments(commandArguments);

  if (projectName === undefined) {
    ({ projectName, install, git } = await promptForCreateOptions());
  }

  const createInCurrentDirectory = projectName === ".";
  let targetDirectory;
  if (createInCurrentDirectory) {
    targetDirectory = process.cwd();
    projectName = basename(targetDirectory);
    process.chdir(dirname(targetDirectory));
  }

  validateProjectName(projectName);
  const projectDirectory = await createProject({
    projectName,
    install,
    git,
    targetDirectory,
  });

  process.stdout.write(`Проект ${projectName} создан: ${projectDirectory}\n`);
}

async function runUpdate(commandArguments) {
  const { install } = parseUpdateArguments(commandArguments);
  const packageJson = await assertLandingKitProject();

  const confirmed = await promptForUpdateConfirmation();
  if (!confirmed) {
    process.stdout.write("Обновление отменено.\n");
    return;
  }

  const projectDirectory = await updateProject({ packageJson, install });
  process.stdout.write(`Проект обновлён: ${projectDirectory}\n`);
}

export async function main(arguments_) {
  assertSupportedNodeVersion(process.versions.node);

  const [command, ...commandArguments] = arguments_;

  if (command === "create") {
    await runCreate(commandArguments);
    return;
  }

  if (command === "update") {
    await runUpdate(commandArguments);
    return;
  }

  throw new Error(
    "Использование: landing-kit create <project-name> | landing-kit update",
  );
}
