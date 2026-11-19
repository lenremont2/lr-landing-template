import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const [suitePath, id] = process.argv.slice(2);
const cases = JSON.parse(
  await readFile(new URL("cases.json", import.meta.url), "utf8"),
);
if (!suitePath || !Object.hasOwn(cases, id))
  throw new Error("Usage: node run.mjs <prepared suite> <case>");
const suite = resolve(suitePath);
const project = join(suite, "lr-" + id);
await access(join(project, ".git"));
const results = join(suite, "results", id);
await mkdir(join(suite, "results"), { recursive: true });
await mkdir(results); // A second trial starts from another clean project.
const session = join(results, "session.jsonl");
const windows = process.platform === "win32";
const command = windows ? process.execPath : "pi";
const launcher = windows
  ? [process.env.PILOT_PI_JS || join(homedir(), ".pi/agent/bin/pi-launcher.js")]
  : [];
const model = process.env.PILOT_MODEL || "openai-codex/gpt-6.1-sol";
const minutes = id === "transfer" ? 12 : 6;
const args = [
  ...launcher,
  "--approve",
  "--no-extensions",
  "--no-skills",
  "--skill",
  ".agents/skills",
  "--model",
  model,
  "--thinking",
  "low",
  "--tools",
  "read,write,edit,bash",
  "--session",
  session,
  "--append-system-prompt",
  "Работай только с этим временным проектом и его локальными материалами. Зависимости уже установлены. Не используй сеть, внешние сервисы и отправку форм. Используй доступные локальные проверки. Заверши итоговым отчётом.",
  "-p",
  cases[id],
];
const version = spawnSync(command, [...launcher, "--version"], {
  encoding: "utf8",
}).stdout?.trim();
const started = Date.now();
const child = spawn(command, args, {
  cwd: project,
  stdio: ["ignore", "inherit", "inherit"],
  windowsHide: true,
  detached: !windows,
});
let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  if (windows)
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
    });
  else process.kill(-child.pid, "SIGTERM");
}, minutes * 60000);
let status;
try {
  status = await new Promise((ok, fail) => {
    child.once("error", fail);
    child.once("close", ok);
  });
} finally {
  clearTimeout(timer);
}
const reads = [];
const answers = [];
let tokens = 0;
let turns = 0;
let modelError;
const transcript = await readFile(session, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
for (const line of transcript.trim().split("\n").filter(Boolean)) {
  const msg = JSON.parse(line).message;
  if (msg?.role !== "assistant") continue;
  turns++;
  tokens += msg.usage?.totalTokens || 0;
  if (msg.stopReason === "error" || msg.stopReason === "aborted")
    modelError = msg.errorMessage || msg.stopReason;
  for (const part of msg.content || []) {
    if (part.type === "toolCall" && part.name === "read")
      reads.push(part.arguments.path);
    if (part.type === "text" && msg.stopReason === "stop")
      answers.push(part.text);
  }
}
const diff = spawnSync("git", ["status", "--porcelain"], {
  cwd: project,
  encoding: "utf8",
}).stdout;
const summary = {
  id,
  model,
  pi: version,
  minutes,
  status,
  timedOut,
  modelError,
  seconds: Math.round((Date.now() - started) / 1000),
  turns,
  tokens,
  reads,
  diff,
  answer: answers.join("\n"),
};
await writeFile(
  join(results, "summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
if (status !== 0 || timedOut || modelError || !answers.length)
  process.exitCode = 1;
