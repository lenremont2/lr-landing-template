import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createProjectPackage } from "../core/template.js";
import { initializeGit } from "../core/git.js";
import { installDependencies } from "../core/process.js";

const templateDirectory = fileURLToPath(
  new URL("../../templates/base/", import.meta.url),
);

async function inspectTarget(targetDirectory) {
  try {
    const entries = await readdir(targetDirectory);
    if (entries.length > 0) {
      throw new Error(
        `Целевая папка не пуста: ${targetDirectory}. Выберите другое имя или подготовьте пустую папку вручную.`,
      );
    }

    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function createProject({
  projectName,
  install,
  git,
  cwd = process.cwd(),
}) {
  const targetDirectory = resolve(cwd, projectName);
  const parentDirectory = dirname(targetDirectory);
  const targetExisted = await inspectTarget(targetDirectory);

  await mkdir(parentDirectory, { recursive: true });
  const stagingDirectory = await mkdtemp(
    join(parentDirectory, `.${projectName}.landing-kit-`),
  );

  try {
    await cp(templateDirectory, stagingDirectory, {
      recursive: true,
    });
    await rename(
      join(stagingDirectory, "gitignore.template"),
      join(stagingDirectory, ".gitignore"),
    );
    await writeFile(
      join(stagingDirectory, "package.json"),
      `${JSON.stringify(createProjectPackage(projectName), null, 2)}\n`,
      "utf8",
    );

    if (targetExisted) {
      await rmdir(targetDirectory);
    }
    await rename(stagingDirectory, targetDirectory);
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true });
    if (targetExisted) {
      await mkdir(targetDirectory, { recursive: true });
    }
    throw error;
  }

  if (install) {
    try {
      await installDependencies(targetDirectory);
    } catch {
      throw new Error(
        `Проект создан, но зависимости не установлены. Перейдите в ${targetDirectory} и выполните npm install.`,
      );
    }
  }

  if (git) {
    const gitResult = await initializeGit(targetDirectory);
    if (gitResult === "skipped-parent") {
      process.stdout.write(
        "Git не инициализирован: найден родительский репозиторий.\n",
      );
    } else if (gitResult === "unavailable") {
      process.stdout.write("Git не инициализирован: команда git недоступна.\n");
    }
  }

  return targetDirectory;
}
