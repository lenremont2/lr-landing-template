import { readFileSync } from "node:fs";

const LANDING_KIT_PACKAGE = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const LANDING_KIT_VERSION = LANDING_KIT_PACKAGE.version;

export function createProjectPackage(projectName) {
  return {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
      check: "astro check",
      format: "prettier --write .",
      "format:check": "prettier --check .",
      quality: "npm run check && npm run format:check && npm run build",
    },
    engines: {
      node: "^22.12.0 || ^24.0.0",
      npm: ">=10",
    },
    devDependencies: {
      "@astrojs/check": "0.9.10",
      "@lenremont2/landing-kit": LANDING_KIT_VERSION,
      astro: "7.1.6",
      prettier: "3.9.6",
      "prettier-plugin-astro": "0.14.1",
      sass: "1.102.0",
      typescript: "6.0.3",
    },
  };
}
