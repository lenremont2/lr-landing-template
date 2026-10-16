# Changelog

All notable Landing Kit changes are documented here.

## [Unreleased]

### Fixed

- Lead Capture rules now use `data-lead-ignore`, require contacts inside the visible lead block, and clarify custom quiz and dialpad examples.
- Quiz answers and contact method are copied into separate fields in the final form and preserved when the modal closes.
- Forms include service and success hooks; local demo handling is limited to Astro development and does not require an endpoint for HTML On Page capture.
- Scoped hidden-state styling keeps inactive quiz steps and the success screen hidden.

## [0.3.1] - 2026-08-04

### Fixed

- `landing-kit create .` no longer removes and replaces the current empty directory, avoiding Windows `EBUSY` failures when the invoking PowerShell is inside that directory.
- A Windows integration test now reproduces the real parent-shell directory lock that the previous child-process test missed.

## [0.3.0] - 2026-08-04

### Added

- `landing-kit create .` for creating a project directly in the current empty directory.
- `landing-kit update` with mandatory `(y/N)` confirmation and optional `--no-install`.
- Safe infrastructure synchronization that preserves `src/**`, `public/**`, custom scripts, dependencies, and package metadata.
- Bundled Telegram, VK, and MAX QR media with working social destinations.
- GitHub quality checks for supported Node.js versions and the packed npm artifact.
- npm, quality, release, Node.js, downloads, and license badges in the README.

### Changed

- Social buttons and QR cards now provide clearer hover feedback.
- The packed-artifact smoke test covers current-directory creation and confirmed project updates.

## [0.2.0] - 2026-08-03

### Added

- Mandatory lead-capture and social-link sections.
- Public npm publication through GitHub trusted publishing.

## [0.1.0] - 2026-08-03

### Added

- Initial dependency-free Landing Kit CLI and versioned Astro project template.
