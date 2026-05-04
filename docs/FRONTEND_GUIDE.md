# RL Stats — Frontend Development Guide

> The definitive guide for frontend developers working on the RL Stats desktop application.
> **Stack**: Tauri 2 + React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Zustand + TanStack Query

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Component Architecture](#2-component-architecture)
3. [Styling Guidelines](#3-styling-guidelines)
4. [State Management](#4-state-management)
5. [Tauri Integration](#5-tauri-integration)
6. [Data Fetching Patterns](#6-data-fetching-patterns)
7. [Routing](#7-routing)
8. [Forms & Inputs](#8-forms--inputs)
9. [Charts & Visualization](#9-charts--visualization)
10. [Testing](#10-testing)
11. [Performance](#11-performance)
12. [Accessibility](#12-accessibility)
13. [Common Patterns](#13-common-patterns)
14. [Anti-Patterns to Avoid](#14-anti-patterns-to-avoid)

---

## 1. Project Structure

### Exact Folder Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (DO NOT MODIFY)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   ├── atoms/                 # Atomic design: smallest building blocks
│   │   ├── StatValue.tsx
│   │   ├── TeamBadge.tsx
│   │   ├── LivePulse.tsx
│   │   └── PlayerAvatar.tsx
│   ├── molecules/             # Groups of atoms
│   │   ├── PlayerCard.tsx
│   │   ├── MatchScore.tsx
│   │   ├── EventFeedItem.tsx
│   │   └── FilterPill.tsx
│   ├── organisms/             # Complex UI sections
│   │   ├── TeamPanel.tsx
│   │   ├── EventFeed.tsx
│   │   ├── MatchList.tsx
│   │   └── StatsGrid.tsx
│   ├── layout/                # Shell/layout components
│   │   ├── Sidebar.tsx
│   │   ├── AppShell.tsx
│   │   └── Header.tsx
│   ├── live/
│   │   ├── LiveDashboard.tsx
│   │   ├── MatchTimer.tsx
│   │   └── ConnectionStatus.tsx
│   ├── history/
│   │   ├── MatchCard.tsx
│   │   └── FilterBar.tsx
│   ├── match-detail/
│   │   ├── MatchHeader.tsx
│   │   ├── ScoreTimeline.tsx
│   │   ├── PlayerStatsTable.tsx
│   │   └── GoalDetail.tsx
│   ├── analytics/
│   │   ├── PerformanceChart.tsx
│   │   └── StreakCard.tsx
│   └── settings/
│       ├── SettingsPanel.tsx
│       ├── IniHelper.tsx
│       └── DataManagement.tsx
├── pages/
│   ├── LivePage.tsx
│   ├── HistoryPage.tsx
│   ├── MatchDetailPage.tsx
│   ├── AnalyticsPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useLiveMatch.ts
│   ├── useMatchHistory.ts
│   ├── useAnalytics.ts
│   ├── useSettings.ts
│   └── useTauriEvent.ts
├── stores/
│   ├── liveStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── lib/
│   ├── api.ts                 # Tauri command wrappers
│   ├── types.ts               # Shared TypeScript types
│   ├── constants.ts           # App constants
│   ├── utils.ts               # Utility functions
│   └── queries.ts             # TanStack Query definitions
├── styles/
│   └── globals.css            # Tailwind imports + custom CSS
└── main.tsx                   # Entry point
```

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `PlayerCard.tsx` |
| Hooks | camelCase with `use` prefix | `useLiveMatch.ts` |
| Stores | camelCase with `Store` suffix | `liveStore.ts` |
| Utilities | camelCase | `formatTime.ts` |
| Types/Interfaces | PascalCase | `MatchSummary.ts` |
| Constants | UPPER_SNAKE_CASE in `constants.ts` | `MAX_EVENT_FEED_ITEMS` |
| Test files | Same name + `.test.tsx` | `PlayerCard.test.tsx` |
| Barrel exports | `index.ts` in folder | `components/atoms/index.ts` |

### Barrel Exports Pattern

Every component folder must have an `index.ts` barrel export:

```typescript
// src/components/atoms/index.ts
export { StatValue } from './StatValue';
export { TeamBadge } from './TeamBadge';
export { LivePulse } from './LivePulse';
export { PlayerAvatar } from './PlayerAvatar';
```

Pages and hooks should also use barrel exports where it improves developer experience:

```typescript
// src/hooks/index.ts
export { useLiveMatch } from './useLiveMatch';
export { useMatchHistory } from './useMatchHistory';
```

**Rule**: Only export the public API. Keep internal helper components co-located but unexported from the barrel.

---

## 2. Component Architecture

### Atomic Design Methodology

We follow Brad Frost's Atomic Design with pragmatic adjustments for a desktop app:

**Atoms** — smallest indivisible UI elements:
- `StatValue`, `TeamBadge`, `LivePulse`, `PlayerAvatar`
- No business logic, only presentational props

**Molecules** — groups of atoms with simple logic:
- `PlayerCard` (avatar + name + stats)
- `MatchScore` (team badges + score numbers)
- `EventFeedItem` (icon + message + timestamp)

**Organisms** — complex sections with state and side effects:
- `TeamPanel` (list of PlayerCards + team stats)
- `EventFeed` (scrollable list with auto-scroll logic)
- `StatsGrid` (multiple StatValues with layout)

**Templates** — page-level layout structure:
- `AppShell` (sidebar + main content area)
- `DashboardLayout` (header + grid of panels)

**Pages** — route-level components:
- `LivePage`, `HistoryPage`, `AnalyticsPage`

### Component File Structure

Each component lives in its own folder with these files:

```
PlayerCard/
├── PlayerCard.tsx           # Main component
├── PlayerCard.test.tsx      # Unit tests
├── PlayerCard.types.ts      # Props and related types (optional for complex cases)
└── index.ts                 # Barrel export
```

For simple components, co-locate types in the `.tsx` file. Extract to `.types.ts` only when:
- The type is shared across multiple components
- The props interface exceeds ~20 lines
- The component has complex generic types

### Props Interface Naming

Always name props interfaces with the component name + `Props`:

```typescript
interface PlayerCardProps {
  player: PlayerLiveState;
  isCurrentUser?: boolean;
  showBoost?: boolean;
  onClick?: (playerId: string) => void;
}

export function PlayerCard({ player, isCurrentUser, showBoost = true, onClick }: PlayerCardProps) {
  // ...
}
```

For components with `asChild` or polymorphic behavior, extend from `React.ComponentPropsWithoutRef`:

```typescript
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}
```

### Composition vs Configuration

**Prefer composition** for components with variable content:

```tsx
// Good — composition
<MatchCard>
  <MatchCard.Header>
    <TeamBadge team="blue" />
    <MatchScore blue={3} orange={2} />
  </MatchCard.Header>
  <MatchCard.Body>
    <PlayerList players={players} />
  </MatchCard.Body>
</MatchCard>

// Avoid — excessive configuration props
<MatchCard
  headerLeft={<TeamBadge team="blue" />}
  headerCenter={<MatchScore blue={3} orange={2} />}
  bodyContent={<PlayerList players={players} />}
/>
```

**Use configuration** for highly standardized components:

```tsx
// Good — configuration for standardized UI
<Button variant="primary" size="sm" isLoading={isSaving}>
  Save Settings
</Button>

<Badge status={match.result} />
```

### Container/Presentational Pattern Guidance

Use this pattern sparingly. In modern React with hooks, most "containers" become custom hooks:

```typescript
// Instead of a LiveDashboardContainer component:
function LivePage() {
  // Container logic in the hook
  const { match, players, events, status } = useLiveMatch();

  // Presentational components render the data
  return (
    <AppShell>
      <LiveDashboard>
        <ConnectionStatus status={status} />
        <TeamPanel team="blue" players={players.filter(p => p.team === 0)} />
        <TeamPanel team="orange" players={players.filter(p => p.team === 1)} />
        <EventFeed events={events} />
      </LiveDashboard>
    </AppShell>
  );
}
```

**When to separate**: If a component exceeds ~200 lines or mixes complex data fetching with intricate UI logic, extract the data logic into a hook and keep the component presentational.

---

## 3. Styling Guidelines

### Tailwind CSS v4 Usage Rules

**Use utility classes for 95% of styling**. Avoid inline styles entirely.

```tsx
// Good
<div className="flex items-center gap-3 rounded-lg bg-tertiary p-4">

// Avoid
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
```

**When to use arbitrary values** (`[]` syntax):

```tsx
// Acceptable — one-off values not in design system
<div className="w-[68px]">

// Better — extend theme if reused
// In tailwind.config.js: spacing: { 17: '68px' }
<div className="w-17">
```

**Rule of thumb**: If you use an arbitrary value more than twice, add it to the theme or as a CSS variable.

**When to extend `globals.css` vs Tailwind config**:

- Use `@theme` in `globals.css` for design tokens (colors, spacing, fonts)
- Use Tailwind config only for plugins and complex customizations

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background-primary: #0A0E17;
  --color-background-secondary: #111827;
  --color-background-tertiary: #1A2235;
  --color-surface-hover: #1E293B;
  
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-tertiary: #64748B;
  
  --color-accent-primary: #3B82F6;
  --color-accent-secondary: #10B981;
  --color-accent-danger: #EF4444;
  --color-accent-warning: #F59E0B;
  --color-accent-info: #06B6D4;
  
  --color-team-blue: #3B82F6;
  --color-team-orange: #F97316;
  
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### CSS Organization

1. **Tailwind utilities first** in className
2. **Custom classes last** (for complex animations or states)
3. **Group related utilities** with `cn()` helper

```tsx
import { cn } from '@/lib/utils';

function Card({ className, children }: CardProps) {
  return (
    <div className={cn(
      // Base styles
      "rounded-lg border border-border-subtle bg-background-tertiary p-4",
      // Interactive states
      "transition-all duration-150 ease-out",
      "hover:border-border-strong hover:shadow-level-2",
      // Custom overrides
      className
    )}>
      {children}
    </div>
  );
}
```

### Dark Theme Implementation

The app is **dark-first**. Dark mode is the default; light mode is secondary if implemented.

```css
/* globals.css */
@theme {
  /* All colors are defined for dark mode by default */
}

@media (prefers-color-scheme: light) {
  :root {
    /* Light mode overrides — only if we support light mode */
  }
}
```

Use CSS variables for theme-aware values:

```tsx
// Components reference the theme variables directly
<div className="bg-background-primary text-text-primary">
```

**Theme toggle** (if implemented):

```typescript
// stores/uiStore.ts
interface UIState {
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    { name: 'ui-store' }
  )
);
```

### Responsive Design in Desktop Context

Since this is a desktop app, "responsive" means window resize handling:

```tsx
// Use Tailwind breakpoints for window size changes
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
```

**Key breakpoints**:
- `< 768px`: Single column, icon-only sidebar, stacked cards
- `768px - 1024px`: Collapsed sidebar (64px), 2-column layouts
- `> 1024px`: Full sidebar (200px), multi-column, side-by-side panels

**Container queries** for card-level responsiveness:

```tsx
<div className="@container">
  <div className="@lg:grid-cols-2 grid grid-cols-1">
```

### Animation Guidelines

**Use CSS transitions** for simple state changes:

```tsx
<button className="transition-all duration-150 ease-out active:scale-[0.98]">
```

**Use Framer Motion** for complex orchestrated animations:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Page transitions
<AnimatePresence mode="wait">
  <motion.div
    key={page}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>

// Score change animation
<motion.span
  key={score}
  initial={{ scale: 1.2, color: '#3B82F6' }}
  animate={{ scale: 1, color: '#F8FAFC' }}
  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
>
  {score}
</motion.span>

// Event feed entry
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

**Performance rule**: Never animate `width`, `height`, `top`, `left`. Use `transform` and `opacity` only.

**Reduced motion support**:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }}
>
```

### shadcn/ui Customization Rules

**DO NOT modify files in `components/ui/` directly.** These are managed by the shadcn CLI.

Instead, wrap and extend:

```tsx
// src/components/atoms/Button.tsx
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof ShadcnButton> {
  isLoading?: boolean;
}

export function Button({ isLoading, children, className, ...props }: ButtonProps) {
  return (
    <ShadcnButton
      className={cn("active:scale-[0.98] transition-transform", className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </ShadcnButton>
  );
}
```

**Theme customization**: Use the `@theme` block in `globals.css` to override shadcn's default CSS variables.

---

## 4. State Management

### Zustand Store Patterns

Create stores with the `.ts` suffix and use the `create` function with TypeScript:

```typescript
// stores/liveStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface LiveState {
  currentMatch: Match | null;
  players: PlayerLiveState[];
  events: LiveEvent[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  
  // Actions
  setMatch: (match: Match | null) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerLiveState>) => void;
  addEvent: (event: LiveEvent) => void;
  setConnectionStatus: (status: LiveState['connectionStatus']) => void;
  reset: () => void;
}

export const useLiveStore = create<LiveState>()(
  immer(
    subscribeWithSelector((set) => ({
      currentMatch: null,
      players: [],
      events: [],
      connectionStatus: 'disconnected',
      
      setMatch: (match) => set({ currentMatch: match }),
      
      updatePlayer: (playerId, updates) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          if (player) Object.assign(player, updates);
        }),
      
      addEvent: (event) =>
        set((state) => {
          state.events.unshift(event);
          // Keep only last 100 events
          if (state.events.length > 100) state.events.pop();
        }),
      
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      
      reset: () => set({ currentMatch: null, players: [], events: [] }),
    }))
  )
);
```

**Selectors**: Always use selectors to prevent unnecessary re-renders:

```tsx
// Good — component only re-renders when connectionStatus changes
const status = useLiveStore((state) => state.connectionStatus);

// Avoid — re-renders on any store change
const { connectionStatus } = useLiveStore();
```

**Derived state** with `subscribeWithSelector` for computed values:

```typescript
// Create selectors outside components
export const selectBlueTeamPlayers = (state: LiveState) =>
  state.players.filter((p) => p.team === 0);

export const selectOrangeTeamPlayers = (state: LiveState) =>
  state.players.filter((p) => p.team === 1);

// Use in component
const bluePlayers = useLiveStore(selectBlueTeamPlayers);
```

### When to Use Global vs Local State

| Use Global (Zustand) | Use Local (useState/useReducer) |
|---------------------|--------------------------------|
| Current match data | Form input values |
| Connection status | Modal open/close |
| App settings | Dropdown menu state |
| Player filtering/sorting (shared) | Hover states |
| Theme/sidebar state | Animation triggers |
| Toast notifications | Local validation errors |

### TanStack Query Patterns for Tauri Commands

Treat Tauri commands as your "server" — use TanStack Query for all data fetching:

```typescript
// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

// Query keys as constants
export const queryKeys = {
  matches: (filters: MatchFilters) => ['matches', filters] as const,
  matchDetail: (id: number) => ['match', id] as const,
  analytics: (period: AnalyticsPeriod) => ['analytics', period] as const,
  settings: ['settings'] as const,
  connectionStatus: ['connectionStatus'] as const,
};

// History query
export function useMatches(filters: MatchFilters) {
  return useQuery({
    queryKey: queryKeys.matches(filters),
    queryFn: async () => {
      return invoke<MatchSummary[]>('get_matches', { filters });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Match detail query
export function useMatchDetail(matchId: number) {
  return useQuery({
    queryKey: queryKeys.matchDetail(matchId),
    queryFn: async () => {
      return invoke<MatchDetail>('get_match_detail', { matchId });
    },
    enabled: matchId > 0,
  });
}

// Settings with mutation
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      return invoke<AppSettings>('get_settings');
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      return invoke<void>('set_settings', { settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
```

### Optimistic Updates

```typescript
export function useDeleteMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (matchId: number) => {
      return invoke<void>('delete_match', { matchId });
    },
    onMutate: async (matchId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['matches'] });
      
      // Snapshot previous value
      const previousMatches = queryClient.getQueryData<MatchSummary[]>(['matches']);
      
      // Optimistically update
      queryClient.setQueryData(['matches'], (old: MatchSummary[] | undefined) =>
        old?.filter((m) => m.id !== matchId)
      );
      
      return { previousMatches };
    },
    onError: (_err, _matchId, context) => {
      // Rollback on error
      queryClient.setQueryData(['matches'], context?.previousMatches);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
```

### State Normalization

For complex relational data (players, matches, events), normalize in Zustand:

```typescript
interface NormalizedLiveState {
  matches: Record<string, Match>;
  players: Record<string, Player>;
  events: Record<string, LiveEvent>;
  currentMatchId: string | null;
}

// Access via selector
export const selectCurrentMatch = (state: NormalizedLiveState) =>
  state.currentMatchId ? state.matches[state.currentMatchId] : null;
```

For simpler cases (like our live match with few players), denormalized arrays are acceptable.

---

## 5. Tauri Integration

### How to Call Tauri Commands from React

Always wrap `invoke` in typed helper functions:

```typescript
// lib/api.ts
import { invoke } from '@tauri-apps/api/core';

export async function getMatches(filters: MatchFilters): Promise<MatchSummary[]> {
  return invoke('get_matches', { filters });
}

export async function getMatchDetail(matchId: number): Promise<MatchDetail> {
  return invoke('get_match_detail', { matchId });
}

export async function getAnalytics(period: AnalyticsPeriod): Promise<AnalyticsData> {
  return invoke('get_analytics', { period });
}

export async function getSettings(): Promise<AppSettings> {
  return invoke('get_settings');
}

export async function setSettings(settings: AppSettings): Promise<void> {
  return invoke('set_settings', { settings });
}

export async function exportData(path: string): Promise<void> {
  return invoke('export_data', { path });
}

export async function importData(path: string): Promise<void> {
  return invoke('import_data', { path });
}
```

### How to Listen to Tauri Events

Use a custom hook for event listening:

```typescript
// hooks/useTauriEvent.ts
import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export function useTauriEvent<T>(
  eventName: string,
  handler: (event: T) => void
) {
  useEffect(() => {
    let unlisten: UnlistenFn;
    
    const setupListener = async () => {
      unlisten = await listen<T>(eventName, (event) => {
        handler(event.payload);
      });
    };
    
    setupListener();
    
    return () => {
      unlisten?.();
    };
  }, [eventName, handler]);
}
```

Usage:

```tsx
// hooks/useLiveMatch.ts
import { useTauriEvent } from './useTauriEvent';
import { useLiveStore } from '@/stores/liveStore';

export function useLiveMatch() {
  const addEvent = useLiveStore((state) => state.addEvent);
  const updatePlayer = useLiveStore((state) => state.updatePlayer);
  const setConnectionStatus = useLiveStore((state) => state.setConnectionStatus);
  
  useTauriEvent<LiveEvent>('live:event', (event) => {
    addEvent(event);
  });
  
  useTauriEvent<PlayerUpdate>('live:player_update', (update) => {
    updatePlayer(update.playerId, update.data);
  });
  
  useTauriEvent<ConnectionStatus>('live:connection', (status) => {
    setConnectionStatus(status);
  });
  
  // ...
}
```

### Type Safety Between Rust and TypeScript

**Define TypeScript types to mirror Rust structs**:

```typescript
// lib/types.ts

// Mirror of Rust: ConnectionStatus
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

// Mirror of Rust: MatchSummary
export interface MatchSummary {
  id: number;
  matchGuid: string | null;
  startTime: number;
  endTime: number | null;
  durationSeconds: number | null;
  arena: string | null;
  teamBlueScore: number;
  teamOrangeScore: number;
  winnerTeamNum: number | null;
  isOnline: boolean;
  isOvertime: boolean;
}

// Mirror of Rust: PlayerLiveState
export interface PlayerLiveState {
  id: string;
  name: string;
  team: 0 | 1;
  score: number;
  goals: number;
  shots: number;
  assists: number;
  saves: number;
  demos: number;
  boostAmount: number;
  speed: number;
}

// Use camelCase in TypeScript even if Rust uses snake_case
// The serde rename attribute in Rust handles the mapping
```

**Rust side** (for reference):

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchSummary {
    pub id: i64,
    pub match_guid: Option<String>,
    pub start_time: i64,
    // ...
}
```

### Error Handling for Command Failures

Create a typed error handler:

```typescript
// lib/errors.ts
export interface TauriError {
  message: string;
  code?: string;
}

export function isTauriError(error: unknown): error is TauriError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function getErrorMessage(error: unknown): string {
  if (isTauriError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
```

Use in components:

```tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';

function ExportButton() {
  const [error, setError] = useState<string | null>(null);
  
  const exportMutation = useMutation({
    mutationFn: exportData,
    onError: (err) => setError(getErrorMessage(err)),
    onSuccess: () => setError(null),
  });
  
  return (
    <div>
      <Button
        onClick={() => exportMutation.mutate('/path/to/export.json')}
        isLoading={exportMutation.isPending}
      >
        Export Data
      </Button>
      {error && <p className="text-accent-danger text-sm mt-2">{error}</p>}
    </div>
  );
}
```

### File System Access Patterns

Always use Tauri's dialog and fs APIs — never use native browser APIs for file access:

```typescript
// lib/fs.ts
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export async function selectExportPath(): Promise<string | null> {
  const path = await save({
    filters: [{ name: 'JSON', extensions: ['json'] }],
    defaultPath: 'rl-stats-backup.json',
  });
  return path;
}

export async function selectImportPath(): Promise<string | null> {
  const path = await open({
    filters: [{ name: 'JSON', extensions: ['json'] }],
    multiple: false,
  });
  return path;
}

export async function readBackupFile(path: string): Promise<string> {
  return readTextFile(path);
}

export async function writeBackupFile(path: string, data: string): Promise<void> {
  return writeTextFile(path, data);
}
```

---

## 6. Data Fetching Patterns

### Query Keys Structure

Use hierarchical, typed query keys:

```typescript
export const queryKeys = {
  all: ['rl-stats'] as const,
  matches: () => [...queryKeys.all, 'matches'] as const,
  match: (id: number) => [...queryKeys.matches(), 'detail', id] as const,
  analytics: () => [...queryKeys.all, 'analytics'] as const,
  rollups: (period: AnalyticsPeriod) => [...queryKeys.analytics(), 'rollups', period] as const,
  settings: () => [...queryKeys.all, 'settings'] as const,
  live: () => [...queryKeys.all, 'live'] as const,
};
```

### Caching Strategy

```typescript
// Default query client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute
      gcTime: 10 * 60 * 1000,      // 10 minutes (was cacheTime in v4)
      retry: 2,
      refetchOnWindowFocus: false, // Desktop app — don't refocus refetch
    },
  },
});
```

**Specific stale times**:
- Settings: `Infinity` (rarely change, invalidate manually)
- Match history: `5 * 60 * 1000` (5 minutes)
- Match detail: `10 * 60 * 1000` (10 minutes)
- Analytics: `5 * 60 * 1000` (5 minutes)
- Live data: `0` (always fresh, but use events for real-time)

### Pagination/Infinite Scroll for History

```typescript
// lib/queries.ts
export function useMatchHistory(filters: MatchFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.matches(),
    queryFn: async ({ pageParam = 0 }) => {
      return invoke<MatchSummary[]>('get_matches', {
        filters: { ...filters, offset: pageParam * 20, limit: 20 },
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
}

// In component
function HistoryPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMatchHistory(filters);
  
  const matches = data?.pages.flatMap((page) => page) ?? [];
  
  return (
    <div>
      <MatchList matches={matches} />
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          isLoading={isFetchingNextPage}
        >
          Load More
        </Button>
      )}
    </div>
  );
}
```

**Virtualized list** for large history:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualMatchList({ matches }: { matches: MatchSummary[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MatchCard match={matches[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Real-Time Updates (Live Match)

For live data, prefer **Tauri events** over polling:

```tsx
// pages/LivePage.tsx
function LivePage() {
  const { match, players, events, status } = useLiveMatch();
  
  return (
    <AppShell>
      <ConnectionStatus status={status} />
      {match ? (
        <LiveDashboard match={match} players={players} events={events} />
      ) : (
        <EmptyState
          icon={<Radio size={48} />}
          title="Waiting for match..."
          description="Start a match in Rocket League to see live data."
        />
      )}
    </AppShell>
  );
}
```

The `useLiveMatch` hook subscribes to Tauri events and updates Zustand state — no polling needed.

### Loading and Error States

```tsx
function HistoryPage() {
  const { data, isLoading, isError, error, refetch } = useMatches(filters);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <ErrorState
        title="Failed to load matches"
        message={getErrorMessage(error)}
        onRetry={refetch}
      />
    );
  }
  
  if (!data?.length) {
    return (
      <EmptyState
        icon={<Gamepad2 size={48} />}
        title="No matches captured yet"
        description="Start Rocket League and play a match. We'll automatically capture your data."
        action={<Button onClick={() => navigate('/settings')}>How to enable Stats API</Button>}
      />
    );
  }
  
  return <MatchList matches={data} />;
}
```

---

## 7. Routing

### Page Structure

We use a simple route-based page structure with React Router or TanStack Router:

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LivePage } from '@/pages/LivePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { MatchDetailPage } from '@/pages/MatchDetailPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LivePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:matchId', element: <MatchDetailPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
```

### Navigation Patterns

```tsx
// components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Radio, List, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Live Match', icon: Radio },
  { path: '/history', label: 'History', icon: List },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
              isActive
                ? "bg-accent-primary/10 text-accent-primary border-l-3 border-accent-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )
          }
        >
          <item.icon size={20} />
          <span className="text-sm font-medium">{item.label}</span>
          {item.path === '/' && <LivePulse />}
        </NavLink>
      ))}
    </nav>
  );
}
```

### Deep Linking

For desktop apps, deep linking opens specific views:

```tsx
// In Tauri, handle deep links in Rust, then navigate in React:
useTauriEvent<string>('deep-link:open', (url) => {
  const matchId = extractMatchIdFromUrl(url);
  if (matchId) {
    navigate(`/history/${matchId}`);
  }
});
```

### Route Guards

```tsx
// components/layout/RouteGuard.tsx
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  requireSetup?: boolean;
}

export function RouteGuard({ children, requireSetup }: RouteGuardProps) {
  const { data: settings } = useSettings();
  
  if (requireSetup && !settings?.rlPath) {
    return <Navigate to="/settings" replace />;
  }
  
  return <>{children}</>;
}
```

---

## 8. Forms & Inputs

### Form Handling Library Recommendation

Use **React Hook Form** with **Zod** for validation:

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

### Validation Patterns

```tsx
// lib/validation.ts
import { z } from 'zod';

export const settingsSchema = z.object({
  playerName: z.string().min(1, 'Player name is required').max(32),
  autoStart: z.boolean(),
  dataRetentionDays: z.number().min(1).max(365),
  enableEstimatedMetrics: z.boolean(),
  theme: z.enum(['dark', 'light', 'system']),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
```

### Form Implementation

```tsx
// components/settings/SettingsForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema, SettingsFormData } from '@/lib/validation';
import { useSettings, useUpdateSettings } from '@/lib/queries';

export function SettingsForm() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings ?? {},
  });
  
  // Reset form when settings load
  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);
  
  const onSubmit = (data: SettingsFormData) => {
    updateSettings.mutate(data, {
      onSuccess: () => {
        toast.success('Settings saved');
        reset(data); // Reset dirty state
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Player Name
        </label>
        <Input
          {...register('playerName')}
          placeholder="Your in-game name"
          error={errors.playerName?.message}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Data Retention (days)
        </label>
        <Input
          type="number"
          {...register('dataRetentionDays', { valueAsNumber: true })}
          error={errors.dataRetentionDays?.message}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Switch {...register('autoStart')} />
        <label className="text-sm text-text-secondary">
          Auto-start with Windows
        </label>
      </div>
      
      <Button type="submit" disabled={!isDirty || updateSettings.isPending}>
        Save Settings
      </Button>
    </form>
  );
}
```

### Error Display

```tsx
// components/ui/Input.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-md border bg-background-secondary px-3 py-2 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary",
            "transition-colors",
            error
              ? "border-accent-danger focus:border-accent-danger focus:ring-accent-danger/50"
              : "border-border-subtle",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-accent-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Auto-Save Patterns

```tsx
// hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

export function useAutoSave<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  onSave: (data: T) => void,
  delay = 1000
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        if (form.formState.isDirty && form.formState.isValid) {
          onSave(value as T);
          form.reset(value as T); // Reset dirty state after save
        }
      }, delay);
    });
    
    return () => subscription.unsubscribe();
  }, [form, onSave, delay]);
}
```

---

## 9. Charts & Visualization

### Chart Component Patterns

Use **Recharts** for standard charts, **ECharts** for complex custom visualizations:

```bash
pnpm add recharts echarts echarts-for-react
```

**Recharts for line/bar charts**:

```tsx
// components/analytics/PerformanceChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useMemo } from 'react';

interface PerformanceChartProps {
  data: { date: string; score: number; winRate: number }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => data, [data]);
  
  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F8FAFC' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Data Transformation for Charts

Transform data close to the chart component, not in the global store:

```typescript
// lib/chart-utils.ts
export function transformMatchHistoryForChart(
  matches: MatchSummary[]
): ChartDataPoint[] {
  return matches.map((match) => ({
    date: formatDate(match.startTime),
    score: match.teamBlueScore + match.teamOrangeScore,
    result: match.winnerTeamNum === 0 ? 1 : -1,
    duration: match.durationSeconds ?? 0,
  }));
}

export function transformPlayerStatsForRadar(
  stats: PlayerStats
): RadarDataPoint[] {
  return [
    { subject: 'Goals', value: normalize(stats.goals, 5), fullMark: 100 },
    { subject: 'Assists', value: normalize(stats.assists, 3), fullMark: 100 },
    { subject: 'Saves', value: normalize(stats.saves, 4), fullMark: 100 },
    { subject: 'Shots', value: normalize(stats.shots, 6), fullMark: 100 },
    { subject: 'Demos', value: normalize(stats.demos, 2), fullMark: 100 },
  ];
}
```

### Performance (Memoization)

```tsx
import { memo, useMemo } from 'react';

export const PerformanceChart = memo(function PerformanceChart({
  data,
}: PerformanceChartProps) {
  // Memoize expensive computations
  const chartData = useMemo(() => processData(data), [data]);
  const domain = useMemo(() => calculateDomain(chartData), [chartData]);
  
  return (
    <ResponsiveContainer>
      <LineChart data={chartData}>
        {/* ... */}
      </LineChart>
    </ResponsiveContainer>
  );
});
```

### Responsive Charts

Always wrap charts in `ResponsiveContainer`:

```tsx
<div className="h-[300px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart>{/* ... */}</LineChart>
  </ResponsiveContainer>
</div>
```

Use container queries for chart sizing:

```tsx
<div className="@container">
  <div className="h-[200px] @lg:h-[300px]">
    <ResponsiveContainer>
      {/* Chart */}
    </ResponsiveContainer>
  </div>
</div>
```

### Empty/Error States for Charts

```tsx
function ChartEmptyState() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle">
      <BarChart3 size={32} className="text-text-tertiary" />
      <p className="mt-2 text-sm text-text-secondary">No data for this period</p>
      <p className="text-xs text-text-tertiary">Play some matches to see analytics</p>
    </div>
  );
}

function ChartErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center">
      <AlertTriangle size={32} className="text-accent-warning" />
      <p className="mt-2 text-sm text-text-secondary">Failed to load chart data</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
        Retry
      </Button>
    </div>
  );
}
```

---

## 10. Testing

### Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri APIs
globalThis.__TAURI_INTERNALS__ = {};
```

### React Testing Library Patterns

```tsx
// components/atoms/StatValue.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatValue } from './StatValue';

describe('StatValue', () => {
  it('renders the label and value', () => {
    render(<StatValue label="Goals" value={5} />);
    
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  it('formats large numbers', () => {
    render(<StatValue label="Score" value={1500} format="number" />);
    
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });
  
  it('applies highlight styles when isHighlight is true', () => {
    render(<StatValue label="MVP" value={1} isHighlight />);
    
    expect(screen.getByTestId('stat-value')).toHaveClass('text-accent-purple');
  });
});
```

```tsx
// components/molecules/PlayerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerCard } from './PlayerCard';
import { mockPlayer } from '@/test/fixtures';

describe('PlayerCard', () => {
  it('displays player name and stats', () => {
    render(<PlayerCard player={mockPlayer} />);
    
    expect(screen.getByText(mockPlayer.name)).toBeInTheDocument();
    expect(screen.getByText('Goals: 2')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<PlayerCard player={mockPlayer} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockPlayer.id);
  });
  
  it('shows boost bar when showBoost is true', () => {
    render(<PlayerCard player={mockPlayer} showBoost />);
    
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '83');
  });
});
```

### Mocking Tauri APIs

```typescript
// src/test/mocks/tauri.ts
import { vi } from 'vitest';

export function mockTauriCommands(
  commands: Record<string, (...args: unknown[]) => unknown>
) {
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn((cmd: string, args?: unknown) => {
      const handler = commands[cmd];
      if (!handler) throw new Error(`Command "${cmd}" not mocked`);
      return Promise.resolve(handler(args));
    }),
  }));
}

export function mockTauriEvents() {
  const listeners: Record<string, Array<(payload: unknown) => void>> = {};
  
  vi.mock('@tauri-apps/api/event', () => ({
    listen: vi.fn((event: string, handler: (payload: unknown) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return Promise.resolve(() => {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      });
    }),
    emit: vi.fn((event: string, payload: unknown) => {
      listeners[event]?.forEach((handler) => handler(payload));
    }),
  }));
  
  return { listeners };
}
```

```tsx
// hooks/useLiveMatch.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLiveMatch } from './useLiveMatch';
import { mockTauriEvents } from '@/test/mocks/tauri';

describe('useLiveMatch', () => {
  const { listeners } = mockTauriEvents();
  
  beforeEach(() => {
    // Reset store
    useLiveStore.getState().reset();
  });
  
  it('adds events to the store when live:event is received', async () => {
    renderHook(() => useLiveMatch());
    
    const event = { type: 'GoalScored', player: 'Player1', time: 120 };
    listeners['live:event']?.[0]?.(event);
    
    await waitFor(() => {
      expect(useLiveStore.getState().events).toHaveLength(1);
      expect(useLiveStore.getState().events[0]).toEqual(event);
    });
  });
});
```

### Component Testing Best Practices

1. **Test behavior, not implementation**:

```tsx
// Good — test what the user sees
expect(screen.getByText('Save Settings')).toBeInTheDocument();

// Avoid — testing implementation details
expect(component.instance().state.isOpen).toBe(true);
```

2. **Use `userEvent` over `fireEvent`**:

```tsx
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByRole('textbox'), 'Player Name');
```

3. **Test accessibility**:

```tsx
expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument();
expect(screen.getByLabelText('Player Name')).toHaveValue('TestPlayer');
```

### E2E with Playwright

```typescript
// e2e/live-match.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Live Match Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('shows waiting state when no match is active', async ({ page }) => {
    await expect(page.getByText('Waiting for match...')).toBeVisible();
    await expect(page.getByText('Start a match in Rocket League')).toBeVisible();
  });
  
  test('displays live data when match is active', async ({ page }) => {
    // Simulate match start via mock Tauri event
    await page.evaluate(() => {
      window.__TAURI__.event.emit('live:match_started', {
        matchId: 'test-match-1',
        arena: 'DFH Stadium',
      });
    });
    
    await expect(page.getByText('DFH Stadium')).toBeVisible();
    await expect(page.getByRole('timer')).toBeVisible();
  });
  
  test('navigates to history page', async ({ page }) => {
    await page.click('text=History');
    await expect(page).toHaveURL('/history');
    await expect(page.getByText('Match History')).toBeVisible();
  });
});
```

---

## 11. Performance

### React Optimization

**Use `memo` for pure presentational components**:

```tsx
import { memo } from 'react';

export const PlayerCard = memo(function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="rounded-lg bg-background-tertiary p-4">
      <h3>{player.name}</h3>
      <p>Score: {player.score}</p>
    </div>
  );
});
```

**Use `useMemo` for expensive computations**:

```tsx
const sortedPlayers = useMemo(() => {
  return [...players].sort((a, b) => b.score - a.score);
}, [players]);

const winRate = useMemo(() => {
  if (totalMatches === 0) return 0;
  return (wins / totalMatches) * 100;
}, [wins, totalMatches]);
```

**Use `useCallback` for stable function references**:

```tsx
const handlePlayerClick = useCallback((playerId: string) => {
  navigate(`/history/player/${playerId}`);
}, [navigate]);

// Now PlayerCard won't re-render unnecessarily when parent re-renders
<PlayerCard player={player} onClick={handlePlayerClick} />
```

**Avoid premature optimization**: Don't memoize everything. Profile first with React DevTools Profiler.

### Bundle Splitting

Use dynamic imports for heavy pages:

```tsx
// main.tsx
import { lazy, Suspense } from 'react';

const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));

// In router
{
  path: 'analytics',
  element: (
    <Suspense fallback={<PageSkeleton />}>
      <AnalyticsPage />
    </Suspense>
  ),
}
```

### Image Optimization

Since this is a desktop app, optimize assets at build time:

```tsx
// Use WebP/AVIF for assets
<img
  src="/assets/arena-dfh-stadium.webp"
  alt="DFH Stadium"
  width={120}
  height={80}
  loading="lazy"
/>

// For SVG icons, use Lucide React (tree-shakeable)
import { Trophy, Target, Shield } from 'lucide-react';
```

### Virtualization for Long Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function EventFeed({ events }: { events: LiveEvent[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });
  
  // Auto-scroll to bottom for live feed
  useEffect(() => {
    virtualizer.scrollToIndex(events.length - 1);
  }, [events.length, virtualizer]);
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <EventFeedItem event={events[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debouncing/Throttling

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search
function FilterBar() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = useMatches({ search: debouncedSearch });
  
  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search matches..."
    />
  );
}
```

```tsx
// hooks/useThrottle.ts
import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => (inThrottle.current = false), limit);
      }
    },
    [callback, limit]
  ) as T;
}

// Usage for scroll handlers
const throttledScroll = useThrottle((scrollY: number) => {
  setScrollPosition(scrollY);
}, 100);
```

---

## 12. Accessibility

### ARIA Patterns

```tsx
// Live region for status updates
<div role="status" aria-live="polite" className="sr-only">
  {`Match connected. Score: ${blueScore} to ${orangeScore}`}
</div>

// Progress bar for boost
<div
  role="progressbar"
  aria-valuenow={boostAmount}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Boost: ${boostAmount}%`}
  className="h-2 rounded-full bg-background-secondary"
>
  <div
    className="h-full rounded-full bg-accent-info transition-all"
    style={{ width: `${boostAmount}%` }}
  />
</div>

// Tab panel
<div role="tablist" aria-label="Analytics periods">
  <button role="tab" aria-selected={period === 'day'} aria-controls="day-panel">
    Day
  </button>
  <button role="tab" aria-selected={period === 'week'} aria-controls="week-panel">
    Week
  </button>
</div>
<div id="day-panel" role="tabpanel" aria-labelledby="day-tab">
  {/* Day content */}
</div>
```

### Keyboard Navigation

```tsx
// Keyboard shortcut for toggling sidebar
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleSidebar();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [toggleSidebar, closeModal]);

// Focusable cards with Enter activation
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-primary"
>
```

### Focus Management

```tsx
// Focus trap for modals
import { useRef, useEffect } from 'react';

function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    firstElement?.focus();
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive]);
  
  return containerRef;
}
```

### Screen Reader Testing

Test with real screen readers:
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)

Use automated testing:

```bash
pnpm add -D @axe-core/react
```

```tsx
// main.tsx (dev only)
if (import.meta.env.DEV) {
  const axe = await import('@axe-core/react');
  axe.default(React, ReactDOM, 1000);
}
```

### Color Contrast

All text must meet WCAG 2.1 AA:
- Normal text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio

Verify with the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

```
Text Primary (#F8FAFC) on Background Primary (#0A0E17): 17.5:1 ✅
Text Secondary (#94A3B8) on Background Primary (#0A0E17): 7.3:1 ✅
Accent Primary (#3B82F6) on Background Primary (#0A0E17): 5.9:1 ✅
Text Tertiary (#64748B) on Background Primary (#0A0E17): 4.6:1 ✅ (borderline, use carefully)
```

---

## 13. Common Patterns

### Creating a New Page

```tsx
// src/pages/AnalyticsPage.tsx
import { AppShell } from '@/components/layout/AppShell';
import { StatsGrid } from '@/components/organisms/StatsGrid';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics('week');
  
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Performance Analytics</h1>
        
        {isLoading && <StatsSkeleton />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && (
          <>
            <StatsGrid stats={data.summary} />
            <PerformanceChart data={data.overTime} />
          </>
        )}
      </div>
    </AppShell>
  );
}
```

Add to router:

```tsx
import { AnalyticsPage } from '@/pages/AnalyticsPage';

{ path: 'analytics', element: <AnalyticsPage /> },
```

### Creating a New Component

```tsx
// src/components/molecules/MatchScore.tsx
import { memo } from 'react';
import { TeamBadge } from '@/components/atoms/TeamBadge';
import { cn } from '@/lib/utils';

interface MatchScoreProps {
  blueScore: number;
  orangeScore: number;
  isOvertime?: boolean;
  className?: string;
}

export const MatchScore = memo(function MatchScore({
  blueScore,
  orangeScore,
  isOvertime,
  className,
}: MatchScoreProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <TeamBadge team="blue" />
      <div className="flex items-center gap-2 font-mono text-2xl font-bold">
        <span className={cn(blueScore > orangeScore && 'text-team-blue')}>
          {blueScore}
        </span>
        <span className="text-text-tertiary">-</span>
        <span className={cn(orangeScore > blueScore && 'text-team-orange')}>
          {orangeScore}
        </span>
      </div>
      <TeamBadge team="orange" />
      {isOvertime && (
        <span className="rounded-full bg-accent-warning/20 px-2 py-0.5 text-xs font-semibold text-accent-warning">
          OT
        </span>
      )}
    </div>
  );
});
```

### Adding a Tauri Command

**Rust side**:

```rust
// src-tauri/src/commands/analytics.rs
use crate::core::storage::analytics::get_rollups;
use crate::error::AppError;
use crate::models::analytics::{AnalyticsPeriod, DailyRollup};

#[tauri::command]
pub async fn get_daily_rollups(
    period: AnalyticsPeriod,
    db: tauri::State<'_, Database>,
) -> Result<Vec<DailyRollup>, AppError> {
    let rollups = get_rollups(&db, &period).await?;
    Ok(rollups)
}
```

Register in `lib.rs`:

```rust
// src-tauri/src/lib.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::analytics::get_daily_rollups,
            // ... other commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Frontend side**:

```typescript
// lib/api.ts
export async function getDailyRollups(period: AnalyticsPeriod): Promise<DailyRollup[]> {
  return invoke('get_daily_rollups', { period });
}

// lib/queries.ts
export function useDailyRollups(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: queryKeys.rollups(period),
    queryFn: () => getDailyRollups(period),
  });
}
```

### Adding a Chart

```tsx
// components/analytics/WinRateChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { memo, useMemo } from 'react';

interface WinRateChartProps {
  wins: number;
  losses: number;
}

const COLORS = ['#10B981', '#EF4444'];

export const WinRateChart = memo(function WinRateChart({ wins, losses }: WinRateChartProps) {
  const data = useMemo(
    () => [
      { name: 'Wins', value: wins },
      { name: 'Losses', value: losses },
    ],
    [wins, losses]
  );
  
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';
  
  return (
    <div className="flex flex-col items-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #1E293B',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-2xl font-bold text-text-primary">{winRate}%</p>
      <p className="text-sm text-text-secondary">Win Rate</p>
    </div>
  );
});
```

### Implementing a Form

```tsx
// components/settings/DataRetentionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  retentionDays: z.number().min(1).max(365),
  autoExport: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function DataRetentionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { retentionDays: 30, autoExport: false },
  });
  
  const onSubmit = async (data: FormData) => {
    await setSettings(data);
    toast.success('Settings saved');
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        type="number"
        label="Retention Period (days)"
        {...register('retentionDays', { valueAsNumber: true })}
        error={errors.retentionDays?.message}
      />
      
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('autoExport')} />
        <span className="text-sm text-text-secondary">Auto-export on exit</span>
      </label>
      
      <Button type="submit" isLoading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

### Handling Errors

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <AlertTriangle size={48} className="text-accent-danger" />
            <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
            <p className="max-w-md text-center text-sm text-text-secondary">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Button onClick={() => window.location.reload()}>Reload App</Button>
          </div>
        )
      );
    }
    
    return this.props.children;
  }
}
```

### Implementing Loading States

```tsx
// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-background-secondary',
        className
      )}
    />
  );
}

// Usage
function MatchCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-subtle bg-background-tertiary p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
```

---

## 14. Anti-Patterns to Avoid

### What NOT to Do

#### 1. Don't Use `any` Types

```tsx
// Avoid
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// Good
function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

If you must bypass TypeScript, use `// @ts-expect-error` with a justification comment:

```tsx
// @ts-expect-error: Tauri internals type mismatch, tracked in issue #42
const result = await invoke('legacy_command');
```

#### 2. Don't Inline Styles

```tsx
// Avoid
<div style={{ marginTop: '16px', backgroundColor: '#111827' }}>

// Good
<div className="mt-4 bg-background-secondary">
```

#### 3. Don't Prop Drill

```tsx
// Avoid: Passing props through 3+ levels
<AppShell>
  <HistoryPage>
    <MatchList>
      <MatchCard match={match}>
        <MatchScore score={match.score} /> {/* Prop drilled from AppShell */}

// Good: Use context or Zustand for deeply shared state
const score = useLiveStore((state) => state.currentMatch?.score);
```

#### 4. Don't Mix Business Logic with UI

```tsx
// Avoid: Component does data transformation + rendering
function PlayerCard({ player }: { player: RawPlayerData }) {
  const normalizedScore = player.score / player.gamesPlayed;
  const rank = calculateRank(normalizedScore);
  const badge = getBadgeForRank(rank);
  
  return <div>{/* UI */}</div>;
}

// Good: Extract logic to hook or utility
function PlayerCard({ player }: { player: ProcessedPlayer }) {
  return <div>{/* UI using processed data */}</div>;
}
```

#### 5. Don't Use Index as Key

```tsx
// Avoid
{matches.map((match, index) => (
  <MatchCard key={index} match={match} />
))}

// Good
{matches.map((match) => (
  <MatchCard key={match.id} match={match} />
))}
```

### Common Mistakes

#### 1. Creating New Functions in Render

```tsx
// Avoid: New function reference on every render
<button onClick={() => handleDelete(match.id)}>Delete</button>

// Good: Stable callback
const handleDelete = useCallback((id: number) => {
  deleteMatch(id);
}, [deleteMatch]);

<button onClick={() => handleDelete(match.id)}>Delete</button>
```

#### 2. Not Cleaning Up Effects

```tsx
// Avoid: Potential memory leak
useEffect(() => {
  const interval = setInterval(() => {
    fetchStatus();
  }, 1000);
  // Missing cleanup!
}, []);

// Good
useEffect(() => {
  const interval = setInterval(fetchStatus, 1000);
  return () => clearInterval(interval);
}, [fetchStatus]);
```

#### 3. Over-Fetching with TanStack Query

```tsx
// Avoid: Query refreshes on every focus
useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,
  // Missing staleTime — defaults to 0
});

// Good: Set appropriate staleTime
useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,
  staleTime: Infinity, // Settings rarely change
});
```

### Performance Traps

#### 1. Unnecessary Re-renders

```tsx
// Avoid: Inline object/array creates new reference every render
<Chart data={{ labels, values }} options={{ responsive: true }} />

// Good: Memoize objects
const chartData = useMemo(() => ({ labels, values }), [labels, values]);
const chartOptions = useMemo(() => ({ responsive: true }), []);

<Chart data={chartData} options={chartOptions} />
```

#### 2. Large Lists Without Virtualization

```tsx
// Avoid: Rendering 1000+ DOM nodes
<div className="overflow-auto">
  {events.map((event) => (
    <EventItem key={event.id} event={event} />
  ))}
</div>

// Good: Virtualize long lists
<VirtualList items={events} renderItem={EventItem} itemHeight={48} />
```

#### 3. Heavy Computations on Every Render

```tsx
// Avoid: Expensive calculation on every render
const sortedPlayers = [...players].sort((a, b) => {
  return complexComparison(a.stats, b.stats);
});

// Good: Memoize
const sortedPlayers = useMemo(() => {
  return [...players].sort((a, b) => complexComparison(a.stats, b.stats));
}, [players]);
```

### Security Mistakes in Frontend

#### 1. Don't Trust User Input

```tsx
// Avoid: Directly interpolating user input
const query = `SELECT * FROM matches WHERE name = '${playerName}'`;

// Good: Parameterized queries (handled in Rust backend)
invoke('search_matches', { query: playerName });
```

#### 2. Don't Expose Sensitive Data in Frontend State

```tsx
// Avoid: Storing API keys or tokens in Zustand
const useAuthStore = create(() => ({
  apiKey: 'sk-12345', // Never do this
}));
```

#### 3. Sanitize Rendered HTML

```tsx
// Avoid: Dangerously setting innerHTML with user content
<div dangerouslySetInnerHTML={{ __html: player.bio }} />

// Good: Use text content or a sanitizer
<div>{player.bio}</div>
// Or with DOMPurify if HTML is needed
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(player.bio) }} />
```

#### 4. Validate File Paths

```tsx
// Avoid: Unrestricted file access
invoke('read_file', { path: userInput });

// Good: Validate paths in Rust backend, use Tauri dialogs
const path = await open({
  filters: [{ name: 'JSON', extensions: ['json'] }],
});
```

#### 5. Don't Disable CSP

Never disable Content Security Policy in production:

```json
// tauri.conf.json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'"
    }
  }
}
```

---

## Appendix: Quick Reference

### Import Order Convention

```tsx
// 1. React and libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Absolute imports (aliases)
import { Button } from '@/components/ui/Button';
import { useLiveStore } from '@/stores/liveStore';

// 3. Relative imports (same directory)
import { PlayerCard } from './PlayerCard';
import { usePlayerStats } from './usePlayerStats';

// 4. Types and constants
import type { Player } from '@/lib/types';
import { MAX_PLAYERS } from '@/lib/constants';

// 5. Styles (if CSS modules)
import styles from './TeamPanel.module.css';
```

### Naming Quick Reference

| Entity | Convention | Example |
|--------|-----------|---------|
| Component files | PascalCase | `PlayerCard.tsx` |
| Hook files | camelCase | `useLiveMatch.ts` |
| Store files | camelCase | `liveStore.ts` |
| Utility files | camelCase | `formatTime.ts` |
| Type files | PascalCase | `MatchSummary.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_EVENTS` |
| Props interface | ComponentName + Props | `PlayerCardProps` |
| Styled wrapper | Original + Styled | `StyledButton` |
| Test files | `.test.tsx` | `PlayerCard.test.tsx` |

### Git Commit Message Convention

```
feat(frontend): add live match dashboard
fix(components): correct stat value alignment
refactor(hooks): simplify useLiveMatch logic
test(pages): add HistoryPage unit tests
docs(frontend): update component usage examples
style(components): adjust card hover animation
perf(charts): memoize chart data transformation
```

---

> **Remember**: This guide is a living document. When you encounter a new pattern, update this file. When you refactor existing code, ensure it follows these guidelines. Consistency is more important than perfection.

**Maintained by**: Frontend team  
**Last updated**: 2026-05-02
