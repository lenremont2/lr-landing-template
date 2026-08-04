import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createProjectPackage } from "../core/template.js";
import { installDependencies } from "../core/process.js";

const LANDING_KIT_PACKAGE_NAME = "@lenremont/landing-kit";
const templateDirectory = fileURLToPath(
  new URL("../../templates/base/", import.meta.url),
);
const INFRASTRUCTURE_ENTRIES = [
  "AGENTS.md",
  "astro.config.mjs",
  "docs",
  "prettier.config.mjs",
  "tsconfig.json",
];

function createUpdatedPackage(packageJson) {
  const managedPackage = createProjectPackage(packageJson.name);

  return {
    ...packageJson,
    scripts: {
      ...(packageJson.scripts ?? {}),
      ...managedPackage.scripts,
    },
    engines: {
      ...(packageJson.engines ?? {}),
      ...managedPackage.engines,
    },
    devDependencies: {
      ...(packageJson.devDependencies ?? {}),
      ...managedPackage.devDependencies,
    },
  };
}

export async function assertLandingKitProject(
  projectDirectory = process.cwd(),
) {
  const packagePath = join(projectDirectory, "package.json");
  let packageJson;

  try {
    packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        "В текущей папке не найден проект Landing Kit: отсутствует package.json.",
      );
    }
    throw error;
  }

  if (!(LANDING_KIT_PACKAGE_NAME in (packageJson.devDependencies ?? {}))) {
    throw new Error(
      `В текущей папке не найден проект Landing Kit: в devDependencies отсутствует ${LANDING_KIT_PACKAGE_NAME}.`,
    );
  }

  return packageJson;
}

export async function updateProject({
  packageJson,
  install,
  projectDirectory = process.cwd(),
}) {
  const stagingDirectory = await mkdtemp(
    join(
      dirname(projectDirectory),
      `.${basename(projectDirectory)}.landing-kit-update-`,
    ),
  );

  try {
    for (const entry of INFRASTRUCTURE_ENTRIES) {
      await cp(join(templateDirectory, entry), join(stagingDirectory, entry), {
        recursive: true,
      });
    }

    await copyFile(
      join(templateDirectory, "gitignore.template"),
      join(stagingDirectory, ".gitignore"),
    );
    await writeFile(
      join(stagingDirectory, "package.json"),
      `${JSON.stringify(createUpdatedPackage(packageJson), null, 2)}\n`,
      "utf8",
    );

    for (const entry of INFRASTRUCTURE_ENTRIES) {
      await cp(join(stagingDirectory, entry), join(projectDirectory, entry), {
        recursive: true,
        force: true,
      });
    }

    await mkdir(projectDirectory, { recursive: true });
    await copyFile(
      join(stagingDirectory, ".gitignore"),
      join(projectDirectory, ".gitignore"),
    );
    await copyFile(
      join(stagingDirectory, "package.json"),
      join(projectDirectory, "package.json"),
    );
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }

  if (install) {
    try {
      await installDependencies(projectDirectory);
    } catch {
      throw new Error(
        "Проект обновлён, но зависимости не установлены. Выполните npm install вручную.",
      );
    }
  }

  return projectDirectory;
}
