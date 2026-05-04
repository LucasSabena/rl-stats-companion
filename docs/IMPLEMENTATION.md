# RL Stats — Implementation Guide

> The primary reference for developers. Practical patterns, code examples, and operational procedures for building the RL Stats desktop application.

---

## 1. Development Environment Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Rust | Stable (latest via rustup) | Tauri backend, TCP ingestor, SQLite |
| Node.js | >= 20 | Frontend tooling |
| pnpm | >= 9 | Package manager (preferred over npm/yarn) |
| Windows SDK | 10/11 | Required by Tauri for Windows builds |
| Git | Latest | Version control |

**Install Rust (Windows):**
```powershell
# Download from https://rustup.rs/ or use winget
winget install Rustlang.Rustup
rustup default stable
rustup component add rustfmt clippy
```

**Install Node.js + pnpm:**
```powershell
# Using corepack (comes with Node 20+)
corepack enable
corepack prepare pnpm@latest --activate
```

**Verify installation:**
```bash
rustc --version       # >= 1.78
node --version        # >= 20.0.0
pnpm --version        # >= 9.0.0
cargo tauri --version # >= 2.0.0
```

### Project Initialization

```bash
# Clone the repository
git clone https://github.com/your-org/api-rocketleague.git
cd api-rocketleague

# Install frontend dependencies
pnpm install

# Install Tauri CLI (if not already global)
pnpm add -D @tauri-apps/cli

# Run development server (starts Vite + Tauri in watch mode)
pnpm tauri dev

# Run Rust tests only
cd src-tauri && cargo test

# Run frontend tests only
pnpm test

# Run lints
pnpm lint
rustc --edition 2021 --deny warnings src-tauri/src/lib.rs
```

### IDE Recommendations

**VS Code (Recommended)**

Required extensions:
- **rust-analyzer**: Rust language server (config below)
- **Even Better TOML**: `Cargo.toml` and `tauri.conf.json` support
- **ESLint**: TypeScript/React linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Autocomplete for design tokens
- **EditorConfig**: Consistent formatting rules

`.vscode/settings.json`:
```json
{
  "rust-analyzer.check.command": "clippy",
  "rust-analyzer.check.extraArgs": ["--all-targets", "--", "-D", "warnings"],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

`.vscode/launch.json` (Tauri debug):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug Tauri",
      "cargo": {
        "args": ["build", "--manifest-path", "src-tauri/Cargo.toml", "--no-default-features"]
      },
      "preLaunchTask": "pnpm: dev"
    }
  ]
}
```

### Debugging

**Frontend**: Use the WebView devtools (`Ctrl+Shift+I` in dev mode, or right-click → Inspect).

**Backend**: Attach LLDB/GDB to the Rust process. In VS Code, use the launch config above.

**Logs**: The app uses `tracing` (Rust) and writes to:
```
%APPDATA%\rl-stats\logs\
```
Set `RUST_LOG=rl_stats=debug` before running to see verbose output.

---

## 2. Coding Standards

### Rust Standards

**Formatting**: Enforced via `rustfmt`. CI fails on diff.
```bash
cargo fmt -- --check
```

**Linting**: Clippy with warnings-as-errors in CI.
```bash
cargo clippy --all-targets --all-features -- -D warnings
```

**Error Handling**: Use `thiserror` for domain errors. Never use `unwrap()`/`expect()` in production code paths.
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("failed to parse event: {0}")]
    ParseError(String),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}
```

**Naming Conventions:**
- Files/variables/functions: `snake_case`
- Types/structs/traits/enums: `PascalCase`
- Constants/statics: `SCREAMING_SNAKE_CASE`
- Acronyms are treated as words: `XmlParser`, not `XMLParser` (except well-known ones like `Http`, `Tcp`, `Sql`)

**File Organization:**
- One module per domain concern.
- `mod.rs` re-exports public types.
- Implementation details live in sibling files.
- Keep Tauri command handlers thin (< 30 lines). Domain logic belongs in `core/`.

### TypeScript Standards

**Compiler**: Strict mode enabled. No `any` without `// @ts-expect-error` and justification.

**Naming Conventions:**
- Variables/functions: `camelCase`
- Types/interfaces/components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

**File Naming:**
- Components: `PascalCase.tsx` (e.g., `LiveDashboard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useLiveMatch.ts`)
- Utilities/stores: `kebab-case.ts` (e.g., `live-store.ts`)

**Import Ordering** (enforced via ESLint):
1. React / framework imports
2. Third-party libraries (`lucide-react`, `@tanstack/react-query`)
3. Tauri API imports (`@tauri-apps/api/*`)
4. Absolute internal imports (`@/components/*`, `@/lib/*`)
5. Relative imports (`../hooks/*`, `./utils`)
6. Type-only imports (`import type { ... }`)
7. Styles (`./globals.css`)

Example:
```typescript
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

import { Button } from '@/components/ui/button';
import { useLiveStore } from '@/stores/live-store';
import type { LiveMatchState } from '@/lib/types';

import './live-dashboard.css';
```

---

## 3. Backend Patterns (Rust)

### Tauri Command Structure

Commands must be thin orchestrators. Extract state, validate input, call domain logic, handle errors, return DTOs.

```rust
// src-tauri/src/commands/live.rs
use tauri::State;
use crate::core::session::SessionManager;
use crate::error::AppError;
use crate::models::LiveMatchState;

#[tauri::command]
pub async fn get_live_state(
    session: State<'_, SessionManager>,
) -> Result<LiveMatchState, AppError> {
    // Thin delegation: no business logic here
    session.get_current_state().await
}

#[tauri::command]
pub async fn get_connection_status(
    ingestor: State<'_, IngestorHandle>,
) -> ConnectionStatus {
    ingestor.status().await
}
```

Register commands in `lib.rs`:
```rust
pub fn run() {
    tauri::Builder::default()
        .manage(create_session_manager())
        .manage(create_connection_pool())
        .invoke_handler(tauri::generate_handler![
            commands::live::get_live_state,
            commands::live::get_connection_status,
            // ...
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Error Handling Pattern

All errors must implement `Serialize` so Tauri can send them to the frontend as JSON.

```rust
// src-tauri/src/error.rs
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
#[serde(tag = "code", content = "message")]
pub enum AppError {
    #[error("Database operation failed")]
    Database(String),
    #[error("Invalid input: {0}")]
    Validation(String),
    #[error("Resource not found")]
    NotFound,
    #[error("Internal error")]
    Internal(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        tracing::error!(%err, "database error");
        AppError::Database(err.to_string())
    }
}
```

**Frontend receives:**
```json
{
  "code": "Database",
  "message": "database error: no such table: matches"
}
```

### Async Patterns

Use `tokio` as the async runtime (bundled with Tauri). Use `spawn` for background tasks that outlive the command invocation.

```rust
use tokio::task;

// GOOD: Spawn long-running ingestor on app start
let ingestor_handle = task::spawn(async move {
    ingestor.run().await;
});

// BAD: Never block the async runtime
// std::thread::sleep(Duration::from_secs(5)); // Use tokio::time::sleep instead

// GOOD: Hold locks only for synchronous work
{
    let mut state = shared_state.lock().await;
    state.update(event);
} // lock released here before await

let result = db.query().await; // await outside lock
```

### Database Access Patterns

Use `r2d2` for connection pooling with `rusqlite`.

```rust
// src-tauri/src/core/storage/connection.rs
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn create_pool(app_handle: &AppHandle) -> Result<DbPool, AppError> {
    let app_dir = app_handle.path().app_data_dir()?;
    let db_path = app_dir.join("data.db");
    let manager = SqliteConnectionManager::file(&db_path);
    let pool = Pool::builder().max_size(5).build(manager)?;
    Ok(pool)
}
```

**Repository pattern** (parameterized queries only):
```rust
// src-tauri/src/core/storage/match_repo.rs
use rusqlite::{params, OptionalExtension};

pub struct MatchRepo {
    pool: DbPool,
}

impl MatchRepo {
    pub fn find_by_id(&self, id: i64) -> Result<Option<Match>, AppError> {
        let conn = self.pool.get()?;
        let mut stmt = conn.prepare(
            "SELECT id, match_guid, start_time, arena FROM matches WHERE id = ?1"
        )?;
        let match_row = stmt
            .query_row(params![id], |row| {
                Ok(Match {
                    id: row.get(0)?,
                    match_guid: row.get(1)?,
                    start_time: row.get(2)?,
                    arena: row.get(3)?,
                })
            })
            .optional()?;
        Ok(match_row)
    }

    pub fn insert(&self, match_data: &NewMatch) -> Result<i64, AppError> {
        let conn = self.pool.get()?;
        conn.execute(
            "INSERT INTO matches (match_guid, start_time, arena) VALUES (?1, ?2, ?3)",
            params![&match_data.match_guid, match_data.start_time, &match_data.arena],
        )?;
        Ok(conn.last_insert_rowid())
    }

    /// Use transactions for multi-table writes
    pub fn create_match_with_players(
        &self,
        new_match: &NewMatch,
        players: &[NewMatchPlayer],
    ) -> Result<i64, AppError> {
        let mut conn = self.pool.get()?;
        let tx = conn.transaction()?;

        tx.execute(
            "INSERT INTO matches (match_guid, start_time, arena) VALUES (?1, ?2, ?3)",
            params![&new_match.match_guid, new_match.start_time, &new_match.arena],
        )?;
        let match_id = tx.last_insert_rowid();

        for player in players {
            tx.execute(
                "INSERT INTO match_players (match_id, player_id, team_num, score) VALUES (?1, ?2, ?3, ?4)",
                params![match_id, player.player_id, player.team_num, player.score],
            )?;
        }

        tx.commit()?;
        Ok(match_id)
    }
}
```

**Tauri state injection:**
```rust
#[tauri::command]
pub async fn get_matches(
    pool: State<'_, DbPool>,
    filters: MatchFilters,
) -> Result<Vec<MatchSummary>, AppError> {
    let repo = MatchRepo::new(pool.inner().clone());
    repo.find_with_filters(filters)
}
```

### Event Parsing Patterns

Use `serde` with forward-compatible unknown variant handling.

```rust
// src-tauri/src/core/parser/events.rs
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(tag = "event", rename_all = "PascalCase")]
pub enum RlEvent {
    UpdateState(UpdateStateData),
    BallHit(BallHitData),
    GoalScored(GoalScoredData),
    MatchCreated(MatchRef),
    MatchEnded(MatchEndedData),
    // Fallback for unknown events — never crash on new API fields
    #[serde(other)]
    Unknown,
}
```

**Custom deserializer for ranges:**
```rust
use serde::{de, Deserialize, Deserializer};

fn deserialize_boost<'de, D>(deserializer: D) -> Result<f32, D::Error>
where
    D: Deserializer<'de>,
{
    let value = f32::deserialize(deserializer)?;
    if (0.0..=100.0).contains(&value) {
        Ok(value)
    } else {
        Err(de::Error::custom("boost must be between 0 and 100"))
    }
}

#[derive(Debug, Deserialize)]
pub struct PlayerState {
    pub name: String,
    pub team: u8,
    #[serde(deserialize_with = "deserialize_boost")]
    pub boost: f32,
    pub speed: f32,
}
```

### Logging Standards

Use `tracing` with structured fields. Never use `println!` in production code.

```rust
use tracing::{info, warn, error, debug, span, Level};

// In ingestor loop
let span = span!(Level::INFO, "match_ingestion", match_id = ?match_ref.id);
let _enter = span.enter();

info!(event_type = %event_type, "received game event");

// Errors before returning to frontend
error!(error = %err, command = "get_matches", "command failed");

// Debug for development only
debug!(raw_json = %line, "parsed event payload");
```

Configure tracing in `main.rs`:
```rust
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

tracing_subscriber::registry()
    .with(
        tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "rl_stats=info,tower_http=debug".into()),
    )
    .with(tracing_subscriber::fmt::layer().with_writer(std::io::stderr))
    .init();
```

### Testing Patterns

**Unit tests** live in the same file as the module:
```rust
// src-tauri/src/core/parser/update_state.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_update_state() {
        let json = r#"{"event":"UpdateState","game":{"time":300}}"#;
        let event: RlEvent = serde_json::from_str(json).unwrap();
        assert!(matches!(event, RlEvent::UpdateState(_)));
    }

    #[test]
    fn handles_unknown_event_gracefully() {
        let json = r#"{"event":"FutureEvent","data":123}"#;
        let event: RlEvent = serde_json::from_str(json).unwrap();
        assert!(matches!(event, RlEvent::Unknown));
    }
}
```

**Integration tests** with fixtures:
```rust
// src-tauri/tests/ingestor_test.rs
use std::fs::File;
use std::io::{BufRead, BufReader};

#[test]
fn replay_fixture_creates_correct_matches() {
    let file = File::open("tests/fixtures/match_1v1.jsonl").unwrap();
    let reader = BufReader::new(file);

    let mut parser = EventParser::new();
    for line in reader.lines() {
        let line = line.unwrap();
        parser.process_line(&line).unwrap();
    }

    let matches = parser.finalize();
    assert_eq!(matches.len(), 1);
    assert_eq!(matches[0].team_blue_score, 3);
}
```

---

## 4. Frontend Patterns (React/TS)

### Component Structure

Composition over inheritance. Every component accepts a `className` prop for style overrides (via `cn()` utility).

```tsx
// src/components/live/PlayerCard.tsx
import { cn } from '@/lib/utils';
import type { PlayerLiveState } from '@/lib/types';

interface PlayerCardProps {
  player: PlayerLiveState;
  isCurrentUser?: boolean;
  className?: string;
}

export function PlayerCard({ player, isCurrentUser, className }: PlayerCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-subtle bg-bg-tertiary p-4',
        isCurrentUser && 'border-accent-primary/20 bg-accent-primary/5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-text-primary">{player.name}</span>
        <TeamBadge team={player.team} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="Score" value={player.score} />
        <Stat label="Goals" value={player.goals} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-caption text-text-tertiary">{label}</span>
      <span className="font-mono text-lg text-text-primary">{value}</span>
    </div>
  );
}
```

### Hook Patterns

Encapsulate Tauri interactions and complex state in custom hooks.

```tsx
// src/hooks/useLiveMatch.ts
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type { LiveMatchState } from '@/lib/types';

export function useLiveMatch() {
  const [state, setState] = useState<LiveMatchState | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    // Initial fetch
    invoke<LiveMatchState>('get_live_state')
      .then(setState)
      .catch(console.error);

    // Subscribe to live events
    const unlisten = listen<LiveMatchState>('live-match-update', (event) => {
      setState(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return { state, status };
}
```

**Rules for hooks:**
- Name must start with `use`.
- Never call hooks conditionally.
- Clean up subscriptions/event listeners in `useEffect` return.
- Return typed objects, not tuples (more extensible).

### State Management (Zustand)

Use Zustand for global state. Split stores by domain.

```tsx
// src/stores/liveStore.ts
import { create } from 'zustand';
import type { LiveMatchState, GameEvent } from '@/lib/types';

interface LiveStore {
  currentMatch: LiveMatchState | null;
  events: GameEvent[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setMatch: (match: LiveMatchState | null) => void;
  addEvent: (event: GameEvent) => void;
  setConnectionStatus: (status: LiveStore['connectionStatus']) => void;
}

export const useLiveStore = create<LiveStore>((set) => ({
  currentMatch: null,
  events: [],
  connectionStatus: 'disconnected',
  setMatch: (match) => set({ currentMatch: match }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
```

**Selectors** (prevent unnecessary re-renders):
```tsx
// GOOD: Component only re-renders when connectionStatus changes
const status = useLiveStore((state) => state.connectionStatus);

// BAD: Re-renders on any store change
const { status } = useLiveStore();
```

### Data Fetching (TanStack Query)

Wrap all Tauri command calls in TanStack Query for caching, deduping, and error handling.

```tsx
// src/hooks/useMatchHistory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { MatchFilters, MatchSummary } from '@/lib/types';

const QUERY_KEYS = {
  matches: (filters: MatchFilters) => ['matches', filters] as const,
  matchDetail: (id: number) => ['match', id] as const,
};

export function useMatchHistory(filters: MatchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.matches(filters),
    queryFn: () => invoke<MatchSummary[]>('get_matches', { filters }),
    staleTime: 30_000, // 30s
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => invoke<void>('delete_match', { matchId }),
    onSuccess: () => {
      // Invalidate all match lists
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
```

### Tauri Command Invocation Patterns

Create a typed API wrapper to centralize command names and types.

```ts
// src/lib/api.ts
import { invoke } from '@tauri-apps/api/core';
import type { MatchFilters, MatchSummary, MatchDetail, AppSettings } from './types';

export const api = {
  live: {
    getState: () => invoke<LiveMatchState>('get_live_state'),
    getConnectionStatus: () => invoke<ConnectionStatus>('get_connection_status'),
  },
  history: {
    getMatches: (filters: MatchFilters) =>
      invoke<MatchSummary[]>('get_matches', { filters }),
    getDetail: (matchId: number) =>
      invoke<MatchDetail>('get_match_detail', { matchId }),
    delete: (matchId: number) => invoke<void>('delete_match', { matchId }),
  },
  settings: {
    get: () => invoke<AppSettings>('get_settings'),
    set: (settings: AppSettings) => invoke<void>('set_settings', { settings }),
  },
};
```

### Event Subscription Patterns

Use Tauri's event system for live data. Always clean up listeners.

```tsx
// src/hooks/useTauriEvent.ts
import { useEffect, useRef } from 'react';
import { listen, type EventCallback, type UnlistenFn } from '@tauri-apps/api/event';

export function useTauriEvent<T>(eventName: string, handler: EventCallback<T>) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let unlistenFn: UnlistenFn;

    const setup = async () => {
      unlistenFn = await listen<T>(eventName, (event) => {
        handlerRef.current(event);
      });
    };

    setup();

    return () => {
      unlistenFn?.();
    };
  }, [eventName]);
}
```

Usage:
```tsx
useTauriEvent<GoalScoredPayload>('goal-scored', (event) => {
  toast.success(`Goal! ${event.payload.scorerName}`);
});
```

### Form Handling

Use controlled components with Zod validation for settings and filters.

```tsx
// src/components/settings/SettingsPanel.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const settingsSchema = z.object({
  playerName: z.string().min(1).max(32),
  autoStart: z.boolean(),
  dataRetentionDays: z.number().min(7).max(365),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsPanel() {
  const { data: settings } = useSettings();
  const mutation = useUpdateSettings();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <input {...form.register('playerName')} />
      {form.formState.errors.playerName && (
        <span className="text-accent-danger">{form.formState.errors.playerName.message}</span>
      )}
      <button type="submit">Save</button>
    </form>
  );
}
```

### Error Boundaries

Wrap route-level components to catch React rendering errors.

```tsx
// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React Error Boundary caught:', error, info);
    // Future: send to crash reporting (opt-in)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-8 text-center">
            <h2 className="text-h2 text-accent-danger">Something went wrong</h2>
            <p className="mt-2 text-body text-text-secondary">
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

---

## 5. Database Patterns

### Migration Strategy

Schema changes are versioned and applied on app startup. Use a `schema_version` table to track migrations.

```rust
// src-tauri/src/core/storage/migrations.rs
use rusqlite::Connection;

const MIGRATIONS: &[(i64, &str)] = &[
    (1, r#"
        CREATE TABLE app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE TABLE matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_guid TEXT UNIQUE,
            start_time INTEGER NOT NULL,
            end_time INTEGER,
            duration_seconds INTEGER,
            arena TEXT,
            team_blue_score INTEGER DEFAULT 0,
            team_orange_score INTEGER DEFAULT 0,
            winner_team_num INTEGER,
            is_online BOOLEAN DEFAULT FALSE,
            is_overtime BOOLEAN DEFAULT FALSE,
            created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
        );
    "#),
    (2, r#"
        CREATE TABLE players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            primary_id TEXT UNIQUE,
            name TEXT NOT NULL,
            first_seen INTEGER NOT NULL,
            last_seen INTEGER NOT NULL
        );
        CREATE TABLE match_players (...);
    "#),
    // ... additional migrations
];

pub fn run_migrations(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)",
        [],
    )?;

    let current_version: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )?;

    for (version, sql) in MIGRATIONS {
        if *version > current_version {
            let tx = conn.transaction()?;
            tx.execute_batch(sql)?;
            tx.execute(
                "INSERT INTO schema_version (version) VALUES (?1)",
                params![version],
            )?;
            tx.commit()?;
            tracing::info!(version, "applied database migration");
        }
    }
    Ok(())
}
```

### Query Patterns

**Parameterized queries only.** Never concatenate user input into SQL strings.

```rust
// GOOD: Parameterized
let mut stmt = conn.prepare("SELECT * FROM matches WHERE arena = ?1 AND start_time > ?2")?;
let rows = stmt.query_map(params![arena_filter, since], |row| { ... })?;

// BAD: SQL injection vulnerability
// let sql = format!("SELECT * FROM matches WHERE arena = '{}'", arena_filter);
```

**Pagination pattern:**
```rust
pub fn find_matches_paginated(
    &self,
    limit: usize,
    offset: usize,
) -> Result<Vec<MatchSummary>, AppError> {
    let conn = self.pool.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, start_time, arena, team_blue_score, team_orange_score
         FROM matches
         ORDER BY start_time DESC
         LIMIT ?1 OFFSET ?2"
    )?;
    let rows = stmt.query_map(params![limit, offset], |row| {
        Ok(MatchSummary { ... })
    })?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}
```

### Index Strategy

Apply indexes based on query patterns defined in `ARCHITECTURE.md`:

```sql
-- History queries (sorted by date)
CREATE INDEX idx_matches_start_time ON matches(start_time DESC);

-- Guid lookups for deduplication
CREATE INDEX idx_matches_guid ON matches(match_guid);

-- Event filtering by match
CREATE INDEX idx_match_events_match ON match_events(match_id, event_type);

-- Player join performance
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_players_primary_id ON players(primary_id);

-- Snapshot time-series lookups
CREATE INDEX idx_snapshots_match_time ON state_snapshots(match_id, game_time_seconds);
```

**Rules:**
- Add indexes after schema stabilizes (not in V0.1).
- Measure with `EXPLAIN QUERY PLAN` before adding.
- Remove unused indexes that slow down writes.

### Backup and Recovery

SQLite WAL mode provides crash resilience. Implement explicit backups for user data export.

```rust
pub fn create_backup(pool: &DbPool, target_path: &Path) -> Result<(), AppError> {
    let conn = pool.get()?;
    // SQLite built-in backup
    conn.execute(
        "VACUUM INTO ?1",
        params![target_path.to_string_lossy()],
    )?;
    Ok(())
}
```

**Recovery on startup:**
```rust
// In main.rs before migrations
if let Err(e) = conn.execute("PRAGMA integrity_check", []) {
    tracing::error!("database corrupted: {}", e);
    // Prompt user to restore from backup or reset
}
```

### Data Retention

Respect `settings.dataRetentionDays`. Run cleanup on startup and periodically.

```rust
pub fn purge_old_data(pool: &DbPool, retention_days: u32) -> Result<usize, AppError> {
    let conn = pool.get()?;
    let cutoff = SystemTime::now()
        .duration_since(UNIX_EPOCH)?
        .as_millis() as i64
        - (retention_days as i64 * 86400 * 1000);

    let deleted = conn.execute(
        "DELETE FROM matches WHERE start_time < ?1",
        params![cutoff],
    )?;

    // Vacuum to reclaim space (run sparingly, it's expensive)
    conn.execute("VACUUM", [])?;

    Ok(deleted)
}
```

---

## 6. Testing Strategy

### Rust Test Structure

```
src-tauri/
├── src/
│   └── core/
│       └── parser/
│           └── mod.rs          # #[cfg(test)] blocks here
├── tests/
│   ├── fixtures/
│   │   ├── match_1v1.jsonl     # Captured event stream
│   │   └── match_3v3_ot.jsonl
│   ├── parser_tests.rs         # Integration tests
│   └── ingestor_tests.rs
```

**Unit test example:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_boost_range_validation() {
        let valid = r#"{"name":"Player","team":0,"boost":85.5,"speed":1200}"#;
        let player: PlayerState = serde_json::from_str(valid).unwrap();
        assert_eq!(player.boost, 85.5);

        let invalid = r#"{"name":"Player","team":0,"boost":150,"speed":1200}"#;
        let result: Result<PlayerState, _> = serde_json::from_str(invalid);
        assert!(result.is_err());
    }
}
```

**Integration test with fixtures:**
```rust
// tests/parser_tests.rs
use rl_stats::core::parser::EventParser;

#[test]
fn test_replay_fixture_1v1() {
    let fixture = std::fs::read_to_string("tests/fixtures/match_1v1.jsonl").unwrap();
    let parser = EventParser::new();

    for line in fixture.lines() {
        parser.process_line(line).expect("valid event");
    }

    let summary = parser.into_summary();
    assert_eq!(summary.players.len(), 2);
    assert!(summary.duration_seconds > 0);
}
```

Run with: `cargo test --all-targets`

### Frontend Test Structure (Vitest + React Testing Library)

```
src/
├── components/
│   └── live/
│       └── PlayerCard.test.tsx
├── hooks/
│   └── useLiveMatch.test.ts
├── lib/
│   └── api.test.ts
```

**Component test:**
```tsx
// src/components/live/PlayerCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';
import { describe, it, expect } from 'vitest';

describe('PlayerCard', () => {
  const mockPlayer = {
    name: 'TestPlayer',
    team: 0,
    score: 420,
    goals: 2,
    boost: 75.0,
    speed: 1400,
  };

  it('renders player name and stats', () => {
    render(<PlayerCard player={mockPlayer} />);
    expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(<PlayerCard player={mockPlayer} isCurrentUser />);
    expect(screen.getByText('TestPlayer').closest('div')).toHaveClass('bg-accent-primary/5');
  });
});
```

**Mocking Tauri API:**
```ts
// vitest.setup.ts
import { vi } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));
```

Run with: `pnpm test`

### E2E Test Structure (Playwright)

```
tests-e2e/
├── fixtures/
│   └── seeded-db/              # Pre-populated SQLite files for test scenarios
├── live-match.spec.ts
├── history.spec.ts
└── settings.spec.ts
```

**Example E2E test:**
```ts
// tests-e2e/live-match.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Live Match Flow', () => {
  test('displays waiting state when no match is active', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Waiting for match...')).toBeVisible();
  });

  test('captures and displays match from replay fixture', async ({ page }) => {
    // Seed DB via CLI helper or pre-launch state
    await page.goto('/');
    // Trigger fixture replay (via dev-only command)
    await page.evaluate(() => (window as any).__TAURI_INVOKE__('dev_replay_fixture', { name: 'match_1v1' }));

    await expect(page.getByText('Match Active')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('team-blue-score')).toHaveText('3');
  });
});
```

Run with: `pnpm exec playwright test`

### Coverage Targets

| Module | Minimum Coverage |
|--------|------------------|
| `core/parser` | 90% |
| `core/metrics` | 85% |
| `core/storage` | 80% |
| `core/session` | 75% |
| Frontend components | 70% |
| E2E critical paths | 100% (live → history → detail) |

Generate reports:
```bash
# Rust
cargo tarpaulin --out Html --target-dir target/coverage

# Frontend
pnpm vitest run --coverage
```

---

## 7. Git Workflow

### Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `main` | Production-ready code | — |
| `develop` | Integration branch for next release | — |
| `feature/` | New functionality | `feature/live-event-feed` |
| `bugfix/` | Non-critical fixes | `bugfix/connection-retry-loop` |
| `hotfix/` | Critical production fixes | `hotfix/db-lock-timeout` |
| `release/` | Release preparation | `release/v1.0.0` |
| `docs/` | Documentation only | `docs/api-examples` |

**Rules:**
- Branch from `develop` for features/bugfixes.
- Branch from `main` for hotfixes.
- Use kebab-case for descriptive names.
- Keep branches short-lived (< 1 week ideally).

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or fixing tests
- `chore`: Build process, dependencies, tooling

**Scopes:** `ingestor`, `parser`, `storage`, `metrics`, `ui`, `live`, `history`, `analytics`, `settings`, `deps`

**Examples:**
```
feat(live): add boost bar visualization to player cards

Implements a linear progress bar for boost percentage
with color transitions (green → yellow → red).

fix(storage): resolve race condition in match insert

The match insert and player association were not wrapped
in a transaction, causing orphaned match_players rows.
Closes #42
```

### PR Template

Create `.github/pull_request_template.md`:

```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows project style guidelines (`cargo fmt`, `pnpm lint`)
- [ ] Self-review completed
- [ ] Tests added/updated for new logic
- [ ] All tests pass (`cargo test`, `pnpm test`)
- [ ] No `unwrap()`/`expect()` in production paths without justification
- [ ] SQL queries use parameterization
- [ ] Changes are documented in CHANGELOG.md (if user-facing)
- [ ] Security implications considered (new deps, capabilities, network)

## Screenshots (if UI changes)

## Related Issues
Fixes #(issue)
```

### Code Review Checklist

**For Reviewers:**
- [ ] Logic correctness and edge cases handled
- [ ] Error paths covered (Rust `?` operator used correctly)
- [ ] No sensitive data logged or exposed
- [ ] Database queries are parameterized
- [ ] New dependencies are justified and audited
- [ ] Frontend components are accessible (ARIA, keyboard)
- [ ] No `any` types without `// @ts-expect-error`
- [ ] Tests exist and are meaningful

**Merge requirements:**
- At least 1 approving review
- CI passes (lint, test, build)
- Branch is up to date with `develop`
- Commit history is clean (squash fixups if needed)

---

## 8. Security Implementation Checklist

### Tauri Capability Configuration

Keep permissions minimal. Review `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/capability-schema.json",
  "identifier": "default",
  "description": "Minimal capabilities for RL Stats",
  "windows": ["main"],
  "permissions": [
    "core:app:default",
    "core:event:default",
    "core:window:default",
    "core:path:default",
    "core:fs:allow-appdata-read",
    "core:fs:allow-appdata-write",
    "core:process:allow-restart",
    "updater:default"
  ]
}
```

**Explicitly disabled:**
- `shell:default` — no arbitrary process execution
- `clipboard:default` — not needed in V1
- `global-shortcut:default` — future feature only
- `http:default` — no frontend HTTP requests

### CSP Setup

Configure in `tauri.conf.json`:

```json
{
  "app": {
    "security": {
      "csp": {
        "default-src": "'self'",
        "script-src": "'self'",
        "style-src": "'self' 'unsafe-inline'",
        "img-src": "'self' data:",
        "connect-src": "'self' https://api.github.com",
        "font-src": "'self'",
        "object-src": "'none'",
        "frame-ancestors": "'none'"
      }
    }
  }
}
```

### Input Sanitization

**Rust side:**
```rust
// Always validate and sanitize external input
pub fn sanitize_player_name(name: &str) -> String {
    name.chars()
        .filter(|c| !c.is_control())
        .take(32)
        .collect()
}

// Validate file paths (prevent path traversal)
pub fn validate_export_path(path: &str) -> Result<PathBuf, AppError> {
    let path = PathBuf::from(path);
    if path.components().any(|c| matches!(c, Component::ParentDir)) {
        return Err(AppError::Validation("invalid path".into()));
    }
    Ok(path)
}
```

**Frontend side:**
```tsx
// Sanitize display of player names (defense in depth)
function sanitizeDisplay(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
// Or use a library like DOMPurify if rendering HTML
```

### Update Signature Verification

The Tauri updater automatically verifies Ed25519 signatures. Ensure the public key is embedded:

```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDFBQkNDREUxMjM0NTY3ODkKUldTd...",
      "endpoints": [
        "https://github.com/your-org/api-rocketleague/releases/latest/download/latest.json"
      ]
    }
  }
}
```

**Release signing process:**
1. Build artifacts in CI (GitHub Actions).
2. Sign `.msi` and `.zip` with `tauri signer sign`.
3. Upload signature files alongside artifacts.
4. `latest.json` must include the signature block.

**Private key storage:**
- NEVER commit the private key.
- Store in GitHub Secrets (`TAURI_SIGNING_PRIVATE_KEY`).
- Rotate key if compromise is suspected.

### Secret Management

| Secret | Storage | Usage |
|--------|---------|-------|
| Tauri signing private key | GitHub Secrets | CI signing |
| Code signing certificate | GitHub Secrets | Windows SmartScreen |
| GitHub token (releases) | GitHub Secrets | CI release upload |

**CI workflow snippet:**
```yaml
- name: Build and sign
  env:
    TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
  run: pnpm tauri build
```

### Dependency Auditing

Run in CI on every PR:
```bash
# Rust
cargo audit

# Node
pnpm audit --audit-level moderate
```

Fail the build on moderate+ vulnerabilities.

---

## 9. Performance Guidelines

### Bundle Size Optimization

**Frontend:**
- Route-level code splitting with `React.lazy()`:
  ```tsx
  const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
  ```
- Tree-shake libraries (use ESM builds).
- Import only needed Lucide icons:
  ```tsx
  import { Trophy, BarChart3 } from 'lucide-react'; // Good
  import * as Icons from 'lucide-react'; // Bad — imports all 1000+ icons
  ```
- Analyze bundle: `pnpm exec vite-bundle-visualizer`.

**Rust:**
- Enable LTO in release builds (`Cargo.toml`):
  ```toml
  [profile.release]
  lto = true
  codegen-units = 1
  opt-level = 3
  strip = true
  ```
- Minimize dependency bloat. Prefer `serde_json` over full `reqwest` if only parsing.

### Database Query Optimization

- **Pagination**: Never fetch unbounded history. Default limit 50, max 500.
- **Covering indexes**: For frequent analytics queries, include needed columns in indexes.
- **WAL mode**: Already enabled; provides better concurrent read performance.
- **Prepared statements**: Reuse `rusqlite::Statement` in tight loops.
- **Lazy aggregation**: Compute daily rollups on-demand or in background, not on every query.

```rust
// BAD: Fetching all matches into memory
let all = conn.prepare("SELECT * FROM matches")?.query_map([], ...)?;

// GOOD: Paginated, projected columns only
let stmt = conn.prepare(
    "SELECT id, start_time, arena, team_blue_score, team_orange_score
     FROM matches
     WHERE start_time > ?1
     ORDER BY start_time DESC
     LIMIT ?2 OFFSET ?3"
)?;
```

### React Rendering Optimization

- **Memoize expensive computations:**
  ```tsx
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.timestamp - a.timestamp),
    [events]
  );
  ```

- **Memoize child components:**
  ```tsx
  const PlayerCardMemo = memo(PlayerCard, (prev, next) => {
    return prev.player.id === next.player.id && prev.player.score === next.player.score;
  });
  ```

- **Virtualize long lists** (history, event feeds):
  ```tsx
  import { Virtuoso } from 'react-virtuoso';

  <Virtuoso
    data={matches}
    itemContent={(index, match) => <MatchCard match={match} />}
  />
  ```

- **Avoid inline objects/functions in render:**
  ```tsx
  // BAD: New reference every render
  <Chart options={{ responsive: true }} />

  // GOOD: Stable reference
  const chartOptions = useMemo(() => ({ responsive: true }), []);
  <Chart options={chartOptions} />
  ```

### Memory Management

**Rust:**
- Drop large buffers after parsing (use `std::mem::drop` explicitly if needed).
- Limit snapshot retention (default 30 days).
- Use `Arc<str>` instead of `String` for immutable shared data (player names).

**Frontend:**
- Unsubscribe from Tauri events on unmount.
- Dispose chart instances (`chart.destroy()`).
- Clear large arrays in Zustand when switching pages (e.g., leave live page → clear event feed).

---

## 10. Common Pitfalls & Solutions

### Tauri-Specific Gotchas

**Window freezes on heavy sync work**
- **Problem**: Running CPU-intensive work in a Tauri command blocks the main thread.
- **Solution**: Spawn a Tokio task for heavy work. Use `tokio::task::spawn_blocking` for CPU-bound tasks.
  ```rust
  #[tauri::command]
  async fn export_large_dataset() -> Result<(), AppError> {
      tokio::task::spawn_blocking(|| {
          // heavy CSV generation
      }).await??;
      Ok(())
  }
  ```

**Frontend cannot access filesystem directly**
- **Problem**: `fs.readFile` from frontend throws CSP or permission error.
- **Solution**: All file access must go through Rust commands. Never use Node polyfills in Vite.

**State not available in commands**
- **Problem**: `State<'_, T>` fails to extract.
- **Solution**: Ensure `.manage(instance)` is called on the Tauri builder before `.invoke_handler()`.

### Rust Async Gotchas

**Holding MutexGuard across await points**
- **Problem**: Deadlocks or compile errors with standard `std::sync::Mutex`.
- **Solution**: Use `tokio::sync::Mutex` for async contexts, or scope the lock:
  ```rust
  {
      let guard = state.lock().await;
      guard.do_sync_work();
  }
  async_operation().await;
  ```

**Blocking the async runtime**
- **Problem**: `std::thread::sleep` or heavy CPU work in async fn pauses all tasks on that thread.
- **Solution**: Use `tokio::time::sleep` for delays. Use `spawn_blocking` for CPU work.

** forgetting to await spawned tasks**
- **Problem**: `task::spawn(...)` returns a JoinHandle. If not awaited, errors are silently dropped.
- **Solution**: Either `.await` the handle or attach a log-on-error wrapper:
  ```rust
  tokio::spawn(async move {
      if let Err(e) = task().await {
          tracing::error!(error = %e, "background task failed");
      }
  });
  ```

### React + Tauri Integration Issues

**Event listener memory leaks**
- **Problem**: Multiple `listen()` calls without cleanup cause duplicate handlers.
- **Solution**: Always clean up in `useEffect`:
  ```tsx
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen('event', handler).then((u) => { unlisten = u; });
    return () => unlisten?.();
  }, []);
  ```

**Calling invoke during render**
- **Problem**: `invoke()` in render phase causes infinite loops or race conditions.
- **Solution**: Call commands inside `useEffect` or event handlers only.

**State desync between Zustand and TanStack Query**
- **Problem**: Mutating Zustand store while Query has stale cache.
- **Solution**: Use Query as source of truth for server state. Zustand only for client/UI state. Invalidate queries after mutations.

### SQLite Concurrency

**"database is locked" errors**
- **Problem**: Multiple threads/processes writing to the same SQLite file without WAL mode.
- **Solution**: Ensure WAL mode is enabled:
  ```rust
  conn.execute("PRAGMA journal_mode = WAL", [])?;
  ```
  Also, keep transactions short. Do not hold a transaction open while awaiting I/O.

**Connection pool exhaustion**
- **Problem**: Too many concurrent requests, all waiting for a connection.
- **Solution**: Increase pool size (`Pool::builder().max_size(10)`) or reduce command concurrency. Monitor with `tracing`:
  ```rust
  let start = Instant::now();
  let conn = self.pool.get()?;
  tracing::debug!(wait_ms = start.elapsed().as_millis(), "acquired db connection");
  ```

**Long-running reads blocking writes**
- **Problem**: A large analytics query holds a read lock, preventing match inserts.
- **Solution**: Use `PRAGMA busy_timeout = 5000;` to let writes wait gracefully. Split analytics to read replicas (or just accept brief waits for a desktop app).

---

*End of Implementation Guide. Keep this document updated as patterns evolve.*






