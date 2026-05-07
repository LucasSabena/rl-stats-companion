# Changelog

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
