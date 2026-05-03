# Changelog

All notable changes to RL Stats Companion will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-05-03

### Fixed
- Release workflow now locates Windows bundle artifacts under the target-triple output directory before hashing and uploading them to GitHub Releases

## [0.1.3] - 2026-05-03

### Fixed
- Release workflow now derives the tag name safely inside `actions/github-script`, fixing draft release creation for tag pushes

## [0.1.2] - 2026-05-03

### Added
- Minimal Vitest coverage setup so CI frontend tests run successfully
- Basic frontend constants test to prevent empty-test-suite CI failures

### Fixed
- ESLint v9 flat config added so `pnpm lint` works in CI and locally
- Rust `cargo clippy -- -D warnings` issues resolved without broad lint suppressions
- Storage APIs refactored to use structured arguments instead of oversized parameter lists
- Test coverage tooling aligned with Vitest v3 to satisfy the CI `--coverage` job

## [0.1.1] - 2026-05-03

### Added
- Tauri updater manifest (latest.json) for auto-update support
- Proper minisign signing key for secure updater delivery
- Storage stats now report DB path, oldest match date, and real file size
- Click on match in history now navigates to detail (not just right-click)

### Changed
- Dependabot now ignores semver-major bumps for recharts, lucide-react, typescript, eslint-plugin-react-hooks, @vitejs/plugin-react
- Author metadata updated to Lucas Sabena across LICENSE, Cargo.toml, README
- Repository URLs aligned to github.com/LucasSabena/rl-stats-companion

### Fixed
- Release workflow PowerShell parser error ($prevTag:→${prevTag}:)
- Release changelog generator rewritten in bash to avoid further scripting issues
- Export now includes all matches (removed 10k limit)
- Import now resolves match players by stable primary_id instead of DB-local numeric id
- Import preserves match_type and playlist metadata
- Import rebuilds daily_rollups from matches instead of additively merging (fixes double-count)
- Match events now stored with real wall-clock timestamp instead of all sharing end_time
- Match events serialized as proper JSON for scoring, assists, and statfeed data
- Settings form no longer silently fails when platform is empty string
- Onboarding Find Game step persists detected path to backend settings
- Live match end invalidates history, analytics, and storage stats queries

## [0.1.0] - 2026-05-03

### Added
- Project initialization
- Documentation framework (AGENTS.md, DESIGN.md, ARCHITECTURE.md, PRODUCT.md, SECURITY.md)
- Technical planning and architecture decisions
- Live match dashboard with real-time stats
- Match history with filtering and detailed match view
- Performance analytics (day, week, month)
- Local player identity auto-detection via in-game name and PrimaryId
- JSON backup export/import flow
- MSI and NSIS Windows installers
- Onboarding wizard
- Tracker Network integration
- Auto-configuration of Rocket League Stats API INI

## Planned

### [1.0.0] - Target: Q3 2026
- Live match dashboard
- Match history with filtering
- Match detail view with timeline
- Performance analytics (day, week, month, session)
- Auto-updater
- Data export/import
- Windows installer
- Open source release

### [1.1.0]
- Estimated advanced metrics (distance traveled, boost used)
- Streak tracking
- Time-of-day performance heatmap
- Advanced history filters
- Performance optimizations

### [1.2.0]
- Beta/stable update channels
- Opt-in crash reporting
- Enhanced data retention controls
- Keyboard shortcuts
- System tray integration

### [2.0.0]
- Optional encrypted cloud sync
- External rank/MMR integration (opt-in)
- Replay file analysis
- Overlay mode
- Multi-language support
