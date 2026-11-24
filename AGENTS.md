# Landing Kit repository rules

- Current implementation scope is creating static Astro projects and updating managed infrastructure with `@lenremont/landing-kit`.
- Do not implement WordPress export, publication configuration, credentials, API calls, or plugin code in this version.
- Treat `templates/base` as the exact generated-project tree; do not construct landing source files inside CLI strings.
- Keep CLI runtime code dependency-free and compatible with Node 22.12 and Node 24.
- Test public behavior through the CLI, generated project, and packed npm artifact.
- Keep generated dependency versions exact.
- Never write into a non-empty target directory or add a force option.
- Run `npm run quality` before handoff and `npm run smoke:pack` before publication.
- Architecture decisions are recorded in `docs/adr`.
- When changing how agents work on generated landings, use the [maintainer guide](docs/agent-development.md).
