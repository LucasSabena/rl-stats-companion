# Datos que almacena RL Stats Companion

Este documento explica, de forma clara y sin tecnicismos, exactamente qué datos guarda la aplicación y dónde se almacenan.

---

## Dónde viven tus datos

Todos los datos se guardan en una base de datos local **SQLite**, en un único archivo dentro de tu PC:

```
%APPDATA%\com.lukit.rl-stats-companion\rl_stats.db
```

Esto significa:

- **Tus datos nunca salen de tu computadora.** No hay sincronización con la nube, no se envían estadísticas a ningún servidor, y la aplicación funciona completamente sin internet.
- **No hay telemetría.** No recopilamos datos de uso, crashes ni diagnósticos sin tu permiso explícito.
- **Puedes borrar, exportar o hacer copia de seguridad de tus datos en cualquier momento.** El archivo `rl_stats.db` es tuyo.

---

## Qué se guarda por cada partida

Cuando termina una partida de Rocket League, la aplicación guarda los siguientes datos en la tabla `matches`:

| Dato | Descripción | Ejemplo |
|------|-------------|---------|
| **GUID de la partida** | Identificador único que asigna la API de Rocket League | `"a1b2c3d4-..."` |
| **Hora de inicio** | Cuándo se creó la partida (fecha y hora UTC) | `2026-05-02 18:30:00` |
| **Hora de fin** | Cuándo terminó la partida | `2026-05-02 18:37:45` |
| **Duración** | Tiempo total en segundos | `465` (7 min 45 s) |
| **Arena / mapa** | Nombre del estadio donde se jugó | `"DFH Stadium"`, `"Champions Field"` |
| **Resultado azul** | Goles del equipo azul | `3` |
| **Resultado naranja** | Goles del equipo naranja | `2` |
| **Ganador** | `0` = ganó azul, `1` = ganó naranja, vacío = empate | `0` |
| **En línea / local** | Si fue partida online o local (pantalla dividida) | Online |
| **Tiempo extra** | Si la partida llegó a overtime | Sí / No |
| **Tipo de partida** | Etiqueta que tú asignas: competitivo, casual, torneo, otro | `"competitivo"` |

---

## Qué se guarda por cada jugador en cada partida

Para cada jugador que participó en la partida, se guarda un registro en la tabla `match_players`. Los datos son los acumulados al final del encuentro:

| Dato | Descripción |
|------|-------------|
| **Nombre del jugador** | El nombre que aparece en Rocket League |
| **ID de plataforma** | Identificador único de Steam o Epic Games. Este ID permite reconocer al mismo jugador aunque cambie de nombre, y es la única forma de seguir su historial entre partidas |
| **Equipo** | `0` = equipo azul, `1` = equipo naranja |
| **Puntuación** | Puntos totales acumulados durante la partida |
| **Goles** | Goles marcados |
| **Tiros** | Tiros a puerta realizados |
| **Asistencias** | Pases de gol |
| **Salvadas** | Tiros bloqueados (saves / atajadas) |
| **Toques** | Veces que tocó la pelota |
| **Toques de coche** | Contactos con otros coches (choques, empujones) |
| **Demoliciones** | Veces que demolió a un oponente |
| **Velocidad máxima** | La mayor velocidad que alcanzó durante la partida (en unidades del juego) |
| **Boost restante** | Cuánto boost le quedaba en la última actualización recibida |

> El **ID de plataforma** es la pieza clave para el análisis: aunque juegues con o contra jugadores con nombres distintos cada día, la aplicación los reconoce como la misma persona gracias a este identificador único de Steam o Epic.

---

## Qué eventos se guardan durante la partida

La aplicación registra dos tipos de eventos dentro de cada partida, en la tabla `match_events`:

### Goles

Cada vez que se marca un gol, se guarda:

| Dato | Descripción |
|------|-------------|
| **Quién marcó** | Nombre e ID del jugador que anotó |
| **Quién asistió** | Quién dio el pase de gol (si hubo asistencia) |
| **Velocidad del gol** | Velocidad a la que entró la pelota |
| **Momento exacto** | Marca de tiempo de cuándo ocurrió |

### Eventos del feed de estadísticas (Statfeed)

La API de Rocket League emite eventos para las jugadas destacadas. La aplicación guarda:

| Tipo de evento | Qué significa | Qué se guarda |
|----------------|---------------|---------------|
| **Goal** | Alguien marcó gol | Quién lo hizo y a quién (portero rival) |
| **Assist** | Alguien dio una asistencia | Quién asistió y quién anotó |
| **Save** | Alguien hizo una atajada | Quién la hizo y quién tiró |
| **Shot** | Alguien tiró a puerta | Quién disparó y quién estaba en la portería |
| **Demolish** | Alguien demolió a otro jugador | Quién demolió y quién fue demolido |

Cada uno de estos eventos incluye su **marca de tiempo**, lo que permite reconstruir la cronología completa del partido.

---

## Resúmenes diarios (Daily Rollups)

Al final de cada día de juego, la aplicación acumula automáticamente estadísticas agregadas en la tabla `daily_rollups`:

| Dato | Descripción |
|------|-------------|
| **Partidas jugadas** | Cuántas partidas completaste en el día |
| **Victorias** | Cuántas ganaste |
| **Derrotas** | Cuántas perdiste |
| **Goles a favor** | Goles que marcó tu equipo |
| **Goles en contra** | Goles que recibió tu equipo |
| **Tiros totales** | Suma de todos los tiros a puerta |
| **Salvadas totales** | Suma de todas las atajadas |
| **Duración promedio** | Cuánto duraron tus partidas en promedio (en segundos) |
| **Demoliciones** | Cuántas demoliciones hiciste en el día |
| **Asistencias** | Cuántas asistencias diste en el día |

Estos datos se calculan únicamente desde **tu perspectiva**: los goles, tiros, salvadas, demos y asistencias que cuentan son solo los de tu equipo. Esto permite ver tu progreso diario sin mezclar estadísticas de jugadores rivales.

---

## Qué NO se guarda

Hay datos que la aplicación **no guarda** porque el API de Rocket League **no los proporciona**, o porque elegimos no almacenarlos deliberadamente:

| Dato | Motivo |
|------|--------|
| **MMR / rango / división** | El API oficial de Rocket League no expone estos datos |
| **Puntos ganados o perdidos** | No forman parte de los datos que envía el API |
| **Nombre de la lista de juego** | El API no indica si es 1v1, 2v2, 3v3, competitivo o casual. Solo se conoce la arena y la cantidad de jugadores |
| **Posiciones de jugadores o pelota** | No se guardan datos del minimapa (coordenadas X, Y, Z). La aplicación no rastrea posiciones |
| **Mensajes del chat** | El chat no se intercepta ni se almacena |
| **Archivos de repetición (.replay)** | Las repeticiones de Rocket League no se guardan ni se procesan |

---

## Resumen visual: qué tabla guarda qué

```
rl_stats.db
├── matches           ← Datos generales de cada partida (resultado, arena, duración...)
├── players           ← Lista de todos los jugadores que han aparecido en tus partidas
├── match_players     ← Estadísticas de cada jugador en cada partida
├── match_events      ← Goles y jugadas destacadas, con marca de tiempo
├── daily_rollups     ← Estadísticas acumuladas por día
├── sessions          ← Resúmenes completos de sesiones de juego
├── state_snapshots   ← Instantáneas del estado de partidas en curso
├── app_settings      ← Configuración de la aplicación
└── schema_migrations ← Control interno de versiones de la base de datos
```

---

## Privacidad y control

- **Los datos son tuyos.** El archivo `rl_stats.db` está en tu PC y puedes acceder a él, copiarlo o eliminarlo cuando quieras.
- **Exportación de datos.** La aplicación incluye una opción para exportar tu historial a un formato que puedas usar en otras herramientas.
- **Sin rastreo.** No se envía absolutamente nada a servidores externos. La aplicación no tiene analytics, no envía reportes de uso ni recolecta información de diagnóstico sin que tú lo actives manualmente.
- **Actualizaciones seguras.** El auto-actualizador solo descarga nuevas versiones desde los lanzamientos oficiales en GitHub, verificando que estén firmadas digitalmente.
