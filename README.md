# @lenremont2/landing-kit

Landing Kit creates a versioned Astro workspace for Lenremont landing pages. Version 0.1 contains the project generator and development rules; WordPress export and publication are intentionally deferred.

## Requirements

- Node.js 24 LTS is recommended.
- Node.js 22.12 or newer in the 22.x line is also supported.
- npm 10 or newer.

## Create a project

```bash
npx @lenremont2/landing-kit create lr-project-name
```

With a project name, Landing Kit installs dependencies and initializes Git without additional questions. Git initialization is skipped when the target is already inside a Git worktree.

Available flags:

```bash
--no-install
--no-git
```

Run `create` without a project name to choose the name, dependency installation, and Git initialization interactively.

## Generated project

The project contains a removable diagnostic screen, modular SCSS with one entrypoint, one vanilla JavaScript entrypoint, compact agent rules, and the full versioned development reference.

```bash
npm run dev
npm run quality
```

The diagnostic screen must be deleted when actual landing development begins.

## Current scope

Version 0.1 does not contain WordPress credentials, plugin code, media upload, HTML transformation, or publishing commands.
