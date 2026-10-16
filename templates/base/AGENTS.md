# Lenremont landing rules

Rules snapshot: @lenremont/landing-kit 0.3.1.

- Build one static Astro landing inside the single `#hop-landing` root.
- Prefix project classes with `lr-`; use classes for CSS and `data-*` hooks for JavaScript.
- Keep all own selectors explicitly scoped by `#hop-landing`.
- Put SCSS in `src/styles`; do not add component-scoped styles.
- Connect behavior through `src/scripts/landing.js`; do not place behavior scripts in section components or create browser globals.
- Use vanilla JavaScript. Add third-party frontend libraries only as explicitly versioned CDN tags in `LandingLayout.astro`.
- Store project media in `public/media` and use local paths during development.
- Keep a phone or email field inside the visible lead block at final submission; use `data-lead-root`, `data-hop-lead-form`, and named fields. Mirror quiz answers into the final form, mark custom final buttons with `data-hop-lead-submit`, and ignored forms with `data-lead-ignore`.
- Preserve entered contacts and quiz answers until submission and any success screen; mark that screen with `data-lead-success` when present. Local demo handlers must be enabled only by `import.meta.env.DEV` and excluded from production markup.
- Run `npm run quality` before handing off a change.
- Do not add WordPress export, credentials, publication configuration, or plugin code in this version.

Read `docs/MASTER_DEVELOPMENT_PROMPT.md` before substantial landing work.
