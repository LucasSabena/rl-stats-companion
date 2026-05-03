# Changelog

All notable changes to RL Stats Companion will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project initialization
- Documentation framework (AGENTS.md, DESIGN.md, ARCHITECTURE.md, PRODUCT.md, SECURITY.md)
- Technical planning and architecture decisions

### Changed
- Added onboarding identity capture using in-game player name and automatic `PrimaryId` discovery
- Added real JSON backup export/import flow from the desktop app
- Added MSI build target alongside NSIS for Windows releases

### Fixed
- Fixed settings persistence for player name, platform, path, and default match type
- Fixed history/detail result calculation to use the local player's team instead of assuming blue = win
- Fixed storage stats reporting so saved matches and DB size are reflected correctly
- Fixed match detail hydration so goals and event timeline data are returned from the backend
- Improved match persistence when a match ends through FF/leave before the normal final screen
- Rebuilt analytics rollups after identity changes and imports to avoid stale or duplicated stats

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
