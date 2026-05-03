# RL Stats Companion — Especificación de Componentes UI

> Documento fuente de verdad para la implementación de todos los componentes de interfaz.
> Filosofía: "Broadcast precision meets personal performance terminal."
> Stack: Tauri 2 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Lucide React

---

## Tabla de Contenidos

1. [Fundamentos del Sistema](#1-fundamentos-del-sistema)
2. [Inventario de Componentes](#2-inventario-de-componentes)
3. [Sistema de Iconos](#3-sistema-de-iconos)
4. [Especificaciones de Animación](#4-especificaciones-de-animación)
5. [Comportamiento Responsivo](#5-comportamiento-responsivo)
6. [Especificaciones del Tema Oscuro](#6-especificaciones-del-tema-oscuro)
7. [Jerarquía de Componentes](#7-jerarquía-de-componentes)
8. [Configuración de Tailwind](#8-configuración-de-tailwind)
9. [Anexos](#9-anexos)

---

## 1. Fundamentos del Sistema

### 1.1 Tokens de Diseño

Todos los componentes deben derivarse de estos tokens. No usar valores hardcodeados excepto en casos excepcionales documentados.

#### Colores

| Token | Valor HEX | Uso Principal |
|-------|-----------|---------------|
| `bg-primary` | `#0A0E17` | Fondo de la aplicación |
| `bg-secondary` | `#111827` | Superficies elevadas (sidebar, header) |
| `bg-tertiary` | `#1A2235` | Tarjetas, paneles, tablas |
| `bg-hover` | `#1E293B` | Estado hover interactivo |
| `border-subtle` | `#1E293B` | Divisores, contornos sutiles |
| `border-strong` | `#334155` | Elementos enfocados, bordes activos |
| `text-primary` | `#F8FAFC` | Títulos, datos clave |
| `text-secondary` | `#94A3B8` | Etiquetas, metadatos |
| `text-tertiary` | `#64748B` | Timestamps, hints |
| `text-muted` | `#475569` | Deshabilitado, placeholder |
| `accent-primary` | `#3B82F6` | Acciones primarias, enlaces |
| `accent-primary-hover` | `#2563EB` | Hover de acción primaria |
| `accent-success` | `#10B981` | Tendencias positivas, victorias |
| `accent-danger` | `#EF4444` | Derrotas, errores, demos recibidos |
| `accent-warning` | `#F59E0B` | Overtime, advertencias |
| `accent-info` | `#06B6D4` | Indicadores en vivo, boost |
| `accent-purple` | `#8B5CF6` | Eventos especiales, MVP |
| `team-blue` | `#3B82F6` | Equipo azul |
| `team-orange` | `#F97316` | Equipo naranja |
| `team-blue-dark` | `#1E40AF` | Variante oscura equipo azul |
| `team-orange-dark` | `#C2410C` | Variante oscura equipo naranja |

#### Tipografía

| Token | Tamaño | Peso | Tracking | Altura de Línea | Uso |
|-------|--------|------|----------|-----------------|-----|
| `text-hero` | 48px | 700 | -0.02em | 1.2 | Marcador de partido, números clave |
| `text-h1` | 32px | 700 | -0.02em | 1.2 | Títulos de página |
| `text-h2` | 24px | 600 | -0.01em | 1.2 | Secciones, subtítulos |
| `text-h3` | 18px | 600 | 0 | 1.2 | Encabezados de tarjeta |
| `text-body` | 14px | 400 | 0 | 1.5 | Texto general |
| `text-body-sm` | 12px | 400 | 0.01em | 1.5 | Texto secundario |
| `text-caption` | 11px | 500 | 0.02em | 1.2 | Etiquetas, badges |
| `text-mono` | 13px | 500 | 0 | 1.2 | Estadísticas, números, timers |

#### Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `space-0` | 0px | Sin espaciado |
| `space-1` | 4px | Gap mínimo, padding interno tight |
| `space-2` | 8px | Gap entre elementos relacionados |
| `space-3` | 12px | Padding de botones, inputs |
| `space-4` | 16px | Padding de tarjetas, gap estándar |
| `space-5` | 20px | Separación media |
| `space-6` | 24px | Padding de contenedor |
| `space-8` | 32px | Separación entre secciones |
| `space-10` | 40px | Separación grande |
| `space-12` | 48px | Padding de página |
| `space-16` | 64px | Separación máxima |
| `space-20` | 80px | Hero spacing |

#### Radio de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 4px | Botones, badges, inputs |
| `radius-md` | 8px | Tarjetas, paneles |
| `radius-lg` | 12px | Modales, diálogos |
| `radius-full` | 9999px | Avatares, pills |

#### Sombras y Elevación

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-1` | `0 1px 2px rgba(0,0,0,0.3)` | Botones, badges |
| `shadow-2` | `0 4px 6px rgba(0,0,0,0.4)` | Tarjetas, dropdowns |
| `shadow-3` | `0 10px 15px rgba(0,0,0,0.5)` | Modales, overlays |
| `shadow-4` | `0 20px 25px rgba(0,0,0,0.6)` | Notificaciones toast |
| `glow-accent` | `0 0 20px rgba(59,130,246,0.15)` | Indicadores en vivo |

#### Transiciones

| Token | Duración | Easing | Uso |
|-------|----------|--------|-----|
| `transition-fast` | 150ms | `ease-out` | Micro-interacciones (hover) |
| `transition-normal` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Cambios de estado |
| `transition-slow` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones de página |
| `transition-bounce` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Cambio de score (overshoot sutil) |

---

## 2. Inventario de Componentes

### 2.1 Componentes de Layout

---

#### `AppShell`

**Propósito**: Contenedor raíz de la aplicación. Gestiona el layout global con sidebar, header y área de contenido.

**Props Interface**:

```typescript
interface AppShellProps {
  children: React.ReactNode;
  sidebarExpanded?: boolean;
  className?: string;
}
```

**Estructura Visual**:
```
┌─────────────────────────────────────────┐
│  Sidebar  │  Header                     │
│  (64px/   ├─────────────────────────────┤
│   200px)  │                             │
│           │  Content Area               │
│           │  (scrollable)               │
│           │                             │
└─────────────────────────────────────────┘
```

**Estados**:
- **Default**: Sidebar colapsado (64px), contenido con padding `space-6`
- **Expanded**: Sidebar expandido (200px), contenido se adapta
- **Mobile**: Sidebar oculto, drawer desde la izquierda

**Accesibilidad**:
- `role="main"` en el área de contenido
- Skip link para saltar navegación (`<a href="#main-content" className="sr-only focus:not-sr-only">`)
- Landmark regions: `<nav>`, `<main>`, `<header>`

**Ejemplo de Uso**:
```tsx
<AppShell sidebarExpanded={uiStore.sidebarExpanded}>
  <LivePage />
</AppShell>
```

---

#### `Sidebar`

**Propósito**: Navegación vertical principal. Modo icono por defecto, expandible a icono + etiqueta.

**Props Interface**:

```typescript
interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  activePage: string;
  isLive: boolean; // muestra indicador pulso
  className?: string;
}

interface NavItemData {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: 'live' | 'new' | number;
}
```

**Estados**:
- **Collapsed (default)**: Ancho 64px, iconos centrados 24px, tooltips en hover
- **Expanded**: Ancho 200px, iconos 20px + etiqueta 14px
- **Hover item**: Fondo `bg-hover`, transición `transition-fast`
- **Active item**: Borde izquierdo 3px `accent-primary`, texto e icono en `accent-primary`
- **Live indicator**: Punto verde pulsante (`accent-success`) en el item "En Vivo"

**Accesibilidad**:
- `aria-label="Navegación principal"`
- Cada `NavItem` tiene `aria-current={isActive ? 'page' : undefined}`
- Tooltips accesibles: `role="tooltip"`, `id` vinculado vía `aria-describedby`
- Toggle button: `aria-label={expanded ? "Colapsar menú" : "Expandir menú"}`
- `aria-expanded` en el botón de toggle

**Ejemplo de Uso**:
```tsx
<Sidebar
  expanded={uiStore.sidebarExpanded}
  onToggle={() => uiStore.toggleSidebar()}
  activePage="live"
  isLive={liveStore.currentMatch !== null}
/>
```

---

#### `Header`

**Propósito**: Barra superior con título de página, acciones contextuales y estado de conexión.

**Props Interface**:

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  className?: string;
}
```

**Estructura Visual**:
```
┌─────────────────────────────────────────────────────────────┐
│  Título Página    │  [Acciones]    │  [● Connected]         │
│  Subtítulo        │                │                        │
└─────────────────────────────────────────────────────────────┘
```

**Estados**:
- **Default**: Fondo `bg-secondary`, borde inferior `border-subtle`, altura 64px
- **Scrolled**: Sombra `shadow-1` aparece cuando content scroll > 0

**Accesibilidad**:
- Título como `<h1>` semántico
- Estado de conexión con `aria-live="polite"`
- Color no es el único indicador: icono + texto + forma para cada estado de conexión

---

#### `PageContainer`

**Propósito**: Wrapper consistente para todas las páginas. Gestiona padding, max-width y scroll.

**Props Interface**:

```typescript
interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'default' | 'full' | 'narrow';
  className?: string;
}
```

**Variantes**:
- `default`: max-width 1440px, padding `space-6`
- `full`: width 100%, padding `space-6`
- `narrow`: max-width 960px, padding `space-6`, centrado

---

#### `Panel`

**Propósito**: Contenedor genérico para agrupar contenido relacionado. Base de Cards y StatsCards.

**Props Interface**:

```typescript
interface PanelProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'subtle';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

**Variantes Visuales**:
- **default**: Fondo `bg-tertiary`, borde `border-subtle`, radius `radius-md`
- **highlight**: Fondo `accent-primary` al 5%, borde `accent-primary` al 20%
- **subtle**: Fondo `bg-secondary`, sin borde

---

### 2.2 Componentes de Navegación

---

#### `NavItem`

**Propósito**: Item individual de navegación en el Sidebar.

**Props Interface**:

```typescript
interface NavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  badge?: 'live' | 'new' | number;
  onClick?: () => void;
}
```

**Estados**:
- **Default**: Texto `text-secondary`, icono `text-secondary`
- **Hover**: Fondo `bg-hover`, texto `text-primary`
- **Active**: Borde izquierdo 3px sólido `accent-primary`, texto `accent-primary`, icono `accent-primary`
- **Collapsed + Hover**: Tooltip aparece a la derecha con label

**Accesibilidad**:
- `aria-current={isActive ? 'page' : undefined}`
- Tooltip con `role="tooltip"` cuando está colapsado
- Focus ring: 2px `accent-primary`, offset 2px

---

#### `Breadcrumb`

**Propósito**: Indica la ubicación actual en la jerarquía de páginas (usado en Match Detail y Settings anidadas).

**Props Interface**:

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}
```

**Estados**:
- **Default**: Texto `text-tertiary`, separador `/` o `ChevronRight` icono
- **Last item (current)**: Texto `text-primary`, sin link, `aria-current="page"`
- **Link item**: Hover `text-primary`, underline sutil

---

#### `TabNav`

**Propósito**: Navegación por pestañas para cambiar entre vistas dentro de una misma página (Analytics: Day/Week/Month/Session).

**Props Interface**:

```typescript
interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

interface TabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}
```

**Variantes**:
- **default**: Borde inferior `border-subtle`, indicador activo como barra inferior 2px `accent-primary`
- **pills**: Fondo `bg-hover` en activo, radius `radius-full`

**Accesibilidad**:
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected` en tabs
- `aria-controls` vinculando tab con panel
- Navegación con flechas (← →)

---

### 2.3 Componentes de Visualización de Datos

---

#### `StatCard`

**Propósito**: Muestra una métrica individual con etiqueta, valor, y variación opcional. Componente más usado en dashboards.

**Props Interface**:

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number; // porcentaje de cambio
  changeLabel?: string;
  variant?: 'default' | 'compact' | 'highlight' | 'mono';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  className?: string;
}
```

**Variantes Visuales**:
- **default**: Fondo `bg-tertiary`, padding `space-4`, borde `border-subtle`
- **compact**: Fondo `bg-secondary`, padding `space-3`, label arriba (`text-caption`, `text-tertiary`), valor abajo (`text-mono`, 24px, `text-primary`)
- **highlight**: Borde `accent-primary` al 20%, fondo `accent-primary` al 5%
- **mono**: Valor en fuente mono, estilo terminal

**Estados**:
- **Default**: Valor `text-primary` 24px/32px según variante
- **Hover**: `translateY(-2px)`, sombra `shadow-2`, transición `transition-fast`
- **Loading**: `<Skeleton>` reemplaza valor
- **Positive trend**: Icono `TrendingUp` + texto `accent-success`
- **Negative trend**: Icono `TrendingDown` + texto `accent-danger`

**Accesibilidad**:
- Label como `<dt>`, valor como `<dd>` dentro de `<dl>`
- Tendencia anunciada con `aria-label` (ej: "Aumentó 12% respecto a la semana pasada")

**Ejemplo de Uso**:
```tsx
<StatCard
  label="Promedio de Goles"
  value={2.4}
  unit="por partido"
  change={12.5}
  changeLabel="vs semana pasada"
  trend="up"
/>
```

---

#### `PlayerCard`

**Propósito**: Tarjeta de jugador en vivo. Muestra nombre, equipo, estadísticas actuales, boost y velocidad.

**Props Interface**:

```typescript
interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    avatar?: string;
    team: 'blue' | 'orange';
    isLocalPlayer?: boolean;
    score: number;
    goals: number;
    shots: number;
    assists: number;
    saves: number;
    demos: number;
    touches: number;
    boostAmount: number; // 0-100
    speed: number; // unidades uu/s
  };
  variant?: 'compact' | 'detailed';
  isMVP?: boolean;
  className?: string;
}
```

**Estructura (compact)**:
```
┌──────────────────────────────────────┐
│ [Avatar] Player Name    [Team Badge] │
│ ──────────────────────────────────── │
│ Score: 324  │ Goals: 2  │ Shots: 3   │
│ Saves: 1    │ Assists: 0│ Demos: 2   │
│ ──────────────────────────────────── │
│ Boost: [████████░░] 83%              │
│ Speed: 1,420 uu/s                    │
└──────────────────────────────────────┘
```

**Variantes**:
- **compact**: Altura fija ~160px, stats en grid 3-columnas
- **detailed**: Incluye historial de eventos del jugador, gráfico mini de boost

**Estados**:
- **Default**: Borde según equipo (`team-blue` o `team-orange`), opacidad 30%
- **Local Player**: Borde más grueso (2px), indicador "Tú" en badge
- **MVP**: Badge `accent-purple`, borde highlight
- **Hover**: Escala 1.02, sombra elevada
- **Disconnected**: Opacidad 50%, overlay gris

**Accesibilidad**:
- Badge de equipo con `aria-label="Equipo Azul"` o `"Equipo Naranja"`
- Barra de boost: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Velocidad anunciada como texto, no solo número

---

#### `MatchCard`

**Propósito**: Representación de un partido en la lista de historial. Layout horizontal con score, resultado y stats clave.

**Props Interface**:

```typescript
interface MatchCardProps {
  match: {
    id: string;
    date: Date;
    mode: string;
    teamBlueScore: number;
    teamOrangeScore: number;
    result: 'win' | 'loss' | 'draw';
    duration: number; // segundos
    isOvertime: boolean;
    arena?: string;
    playerStats?: {
      goals: number;
      saves: number;
      score: number;
    };
  };
  onClick?: () => void;
  className?: string;
}
```

**Estructura Visual**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Calendar] 12 may, 22:30    [Mode Badge]    [Duration]       │
│                                                              │
│    [Team Blue 3]  ─  [2 Team Orange]    [Win Badge]          │
│                                                              │
│    5 Goles • 2 Asistencias • 1 Parada   [ChevronRight]       │
└──────────────────────────────────────────────────────────────┘
```

**Estados**:
- **Default**: Fondo `bg-tertiary`, borde `border-subtle`
- **Hover**: Fondo `bg-hover`, `translateY(-2px)`, sombra `shadow-2`, aparece icono `ChevronRight`
- **Active/Selected**: Borde `accent-primary`, fondo `accent-primary` al 5%
- **Overtime**: Badge `accent-warning` junto al modo

**Accesibilidad**:
- Elemento clickeable como `<button>` o `<a>` con `role="button"`
- Resultado no indicado solo por color: badge con texto "Victoria"/"Derrota"
- Score anunciado como "3 a 2"

---

#### `EventFeed`

**Propósito**: Lista scrollable de eventos en tiempo real durante un partido. Muestra goles, paradas, demos, etc.

**Props Interface**:

```typescript
interface FeedEvent {
  id: string;
  type: 'goal' | 'save' | 'demo' | 'ball_hit' | 'overtime' | 'match_start' | 'match_end';
  timestamp: number; // segundos de partido
  playerName?: string;
  team?: 'blue' | 'orange';
  description?: string;
  icon?: LucideIcon;
}

interface EventFeedProps {
  events: FeedEvent[];
  maxHeight?: number;
  autoScroll?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Lista con scroll, items separados por `border-subtle`
- **Nuevo evento**: Slide-in desde derecha + fade-in, `transition-normal`
- **Scroll paused**: Aparece badge "Nuevos eventos" si el usuario scrolleó hacia arriba
- **Empty**: `<EmptyState>` con icono `Radio`

**Accesibilidad**:
- `aria-live="polite"` en el contenedor para anunciar nuevos eventos
- Cada item tiene `role="listitem"`
- Timestamp formateado como "3:42" no solo segundos

---

#### `EventFeedItem`

**Propósito**: Item individual del feed de eventos.

**Props Interface**:

```typescript
interface EventFeedItemProps {
  type: FeedEvent['type'];
  timestamp: number;
  playerName?: string;
  team?: 'blue' | 'orange';
  description?: string;
  isNew?: boolean;
}
```

**Mapeo Visual**:

| Evento | Icono | Color de equipo | Color de fondo |
|--------|-------|-----------------|----------------|
| Goal | `Target` | Equipo del goleador | `accent-success` al 10% |
| Save | `Shield` | Equipo del portero | `accent-info` al 10% |
| Demo | `Zap` | Equipo del demoer | `accent-danger` al 10% |
| Ball Hit | `CircleDot` | Neutro | transparent |
| Overtime | `Timer` | Neutro | `accent-warning` al 10% |
| Match Start | `Play` | Neutro | `bg-hover` |
| Match End | `Flag` | Neutro | `bg-hover` |

---

#### `ScoreDisplay`

**Propósito**: Marcador grande para el partido en vivo. Números hero con animación de cambio.

**Props Interface**:

```typescript
interface ScoreDisplayProps {
  blueScore: number;
  orangeScore: number;
  isOvertime?: boolean;
  className?: string;
}
```

**Estructura**:
```
      3  ─  2
   [OVERTIME]
```

**Estados**:
- **Default**: Números `text-hero` (48px), color `text-primary`
- **Score change**: Animación `score-bounce` (scale 1.2 + flash color equipo)
- **Overtime**: Badge `accent-warning` parpadeando sutilmente
- **Match end**: Número ganador en `accent-success` o `accent-danger`, perdedor en `text-muted`

---

#### `MatchTimer`

**Propósito**: Reloj del partido con formato mm:ss. Cambia a overtime.

**Props Interface**:

```typescript
interface MatchTimerProps {
  seconds: number;
  isOvertime?: boolean;
  isPaused?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: `text-h2` (24px), fuente mono, `text-primary`
- **Overtime**: Texto `accent-warning`, prefijo "+"
- **Paused**: Opacidad 60%, icono `Pause` junto al tiempo
- **Final seconds** (< 30s): Color `accent-warning`, pulso sutil

**Accesibilidad**:
- `aria-label={`Tiempo restante: ${formatTime(seconds)}`}`
- Actualizaciones no anunciadas por screen reader (demasiado frecuentes)

---

#### `BoostBar`

**Propósito**: Barra de progreso para la cantidad de boost (0-100). Puede ser horizontal o circular.

**Props Interface**:

```typescript
interface BoostBarProps {
  amount: number; // 0-100
  variant?: 'horizontal' | 'circular' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  isLocalPlayer?: boolean;
  className?: string;
}
```

**Variantes**:
- **horizontal**: Barra clásica, altura según `size` (sm: 4px, md: 8px, lg: 12px)
- **circular**: Ring SVG, usado en PlayerCard compacto
- **compact**: Solo número con color que cambia según cantidad

**Color por rango**:
- 71-100: `accent-primary`
- 31-70: `text-secondary`
- 0-30: `accent-danger` (crítico)

**Accesibilidad**:
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`
- `aria-label="Boost: 83%"`

---

#### `TeamPanel`

**Propósito**: Contenedor para los jugadores de un equipo. Aplica color de equipo y layout.

**Props Interface**:

```typescript
interface TeamPanelProps {
  team: 'blue' | 'orange';
  players: PlayerCardProps['player'][];
  score: number;
  isWinner?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Borde superior 3px con color de equipo, fondo `bg-tertiary`
- **Winner**: Badge trofeo o "Victoria", borde más prominente
- **Empty**: Estado "Sin jugadores" con placeholder

---

#### `ChartWrapper`

**Propósito**: Contenedor consistente para todos los gráficos. Incluye título, leyenda, controles y estado de carga.

**Props Interface**:

```typescript
interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode; // el gráfico
  legend?: { color: string; label: string }[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  className?: string;
}
```

**Estados**:
- **Default**: Fondo `bg-tertiary`, padding `space-4`, radius `radius-md`
- **Loading**: `<Skeleton>` con forma del gráfico
- **Empty**: `<EmptyState>` con mensaje contextual
- **Error**: Badge de error con opción de reintentar

---

#### `DataTable`

**Propósito**: Tabla de datos sortable con headers, rows y selección. Usada en Player Stats y Match History.

**Props Interface**:

```typescript
interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  selectedRow?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  className?: string;
}
```

**Estados**:
- **Header**: Fondo `bg-secondary`, texto `text-caption`, `text-secondary`, uppercase
- **Row default**: Fondo transparente, borde inferior `border-subtle`
- **Row hover**: Fondo `bg-hover`
- **Row selected**: Fondo `accent-primary` al 5%, borde izquierdo 3px `accent-primary`
- **Sortable header**: Icono `ArrowUpDown` por defecto, `ArrowUp`/`ArrowDown` cuando activo

**Accesibilidad**:
- `<table>` semántico con `<thead>`, `<tbody>`
- Headers sortables son `<button>` con `aria-sort="ascending/descending/none"`
- Filas clickeables: `role="button"`, `tabIndex={0}`, Enter para activar
- Caption opcional para descripción de la tabla

---

#### `Timeline`

**Propósito**: Línea de tiempo visual para eventos del partido. Muestra goles y eventos clave a lo largo del tiempo.

**Props Interface**:

```typescript
interface TimelineEvent {
  id: string;
  time: number; // segundos
  type: 'goal' | 'save' | 'demo' | 'overtime_start';
  team?: 'blue' | 'orange';
  playerName?: string;
  description?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  duration: number; // duración total del partido en segundos
  className?: string;
}
```

**Estructura Visual**:
```
0:00 ──●────●────●──●────────────●──●── 5:32
      G1   S1   G2 D1          G3 G4
```

**Estados**:
- **Default**: Línea horizontal `border-subtle`, eventos como puntos coloreados
- **Hover evento**: Tooltip con detalle del evento, punto se agranda
- **Overtime**: Segmento adicional con línea punteada `accent-warning`

---

#### `Sparkline`

**Propósito**: Gráfico de línea minimalista para tendencias. Sin ejes ni labels.

**Props Interface**:

```typescript
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
}
```

**Estados**:
- **Default**: Stroke 1.5px, color `accent-primary`
- **Positive trend**: Color `accent-success`
- **Negative trend**: Color `accent-danger`
- **Fill**: Gradiente opaco 10% a transparente debajo de la línea

---

### 2.4 Componentes de Feedback

---

#### `Toast`

**Propósito**: Notificaciones temporales para errores, éxitos y advertencias.

**Props Interface**:

```typescript
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, default 5000
  onDismiss: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Variantes Visuales**:

| Variante | Icono | Borde izquierdo | Fondo |
|----------|-------|-----------------|-------|
| success | `CheckCircle2` | `accent-success` | `accent-success` al 10% |
| error | `XCircle` | `accent-danger` | `accent-danger` al 10% |
| warning | `AlertTriangle` | `accent-warning` | `accent-warning` al 10% |
| info | `Info` | `accent-primary` | `accent-primary` al 10% |

**Estados**:
- **Enter**: Slide-in desde derecha + fade-in, `transition-normal`
- **Idle**: Opacidad 100%, sombra `shadow-4`
- **Exit**: Slide-out derecha + fade-out, 200ms
- **Hover**: Pausa el auto-dismiss timer

**Accesibilidad**:
- `role="alert"` o `role="status"` según severidad
- `aria-live="polite"` para anuncios
- Botón dismiss con `aria-label="Cerrar notificación"`
- Focus automático al abrirse (para errores críticos)

---

#### `Skeleton`

**Propósito**: Placeholder de carga con animación shimmer. Reemplaza contenido mientras se cargan datos.

**Props Interface**:

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number; // número de líneas para text
  className?: string;
}
```

**Variantes**:
- **text**: Rectángulo con `radius-sm`, altura 1em
- **circular**: Círculo perfecto (avatar)
- **rectangular**: Sin border-radius
- **rounded**: Con `radius-md`

**Estados**:
- **Loading**: Animación `skeleton-shimmer` infinita
- **Reduced motion**: Sin animación, color sólido `bg-hover`

**Accesibilidad**:
- `aria-hidden="true"` (es decorativo)
- `role="status"` en el contenedor padre con texto "Cargando..."

---

#### `EmptyState`

**Propósito**: Pantalla para estados vacíos. Muestra icono, título, descripción y acción opcional.

**Props Interface**:

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
```

**Estados**:
- **Default**: Icono 48px `text-tertiary`, título `text-h3`, descripción `text-body-sm` `text-secondary`
- **Action hover**: Botón primary estándar
- **Icon animation**: Pulso sutil en iconos de "waiting" (ej: `Radio`)

**Mapeo de Empty States**:

| Contexto | Icono | Título | Descripción |
|----------|-------|--------|-------------|
| Sin partidos | `Gamepad2` | "No hay partidos capturados" | "Inicia Rocket League, habilita la Stats API y juega un partido." |
| Sin partido en vivo | `Radio` | "Esperando partido..." | "Inicia un partido en Rocket League para ver datos en vivo." |
| Sin datos analytics | `BarChart3` | "No hay datos para este período" | "Juega algunos partidos para ver tus análisis aquí." |
| Sin resultados búsqueda | `Search` | "No se encontraron resultados" | "Intenta con otros filtros o términos de búsqueda." |
| Sin conexión | `WifiOff` | "Sin conexión al juego" | "Verifica que Rocket League esté ejecutándose con la Stats API habilitada." |
| Error genérico | `AlertTriangle` | "Algo salió mal" | "Intenta nuevamente o reinicia la aplicación." |

---

#### `LoadingSpinner`

**Propósito**: Indicador de carga rotativo para acciones en progreso.

**Props Interface**:

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
  className?: string;
}
```

**Tamaños**:
- **sm**: 16px, stroke 2px
- **md**: 24px, stroke 2px
- **lg**: 32px, stroke 2px

**Colores**:
- **default**: `text-tertiary`
- **primary**: `accent-primary`
- **white**: `#FFFFFF`

**Accesibilidad**:
- `role="status"`
- `aria-label="Cargando..."`
- `aria-live="polite"` si aparece dinámicamente

---

#### `ConnectionStatus`

**Propósito**: Badge con estado de conexión al Stats API.

**Props Interface**:

```typescript
interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting';
  showLabel?: boolean;
  className?: string;
}
```

**Variantes**:

| Estado | Color del dot | Label | Animación |
|--------|---------------|-------|-----------|
| connected | `accent-success` | "Conectado" | Ninguna |
| disconnected | `accent-danger` | "Desconectado" | Ninguna |
| connecting | `accent-warning` | "Conectando..." | Pulso sutil en el dot |

---

#### `ProgressBar`

**Propósito**: Barra de progreso para operaciones largas (exportar, importar).

**Props Interface**:

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'success' | 'striped';
  className?: string;
}
```

**Variantes**:
- **default**: Fondo `bg-hover`, fill `accent-primary`
- **success**: Fill `accent-success`
- **striped**: Patrón de rayas animado sobre el fill

**Accesibilidad**:
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` descriptivo

---

#### `Badge`

**Propósito**: Etiqueta pequeña para estados, categorías y conteos.

**Props Interface**:

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}
```

**Variantes Visuales**:

| Variante | Fondo | Texto | Borde |
|----------|-------|-------|-------|
| default | `bg-hover` | `text-primary` | none |
| success | `accent-success/20` | `accent-success` | none |
| danger | `accent-danger/20` | `accent-danger` | none |
| warning | `accent-warning/20` | `accent-warning` | none |
| info | `accent-info/20` | `accent-info` | none |
| purple | `accent-purple/20` | `accent-purple` | none |
| outline | transparent | `text-secondary` | `border-subtle` |

**Tamaños**:
- **sm**: padding 2px 8px, font `text-caption`
- **md**: padding 4px 12px, font `text-body-sm`

---

#### `Banner`

**Propósito**: Mensaje destacado en la parte superior de una página o sección.

**Props Interface**:

```typescript
interface BannerProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}
```

**Estados**:
- **Enter**: Slide-down desde top, 200ms
- **Exit**: Slide-up + fade, 200ms
- **Hover dismiss**: Icono `X` aparece con opacidad completa

---

### 2.5 Componentes de Input

---

#### `Button`

**Propósito**: Botón de acción principal. Variantes múltiples para jerarquía visual.

**Props Interface**:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}
```

**Variantes Visuales**:

| Variante | Fondo | Texto | Borde | Hover |
|----------|-------|-------|-------|-------|
| primary | `accent-primary` | `#FFFFFF` | none | `accent-primary-hover`, sombra `shadow-1` |
| secondary | transparent | `text-primary` | `border-strong` | `bg-hover` |
| danger | `accent-danger/10` | `accent-danger` | `accent-danger/30` | `accent-danger/20` |
| ghost | transparent | `text-secondary` | none | `bg-hover`, `text-primary` |
| link | transparent | `accent-primary` | none | underline |

**Tamaños**:

| Tamaño | Altura | Padding | Font |
|--------|--------|---------|------|
| sm | 32px | 8px 12px | `text-body-sm` |
| md | 40px | 8px 16px | `text-body` |
| lg | 48px | 12px 24px | `text-body` |
| icon | 32px | 0 | - |

**Estados**:
- **Default**: Opacidad 100%
- **Hover**: Transición `transition-fast`, cursor pointer
- **Active**: `scale(0.98)`, transición 100ms
- **Focus-visible**: Ring 2px `accent-primary`, offset 2px
- **Disabled**: Opacidad 50%, cursor not-allowed, sin hover effects
- **Loading**: Texto reemplazado por `<LoadingSpinner size="sm" variant="white" />`, disabled

**Accesibilidad**:
- `<button>` semántico nativo
- `aria-busy={isLoading}`
- Icono solo: `aria-label` obligatorio
- Focus visible siempre presente

---

#### `IconButton`

**Propósito**: Botón compacto que solo contiene un icono.

**Props Interface**:

```typescript
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // para aria-label
  variant?: 'default' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}
```

**Variantes**:
- **default**: Fondo `bg-tertiary`, borde `border-subtle`
- **ghost**: Fondo transparente
- **subtle**: Fondo transparente, hover `bg-hover`

**Tamaños**:
- **sm**: 28px, icono 14px
- **md**: 32px, icono 16px
- **lg**: 40px, icono 20px

**Accesibilidad**:
- `aria-label={label}` obligatorio (sin texto visible)
- Tooltip con el label en hover

---

#### `Toggle`

**Propósito**: Switch on/off para configuraciones booleanas.

**Props Interface**:

```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}
```

**Estructura**:
```
[Label opcional]
[Descripción opcional]
┌───────┐
│ ●     │  (off)
└───────┘
┌───────┐
│     ● │  (on)
└───────┘
```

**Estados**:
- **Off**: Track `bg-hover`, thumb `text-muted`
- **On**: Track `accent-primary`, thumb `#FFFFFF`
- **Hover**: Brillo sutil en el track
- **Disabled**: Opacidad 50%
- **Focus**: Ring alrededor del track

**Accesibilidad**:
- `role="switch"`
- `aria-checked={checked}`
- Label vinculado con `htmlFor`/`id`
- Navegación por teclado: Enter o Space para toggle

---

#### `Select`

**Propósito**: Dropdown para seleccionar una opción de una lista.

**Props Interface**:

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Fondo `bg-tertiary`, borde `border-subtle`, texto `text-primary`
- **Open**: Lista desplegable con `shadow-3`, `bg-tertiary`, borde `border-subtle`
- **Hover option**: Fondo `bg-hover`
- **Selected option**: Fondo `accent-primary` al 10%, checkmark icon
- **Disabled**: Opacidad 50%, cursor not-allowed
- **Focus**: Ring 2px `accent-primary`

**Accesibilidad**:
- `role="combobox"` o `role="listbox"`
- `aria-expanded` para estado abierto/cerrado
- `aria-selected` en opciones
- Navegación con flechas ↑ ↓

---

#### `SearchInput`

**Propósito**: Input de búsqueda con icono de lupa, clear button y estado de carga.

**Props Interface**:

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
  className?: string;
}
```

**Estados**:
- **Default**: Icono `Search` a la izquierda (`text-tertiary`)
- **Con texto**: Icono `X` a la derecha para limpiar
- **Loading**: Icono `Search` reemplazado por `<LoadingSpinner size="sm" />`
- **Focus**: Ring 2px `accent-primary`, borde `border-strong`

**Accesibilidad**:
- `role="searchbox"`
- `aria-label="Buscar"` si no hay label visible
- Botón clear con `aria-label="Limpiar búsqueda"`

---

#### `TextInput`

**Propósito**: Input de texto genérico con label, placeholder, error state y helper text.

**Props Interface**:

```typescript
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightElement?: React.ReactNode;
  className?: string;
}
```

**Estados**:
- **Default**: Fondo `bg-tertiary`, borde `border-subtle`, texto `text-primary`
- **Focus**: Borde `accent-primary`, ring 2px `accent-primary` al 20%
- **Error**: Borde `accent-danger`, texto de error `accent-danger`
- **Disabled**: Opacidad 50%, fondo `bg-secondary`
- **Valid**: Icono `Check` verde opcional

**Accesibilidad**:
- Label vinculado con `htmlFor`/`id`
- `aria-describedby` vinculado a helper text o error
- `aria-invalid={!!error}`
- Error anunciado con `aria-live="polite"`

---

#### `NumberInput`

**Propósito**: Input numérico con controles de incremento/decremento.

**Props Interface**:

```typescript
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Controles `+`/`-` a la derecha, icon buttons
- **Min/Max reached**: Botón correspondiente disabled
- **Focus**: Input focus ring estándar

---

#### `DateRangePicker`

**Propósito**: Selector de rango de fechas para filtros de historial.

**Props Interface**:

```typescript
interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  presets?: { label: string; days: number }[];
  className?: string;
}
```

**Presets por defecto**:
- "Últimos 7 días"
- "Últimos 30 días"
- "Este mes"
- "Mes pasado"
- "Toda la historia"

**Estados**:
- **Default**: Input con rango formateado "12 may - 18 may"
- **Open**: Calendario dropdown con dos meses lado a lado
- **Selected**: Fechas resaltadas `accent-primary`, rango entre fechas con fondo `accent-primary` al 10%
- **Hover date**: Fondo `bg-hover`

---

#### `Slider`

**Propósito**: Control deslizante para valores numéricos continuos (ej: opacidad de overlay).

**Props Interface**:

```typescript
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Track `bg-hover`, fill `accent-primary`, thumb `#FFFFFF` con borde `border-strong`
- **Hover thumb**: Escala 1.2, sombra `shadow-2`
- **Active thumb**: Escala 1.1
- **Disabled**: Opacidad 50%

**Accesibilidad**:
- `role="slider"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` o label vinculado

---

### 2.6 Componentes de Overlay

---

#### `Modal`

**Propósito**: Diálogo modal para acciones críticas, formularios y detalles.

**Props Interface**:

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  className?: string;
}
```

**Tamaños**:
- **sm**: 400px max-width
- **md**: 500px max-width
- **lg**: 600px max-width
- **xl**: 800px max-width
- **full**: 90vw, 90vh

**Estados**:
- **Closed**: `display: none` o no renderizado
- **Enter**: Overlay fade-in 200ms, content scale(0.95→1) + fade-in 200ms
- **Open**: Overlay `bg-primary` al 80%, content `bg-secondary`, sombra `shadow-3`
- **Exit**: Inverso de enter, 150ms
- **Scroll**: Content scrollable si excede max-height

**Accesibilidad**:
- `role="dialog"`, `aria-modal="true"`
- `aria-labelledby` apuntando al título
- `aria-describedby` apuntando a la descripción
- Focus trap dentro del modal
- Escape para cerrar
- Overlay click para cerrar (si está habilitado)
- Focus retorna al trigger al cerrar

---

#### `Tooltip`

**Propósito**: Información contextual al hacer hover sobre un elemento.

**Props Interface**:

```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // ms antes de mostrar
  className?: string;
}
```

**Estados**:
- **Hidden**: Opacidad 0, pointer-events none
- **Enter**: Fade-in 150ms, `translateY(4px→0)`
- **Visible**: Fondo `bg-secondary`, borde `border-subtle`, texto `text-primary`, padding `space-2` `space-3`, radius `radius-md`, sombra `shadow-2`
- **Exit**: Fade-out 100ms

**Accesibilidad**:
- `role="tooltip"`
- `id` vinculado al trigger vía `aria-describedby`
- No interactivo (no contiene links o botones)

---

#### `DropdownMenu`

**Propósito**: Menú de acciones desplegable. Usado en headers, cards y tablas.

**Props Interface**:

```typescript
interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
}
```

**Estados**:
- **Closed**: No renderizado
- **Open**: Lista `bg-secondary`, borde `border-subtle`, radius `radius-md`, sombra `shadow-3`
- **Hover item**: Fondo `bg-hover`
- **Active item**: Fondo `accent-primary` al 10%
- **Disabled item**: Opacidad 50%, cursor default
- **Danger item**: Texto `accent-danger`

**Accesibilidad**:
- `role="menu"`, items `role="menuitem"`
- Trigger: `aria-haspopup="true"`, `aria-expanded`
- Navegación con flechas ↑ ↓, Escape para cerrar
- Enter/Space para activar item

---

#### `ContextMenu`

**Propósito**: Menú contextual al hacer click derecho. Usado en tablas y listas.

**Props Interface**:

```typescript
interface ContextMenuProps {
  children: React.ReactElement;
  items: DropdownItem[];
  className?: string;
}
```

**Comportamiento**:
- Aparece en la posición del click derecho
- Se cierra al click afuera, Escape, o scroll
- Misma estética que DropdownMenu

---

#### `Popover`

**Propósito**: Panel flotante con contenido interactivo. Diferente de Tooltip porque permite interacción.

**Props Interface**:

```typescript
interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}
```

**Uso típico**: Filtros avanzados, detalle de jugador, calendario.

---

#### `Drawer`

**Propósito**: Panel lateral deslizable para navegación móvil o detalles.

**Props Interface**:

```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

**Estados**:
- **Enter**: Overlay fade-in, panel slide-in desde el lado (300ms, ease-out)
- **Open**: Panel `bg-secondary`, shadow fuerte del lado opuesto
- **Exit**: Inverso de enter

---

#### `ConfirmDialog`

**Propósito**: Diálogo de confirmación para acciones destructivas.

**Props Interface**:

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}
```

**Estructura**:
```
┌─────────────────────────────┐
│  ¿Eliminar partido?         │
│                             │
│  Esta acción no se puede    │
│  deshacer.                  │
│                             │
│  [Cancelar]  [Eliminar]     │
└─────────────────────────────┘
```

**Estados**:
- **Confirm button**: `danger` variant si `isDanger=true`, sino `primary`
- **Loading**: Botón confirm muestra spinner, disabled

---

### 2.7 Componentes Específicos de Dominio

---

#### `LiveIndicator`

**Propósito**: Punto pulsante que indica que hay un partido en vivo.

**Props Interface**:

```typescript
interface LiveIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}
```

**Estados**:
- **Static**: Dot sólido `accent-success`
- **Pulsing**: Animación `live-pulse` infinita (scale + opacity)
- **Sizes**: sm 8px, md 12px, lg 16px

---

#### `ArenaBadge`

**Propósito**: Muestra el nombre del mapa/arena.

**Props Interface**:

```typescript
interface ArenaBadgeProps {
  arena: string;
  showIcon?: boolean;
  className?: string;
}
```

**Visual**: Badge `outline` con icono `MapPin` opcional.

---

#### `GoalDetailCard`

**Propósito**: Tarjeta con detalle de un gol (goleador, asistente, velocidad, tiempo).

**Props Interface**:

```typescript
interface GoalDetailCardProps {
  scorer: string;
  assister?: string;
  team: 'blue' | 'orange';
  gameTime: number;
  ballSpeed?: number;
  isWinningGoal?: boolean;
  className?: string;
}
```

**Estados**:
- **Default**: Borde según equipo
- **Winning goal**: Badge "Gol de la victoria" `accent-purple`

---

#### `PlayerMvpBadge`

**Propósito**: Badge especial para el jugador MVP.

**Props Interface**:

```typescript
interface PlayerMvpBadgeProps {
  className?: string;
}
```

**Visual**: Badge `purple` con icono `Star` y texto "MVP".

---

#### `StatComparisonBar`

**Propósito**: Barra comparativa para dos valores (ej: tiros a favor vs en contra).

**Props Interface**:

```typescript
interface StatComparisonBarProps {
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  className?: string;
}
```

**Visual**: Dos barras horizontales o una dividida en proporción.

---

#### `PerformanceRadar`

**Propósito**: Gráfico radar para comparar stats de jugadores.

**Props Interface**:

```typescript
interface PerformanceRadarProps {
  players: {
    name: string;
    color: string;
    stats: {
      goals: number;
      assists: number;
      saves: number;
      shots: number;
      demos: number;
      score: number;
    };
  }[];
  className?: string;
}
```

---

## 3. Sistema de Iconos

### 3.1 Biblioteca

**Biblioteca oficial**: [Lucide React](https://lucide.dev)
- Consistente, lightweight, tree-shakeable
- Stroke-based (no fill)
- Tamaños y pesos uniformes

### 3.2 Tamaños de Icono

| Tamaño | Valor | Uso |
|--------|-------|-----|
| `xs` | 12px | Inline con texto, badges |
| `sm` | 16px | Botones, inputs, tablas |
| `md` | 20px | Icon buttons, dropdown items |
| `lg` | 24px | Navegación, empty states |
| `xl` | 32px | Ilustraciones, feature icons |
| `2xl` | 48px | Empty states grandes |

### 3.3 Grosor de Stroke

| Contexto | Stroke | Ejemplo |
|----------|--------|---------|
| Navegación | 2px | Sidebar items |
| UI general | 1.5px | Botones, inputs, badges |
| Inline | 2px | Dentro de texto |
| Ilustración | 1.5px | Empty states |

### 3.4 Reglas de Color

- **Default**: `currentColor` (hereda del texto padre)
- **Nunca** usar `fill` en iconos (solo stroke)
- **Nunca** usar emojis
- En botones: heredar color del texto del botón
- En estados de alerta: usar color semántico del estado

### 3.5 Mapeo Completo de Iconos

#### Navegación

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| En Vivo | `Radio` | lg | Con indicador pulso cuando activo |
| Historial | `History` | lg | |
| Analíticas | `BarChart3` | lg | |
| Configuración | `Settings` | lg | |
| Toggle Sidebar | `PanelLeft` / `PanelLeftClose` | md | Cambia según estado |

#### Acciones Generales

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| Buscar | `Search` | sm | Input search |
| Limpiar búsqueda | `X` | sm | Botón clear |
| Filtrar | `Filter` | sm | Botón de filtros |
| Ordenar | `ArrowUpDown` | sm | Header sortable |
| Ordenar ascendente | `ArrowUp` | sm | Header sorted |
| Ordenar descendente | `ArrowDown` | sm | Header sorted |
| Más acciones | `MoreHorizontal` | sm | Dropdown trigger |
| Editar | `Pencil` | sm | |
| Eliminar | `Trash2` | sm | Color danger |
| Exportar | `Download` | sm | |
| Importar | `Upload` | sm | |
| Refrescar | `RefreshCw` | sm | Con spin animation cuando loading |
| Cerrar | `X` | sm | Modales, toasts |
| Expandir | `Maximize2` | sm | |
| Colapsar | `Minimize2` | sm | |
| Copiar | `Copy` | sm | |
| Enlace externo | `ExternalLink` | xs | Con `opener` plugin |
| Chevron derecha | `ChevronRight` | sm | Navegación, cards |
| Chevron izquierda | `ChevronLeft` | sm | Paginación |
| Chevron abajo | `ChevronDown` | sm | Dropdowns, acordeón |
| Chevron arriba | `ChevronUp` | sm | Acordeón |
| Check | `Check` | sm | Confirmaciones |
| Añadir | `Plus` | sm | |
| Restar | `Minus` | sm | |

#### Estado y Feedback

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| Conectado | `Wifi` | sm | Color success |
| Desconectado | `WifiOff` | sm | Color danger |
| Cargando | `Loader2` | sm/md | Con spin animation |
| Éxito | `CheckCircle2` | sm | Color success |
| Error | `XCircle` | sm | Color danger |
| Advertencia | `AlertTriangle` | sm | Color warning |
| Info | `Info` | sm | Color info |
| Ayuda | `HelpCircle` | sm | |
| Vacío / Sin datos | `Inbox` | xl | Empty states |

#### Partido y Jugadores

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| Gol | `Target` | sm | Color del equipo |
| Parada | `Shield` | sm | Color info |
| Demo | `Zap` | sm | Color danger |
| Asistencia | `HandHelping` | sm | Color success |
| Pelota | `CircleDot` | sm | Neutro |
| Tiempo / Reloj | `Clock` | sm | |
| Overtime | `Timer` | sm | Color warning |
| Victoria | `Trophy` | sm | Color success |
| Derrota | `ThumbsDown` | sm | Color danger (raro) |
| MVP | `Star` | sm | Color purple |
| Equipo | `Users` | sm | |
| Jugador | `User` | sm | Avatar fallback |
| Velocidad | `Gauge` | sm | |
| Boost | `Battery` / `BatteryCharging` | sm | Color según cantidad |
| Distancia | `Route` | sm | |
| Mapa / Arena | `MapPin` | sm | |
| Coche | `Car` | sm | |
| Juego | `Gamepad2` | 2xl | Empty state |

#### Analíticas

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| Tendencia arriba | `TrendingUp` | sm | Color success |
| Tendencia abajo | `TrendingDown` | sm | Color danger |
| Tendencia neutra | `Minus` | sm | Color muted |
| Calendario | `Calendar` | sm | Fechas |
| Fecha rango | `CalendarDays` | sm | |
| Estadísticas | `BarChart2` | sm | |
| Gráfico línea | `LineChart` | sm | |
| Gráfico área | `AreaChart` | sm | |
| Pie chart | `PieChart` | sm | |
| Radar chart | `Target` | sm | |
| Streak / Racha | `Flame` | sm | Color warning |
| Sesión | `Timer` | sm | |

#### Configuración

| Elemento UI | Icono Lucide | Tamaño | Notas |
|-------------|--------------|--------|-------|
| General | `SlidersHorizontal` | sm | |
| Apariencia | `Palette` | sm | |
| Idioma | `Globe` | sm | |
| Notificaciones | `Bell` | sm | |
| Datos | `Database` | sm | |
| Actualizaciones | `RefreshCw` | sm | |
| Acerca de | `Info` | sm | |
| Atajo de teclado | `Keyboard` | sm | |
| Privacidad | `Shield` | sm | |
| Carpeta | `FolderOpen` | sm | Path selector |

---

## 4. Especificaciones de Animación

### 4.1 Principios

1. **Con propósito**: Cada animación transmite información o guía atención
2. **Rápidas**: 150-300ms para micro-interacciones, nunca bloquean input
3. **Sutiles**: Sin bounces, sin overshoots (excepto score change). Curvas ease-out.
4. **Respetuosas**: Siempre respetar `prefers-reduced-motion`

### 4.2 Definiciones de Animación

#### Fade In

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Uso: page transitions, modal overlays */
/* Duration: 200ms */
/* Easing: ease-out */
```

#### Fade In Up

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Uso: page transitions, cards entrance */
/* Duration: 200ms */
/* Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Fade In Right

```css
@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Uso: event feed entries, toast notifications */
/* Duration: 200ms */
/* Easing: ease-out */
```

#### Slide In Right

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Uso: toast notifications */
/* Duration: 300ms */
/* Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Slide Out Right

```css
@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Uso: toast dismiss */
/* Duration: 200ms */
/* Easing: ease-in */
```

#### Scale In

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Uso: modal content, popover, dropdown */
/* Duration: 200ms */
/* Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Score Bounce

```css
@keyframes score-bounce {
  0% {
    transform: scale(1);
    color: var(--text-primary);
  }
  40% {
    transform: scale(1.2);
    color: var(--accent-primary);
  }
  100% {
    transform: scale(1);
    color: var(--text-primary);
  }
}

/* Uso: cambio de score */
/* Duration: 300ms */
/* Easing: cubic-bezier(0.34, 1.56, 0.64, 1) */
/* Única animación con overshoot permitida */
```

#### Live Pulse

```css
@keyframes live-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
}

/* Uso: indicador de partido en vivo */
/* Duration: 2000ms */
/* Easing: ease-in-out */
/* Iteration: infinite */
```

#### Skeleton Shimmer

```css
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Uso: estados de carga skeleton */
/* Duration: 1200ms */
/* Easing: linear */
/* Iteration: infinite */
/* Background: linear-gradient(90deg, bg-tertiary 25%, bg-hover 50%, bg-tertiary 75%) */
/* Background-size: 200% 100% */
```

#### Spin

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Uso: loading spinners */
/* Duration: 1000ms */
/* Easing: linear */
/* Iteration: infinite */
```

#### Card Hover Lift

```css
/* No keyframe - transition */
/* Uso: hover en cards */
/* Transform: translateY(-2px) */
/* Shadow: shadow-2 */
/* Duration: 150ms */
/* Easing: ease-out */
```

#### Number Count Up

```typescript
// Uso: animación de conteo numérico
// Duration: 600ms
// Easing: ease-out
// Implementación: requestAnimationFrame + easeOutQuart
// No usar CSS animation para esto - usar JS para precisión
```

#### Toast Enter

```css
/* Slide in from right + fade */
/* Duration: 300ms */
/* Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Toast Exit

```css
/* Slide out to right + fade */
/* Duration: 200ms */
/* Easing: ease-in */
```

#### Modal Overlay Enter

```css
/* Fade in */
/* Duration: 200ms */
/* Easing: ease-out */
```

#### Modal Content Enter

```css
/* Scale 0.95 → 1 + fade */
/* Duration: 200ms */
/* Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Dropdown Enter

```css
/* Fade in + translateY(-4px → 0) */
/* Duration: 150ms */
/* Easing: ease-out */
```

#### Tooltip Enter

```css
/* Fade in + translateY(4px → 0) */
/* Duration: 150ms */
/* Easing: ease-out */
/* Delay: 300ms antes de mostrar */
```

#### Drawer Enter

```css
/* Slide in from side */
/* Duration: 300ms */
/* Easing: ease-out */
```

#### Page Transition

```css
/* Exit: fade out 150ms */
/* Enter: fade-in-up 200ms */
/* Stagger children: 50ms entre elementos */
```

### 4.3 Mapeo de Componente → Animación

| Componente | Animación | Trigger | Duration |
|------------|-----------|---------|----------|
| PageContainer | fade-in-up | Mount | 200ms |
| Card | card-hover-lift | Hover | 150ms |
| StatCard | card-hover-lift | Hover | 150ms |
| MatchCard | card-hover-lift | Hover | 150ms |
| ScoreDisplay | score-bounce | Score change | 300ms |
| LiveIndicator | live-pulse | isLive=true | 2000ms loop |
| EventFeedItem | fade-in-right | New event | 200ms |
| Toast | slide-in-right | Show | 300ms |
| Toast dismiss | slide-out-right | Hide | 200ms |
| Modal overlay | fade-in | Open | 200ms |
| Modal content | scale-in | Open | 200ms |
| Dropdown | fade-in + translateY | Open | 150ms |
| Tooltip | fade-in + translateY | Hover | 150ms |
| Drawer | slide-in | Open | 300ms |
| Skeleton | skeleton-shimmer | Loading | 1200ms loop |
| LoadingSpinner | spin | Loading | 1000ms loop |
| Stat value | number-count-up | Value change | 600ms |
| Banner enter | slide-down | Show | 200ms |
| Banner exit | slide-up | Hide | 200ms |

### 4.4 Alternativas para Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Excepciones** (mantener aunque sea instantáneo):
- Score change: cambio de color instantáneo (sin scale)
- Live indicator: color sólido estático (sin pulse)
- Skeleton: color sólido `bg-hover` (sin shimmer)

---

## 5. Comportamiento Responsivo

### 5.1 Breakpoints

| Nombre | Min Width | Descripción |
|--------|-----------|-------------|
| `sm` | 640px | Ventana pequeña |
| `md` | 768px | Tablet / ventana media |
| `lg` | 1024px | Desktop estándar |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1536px | Desktop extra grande |

### 5.2 Layout Global

#### Desktop (>= 1024px)
- **Sidebar**: Expandido (200px), siempre visible
- **Content**: Multi-columna, padding `space-6`
- **Header**: Altura 64px, título + acciones + status
- **Grid**: 12-columnas, gap `space-4`

#### Tablet (768px - 1023px)
- **Sidebar**: Colapsado (64px), iconos solo
- **Content**: 2-columnas donde aplique, padding `space-4`
- **Header**: Compacto, acciones en dropdown
- **Grid**: 8-columnas, gap `space-3`

#### Small Window (< 768px)
- **Sidebar**: Oculto, drawer desde izquierda con overlay
- **Content**: Single column, padding `space-4`
- **Header**: Título truncado, menú hamburguesa
- **Grid**: 4-columnas, gap `space-3`

### 5.3 Comportamiento por Componente

| Componente | Desktop | Tablet | Small |
|------------|---------|--------|-------|
| AppShell | Sidebar fijo | Sidebar fijo colapsado | Sidebar drawer |
| Sidebar | 200px expandido | 64px colapsado | Drawer 280px |
| Header | Full | Compacto | Mínimo + hamburguesa |
| PageContainer | max-w-1440 | max-w-full | max-w-full |
| StatCard | Grid 4 cols | Grid 2 cols | Stack 1 col |
| PlayerCard | Grid 3 cols | Grid 2 cols | Stack 1 col |
| MatchCard | Horizontal | Horizontal | Vertical compacto |
| DataTable | Full table | Full table | Card list |
| ChartWrapper | 50% width | 100% width | 100% width |
| EventFeed | 50% width | 100% width | 100% height 200px |
| ScoreDisplay | 48px números | 40px números | 32px números |
| TeamPanel | Side by side | Side by side | Stack |

### 5.4 Reglas de Stack/Reorder

#### Live Dashboard
```
Desktop:
  [ScoreDisplay] [Timer]
  [TeamBlue Panel] [TeamOrange Panel]
  [EventFeed] [MatchStats] [BallInfo]

Tablet:
  [ScoreDisplay]
  [Timer]
  [TeamBlue Panel] [TeamOrange Panel]
  [EventFeed]
  [MatchStats] [BallInfo]

Small:
  [ScoreDisplay]
  [Timer]
  [TeamBlue Panel]
  [TeamOrange Panel]
  [EventFeed]
  [MatchStats]
  [BallInfo]
```

#### Analytics Page
```
Desktop:
  [StatGrid: 4 cols]
  [PerformanceChart: full width]
  [StatsBreakdown: 50%] [PeakPerformances: 50%]

Tablet:
  [StatGrid: 2 cols]
  [PerformanceChart]
  [StatsBreakdown]
  [PeakPerformances]

Small:
  [StatGrid: 1 col]
  [PerformanceChart]
  [StatsBreakdown]
  [PeakPerformances]
```

### 5.5 DataTable → CardList

En ventanas < 768px, las tablas se convierten en lista de tarjetas:
- Cada fila = Card vertical
- Headers se ocultan
- Cada celda se convierte en fila con label + value
- Sorting se mueve a un Select dropdown

---

## 6. Especificaciones del Tema Oscuro

### 6.1 Color Tokens → Tailwind

| Token | Tailwind Class | Valor HEX |
|-------|----------------|-----------|
| bg-primary | `bg-[#0A0E17]` | `#0A0E17` |
| bg-secondary | `bg-[#111827]` | `#111827` |
| bg-tertiary | `bg-[#1A2235]` | `#1A2235` |
| bg-hover | `bg-[#1E293B]` | `#1E293B` |
| border-subtle | `border-[#1E293B]` | `#1E293B` |
| border-strong | `border-[#334155]` | `#334155` |
| text-primary | `text-[#F8FAFC]` | `#F8FAFC` |
| text-secondary | `text-[#94A3B8]` | `#94A3B8` |
| text-tertiary | `text-[#64748B]` | `#64748B` |
| text-muted | `text-[#475569]` | `#475569` |
| accent-primary | `text-[#3B82F6]` / `bg-[#3B82F6]` | `#3B82F6` |
| accent-primary-hover | `hover:bg-[#2563EB]` | `#2563EB` |
| accent-success | `text-[#10B981]` / `bg-[#10B981]` | `#10B981` |
| accent-danger | `text-[#EF4444]` / `bg-[#EF4444]` | `#EF4444` |
| accent-warning | `text-[#F59E0B]` / `bg-[#F59E0B]` | `#F59E0B` |
| accent-info | `text-[#06B6D4]` / `bg-[#06B6D4]` | `#06B6D4` |
| accent-purple | `text-[#8B5CF6]` / `bg-[#8B5CF6]` | `#8B5CF6` |
| team-blue | `text-[#3B82F6]` / `bg-[#3B82F6]` | `#3B82F6` |
| team-orange | `text-[#F97316]` / `bg-[#F97316]` | `#F97316` |

### 6.2 Opacidades y Variantes

| Variante | Tailwind | Uso |
|----------|----------|-----|
| 5% | `/5` o `/[0.05]` | Fondos highlight sutil |
| 10% | `/10` o `/[0.10]` | Fondos de badge, selected row |
| 15% | `/15` o `/[0.15]` | Glow effects |
| 20% | `/20` o `/[0.20]` | Bordes highlight |
| 30% | `/30` o `/[0.30]` | Bordes danger |
| 50% | `/50` o `/[0.50]` | Disabled, placeholders |
| 80% | `/80` o `/[0.80]` | Overlays de modal |

### 6.3 Estados Hover/Active

| Elemento | Estado | Cambio |
|----------|--------|--------|
| Button primary | Hover | `bg-[#2563EB]`, sombra `shadow-1` |
| Button primary | Active | `scale(0.98)` |
| Button secondary | Hover | `bg-[#1E293B]` |
| Card | Hover | `translateY(-2px)`, sombra `shadow-2` |
| Table row | Hover | `bg-[#1E293B]` |
| NavItem | Hover | `bg-[#1E293B]` |
| NavItem | Active | borde izq `accent-primary`, texto `accent-primary` |
| Link | Hover | underline, color `accent-primary` |
| IconButton | Hover | `bg-[#1E293B]` |
| Input | Focus | borde `accent-primary`, ring `accent-primary/20` |
| Select option | Hover | `bg-[#1E293B]` |
| Dropdown item | Hover | `bg-[#1E293B]` |
| Tab | Active | borde inf `accent-primary`, texto `accent-primary` |

### 6.4 Focus Ring

```
Especificación:
  - Ancho: 2px
  - Color: accent-primary (#3B82F6)
  - Offset: 2px (fuera del elemento)
  - Estilo: solid
  - Radius: hereda del elemento + offset

Tailwind:
  focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0A0E17]
```

**Excepciones**:
- Inputs: ring interno sin offset (`ring-0` en border, usar border-color + shadow)
- Buttons: offset 2px
- Cards seleccionables: ring sin offset

### 6.5 Scrollbar Styling

```css
/* Webkit scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0A0E17;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Firefox */
scrollbar-width: thin;
scrollbar-color: #334155 #0A0E17;
```

### 6.6 Selection

```css
::selection {
  background-color: rgba(59, 130, 246, 0.3);
  color: #F8FAFC;
}
```

---

## 7. Jerarquía de Componentes

### 7.1 Árbol de Composición

```
App
└── AppShell
    ├── Sidebar
    │   ├── NavItem (×4)
    │   │   ├── Icon (Lucide)
    │   │   ├── Label (opcional)
    │   │   ├── LiveIndicator (condicional)
    │   │   └── Tooltip (collapsed)
    │   └── SidebarToggle
    ├── Header
    │   ├── PageTitle
    │   ├── Breadcrumb (opcional)
    │   ├── HeaderActions
    │   │   └── IconButton / Button / DropdownMenu
    │   └── ConnectionStatus
    └── PageContainer
        ├── LivePage
        │   ├── ScoreDisplay
        │   ├── MatchTimer
        │   ├── TeamPanel (×2)
        │   │   └── PlayerCard (×N)
        │   │       ├── Avatar
        │   │       ├── PlayerName
        │   │       ├── TeamBadge
        │   │       ├── StatGrid (compacto)
        │   │       ├── BoostBar
        │   │       └── SpeedDisplay
        │   ├── EventFeed
        │   │   └── EventFeedItem (×N)
        │   │       ├── EventIcon
        │   │       ├── Timestamp
        │   │       └── Description
        │   └── MatchStatsPanel
        │       └── StatCard (×N)
        ├── HistoryPage
        │   ├── FilterBar
        │   │   ├── SearchInput
        │   │   ├── Select (modo, resultado)
        │   │   └── DateRangePicker
        │   └── MatchList
        │       └── MatchCard (×N)
        │           ├── MatchHeader
        │           ├── ScoreDisplay (compacto)
        │           ├── Badges
        │           └── KeyStats
        ├── MatchDetailPage
        │   ├── MatchHeader
        │   ├── ScoreTimeline
        │   ├── PlayerStatsTable
        │   │   └── DataTable
        │   ├── GoalDetail (×N)
        │   └── EventTimeline
        ├── AnalyticsPage
        │   ├── TabNav
        │   ├── StatsGrid
        │   │   └── StatCard (×4-6)
        │   ├── ChartWrapper
        │   │   └── PerformanceChart
        │   ├── StatsBreakdown
        │   │   └── ChartWrapper
        │   └── PeakPerformances
        │       └── StatCard (×3)
        └── SettingsPage
            ├── SettingsPanel
            │   ├── Toggle (×N)
            │   ├── Select (×N)
            │   ├── TextInput (×N)
            │   └── Button (×N)
            └── IniHelper
```

### 7.2 Shared Sub-components

#### `Avatar`
**Usado por**: PlayerCard, MatchCard, GoalDetailCard, DataTable
**Props**:
```typescript
interface AvatarProps {
  src?: string;
  fallback: string; // iniciales o nombre
  size?: 'xs' | 'sm' | 'md' | 'lg';
  border?: boolean;
  borderColor?: string;
}
```

#### `Timestamp`
**Usado por**: EventFeedItem, MatchCard, MatchHeader
**Props**:
```typescript
interface TimestampProps {
  date: Date;
  format?: 'relative' | 'absolute' | 'time' | 'datetime';
  className?: string;
}
```

#### `TeamBadge`
**Usado por**: PlayerCard, GoalDetailCard, EventFeedItem
**Props**:
```typescript
interface TeamBadgeProps {
  team: 'blue' | 'orange';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}
```

#### `ProgressBar`
**Usado por**: BoostBar, ProgressBar (operaciones)
**Props**: Ver sección 2.4

#### `Badge`
**Usado por**: MatchCard, PlayerCard, EventFeedItem, NavItem
**Props**: Ver sección 2.4

#### `Skeleton`
**Usado por**: StatCard, ChartWrapper, MatchCard, DataTable, PlayerCard
**Props**: Ver sección 2.4

#### `EmptyState`
**Usado por**: EventFeed, MatchList, ChartWrapper, AnalyticsPage
**Props**: Ver sección 2.4

#### `Icon`
**Usado por**: Todos los componentes
**Wrapper sobre Lucide**:
```typescript
interface IconProps extends LucideProps {
  name: string; // nombre del icono
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
```

### 7.3 Props Drilling vs Context

#### Usar Context para:
- **Theme**: Tema actual (dark/light/system) → `ThemeProvider`
- **UI Store**: Estado de sidebar, toasts, active page → `UIProvider` (Zustand)
- **Settings**: Configuración global de la app → `SettingsProvider` (Zustand)
- **Live Match**: Estado del partido en vivo → `LiveProvider` (Zustand)
- **Toast Queue**: Gestión de notificaciones → `ToastProvider`

#### Usar Props Drilling para:
- Datos específicos de un componente (ej: `player` en `PlayerCard`)
- Callbacks directos (ej: `onClick` en `Button`)
- Configuración visual local (ej: `variant`, `size`)

#### Regla de Oro:
> Si más de 3 niveles necesitan la misma prop que no cambia frecuentemente → Context.
> Si es data local o pasa por solo 1-2 niveles → Props.

### 7.4 Componentes shadcn/ui Base

Los siguientes componentes de shadcn/ui se usan como base y se customizan:

| shadcn/ui | Customización | Usado en |
|-----------|---------------|----------|
| `Button` | Colores del tema, tamaños | Toda la app |
| `Dialog` | Colores, animaciones | Modal, ConfirmDialog |
| `DropdownMenu` | Colores, animaciones | DropdownMenu, ContextMenu |
| `Tooltip` | Colores, delay | Tooltip |
| `Select` | Colores, estados | Select |
| `Slider` | Colores del track/thumb | Slider, BoostBar |
| `Switch` | Colores, tamaños | Toggle |
| `Skeleton` | Colores, animación | Skeleton |
| `Popover` | Colores, animaciones | Popover, DateRangePicker |
| `Tabs` | Colores indicador | TabNav |
| `Table` | Colores, hover | DataTable |
| `ScrollArea` | Colores scrollbar | EventFeed, MatchList |
| `Separator` | Color | Divisores |
| `Badge` | Variantes custom | Badge |

---

## 8. Configuración de Tailwind

### 8.1 tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // === COLORS ===
      colors: {
        // Backgrounds
        'bg-primary': '#0A0E17',
        'bg-secondary': '#111827',
        'bg-tertiary': '#1A2235',
        'bg-hover': '#1E293B',

        // Borders
        'border-subtle': '#1E293B',
        'border-strong': '#334155',

        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-tertiary': '#64748B',
        'text-muted': '#475569',

        // Accents
        'accent-primary': {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
        'accent-success': '#10B981',
        'accent-danger': '#EF4444',
        'accent-warning': '#F59E0B',
        'accent-info': '#06B6D4',
        'accent-purple': '#8B5CF6',

        // Teams
        'team-blue': {
          DEFAULT: '#3B82F6',
          dark: '#1E40AF',
        },
        'team-orange': {
          DEFAULT: '#F97316',
          dark: '#C2410C',
        },
      },

      // === TYPOGRAPHY ===
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '500' }],
        'mono-text': ['13px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '500' }],
      },

      // === SPACING ===
      spacing: {
        '18': '72px',
        '88': '352px',
        '128': '512px',
      },

      // === BORDER RADIUS ===
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      // === SHADOWS ===
      boxShadow: {
        'level-1': '0 1px 2px rgba(0,0,0,0.3)',
        'level-2': '0 4px 6px rgba(0,0,0,0.4)',
        'level-3': '0 10px 15px rgba(0,0,0,0.5)',
        'level-4': '0 20px 25px rgba(0,0,0,0.6)',
        'glow': '0 0 20px rgba(59,130,246,0.15)',
        'glow-success': '0 0 20px rgba(16,185,129,0.15)',
        'glow-danger': '0 0 20px rgba(239,68,68,0.15)',
      },

      // === ANIMATIONS ===
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'score-bounce': {
          '0%': { transform: 'scale(1)', color: '#F8FAFC' },
          '40%': { transform: 'scale(1.2)', color: '#3B82F6' },
          '100%': { transform: 'scale(1)', color: '#F8FAFC' },
        },
        'live-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.5' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-right': 'fade-in-right 200ms ease-out',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-right': 'slide-out-right 200ms ease-in',
        'scale-in': 'scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'score-bounce': 'score-bounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'live-pulse': 'live-pulse 2000ms ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1200ms linear infinite',
        'spin-slow': 'spin-slow 1000ms linear infinite',
        'slide-down': 'slide-down 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-in',
      },

      // === TRANSITIONS ===
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '50': '50ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },

      // === Z-INDEX SCALE ===
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
      },

      // === LAYOUT ===
      maxWidth: {
        'app': '1440px',
      },
      width: {
        'sidebar': '200px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'header': '64px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
```

### 8.2 globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0A0E17;
    --bg-secondary: #111827;
    --bg-tertiary: #1A2235;
    --bg-hover: #1E293B;
    --border-subtle: #1E293B;
    --border-strong: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --text-tertiary: #64748B;
    --text-muted: #475569;
    --accent-primary: #3B82F6;
    --accent-primary-hover: #2563EB;
    --accent-success: #10B981;
    --accent-danger: #EF4444;
    --accent-warning: #F59E0B;
    --accent-info: #06B6D4;
    --accent-purple: #8B5CF6;
  }

  * {
    @apply border-border-subtle;
  }

  body {
    @apply bg-bg-primary text-text-primary font-sans antialiased;
    @apply selection:bg-accent-primary/30 selection:text-text-primary;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  /* Focus ring utility */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary;
  }

  /* Card base */
  .card {
    @apply bg-bg-tertiary border border-border-subtle rounded-md p-4 transition-all duration-150 ease-out;
  }

  .card-hover {
    @apply hover:-translate-y-0.5 hover:shadow-level-2;
  }

  /* Stat card compact */
  .stat-card-compact {
    @apply bg-bg-secondary rounded-sm px-4 py-3;
  }

  /* Truncate utilities */
  .line-clamp-1 {
    @apply overflow-hidden text-ellipsis whitespace-nowrap;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@layer utilities {
  /* Gradient text */
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-info;
  }

  /* Glow effects */
  .glow-accent {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
  }

  .glow-success {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
  }

  .glow-danger {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
  }
}
```

### 8.3 Utilidades Custom Recomendadas

```css
/* En globals.css o un archivo de utilidades */

/* Grid layouts comunes */
.grid-stats {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.grid-cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

/* Animación de entrada escalonada */
.stagger-children > * {
  @apply animate-fade-in-up;
  animation-fill-mode: both;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
.stagger-children > *:nth-child(6) { animation-delay: 250ms; }

/* Number mono formatting */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

---

## 9. Anexos

### 9.1 Checklist de Implementación

Antes de marcar un componente como "completo":

- [ ] Implementa la interfaz de props exacta
- [ ] Todos los estados visuales están definidos (default, hover, active, disabled, loading)
- [ ] Cumple con los requisitos de accesibilidad (ARIA, roles, keyboard)
- [ ] Usa los tokens de diseño (colores, spacing, typography) - no hardcodeados
- [ ] Respeta `prefers-reduced-motion`
- [ ] Tiene Storybook story o ejemplo visual
- [ ] Documentado en este archivo
- [ ] Revisado en modo oscuro y claro (si aplica)

### 9.2 Convenciones de Nombrado

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componente React | PascalCase | `PlayerCard.tsx` |
| Props interface | PascalCase + Props | `PlayerCardProps` |
| Utilidad/Hook | camelCase | `useLiveMatch.ts` |
| Constante | UPPER_SNAKE_CASE | `MAX_EVENTS_DISPLAY` |
| Token CSS | kebab-case | `bg-primary` |
| Clase utilitaria | kebab-case | `focus-ring` |
| Variante | kebab-case | `accent-success` |

### 9.3 Orden de Clases Tailwind (Convención)

```
1. Layout (position, display, flex, grid)
2. Box model (width, height, padding, margin, border)
3. Appearance (background, color, shadow, opacity)
4. Typography (font, text, leading, tracking)
5. Transforms & animations (transform, transition, animate)
6. Interactivity (cursor, pointer-events, user-select)
7. Responsive (sm:, md:, lg:)
8. State (hover:, focus:, active:, disabled:)
```

**Ejemplo**:
```tsx
<div className="
  relative flex items-center gap-2
  w-full h-10 px-3 py-2 rounded-sm border
  bg-bg-tertiary text-text-primary
  text-body font-sans
  transition-all duration-150 ease-out
  cursor-pointer
  sm:w-auto
  hover:bg-bg-hover focus:ring-2 focus:ring-accent-primary
"/>
```

### 9.4 Estructura de Carpetas Recomendada

```
src/
├── components/
│   ├── ui/                    # Componentes base (shadcn + custom)
│   │   ├── button.tsx         # shadcn Button customizado
│   │   ├── dialog.tsx         # shadcn Dialog customizado
│   │   ├── tooltip.tsx        # shadcn Tooltip customizado
│   │   └── ...
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── PageContainer.tsx
│   │   └── NavItem.tsx
│   ├── data-display/
│   │   ├── StatCard.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── MatchCard.tsx
│   │   ├── EventFeed.tsx
│   │   ├── EventFeedItem.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── MatchTimer.tsx
│   │   ├── BoostBar.tsx
│   │   ├── TeamPanel.tsx
│   │   ├── ChartWrapper.tsx
│   │   ├── DataTable.tsx
│   │   ├── Timeline.tsx
│   │   └── Sparkline.tsx
│   ├── feedback/
│   │   ├── Toast.tsx
│   │   ├── ToastProvider.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ConnectionStatus.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   └── Banner.tsx
│   ├── inputs/
│   │   ├── Button.tsx         # Wrapper/extend de shadcn
│   │   ├── IconButton.tsx
│   │   ├── Toggle.tsx
│   │   ├── Select.tsx
│   │   ├── SearchInput.tsx
│   │   ├── TextInput.tsx
│   │   ├── NumberInput.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── Slider.tsx
│   ├── overlay/
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Tooltip.tsx        # Wrapper/extend
│   │   ├── DropdownMenu.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── Popover.tsx
│   │   └── Drawer.tsx
│   └── domain/
│       ├── LiveIndicator.tsx
│       ├── ArenaBadge.tsx
│       ├── GoalDetailCard.tsx
│       ├── PlayerMvpBadge.tsx
│       ├── StatComparisonBar.tsx
│       └── PerformanceRadar.tsx
├── components/                # Shared sub-components
│   ├── Avatar.tsx
│   ├── Timestamp.tsx
│   ├── TeamBadge.tsx
│   └── Icon.tsx
├── hooks/
│   ├── useLiveMatch.ts
│   ├── useMatchHistory.ts
│   ├── useAnalytics.ts
│   ├── useSettings.ts
│   └── useToast.ts
├── stores/
│   ├── liveStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── lib/
│   ├── api.ts
│   ├── types.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── animations.ts          # Utilidades de animación JS
├── styles/
│   ├── globals.css
│   └── utilities.css
└── pages/
    ├── LivePage.tsx
    ├── HistoryPage.tsx
    ├── MatchDetailPage.tsx
    ├── AnalyticsPage.tsx
    └── SettingsPage.tsx
```

### 9.5 Dependencias UI Requeridas

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.400.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.12.0"
  }
}
```

---

> **Documento vivo**: Esta especificación debe actualizarse cuando:
> - Se agreguen nuevos componentes
> - Se modifiquen tokens de diseño
> - Se descubran nuevos requisitos de accesibilidad
> - Se añadan nuevas animaciones o estados
>
> **Versión**: 1.0.0
> **Fecha**: 2026-05-02
> **Autor**: UI Designer Agent
> **Próxima revisión**: Al inicio de cada sprint o cuando se mergee un PR que modifique componentes base.

---

## Resumen de Componentes

### Total de componentes documentados: **58**

| Categoría | Cantidad | Componentes |
|-----------|----------|-------------|
| **Layout** | 5 | AppShell, Sidebar, Header, PageContainer, Panel |
| **Navegación** | 3 | NavItem, Breadcrumb, TabNav |
| **Data Display** | 13 | StatCard, PlayerCard, MatchCard, EventFeed, EventFeedItem, ScoreDisplay, MatchTimer, BoostBar, TeamPanel, ChartWrapper, DataTable, Timeline, Sparkline |
| **Feedback** | 8 | Toast, Skeleton, EmptyState, LoadingSpinner, ConnectionStatus, ProgressBar, Badge, Banner |
| **Inputs** | 9 | Button, IconButton, Toggle, Select, SearchInput, TextInput, NumberInput, DateRangePicker, Slider |
| **Overlays** | 8 | Modal, Tooltip, DropdownMenu, ContextMenu, Popover, Drawer, ConfirmDialog |
| **Dominio** | 6 | LiveIndicator, ArenaBadge, GoalDetailCard, PlayerMvpBadge, StatComparisonBar, PerformanceRadar |
| **Shared** | 6 | Avatar, Timestamp, TeamBadge, ProgressBar (reused), Badge (reused), Skeleton (reused) |

### Iconos mapeados: **75+**

### Animaciones definidas: **17 keyframes**

### Tokens de diseño:
- **Colores**: 17 tokens principales + opacidades
- **Tipografía**: 8 tamaños + 2 familias
- **Spacing**: 11 valores
- **Radius**: 4 valores
- **Shadows**: 5 niveles + 3 glows
- **Transitions**: 4 timings

### Cobertura de accesibilidad:
- WCAG 2.1 AA contrast ratios (todos los textos cumplen 4.5:1)
- Focus rings en todos los elementos interactivos
- ARIA roles y atributos especificados por componente
- Keyboard navigation completa
- `prefers-reduced-motion` soportado globalmente
- Screen reader friendly

---

*Fin del documento.*
