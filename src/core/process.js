import { spawn } from "node:child_process";
import { dirname, join } from "node:path";

export function runProcess(
  command,
  arguments_,
  { cwd, stdio = "inherit" } = {},
) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd,
      stdio,
      shell: false,
    });

    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve({ code, signal });
        return;
      }

      reject(
        new Error(
          `${command} завершился с кодом ${code ?? "unknown"}${signal ? ` (${signal})` : ""}.`,
        ),
      );
    });
  });
}

export function installDependencies(projectDirectory) {
  const npmExecPath =
    process.env.npm_execpath ||
    (process.platform === "win32"
      ? join(
          dirname(process.execPath),
          "node_modules",
          "npm",
          "bin",
          "npm-cli.js",
        )
      : undefined);

  if (npmExecPath) {
    return runProcess(process.execPath, [npmExecPath, "install"], {
      cwd: projectDirectory,
    });
  }

  return runProcess("npm", ["install"], { cwd: projectDirectory });
}
