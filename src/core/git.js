import { runProcess } from "./process.js";

async function canRunGit() {
  try {
    await runProcess("git", ["--version"], { stdio: "ignore" });
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function isInsideGitWorkTree(directory) {
  try {
    await runProcess(
      "git",
      ["-C", directory, "rev-parse", "--is-inside-work-tree"],
      { stdio: "ignore" },
    );
    return true;
  } catch {
    return false;
  }
}

export async function initializeGit(projectDirectory) {
  if (!(await canRunGit())) {
    return "unavailable";
  }

  if (await isInsideGitWorkTree(projectDirectory)) {
    return "skipped-parent";
  }

  await runProcess("git", ["init", "--quiet"], { cwd: projectDirectory });
  return "initialized";
}
