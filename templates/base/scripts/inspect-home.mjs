import { fileURLToPath } from "node:url";

// Serve from the build root so absolute asset URLs resolve as they do on the site.
process.chdir(fileURLToPath(new URL("../dist/", import.meta.url)));
process.argv.splice(2, 0, "index.html");
if (!process.argv.includes("--out")) {
  process.argv.push(
    "--out",
    fileURLToPath(new URL("../.taste-skill/inspect/", import.meta.url)),
  );
}
await import("../.agents/skills/design-taste-frontend/scripts/inspect.mjs");
