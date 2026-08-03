import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(
  new URL("../../bin/landing-kit.js", import.meta.url),
);

export function runCli(arguments_, options = {}) {
  return spawnSync(process.execPath, [cliPath, ...arguments_], {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    env: {
      ...process.env,
      ...options.env,
      NO_COLOR: "1",
    },
  });
}

export function runCliInteractive(arguments_, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...arguments_], {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...options.env,
        NO_COLOR: "1",
      },
      stdio: "pipe",
    });
    const prompts = options.answers.map(({ prompt }) => prompt);
    let stdout = "";
    let stderr = "";
    let answerIndex = 0;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;

      while (
        answerIndex < prompts.length &&
        stdout.includes(prompts[answerIndex])
      ) {
        child.stdin.write(`${options.answers[answerIndex].answer}\n`);
        answerIndex += 1;
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status, signal) => {
      resolve({ status, signal, stdout, stderr });
    });
  });
}
