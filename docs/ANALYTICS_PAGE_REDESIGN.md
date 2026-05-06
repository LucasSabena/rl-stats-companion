# Rediseño de AnalyticsPage — Especificación de Diseño

> **Proyecto:** `api-rocketleague` (Tauri 2 + React + Tailwind + shadcn/ui + Recharts)
> **Fecha:** 2026-05-05
> **Autor:** UI/UX Designer Agent
> **Estado:** Listo para implementación

---

## 1. Resumen Ejecutivo

La página actual sufre de **jerarquía plana**: 10 métricas con el mismo peso visual, filtros inexistentes, y un gráfico subutilizado. Esta especificación introduce:

1. **Jerarquía visual clara**: Métricas primarias (4) → Gráfico principal → Métricas secundarias (4) → Insights.
2. **Sistema de filtros**: Periodo + Playlist + Tipo de partida, aplicados en una barra compacta.
3. **Gráfico expandido**: 7 métricas disponibles, vista combinada por defecto (Win Rate + Partidas).
4. **Mejor uso del color**: Cada familia de stats tiene un color semántico consistente.
5. **Datos enriquecidos**: SessionCards muestran assists, demos y diferencia de goles.

---

## 2. Layout Wireframe

### Orden de secciones (vertical, top → bottom)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Análisis de rendimiento          │  │ [AnalyticsFilters]              │  │
│  │ 42 partidas · 1v1 Ranked         │  │                                 │  │
│  └──────────────────────────────────┘  └─────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  SECCIÓN 1 — KPIs Primarios (grid-cols-2 lg:grid-cols-4)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Partidas    │ │  Win Rate    │ │   Goles      │ │ Puntuación   │        │
│  │     42       │ │    58%       │ │    127       │ │    324       │        │
│  │              │ │  24V / 18D   │ │  3.0 / part. │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
├──────────────────────────────────────────────────────────────────────────────┤
│  SECCIÓN 2 — Gráfico de Evolución (full width, h-80)                         │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Evolución          [Win Rate] [Partidas] [Goles] ... [Vista Combo ▾] │  │
│  │                                                                        │  │
│  │  ████████████████████████████████████████████████████████████████████ │  │
│  │  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  SECCIÓN 3 — KPIs Secundarios + Racha (grid-cols-2 lg:grid-cols-5)           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────┐ │
│  │ Asistencias  │ │  Paradas     │ │   Tiros      │ │ Demoliciones │ │Rach│ │
│  │     89       │ │    156       │ │    412       │ │     34       │ │ 3🔥│ │
│  │ 2.1 / part.  │ │ 3.7 / part.  │ │ 9.8 / part.  │ │              │ │ 8🏆│ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│  SECCIÓN 4 — Insights Avanzados (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                          │
│  │ Por Playlist │ │ Mejor horario│ │ Rend. Situac.│                          │
│  └──────────────┘ └──────────────┘ └──────────────┘                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Contribución al equipo (span 3 en lg si se usa grid)                   │  │
│  │ [Goles ████████░░] [Asist. ██████░░░░] [Paradas ████████░░] ...        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────┐                                                            │
│  │   Records    │  ← Nuevo: Peak Speed, Avg Duration (movidos desde grid)   │
│  └──────────────┘                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│  SECCIÓN 5 — Lista de Sesiones (solo si period === "session")                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  📅 5 may, 14:30 — 12 partidas — 45m — WR 67% — 🏆 8V 💔 4D — +8 goles │  │
│  │  📅 4 may, 22:15 —  6 partidas — 28m — WR 50% — 🏆 3V 💔 3D —  0 goles │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Reglas de layout

- **Contenedor global**: `space-y-8` entre secciones principales (aumentado desde `space-y-6` para mejor respiración visual).
- **Separadores**: Cada sección después de la primera puede tener `pt-2` sutil, o simplemente confiar en el `space-y-8`.
- **Ancho**: Todo dentro de `PageContainer` existente.

---

## 3. Especificaciones de Componentes

### 3.1 `AnalyticsFilters` (NUEVO)

**Posición**: Justo debajo del título de página, alineado a la derecha en desktop, apilado en mobile.

**Props**:
```typescript
interface AnalyticsFiltersProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  playlist: PlaylistFilter;
  onPlaylistChange: (playlist: PlaylistFilter) => void;
  matchType: MatchTypeFilter;
  onMatchTypeChange: (matchType: MatchTypeFilter) => void;
  isLoading?: boolean;
}
```

**Estructura visual**:
```tsx
<div className="flex flex-wrap items-center gap-3">
  {/* Periodo: mantener PeriodTabs existente */}
  <PeriodTabs active={period} onChange={onPeriodChange} />

  {/* Divider vertical opcional: <div className="h-6 w-px bg-border-subtle hidden sm:block" /> */}

  {/* Playlist */}
  <Select value={playlist} onValueChange={onPlaylistChange}>
    <SelectTrigger className="w-[160px] h-9 text-xs bg-bg-surface border-border-subtle">
      <ListMusic size={14} className="mr-2 text-text-tertiary" />
      <SelectValue placeholder="Todas las playlists" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todas las playlists</SelectItem>
      <SelectItem value="duel">1v1 — Duel</SelectItem>
      <SelectItem value="doubles">2v2 — Doubles</SelectItem>
      <SelectItem value="standard">3v3 — Standard</SelectItem>
      <SelectItem value="chaos">4v4 — Chaos</SelectItem>
      <SelectItem value="rumble">Rumble</SelectItem>
      <SelectItem value="dropshot">Dropshot</SelectItem>
      <SelectItem value="hoops">Hoops</SelectItem>
      <SelectItem value="snowday">Snow Day</SelectItem>
      <SelectItem value="other">Otras</SelectItem>
    </SelectContent>
  </Select>

  {/* Tipo de partida */}
  <Select value={matchType} onValueChange={onMatchTypeChange}>
    <SelectTrigger className="w-[140px] h-9 text-xs bg-bg-surface border-border-subtle">
      <Swords size={14} className="mr-2 text-text-tertiary" />
      <SelectValue placeholder="Todos los tipos" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="ranked">Competitivo</SelectItem>
      <SelectItem value="casual">Casual</SelectItem>
      <SelectItem value="tournament">Torneo</SelectItem>
      <SelectItem value="training">Entrenamiento</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Comportamiento**:
- Cualquier cambio de filtro dispara `onChange` y debe invalidar/iniciar nueva query de analytics.
- En estado `isLoading`, los selects se deshabilitan (`disabled={isLoading}`) y muestran opacidad reducida.
- En mobile (`< sm`), los filtros deben ocupar el ancho completo usando `w-full sm:w-auto`.

---

### 3.2 `StatsGrid` — Refactorizado

**Separar en dos componentes lógicos** (pueden seguir siendo exportados desde el mismo archivo o separados):

#### `PrimaryStatsRow`
**Grid**: `grid gap-4 grid-cols-2 lg:grid-cols-4`

| # | Stat | Icono | Accent | Trend / Subtitle |
|---|------|-------|--------|------------------|
| 1 | **Partidas jugadas** | `Swords` | `blue` | — |
| 2 | **Win Rate** | `Trophy` | `green` (≥50%) / `orange` (<50%) | `24V / 18D` |
| 3 | **Goles totales** | `Target` | `orange` | `3.0 / partido` |
| 4 | **Puntuación media** | `TrendingUp` | `purple` | — |

#### `SecondaryStatsRow`
**Grid**: `grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`

| # | Stat | Icono | Accent | Trend / Subtitle |
|---|------|-------|--------|------------------|
| 1 | **Asistencias totales** | `Zap` | `purple` | `2.1 / partido` |
| 2 | **Paradas totales** | `Shield` | `blue` | `3.7 / partido` |
| 3 | **Tiros totales** | `Crosshair` | `default` | `9.8 / partido` |
| 4 | **Demoliciones** | `Flame` | `orange` | — |
| 5 | **Racha** | `Flame` (actual) / `Trophy` (mejor) | `green` | Componente `StreakCard` inline |

**Cambios clave**:
- **Eliminados del grid principal**: `Velocidad max` y `Duración media` → movidos a InsightsPanel (tarjeta "Records").
- **StreakCard integrado**: Se renderiza como un `StatCard` especial o como la card existente pero con dimensiones reducidas para encajar en la fila secundaria.

**Props**:
```typescript
interface PrimaryStatsRowProps {
  data: AnalyticsData;
}

interface SecondaryStatsRowProps {
  data: AnalyticsData;
  streak: { best: number; current: number };
}
```

---

### 3.3 `PerformanceChart` — Rediseñado

**Props**:
```typescript
type ChartMetric = "winRate" | "matchesPlayed" | "avgScore" | "goals" | "assists" | "saves" | "demos";

interface PerformanceChartProps {
  data: DailyRollup[];
  defaultMetric?: ChartMetric;
}
```

**UI de controles**:
```tsx
<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h3 className="font-display text-sm font-semibold text-text-primary">Evolución</h3>

  <div className="flex items-center gap-2">
    {/* Selector de métrica principal */}
    <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-bg-panel p-0.5">
      {METRICS.map((m) => (
        <button
          key={m.key}
          onClick={() => { setMetric(m.key); setCombo(false); }}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            metric === m.key && !combo
              ? "bg-accent-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>

    {/* Toggle Combo */}
    <button
      onClick={() => setCombo(!combo)}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
        combo
          ? "border-accent-primary bg-accent-primary text-white shadow-sm"
          : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
      )}
    >
      <BarChart3 size={14} className="inline mr-1" />
      Combo
    </button>
  </div>
</div>
```

**Métricas disponibles**:
```typescript
const METRICS: { key: ChartMetric; label: string; color: string; type: "rate" | "volume" }[] = [
  { key: "winRate", label: "WR", color: "var(--color-accent-primary)", type: "rate" },
  { key: "matchesPlayed", label: "Partidas", color: "var(--color-accent-purple)", type: "volume" },
  { key: "avgScore", label: "Punt.", color: "var(--color-accent-success)", type: "volume" },
  { key: "goals", label: "Goles", color: "var(--color-accent-secondary)", type: "volume" },
  { key: "assists", label: "Asist.", color: "var(--color-accent-purple)", type: "volume" },
  { key: "saves", label: "Paradas", color: "var(--color-accent-primary)", type: "volume" },
  { key: "demos", label: "Demos", color: "var(--color-accent-danger)", type: "volume" },
];
```

**Comportamiento del gráfico**:

1. **Vista individual (combo = false)**:
   - `type: "rate"` (winRate): AreaChart, dominio Y `[0, 100]`, tooltip con `%`.
   - `type: "volume"` (todo lo demás): AreaChart, dominio Y `[0, "auto"]`, tooltip con valor crudo.
   - Suavizado: `type="monotone"` con gradiente bajo el área.

2. **Vista Combo (combo = true)**:
   - Siempre usa `ComposedChart`.
   - Eje izquierdo (Y): Win Rate % — línea suavizada con área degradada.
   - Eje derecho (Y): Métrica de volumen seleccionada — barras con `radius={[4,4,0,0]}`.
   - **UX clave**: Al activar combo, si la métrica seleccionada es "rate" (WR), la barra usa "Partidas" por defecto. Si la métrica seleccionada es "volume", esa métrica se convierte en las barras.
   - Leyenda siempre visible en combo.

**Datos mapeados**:
```typescript
const chartData = data.map((d) => ({
  date: d.date,
  winRate: d.matchesPlayed > 0 ? Math.round((d.wins / d.matchesPlayed) * 100) : 0,
  matchesPlayed: d.matchesPlayed,
  avgScore: Math.round(d.avgScore),
  goals: d.totalGoals ?? 0,
  assists: d.totalAssists ?? 0,
  saves: d.totalSaves ?? 0,
  demos: d.totalDemos ?? 0,
}));
```

**Colores de Recharts** (ya se usan variables CSS):
- Mantener `contentStyle` del tooltip con fondo `bg-elevated` y borde `border-highlight`.
- Colores de grid y ejes: `var(--color-border-subtle)` y `var(--color-text-tertiary)`.

---

### 3.4 `SessionCard` — Enriquecido

**Props**:
```typescript
interface SessionCardProps {
  session: MatchSession;
  onClick: () => void;
}
```

**Nuevo layout interno**:
```tsx
<Card className="cursor-pointer p-4 hoverable" onClick={onClick}>
  {/* Row 1: Meta */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Calendar size={14} className="text-text-tertiary" />
      <span className="text-xs text-text-secondary">{dateStr}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-text-tertiary">
      <Clock size={12} />
      <span>{durationMin}m</span>
      <ChevronRight size={14} className="text-accent-primary" />
    </div>
  </div>

  {/* Row 2: KPIs principales */}
  <div className="grid grid-cols-4 gap-2 mb-3">
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Partidas</p>
      <p className="font-mono text-lg font-bold text-text-primary">{session.match_count}</p>
    </div>
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">WR</p>
      <p className={cn("font-mono text-lg font-bold", winRate >= 50 ? "text-accent-success" : "text-accent-danger")}>
        {winRate}%
      </p>
    </div>
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Goles</p>
      <p className="font-mono text-lg font-bold text-text-primary">
        +{session.goals_scored - session.goals_conceded}
      </p>
    </div>
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Tiros</p>
      <p className="font-mono text-lg font-bold text-text-primary">{session.total_shots}</p>
    </div>
  </div>

  {/* Row 3: Detalles secundarios (NUEVO) */}
  <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 text-accent-success">
        <Trophy size={12} /> {session.wins}V
      </span>
      <span className="flex items-center gap-1 text-accent-danger">
        <Swords size={12} /> {session.losses}D
      </span>
      {session.unknown > 0 && (
        <span className="text-text-tertiary">? {session.unknown}</span>
      )}
    </div>
    <div className="flex items-center gap-3 text-text-tertiary">
      <span className="flex items-center gap-1" title="Asistencias">
        <Zap size={12} className="text-accent-purple" />
        <span className="text-text-secondary">{session.total_assists ?? 0}</span>
      </span>
      <span className="flex items-center gap-1" title="Demoliciones">
        <Flame size={12} className="text-accent-secondary" />
        <span className="text-text-secondary">{session.total_demos ?? 0}</span>
      </span>
    </div>
  </div>
</Card>
```

**Cambios clave**:
- Layout de 4 columnas en row 2: Partidas, WR, Goal Diff, Tiros.
- Row 3 separada por `border-t border-border-subtle` para jerarquía.
- Nuevos datos: `total_assists`, `total_demos`, y Goal Diff computado (`goals_scored - goals_conceded`).

---

### 3.5 `InsightsPanel` — Reorganizado

**Cambios**:
1. **Nueva tarjeta "Records"**: Muestra `peakSpeed` y `avgDuration` (las stats removidas del grid principal).
2. **"Clutch & Dominio"** renombrado a **"Rendimiento situacional"** para claridad.
3. **Grid responsive**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Si "Contribución al equipo" se mantiene, puede usar `lg:col-span-2` si hay espacio vacío, o mantenerse en 1 col con barras más compactas.
4. **Header de sección**: `h3` con icono `Sparkles` o `Brain` para indicar insights.

**Tarjeta Records (nueva)**:
```tsx
<Card className="p-4">
  <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
    <Gauge size={14} /> Records
  </h4>
  <div className="space-y-3">
    <div className="flex justify-between items-center text-xs">
      <span className="text-text-secondary">Velocidad máxima</span>
      <span className="font-mono font-bold text-accent-success">{Math.round(data.peakSpeed)} km/h</span>
    </div>
    <div className="flex justify-between items-center text-xs">
      <span className="text-text-secondary">Duración media</span>
      <span className="font-mono font-bold text-text-primary">{Math.round(data.avgDuration / 60)}m</span>
    </div>
  </div>
</Card>
```

**Nota**: `InsightsPanel` actualmente recibe solo `period`. Para mostrar Records, necesita acceso a `AnalyticsData`. Se recomienda cambiar la prop:
```typescript
interface InsightsPanelProps {
  period: AnalyticsPeriod;
  summary?: AnalyticsData; // Para mostrar Records
}
```

---

## 4. Dirección de Diseño Visual

### 4.1 Espaciado y Separación

- **Entre secciones**: `space-y-8` (32px) en lugar de `space-y-6` (24px).
- **Dentro de cards**: `p-4` o `p-5` para cards principales; `p-3` para cards compactas (StreakCard en fila secundaria).
- **Separadores de sección**: Opcionalmente, un `<div className="h-px w-full bg-border-subtle" />` entre el gráfico y las stats secundarias para crear "franjas" de contenido.
- **Panel de filtros**: Envolver en `div` con `bg-bg-panel/50 border border-border-subtle rounded-xl p-3` para que flote visualmente del fondo base.

### 4.2 Uso Intencional del Color

| Concepto | Color | Variable CSS | Uso |
|----------|-------|--------------|-----|
| **Partidas / Volumen** | Azul | `--color-accent-primary` | Matches, Saves |
| **Goles / Impacto ofensivo** | Naranja | `--color-accent-secondary` | Goals, Shots, Demos |
| **Victorias / Positivo** | Verde | `--color-accent-success` | Win Rate (≥50%), Current Streak |
| **Asistencias / Score** | Púrpura | `--color-accent-purple` | Assists, Avg Score |
| **Derrotas / Negativo** | Rojo | `--color-accent-danger` | Win Rate (<50%), Losses |
| **Neutral / Info** | Gris | `--color-text-tertiary` | Labels, metadata |

**Reglas**:
- Los bordes izquierdos de `StatCard` (`border-l-[3px]`) deben seguir esta tabla para crear identificación por color sin depender solo de los iconos.
- `Win Rate` debe cambiar dinámicamente: `accent="green"` cuando ≥ 50%, `accent="orange"` cuando < 50%. El icono de fondo también cambia.
- En las session cards, los spans de V/D usan `text-accent-success` y `text-accent-danger` directamente (ya lo hacen, mantener).

### 4.3 Estados de Carga (Skeletons)

**Estructura de skeletons**:
```tsx
{isLoading && (
  <div className="space-y-8">
    {/* Filtros */}
    <Skeleton className="h-12 w-full rounded-xl" />
    {/* Primary Stats */}
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
    {/* Chart */}
    <Skeleton className="h-80 w-full rounded-xl" />
    {/* Secondary Stats */}
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  </div>
)}
```

### 4.4 Estados Vacíos

**Mejorar el empty state actual** para considerar filtros activos:
```tsx
{result.data.totalMatches === 0 && (
  <EmptyState
    icon={BarChart3}
    title="No hay datos para este periodo"
    description={
      hasActiveFilters
        ? "Probá cambiando los filtros de playlist o tipo de partida."
        : "Jugá algunas partidas para ver tu análisis aquí."
    }
    actionLabel={hasActiveFilters ? "Limpiar filtros" : undefined}
    onAction={hasActiveFilters ? clearFilters : undefined}
  />
)}
```

**Definición de `hasActiveFilters`**:
```typescript
const hasActiveFilters = playlist !== "all" || matchType !== "all";
```

---

## 5. Actualizaciones de Interfaces TypeScript

### 5.1 Cambios en `src/lib/types.ts`

```typescript
// ─── NUEVOS tipos de filtro ─────────────────────────────────────────────────

export type PlaylistFilter =
  | "all"
  | "duel"
  | "doubles"
  | "standard"
  | "chaos"
  | "rumble"
  | "dropshot"
  | "hoops"
  | "snowday"
  | "other";

export type MatchTypeFilter = "all" | MatchType;

// ─── ACTUALIZAR DailyRollup ─────────────────────────────────────────────────

export interface DailyRollup {
  date: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  avgScore: number;
  totalGoals: number;
  // Campos opcionales → REQUERIDOS para estabilidad del gráfico
  totalShots: number;
  totalSaves: number;
  totalDemos: number;
  totalAssists: number;
}

// ─── ACTUALIZAR MatchSession ────────────────────────────────────────────────

export interface MatchSession {
  id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  match_count: number;
  wins: number;
  losses: number;
  unknown: number;
  goals_scored: number;
  goals_conceded: number;
  total_shots: number;
  total_saves: number;
  // NUEVOS CAMPOS
  total_assists: number;
  total_demos: number;
}

// ─── ACTUALIZAR AnalyticsData (si se requiere filtrado en backend) ──────────
// Nota: Si el backend ya calcula todo en AnalyticsData por periodo,
// esta interfaz puede mantenerse igual. Los filtros se aplicarán
// en la query key de TanStack Query.
```

### 5.2 Cambios en Hooks (`src/hooks/useAnalytics.ts`)

```typescript
interface AnalyticsFiltersState {
  playlist?: PlaylistFilter;
  matchType?: MatchTypeFilter;
}

export function useAnalytics(
  period: AnalyticsPeriod,
  filters?: AnalyticsFiltersState
) {
  return useQuery<AnalyticsResult>({
    queryKey: ["analytics", period, filters],
    queryFn: async () => {
      const result = await getAnalytics(period, filters); // API debe aceptar filtros
      return {
        data: result.data,
        rollups: result.rollups ?? [],
        sessions: result.sessions ?? [],
      };
    },
    staleTime: QUERY_STALE_TIME.analytics,
  });
}

// useInsights también debe recibir filtros si aplica
export function useInsights(
  period: AnalyticsPeriod,
  filters?: AnalyticsFiltersState
) { ... }
```

### 5.3 Cambios en API (`src/lib/api.ts` — inferido)

Las funciones `getAnalytics`, `getDailyRollups`, `getInsights`, `getSessions` deben aceptar un objeto de filtros opcional y pasarlo como query params al backend.

```typescript
export async function getAnalytics(
  period: AnalyticsPeriod,
  filters?: AnalyticsFiltersState
): Promise<AnalyticsResult> {
  const params = new URLSearchParams();
  params.set("period", period);
  if (filters?.playlist && filters.playlist !== "all") {
    params.set("playlist", filters.playlist);
  }
  if (filters?.matchType && filters.matchType !== "all") {
    params.set("matchType", filters.matchType);
  }
  return invoke("get_analytics", { params: params.toString() });
}
```

---

## 6. Flujo de Datos y Estado

### Estado local en `AnalyticsPage`

```typescript
export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [playlist, setPlaylist] = useState<PlaylistFilter>("all");
  const [matchType, setMatchType] = useState<MatchTypeFilter>("all");
  const [selectedSession, setSelectedSession] = useState<MatchSession | null>(null);

  const filters = useMemo(
    () => ({ playlist, matchType }),
    [playlist, matchType]
  );

  const { data: result, isLoading, isError } = useAnalytics(period, filters);
  const { data: insights, isLoading: insightsLoading } = useInsights(period, filters);

  // ...
}
```

### Reglas de invalidación

- Cualquier cambio en `period`, `playlist` o `matchType` debe disparar un nuevo `useQuery`.
- La `queryKey` debe incluir los filtros: `["analytics", period, filters]`.
- Al cambiar de periodo, los filtros se mantienen (persistencia temporal en el estado del componente).

---

## 7. Comportamiento Responsive

| Breakpoint | Layout |
|------------|--------|
| **Mobile** (< 640px) | Filtros apilados (`flex-col`, `w-full`). Primary stats: `grid-cols-2`. Secondary stats: `grid-cols-2` (StreakCard ocupa toda la fila o se colapsa debajo). Chart: altura fija `h-64`. Insights: 1 columna. Sessions: 1 columna. |
| **Tablet** (640–1024px) | Filtros en fila (`flex-row wrap`). Primary stats: `grid-cols-2`. Secondary stats: `grid-cols-3`. Chart: `h-72`. Insights: `grid-cols-2`. Sessions: `grid-cols-2`. |
| **Desktop** (> 1024px) | Filtros alineados a derecha del título. Primary stats: `grid-cols-4`. Secondary stats: `grid-cols-5` (4 stats + streak). Chart: `h-80`. Insights: `grid-cols-3`. Sessions: `grid-cols-3`. |

**Notas**:
- El selector de métricas del gráfico en mobile puede truncar labels (usar abreviaciones: "WR", "Part.", "Gol.", "Asist.", "Par.", "Dem.", "Punt.") o usar un `<Select>` en lugar de botones.
- Considerar un `<Select>` para métricas del gráfico en todos los tamaños si el espacio es crítico.

---

## 8. Accesibilidad (A11y)

1. **Filtros**: Los `<Select>` de shadcn/ui ya manejan `role="combobox"` y navegación por teclado. Verificar que `aria-label` esté presente: `aria-label="Filtrar por playlist"`.
2. **PeriodTabs**: Mantener `aria-pressed` en el botón activo.
3. **Gráfico**: Recharts no es intrínsecamente accesible. Agregar un `aria-label` descriptivo al contenedor:
   ```tsx
   <div role="img" aria-label={`Gráfico de evolución de ${metricLabel}`}>
     <ResponsiveContainer>...</ResponsiveContainer>
   </div>
   ```
4. **Colores**: Todos los colores de acento usados en texto sobre fondo oscuro/claro cumplen con la relación de contraste WCAG AA (verificado: el verde `#10b981` sobre `#0a0d14` pasa AA para textos grandes).
5. **Focus rings**: Los botones del gráfico y filtros deben mostrar `focus-visible:ring-2 focus-visible:ring-accent-primary`.
6. **SessionCards**: Agregar `aria-label` dinámico:
   ```tsx
   aria-label={`Sesión del ${dateStr}, ${session.match_count} partidas, ${winRate}% win rate`}
   ```

---

## 9. Checklist de Implementación

- [ ] Crear componente `AnalyticsFilters` con PeriodTabs + 2 Selects.
- [ ] Actualizar `useAnalytics` y `useInsights` para aceptar `filters`.
- [ ] Actualizar API layer (`src/lib/api.ts`) para pasar query params.
- [ ] Refactorizar `StatsGrid` → `PrimaryStatsRow` + `SecondaryStatsRow`.
- [ ] Integrar `StreakCard` dentro de `SecondaryStatsRow` o como card inline.
- [ ] Expandir `PerformanceChart` a 7 métricas + vista combo.
- [ ] Actualizar mapeo de `DailyRollup` en el chart para incluir goals, assists, saves, demos.
- [ ] Enriquecer `SessionCard` con assists, demos, goal diff.
- [ ] Crear tarjeta "Records" en `InsightsPanel`.
- [ ] Actualizar `src/lib/types.ts` con `PlaylistFilter`, `MatchTypeFilter`, y campos nuevos en `MatchSession`.
- [ ] Revisar skeleton loaders para reflejar nueva estructura.
- [ ] Mejorar empty states para detectar filtros activos.
- [ ] Verificar responsive en 320px, 768px, 1440px.
- [ ] Revisar contraste de colores en ambos temas (dark/light).

---

## 10. Notas para el Frontend Developer

1. **No reescribir `StatCard` desde cero**: El componente ya soporta `accent`, `trend`, `icon`. Solo cambiar la data que se le pasa.
2. **shadcn/ui Select**: Si no está instalado, agregarlo con `npx shadcn add select`. Si se prefiere evitar dependencias, usar un `<select>` nativo estilizado con Tailwind.
3. **Colores del gráfico**: Se usan variables CSS (`var(--color-*)`) para que el gráfico respete el tema dark/light automáticamente.
4. **Combo view**: La lógica de combo puede implementarse en dos fases: (1) metric selector individual, (2) toggle combo con `ComposedChart`. La fase 1 ya funciona con `AreaChart`.
5. **Performance**: `useMemo` en `StatsGrid` y `PerformanceChart` ya está presente; mantenerlo. El nuevo `AnalyticsFilters` no necesita memoización a menos que los callbacks se pasen a componentes hijos pesados.
6. **Idioma**: Todo texto user-facing en español. Código (props, variables) en inglés siguiendo convenciones existentes.

---

*Fin del documento de especificación.*
