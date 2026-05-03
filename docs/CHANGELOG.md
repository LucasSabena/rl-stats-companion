# Changelog

## [0.1.7] - 2026-05-03
- Simplified CI and release flow.
- Release assets now publish only the Windows setup installer.

## [0.1.6] - 2026-05-03
- Release workflow now reconstructs and uploads `latest.json` from the signed Windows bundles.

## [0.1.5] - 2026-05-03
- Tauri bundle config now generates updater artifacts for GitHub releases.
- Release workflow upload step now publishes only real bundle assets from the Windows target output.

## [0.1.4] - 2026-05-03
- Release workflow now locates Windows bundle artifacts under the target-triple output directory.

## [0.1.3] - 2026-05-03
- Release workflow now derives the tag name safely for tag pushes.

## [0.1.2] - 2026-05-03
- Added Vitest coverage setup and a minimal frontend test.
- Fixed ESLint v9 and Rust Clippy CI failures.

## [0.1.1] - 2026-05-03
- Added updater support and storage/reporting fixes.

## [0.1.0] - 2026-05-03
- Initial public app release.
