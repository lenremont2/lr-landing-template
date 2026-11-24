# @lenremont/landing-kit

[![npm version](https://img.shields.io/npm/v/%40lenremont%2Flanding-kit?logo=npm)](https://www.npmjs.com/package/@lenremont/landing-kit)
[![Quality](https://github.com/lenremont2/lr-landing-template/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/lenremont2/lr-landing-template/actions/workflows/quality.yml)
[![GitHub release](https://img.shields.io/github/v/release/lenremont2/lr-landing-template?logo=github)](https://github.com/lenremont2/lr-landing-template/releases)
[![Node.js](https://img.shields.io/node/v/%40lenremont%2Flanding-kit?logo=node.js)](package.json)
[![npm downloads](https://img.shields.io/npm/dm/%40lenremont%2Flanding-kit)](https://www.npmjs.com/package/@lenremont/landing-kit)
[![License](https://img.shields.io/github/license/lenremont2/lr-landing-template)](LICENSE)

Landing Kit creates and maintains a versioned Astro workspace for Lenremont landing pages. Version 0.4 includes the Pi workflow, seven landing skills, a task-based development guide, and a lead quiz prepared for transfer through the Lenremont Gutenberg plugin.

**[Структура создаваемого проекта](templates/base/README.md)** — дерево каталогов, роли, сценарии и документы лендинга. Исходное дерево лежит в `templates/base/`.

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

An approved update refreshes the managed infrastructure files (Astro, Prettier
and TypeScript configuration, `.gitignore`, the reference index and its bundled
chapters in `docs/landing-kit/`) and the
standard scripts, engines, and exact development dependency versions in
`package.json`. Existing custom scripts, dependencies, and package metadata are
preserved. Project-owned files include `AGENTS.md`, the other files under
`docs/`, `.agents/skills/`, `src/` and `public/`. The Pi harness is initialized
by `create`. If a bundled chapter's path already contains an unmarked local
file, `update` reports its path before changing the project. Move that file
to a project-specific name and rerun the update.

Dependencies are installed after the files are updated. Use `--no-install` to
defer that step and run `npm install` manually.

## Generated project

The project contains a removable diagnostic screen, modular SCSS with one entrypoint, and a standalone module for the lead quiz. The [development reference](templates/base/docs/MASTER_DEVELOPMENT_PROMPT.md) groups instructions by task, with direct links for Astro, page content, CSS, interaction, lead capture, verification, and HTML On Page compatibility.

The bundled Pi harness includes `AGENTS.md`, `.agents/workflows/landing.md`, and 14 local skills: seven for landing development, six for web quality, and find-skills for discovery. With Pi and a model configured, run `pi` from the generated project root and approve project trust when prompted. Describe the landing task in your own words. Add project rules to `AGENTS.md`. See `docs/pi-harness.md` in the generated project for usage and source snapshot details.

Each new project also includes four editable guides: [page design decisions](templates/base/DESIGN.md), [development entry points](templates/base/DEVELOPMENT.md), [Lenremont brand assets and image briefs](templates/base/LENREMONT.md), and [map, price and quiz integrations](templates/base/HANDLER.md). Existing projects can adopt them by copying the guides and the linked logo and merging the links into their own `AGENTS.md`. The guides and logo are project-owned and are preserved by `update`.

```bash
npm run dev
npm run quality
```

The diagnostic screen must be deleted when actual landing development begins.

## Gutenberg quiz pilot

A built page containing one marked LeadCapture can be transferred as the editable “Квиз с модалкой” block. The Gutenberg plugin repository owns the adapter and draft import. The [transfer guide](templates/base/docs/landing-kit/embedding.md) covers packaging, editor changes, and browser acceptance.

## Adopting harness changes

For an existing landing, generate an empty comparison project with the desired package version. Compare its AGENTS.md, landing workflow, Pi guide and bundled skills with the project copies. Merge the routes you use and keep local rules. For example, record an agreed 1024 px layout in the page brief, or add a project-specific price-checking skill under .agents/skills/lr-price-table. The generated Pi guide has both examples. The update command refreshes the technical reference at its existing path.

Maintainers can run the seven model pilots from test/pilots/README.md in the source checkout. Pilots use local npm archives and synthetic inputs.

## Current scope

The CLI creates Astro projects and updates their managed infrastructure. The separate Lenremont Gutenberg plugin handles WordPress import.
