# RL Stats Companion — Agent Guide

> Project: `api-rocketleague` — A local-first desktop companion app for Rocket League Stats API.
> Stack: Tauri 2 (Rust) + React + TypeScript + SQLite
> License: MIT (Open Source)

---

## Project Context

This is a **local-first, open-source Windows desktop application** that consumes the official Rocket League Stats API (local TCP stream on `127.0.0.1:49123`). It provides live match dashboards, personal match history, and performance analytics. The app is designed to be lightweight, secure, and privacy-respecting.

**Key constraint**: The Rocket League Stats API is a **local-only, client-side API**. There is no public web API for account history, MMR, or ranks. The app must run on the same Windows PC where Rocket League is installed.

**What the API provides**:
- Real-time match events: `UpdateState`, `BallHit`, `GoalScored`, `StatfeedEvent`, `MatchCreated`, `MatchEnded`, etc.
- Per-player data: name, team, score, goals, shots, assists, saves, touches, demos, speed, boost amount
- Game state: teams, score, time, overtime, ball speed, arena, target

**What the API does NOT provide**:
- Official MMR / rank / division data
- Historical match data from Psyonix servers
- Playlist/mode detection (reliable)
- Distance traveled, total boost used (must be estimated)

---

## Build & Development

### Prerequisites
- Rust toolchain (stable)
- Node.js 20+ with pnpm (recommended)
- Windows 10/11 (target platform)
- Rocket League installed (for testing the Stats API stream)

### Development Commands
```bash
# Install dependencies
pnpm install

# Run in development mode (Tauri dev server + Rust compilation)
pnpm tauri dev

# Build for production
pnpm tauri build

# Run Rust tests
cd src-tauri && cargo test

# Run frontend tests
pnpm test

# Run linting
pnpm lint
rustc --edition 2021 --deny warnings src-tauri/src/lib.rs
```

### Project Structure
```
api-rocketleague/
├── src/                      # React frontend (Vite + TypeScript)
│   ├── components/           # UI components
│   ├── pages/                # Route-level pages
│   ├── hooks/                # React hooks
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utilities, types, constants
│   └── styles/               # Tailwind + global styles
├── src-tauri/                # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs           # Entry point
│   │   ├── lib.rs            # Tauri command exports
│   │   ├── core/             # Domain logic
│   │   │   ├── ingestor/     # TCP stream consumer
│   │   │   ├── parser/       # Event parsing
│   │   │   ├── models/       # Domain types
│   │   │   ├── storage/      # SQLite persistence
│   │   │   ├── metrics/      # Derived metrics engine
│   │   │   └── session/      # Session management
│   │   └── updater/          # Auto-update logic
│   └── tauri.conf.json
├── docs/                     # Project documentation
├── tests/                    # E2E tests (Playwright)
└── package.json
```

---

## Coding Conventions

### Rust (Backend)
- Edition 2021, `deny(warnings)` in CI
- Use `thiserror` for custom error types
- Use `serde` for serialization
- Use `tokio` for async runtime
- Domain logic lives in `src/core/`, never in command handlers
- SQLite via `rusqlite` with connection pooling via `r2d2`
- All file system access goes through Tauri APIs, not direct paths
- Log with `tracing`, never `println!` in production code

### TypeScript / React (Frontend)
- Strict TypeScript (`strict: true`)
- React 19+ with functional components only
- State: Zustand for global, `useState/useReducer` for local
- Data fetching: TanStack Query for async state
- Components: composition over inheritance
- No `any` types without explicit `// @ts-expect-error` justification
- Tailwind CSS for all styling — no inline styles
- shadcn/ui primitives as base, custom components on top

### Naming
- Rust: `snake_case` for files/vars, `PascalCase` for types/structs, `SCREAMING_SNAKE_CASE` for constants
- TypeScript: `camelCase` for vars/functions, `PascalCase` for types/components, `UPPER_SNAKE_CASE` for constants
- Files: `kebab-case` for components, `snake_case` for utilities

---

## Security Rules

1. **No remote backend by default** — the app is local-first. Any cloud feature must be opt-in.
2. **Minimal Tauri permissions** — only enable plugins/commands that are strictly needed. Review `tauri.conf.json > capabilities` before adding new ones.
3. **No shell plugin** — unless explicitly required and documented. Use `opener` plugin for opening external URLs.
4. **Sanitize all external input** — release notes from updater, any future network data.
5. **Secrets in CI only** — signing keys, API tokens must be GitHub Secrets. Never commit them.
6. **Signed updates only** — updater must verify signatures with the embedded public key.
7. **CSP strict** — `default-src 'self'` in production builds.
8. **No telemetry without consent** — crash reports or diagnostics require explicit user opt-in.
9. **SQLite parameterized queries** — always use `?` placeholders, never string interpolation for SQL.
10. **Data stays local** — match history, player names, stats never leave the device unless user explicitly exports.

---

## Testing Requirements

- **Rust**: Unit tests for parser, metrics engine, storage. Integration tests with captured event streams.
- **Frontend**: Vitest for unit tests, React Testing Library for components.
- **E2E**: Playwright for critical user flows (live match → history → detail).
- **Replay tests**: Use captured JSONL event logs as fixtures for deterministic backend tests.
- Minimum coverage target: 70% for core modules.

---

## Release Process

1. Version bump in `package.json`, `Cargo.toml`, and `tauri.conf.json`
2. Update `CHANGELOG.md`
3. Create git tag `vX.Y.Z`
4. GitHub Actions builds Windows x64 installer + updater artifacts
5. Sign artifacts with code signing certificate (production)
6. Publish GitHub Release with `latest.json` manifest for updater
7. Verify updater works from previous version

---

## Communication

- **Language**: Spanish for user-facing content, English for code and technical docs
- **Issues**: Use GitHub Issues with labels: `bug`, `feature`, `enhancement`, `security`, `docs`
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security reports**: Email or private GitHub Security Advisory

---

## Key Decisions (ADRs)

| Decision | Rationale | Date |
|----------|-----------|------|
| Tauri over Electron | Smaller binaries, better security, Rust backend | 2026-05-02 |
| Rust over Go (Wails) | Better parsing performance, memory safety, ecosystem for this use case | 2026-05-02 |
| React + web UI over native Rust UI | Faster development, better design flexibility, rich charting libraries | 2026-05-02 |
| SQLite over embedded NoSQL | Structured data, migrations, query flexibility, small footprint | 2026-05-02 |
| Local-first over cloud | Privacy, zero server costs, works offline, aligns with API constraint | 2026-05-02 |
| No MMR/rank in V1 | API doesn't provide it; external sources unreliable/ToS-risky | 2026-05-02 |
| shadcn/ui primitives | Accessible, customizable, Tailwind-native, no runtime dependency | 2026-05-02 |

---

## Useful Resources

- [Rocket League Stats API Docs](https://www.rocketleague.com/en/developer/stats-api)
- [Tauri Documentation](https://tauri.app/)
- [Tauri Updater Plugin](https://tauri.app/plugin/updater/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [rlstatsapi Rust library](https://github.com/xentrick/rlstatsapi) — reference for event parsing
- [RocketLeagueStatsAPI Python library](https://github.com/manucabral/RocketLeagueStatsAPI) — reference for event schema
- [AGENTS.md Spec](https://agents.md/)
- [DESIGN.md Spec](https://stitch.withgoogle.com/docs/design-md/overview)
