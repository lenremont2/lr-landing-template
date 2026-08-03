import { parseCreateArguments } from "./core/arguments.js";
import { createProject } from "./commands/create.js";
import { validateProjectName } from "./core/project-name.js";
import { promptForCreateOptions } from "./core/prompts.js";
import { assertSupportedNodeVersion } from "./core/node-version.js";

export async function main(arguments_) {
  assertSupportedNodeVersion(process.versions.node);

  const [command, ...commandArguments] = arguments_;

  if (command !== "create") {
    throw new Error("Использование: landing-kit create <project-name>");
  }

  let { projectName, install, git } = parseCreateArguments(commandArguments);

  if (projectName === undefined) {
    ({ projectName, install, git } = await promptForCreateOptions());
  }

  validateProjectName(projectName);
  const projectDirectory = await createProject({
    projectName,
    install,
    git,
  });

  process.stdout.write(`Проект ${projectName} создан: ${projectDirectory}\n`);
}
