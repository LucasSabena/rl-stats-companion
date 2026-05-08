# Changelog

## v1.7.0 — Training Packs Repository & User Presets

### Features

**Training Packs Repository**
- Nueva página `/training-packs` con catálogo completo de packs de entrenamiento.
- 60+ packs de la comunidad organizados por categoría (Speedflip, Aerials, Shooting, Dribbling, Defense, etc.) y dificultad (Beginner → Pro).
- Datos cargados desde `public/training-packs.json` — editable vía PRs en GitHub.
- Filtros por categoría, dificultad, búsquedas por nombre/creador/código.
- Favoritos locales persistidos en `localStorage`.
- Agregar packs personalizados con modal propio.
- i18n completo: ES/EN/PT para categorías, dificultades y UI.

**User Presets System**
- Gestión de configuraciones personales: Camera, Controls, Deadzone, Hardware.
- CRUD completo en base de datos SQLite.
- Exportar/importar presets como JSON.
- Botón de compartir con tarjeta visual generada por Canvas.

**Pro Configs Page**
- Catálogo de configs de jugadores profesionales (cam, controls, deadzone) organizados por continente/equipo.
- Búsqueda por nombre, equipo o nacionalidad.

### Improvements
- Training Packs: `public/training-packs.json` se sirve estáticamente y se descarga en vivo desde GitHub raw.
- Nueva ruta de sidebar: `Entrenamientos` (icono Dumbbell).

## v1.6.1 — Match Detail Kickoff Goals, MMR Timing & Update Flow

### Features

**Kickoff Goals en Match Detail**
- Agregada columna `kickoffGoals` en la tabla de estadísticas de jugadores (sortable).
- Badge con icono Rocket en el roster del equipo cuando un jugador tiene goles de saque.
- Traducciones ES/EN/PT: `stats.kickoffGoals`, `stats.kickoffGoalsShort`, `roster.kg`.

### Improvements

**Live MMR Snapshot Timing**
- Corregido el momento en que se captura el snapshot de MMR.
- Ahora escucha el evento `CountdownBegin` (cuando la sala está llena) en lugar de `match-started` (cuando se crea la sala, aún sin jugadores).

**Update Checker Flow**
- El check de actualizaciones ahora solo muestra la notificación toast con la nueva versión disponible.
- Ya no fuerza la descarga e instalación automática — el usuario decide cuándo actualizar.

## v1.6.0 — Overlay Speed Fix & Kickoff Goals Tracking

### Features

**Kickoff Goals Tracking**
- Detecta goles de saque (kickoff goals) tanto en tiempo normal como en overtime.
- Umbral de tiempo configurable desde el panel de ajustes (1-20 segundos, default 7s).
- Se detecta basandose en el evento `RoundStarted`/`CountdownBegin`.
- Datos agregados a analytics, overlay en vivo, y resumen de sesion.

**Overlay Speedometer Fix**
- Corregida la escala del indicador de velocidad en el overlay:
  - Factor real: 2200 uu/s / 82 game units = 26.829
  - Supersonico ahora se dispara a 82 (antes 44, debido a escala incorrecta).

### Improvements
- Campos de kickoff goals agregados a la base de datos SQLite via migracion v18.
- Traducciones ES/EN/PT para la nueva configuracion.

## v1.5.3 — CI Fixes & Release Workflow
- CI: clippy, test, y fmt fixes.
- Release: extraccion correcta de URL del installer via `gh api`.
