# @lenremont/landing-kit

[![npm version](https://img.shields.io/npm/v/%40lenremont%2Flanding-kit?logo=npm)](https://www.npmjs.com/package/@lenremont/landing-kit)
[![Quality](https://github.com/lenremont2/lr-landing-template/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/lenremont2/lr-landing-template/actions/workflows/quality.yml)
[![GitHub release](https://img.shields.io/github/v/release/lenremont2/lr-landing-template?logo=github)](https://github.com/lenremont2/lr-landing-template/releases)
[![Node.js](https://img.shields.io/node/v/%40lenremont%2Flanding-kit?logo=node.js)](package.json)
[![npm downloads](https://img.shields.io/npm/dm/%40lenremont%2Flanding-kit)](https://www.npmjs.com/package/@lenremont/landing-kit)
[![License](https://img.shields.io/github/license/lenremont2/lr-landing-template)](LICENSE)

Landing Kit creates and maintains a versioned Astro workspace for Lenremont landing pages. Version 0.3 adds creation in the current directory, confirmed infrastructure updates, bundled social QR media, and automated quality checks. WordPress export and publication remain intentionally deferred.

## Requirements

- Node.js 24 LTS is recommended.
- Node.js 22.12 or newer in the 22.x line is also supported.
- npm 10 or newer.

## Create a project

```bash
npx @lenremont/landing-kit create lr-project-name
```

With a project name, Landing Kit installs dependencies and initializes Git without additional questions. Git initialization is skipped when the target is already inside a Git worktree.

Available flags:

```bash
--no-install
--no-git
```

Run `create` without a project name to choose the name, dependency installation, and Git initialization interactively.

To create the project directly in the current empty directory, use `.`. The
project name is derived from the directory name, and the same non-empty target
protection remains active. On Windows, Landing Kit keeps the current directory
itself in place so the command works when PowerShell is running inside it.

```bash
npx @lenremont/landing-kit create .
```

## Update a project

Run the latest Landing Kit from the root of an existing generated project:

```bash
npx @lenremont/landing-kit@latest update
```

The command always displays a `(y/N)` confirmation before writing anything.
Declining or submitting an empty answer leaves the project unchanged.

An approved update refreshes the managed infrastructure files (`AGENTS.md`,
Astro, Prettier and TypeScript configuration, `.gitignore`, and `docs`) and the
standard scripts, engines, and exact development dependency versions in
`package.json`. Existing custom scripts, dependencies, and package metadata are
preserved. Files inside `src` and `public` are never updated by this command.

Dependencies are installed after the files are updated. Use `--no-install` to
defer that step and run `npm install` manually.

## Generated project

The project contains a removable diagnostic screen, modular SCSS with one entrypoint, one vanilla JavaScript entrypoint, compact agent rules, and the full versioned development reference.

```bash
npm run dev
npm run quality
```

The diagnostic screen must be deleted when actual landing development begins.

## Current scope

Version 0.3 does not contain WordPress credentials, plugin code, media upload, HTML transformation, or publishing commands.
