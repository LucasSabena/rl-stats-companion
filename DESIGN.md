# RL Stats — Design System (`api-rocketleague`)

> Status: Draft
> Scope: Desktop Client App (Tauri + React)

## Goal

Create a desktop companion app for Rocket League that feels **native, highly polished, and distinctly embedded in the game's aesthetic**. It shouldn't feel like a generic dashboard. It should feel like a piece of high-performance tactical gear. 

The aesthetic is **"Competitive Cyber-Athletic"**:
- Deep, dark space backgrounds (like RL arenas).
- Intense neon accents (Electric Blue, Turbo Orange).
- High-contrast, crisp typography for readability at a glance.
- Subtle glassmorphism and deep shadows to establish depth.

## Core Rules

### 1. Depth & Elevation
We use a 4-tier elevation system in the dark theme to create a native desktop feel.
- **Base (`bg-base`)**: The deep background (`#070A13`).
- **Surface (`bg-surface`)**: Standard cards and panels (`#0D111F`).
- **Elevated (`bg-elevated`)**: Flyouts, popovers, and focus cards (`#151A2B`).
- **Glass (`surface-glass`)**: Overlays and sticky headers with background blur.

### 2. Interaction & Motion
Every interactive element must respond predictably but with "snap":
- **Buttons**: Scale down slightly on click (`active:scale-95`). Glow on hover.
- **Cards**: Subtle Y-axis translation (`hover:-translate-y-1`) and border highlight.
- **Transitions**: Use `cubic-bezier(0.16, 1, 0.3, 1)` for springy, snappy entrances.

### 3. The RL Palette (Non-negotiable)
- **Team Blue**: `#3b82f6` (Electric Blue).
- **Team Orange**: `#f97316` (Turbo Orange).
- **Boost Indicators**: 
  - 100-80: Green (`#10b981`)
  - 79-30: Yellow (`#f59e0b`)
  - 29-0: Red (`#ef4444`)

## Token Hierarchy

### Colors (Semantic)

**Dark Theme (Default):**
- `bg-base`: `#070A13`
- `bg-surface`: `#0D111F`
- `bg-elevated`: `#151A2B`
- `border-subtle`: `rgba(255,255,255,0.04)`
- `border-default`: `rgba(255,255,255,0.08)`
- `border-highlight`: `rgba(255,255,255,0.15)`
- `text-primary`: `#F8FAFC`
- `text-secondary`: `#94A3B8`
- `text-muted`: `#475569`

**Light Theme (Opt-in):**
- `bg-base`: `#F1F5F9`
- `bg-surface`: `#FFFFFF`
- `bg-elevated`: `#FFFFFF`
- `border-subtle`: `rgba(0,0,0,0.04)`
- `border-default`: `rgba(0,0,0,0.08)`
- `border-highlight`: `rgba(0,0,0,0.15)`
- `text-primary`: `#0F172A`
- `text-secondary`: `#475569`
- `text-muted`: `#94A3B8`

### Typography
- **Display**: Space Grotesk (geometric, techy, used for scores, headers, big numbers).
- **Sans**: Inter or system-ui (highly legible, used for lists, tables, body text).
- **Mono**: JetBrains Mono (used for logs, exact data points).

## Component Guidelines

### Cards
Cards are the primary structural element. 
- Use a `1px` subtle inner ring (using inset shadow or border) to give a sharp, native edge.
- Interactive cards use group-hover to illuminate inner elements (e.g., text brightens, borders glow).

### Badges
Badges denote ranks, status, or tags.
- They must have a subtle background tint (`10-15%` opacity) of their accent color and a solid border of the same color at `20-30%` opacity.

### Layout
- Use a persistent sidebar (native app feel).
- Top window draggable area (Tauri `data-tauri-drag-region`).
- Content areas should be constrained to max-width to avoid stretching on ultrawide monitors.
