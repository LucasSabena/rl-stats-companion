# MMR Provider Strategy

## Goal

Mostrar MMR del lobby sin tocar memoria, sin inyeccion y sin depender de APIs internas del cliente de Rocket League.

## Safe path

1. Leer `PrimaryId` desde la `Stats API` oficial local.
2. Resolver MMR fuera del juego con proveedores externos.
3. Mostrar resultados en la companion app y overlay externa del proyecto.

## Providers

### Tracker Network

- Fuente primaria cuando existe `TRN-Api-Key` valida.
- Ventaja: devuelve rank, division y MMR estructurados.
- Riesgo: requiere aprobacion de app o puede rechazar la clave.

### RLStats

- Fallback publico de solo lectura.
- Ventaja: acepta `EpicID`, `SteamID64` y otros IDs de plataforma visibles en `PrimaryId`.
- Riesgo: no expone una API formal; el parser depende de HTML server-rendered.

## Current implementation

- Command Tauri: `fetch_live_mmr_snapshot`
- Cache local SQLite: `mmr_cache`
- TTL:
  - `tracker`: 15 min
  - `rlstats`: 30 min
- Playlist inferida desde tamano del lobby:
  - `2 players` => `duel`
  - `4 players` => `doubles`
  - `6 players` => `standard`

## Known limitations

1. La `Stats API` no expone playlist confiable.
2. Modos extra, privadas y playlists especiales pueden quedar sin inferencia exacta.
3. `RLStats` hoy se usa como fallback tactico, no como contrato estable a largo plazo.

## Next step if we want more reliability

1. Conseguir acceso formal a `Tracker Network` para Rocket League.
2. Mantener `RLStats` como fallback de contingencia.
3. Si no conseguimos proveedor estable para terceros, degradar la UI y mostrar solo stats live sin MMR rival.
