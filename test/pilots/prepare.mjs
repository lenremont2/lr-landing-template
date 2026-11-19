import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(await readFile(join(here, "cases.json"), "utf8"));
const [archive, ...selected] = process.argv.slice(2);
if (!archive || selected.some((id) => !Object.hasOwn(cases, id))) {
  throw new Error("Usage: npm run pilot:prepare -- <local.tgz> [case ...]");
}
const tarball = resolve(archive);
const suite = await mkdtemp(join(tmpdir(), "lr-pilot-suite-"));
const npm = (args, cwd) =>
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd,
    stdio: "inherit",
  });
await writeFile(join(suite, "package.json"), '{"private":true}\n');
npm(["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], suite);
const cli = join(
  suite,
  "node_modules/@lenremont/landing-kit/bin/landing-kit.js",
);
for (const id of selected.length ? selected : Object.keys(cases)) {
  const project = join(suite, "lr-" + id);
  execFileSync(
    process.execPath,
    [cli, "create", "lr-" + id, "--no-install", "--no-git"],
    { cwd: suite },
  );
  npm(
    [
      "install",
      "--save-dev",
      "--save-exact",
      "--no-audit",
      "--no-fund",
      "--prefer-offline",
      tarball,
    ],
    project,
  );
  await cp(join(here, "fixtures", id), project, { recursive: true });
  // Format the input before taking the baseline diff for a review-only task.
  npm(["run", "format"], project);
  execFileSync("git", ["init", "--quiet"], { cwd: project });
  execFileSync("git", ["add", "."], { cwd: project });
  execFileSync(
    "git",
    [
      "-c",
      "user.name=Pilot",
      "-c",
      "user.email=pilot@localhost",
      "commit",
      "--quiet",
      "-m",
      "Pilot input",
    ],
    { cwd: project },
  );
}
console.log("PILOT_SUITE=" + suite);
