use crate::core::models::{DailyRollup, Match, MatchEvent, Player, SessionSummary};
use crate::error::{AppError, AppResult};
use chrono::{DateTime, Timelike, Utc};
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, OptionalExtension};
use serde::Serialize;
use std::path::Path;
use tracing::{debug, info};

pub mod migrations;

pub type DbPool = Pool<SqliteConnectionManager>;

pub struct FinishMatchUpdate {
    pub end_time: DateTime<Utc>,
    pub score_blue: i32,
    pub score_orange: i32,
    pub winner: Option<i32>,
    pub is_overtime: bool,
    pub duration_seconds: i32,
}

pub struct MatchPlayerRow {
    pub player_id: i64,
    pub team_num: i32,
    pub stats: crate::core::models::PlayerStats,
}

pub struct MatchQuery<'a> {
    pub limit: i64,
    pub offset: i64,
    pub arena: Option<&'a str>,
    pub match_type: Option<&'a str>,
    pub playlist: Option<&'a str>,
    pub result: Option<&'a str>,
    pub date_from: Option<&'a str>,
    pub date_to: Option<&'a str>,
    pub search: Option<&'a str>,
}

pub struct MatchUpsert<'a> {
    pub guid: &'a str,
    pub start_time: &'a str,
    pub end_time: Option<&'a str>,
    pub arena: Option<&'a str>,
    pub score_blue: i32,
    pub score_orange: i32,
    pub winner: Option<i32>,
    pub is_online: bool,
    pub is_overtime: bool,
    pub duration_seconds: i32,
    pub match_type: Option<&'a str>,
    pub playlist: Option<&'a str>,
}

/// Initialize the SQLite database pool and run versioned migrations.
pub fn init_storage<P: AsRef<Path>>(db_path: P) -> AppResult<DbPool> {
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::builder()
        .max_size(5)
        .build(manager)
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let conn = pool
        .get()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    // Enable WAL mode for better concurrency.
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA foreign_keys = ON;
        ",
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;

    // Run versioned migrations instead of ad-hoc CREATE TABLE IF NOT EXISTS.
    migrations::run_migrations(&conn)?;
    info!("Storage initialized successfully");
    Ok(pool)
}

pub fn get_conn(pool: &DbPool) -> AppResult<PooledConnection<SqliteConnectionManager>> {
    pool.get()
        .map_err(|e| AppError::StorageError(e.to_string()))
}

/// Insert a new match and return its ID.
pub fn insert_match(
    pool: &DbPool,
    guid: &str,
    start_time: DateTime<Utc>,
    arena: Option<&str>,
    is_online: bool,
    match_type: Option<&str>,
    playlist: Option<&str>,
) -> AppResult<i64> {
    let conn = get_conn(pool)?;
    let arena = arena.unwrap_or("Unknown");
    conn.execute(
        "INSERT INTO matches (guid, start_time, arena, is_online, match_type, playlist) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![guid, start_time.to_rfc3339(), arena, is_online as i32, match_type, playlist],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;

    let id = conn.last_insert_rowid();
    debug!(match_id = id, "Inserted match");
    Ok(id)
}

/// Update match with end-of-game data.
pub fn finish_match(pool: &DbPool, match_id: i64, update: FinishMatchUpdate) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "UPDATE matches SET end_time = ?1, score_blue = ?2, score_orange = ?3, winner = ?4, is_overtime = ?5, duration_seconds = ?6 WHERE id = ?7",
        params![
            update.end_time.to_rfc3339(),
            update.score_blue,
            update.score_orange,
            update.winner,
            update.is_overtime as i32,
            update.duration_seconds,
            match_id
        ],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Get or create a player by primary_id.
pub fn get_or_create_player(pool: &DbPool, primary_id: &str, name: &str) -> AppResult<i64> {
    let conn = get_conn(pool)?;

    let existing: Option<i64> = conn
        .query_row(
            "SELECT id FROM players WHERE primary_id = ?1",
            params![primary_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    if let Some(id) = existing {
        return Ok(id);
    }

    conn.execute(
        "INSERT INTO players (primary_id, name) VALUES (?1, ?2)",
        params![primary_id, name],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;

    let id = conn.last_insert_rowid();
    debug!(player_id = id, "Inserted player");
    Ok(id)
}

/// Link a player to a match with stats.
pub fn insert_match_player(pool: &DbPool, match_id: i64, player: MatchPlayerRow) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "INSERT INTO match_players (match_id, player_id, team_num, score, goals, shots, assists, saves, touches, car_touches, demos, speed, boost)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
         ON CONFLICT(match_id, player_id) DO UPDATE SET
         score = excluded.score,
         goals = excluded.goals,
         shots = excluded.shots,
         assists = excluded.assists,
         saves = excluded.saves,
         touches = excluded.touches,
         car_touches = excluded.car_touches,
         demos = excluded.demos,
         speed = excluded.speed,
         boost = excluded.boost",
        params![
            match_id,
            player.player_id,
            player.team_num,
            player.stats.score,
            player.stats.goals,
            player.stats.shots,
            player.stats.assists,
            player.stats.saves,
            player.stats.touches,
            player.stats.car_touches,
            player.stats.demos,
            player.stats.speed,
            player.stats.boost
        ],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Insert a match event.
pub fn insert_match_event(
    pool: &DbPool,
    match_id: i64,
    event_type: &str,
    event_data: &str,
    occurred_at: DateTime<Utc>,
) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "INSERT INTO match_events (match_id, event_type, event_data, occurred_at) VALUES (?1, ?2, ?3, ?4)",
        params![match_id, event_type, event_data, occurred_at.to_rfc3339()],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Insert a session summary.
pub fn insert_session(pool: &DbPool, match_id: i64, summary: &SessionSummary) -> AppResult<()> {
    let conn = get_conn(pool)?;
    let summary_json =
        serde_json::to_string(summary).map_err(|e| AppError::ParseError(e.to_string()))?;
    conn.execute(
        "INSERT INTO sessions (match_id, summary_json, created_at) VALUES (?1, ?2, ?3)",
        params![match_id, summary_json, Utc::now().to_rfc3339()],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Upsert a daily rollup row.
pub fn upsert_daily_rollup(pool: &DbPool, rollup: &DailyRollup) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "INSERT INTO daily_rollups (date, matches_played, wins, losses, goals_scored, goals_conceded, total_shots, total_saves, avg_duration_seconds, total_demos, total_assists)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
         ON CONFLICT(date) DO UPDATE SET
         matches_played = matches_played + excluded.matches_played,
         wins = wins + excluded.wins,
         losses = losses + excluded.losses,
         goals_scored = goals_scored + excluded.goals_scored,
         goals_conceded = goals_conceded + excluded.goals_conceded,
         total_shots = total_shots + excluded.total_shots,
         total_saves = total_saves + excluded.total_saves,
         total_demos = total_demos + excluded.total_demos,
         total_assists = total_assists + excluded.total_assists,
         avg_duration_seconds = (avg_duration_seconds + excluded.avg_duration_seconds) / 2",
        params![
            rollup.date,
            rollup.matches_played,
            rollup.wins,
            rollup.losses,
            rollup.goals_scored,
            rollup.goals_conceded,
            rollup.total_shots,
            rollup.total_saves,
            rollup.avg_duration_seconds,
            rollup.total_demos,
            rollup.total_assists,
        ],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

fn map_match_row(row: &rusqlite::Row) -> rusqlite::Result<Match> {
    Ok(Match {
        id: row.get(0)?,
        guid: row.get(1)?,
        start_time: row
            .get::<_, String>(2)?
            .parse::<DateTime<Utc>>()
            .unwrap_or_else(|_| Utc::now()),
        end_time: row
            .get::<_, Option<String>>(3)?
            .and_then(|s| s.parse::<DateTime<Utc>>().ok()),
        arena: row.get(4)?,
        score_blue: row.get(5)?,
        score_orange: row.get(6)?,
        winner: row.get(7)?,
        is_online: row.get::<_, i32>(8)? != 0,
        is_overtime: row.get::<_, i32>(9)? != 0,
        duration_seconds: row.get(10)?,
        match_type: row.get(11)?,
        playlist: row.get(12)?,
    })
}

/// Query matches with optional filters.
pub fn get_matches(pool: &DbPool, filters: MatchQuery<'_>) -> AppResult<Vec<Match>> {
    let conn = get_conn(pool)?;
    let mut matches = Vec::new();

    let mut sql = String::from(
        "SELECT id, guid, start_time, end_time, arena, score_blue, score_orange, winner, is_online, is_overtime, duration_seconds, match_type, playlist FROM matches WHERE 1=1"
    );
    let mut args: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(arena) = filters.arena {
        sql.push_str(" AND arena = ?");
        args.push(Box::new(arena.to_string()));
    }

    if let Some(mt) = filters.match_type {
        sql.push_str(" AND match_type = ?");
        args.push(Box::new(mt.to_string()));
    }

    if let Some(playlist) = filters.playlist {
        sql.push_str(" AND playlist = ?");
        args.push(Box::new(playlist.to_string()));
    }

    if let Some(result) = filters.result {
        match result {
            "win" => sql.push_str(" AND winner = 0"),
            "loss" => sql.push_str(" AND winner = 1"),
            _ => {}
        }
    }

    if let Some(from) = filters.date_from {
        sql.push_str(" AND start_time >= ?");
        args.push(Box::new(from.to_string()));
    }

    if let Some(to) = filters.date_to {
        sql.push_str(" AND start_time <= ?");
        args.push(Box::new(to.to_string()));
    }

    if let Some(search) = filters.search {
        sql.push_str(
            " AND id IN (SELECT match_id FROM match_players mp JOIN players p ON mp.player_id = p.id WHERE p.name LIKE ?)"
        );
        let pattern = format!("%{}%", search);
        args.push(Box::new(pattern));
    }

    sql.push_str(" ORDER BY start_time DESC LIMIT ? OFFSET ?");
    args.push(Box::new(filters.limit));
    args.push(Box::new(filters.offset));

    let params_refs: Vec<&dyn rusqlite::ToSql> = args.iter().map(|a| a.as_ref()).collect();
    let mut stmt = conn.prepare(&sql)?;
    let iter = stmt.query_map(&*params_refs, map_match_row)?;
    for m in iter {
        matches.push(m.map_err(|e| AppError::StorageError(e.to_string()))?);
    }

    Ok(matches)
}

/// Get full match detail including players.
pub fn get_match_detail(pool: &DbPool, match_id: i64) -> AppResult<(Match, Vec<Player>)> {
    let conn = get_conn(pool)?;

    let m: Match = conn.query_row(
        "SELECT id, guid, start_time, end_time, arena, score_blue, score_orange, winner, is_online, is_overtime, duration_seconds, match_type, playlist FROM matches WHERE id = ?1",
        params![match_id],
        |row| {
            Ok(Match {
                id: row.get(0)?,
                guid: row.get(1)?,
                start_time: row.get::<_, String>(2)?.parse::<DateTime<Utc>>().unwrap_or_else(|_| Utc::now()),
                end_time: row.get::<_, Option<String>>(3)?.and_then(|s| s.parse::<DateTime<Utc>>().ok()),
                arena: row.get(4)?,
                score_blue: row.get(5)?,
                score_orange: row.get(6)?,
                winner: row.get(7)?,
                is_online: row.get::<_, i32>(8)? != 0,
                is_overtime: row.get::<_, i32>(9)? != 0,
                duration_seconds: row.get(10)?,
                match_type: row.get(11)?,
                playlist: row.get(12)?,
            })
        },
    ).map_err(|e| AppError::StorageError(e.to_string()))?;

    let mut stmt = conn.prepare(
        "SELECT p.id, p.primary_id, p.name, mp.team_num, mp.score, mp.goals, mp.shots, mp.assists, mp.saves, mp.touches, mp.car_touches, mp.demos, mp.speed, mp.boost
         FROM match_players mp
         JOIN players p ON mp.player_id = p.id
         WHERE mp.match_id = ?1"
    )?;

    let player_iter = stmt.query_map(params![match_id], |row| {
        Ok(Player {
            id: row.get(0)?,
            primary_id: row.get(1)?,
            name: row.get(2)?,
            team_num: row.get(3)?,
            stats: crate::core::models::PlayerStats {
                score: row.get(4)?,
                goals: row.get(5)?,
                shots: row.get(6)?,
                assists: row.get(7)?,
                saves: row.get(8)?,
                touches: row.get(9)?,
                car_touches: row.get(10)?,
                demos: row.get(11)?,
                speed: row.get(12)?,
                boost: row.get(13)?,
            },
        })
    })?;

    let mut players = Vec::new();
    for p in player_iter {
        players.push(p.map_err(|e| AppError::StorageError(e.to_string()))?);
    }

    Ok((m, players))
}

pub fn get_match_events(pool: &DbPool, match_id: i64) -> AppResult<Vec<MatchEvent>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT id, match_id, event_type, event_data, occurred_at
         FROM match_events
         WHERE match_id = ?1
         ORDER BY occurred_at ASC, id ASC",
    )?;

    let iter = stmt.query_map(params![match_id], |row| {
        Ok(MatchEvent {
            id: row.get(0)?,
            match_id: row.get(1)?,
            event_type: row.get(2)?,
            event_data: row.get(3)?,
            occurred_at: row
                .get::<_, String>(4)?
                .parse::<DateTime<Utc>>()
                .unwrap_or_else(|_| Utc::now()),
        })
    })?;

    let mut events = Vec::new();
    for event in iter {
        events.push(event.map_err(|e| AppError::StorageError(e.to_string()))?);
    }

    Ok(events)
}

pub fn get_local_team_num(
    pool: &DbPool,
    match_id: i64,
    local_primary_id: Option<&str>,
    player_names: &[String],
) -> AppResult<Option<i32>> {
    if local_primary_id.is_none() && player_names.is_empty() {
        return Ok(None);
    }

    let conn = get_conn(pool)?;
    get_local_team_num_from_conn(&conn, match_id, local_primary_id, player_names)
}

/// Update match metadata (match_type and playlist).
pub fn update_match(
    pool: &DbPool,
    match_id: i64,
    match_type: Option<&str>,
    playlist: Option<&str>,
) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "UPDATE matches SET match_type = ?1, playlist = ?2 WHERE id = ?3",
        params![match_type, playlist, match_id],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Delete a match and all related data (cascade), then rebuild daily rollups.
pub fn delete_match(pool: &DbPool, match_id: i64) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute("DELETE FROM matches WHERE id = ?1", params![match_id])
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let settings = crate::core::settings::get_settings(pool).unwrap_or_default();
    let names = identity_candidate_names(&settings);
    if let Err(e) = rebuild_daily_rollups_for_identity(
        pool,
        settings.local_primary_id.as_deref(),
        &names,
    ) {
        tracing::warn!(error = %e, "Failed to rebuild daily rollups after match deletion");
    }
    Ok(())
}

fn identity_candidate_names(settings: &crate::core::settings::AppSettings) -> Vec<String> {
    let mut names = Vec::new();
    if !settings.player_name.trim().is_empty() {
        names.push(settings.player_name.trim().to_string());
    }
    if let Some(ref u) = settings.tracker_username {
        let u = u.trim();
        if !u.is_empty() && !names.iter().any(|n| n.eq_ignore_ascii_case(u)) {
            names.push(u.to_string());
        }
    }
    names
}

/// Get daily rollups for a date range.
pub fn get_daily_rollups(
    pool: &DbPool,
    start_date: &str,
    end_date: &str,
) -> AppResult<Vec<DailyRollup>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT date, matches_played, wins, losses, goals_scored, goals_conceded, total_shots, total_saves, avg_duration_seconds, total_demos, total_assists
         FROM daily_rollups
         WHERE date >= ?1 AND date <= ?2
         ORDER BY date ASC"
    )?;

    let iter = stmt.query_map(params![start_date, end_date], |row| {
        Ok(DailyRollup {
            date: row.get(0)?,
            matches_played: row.get(1)?,
            wins: row.get(2)?,
            losses: row.get(3)?,
            goals_scored: row.get(4)?,
            goals_conceded: row.get(5)?,
            total_shots: row.get(6)?,
            total_saves: row.get(7)?,
            avg_duration_seconds: row.get(8)?,
            total_demos: row.get(9)?,
            total_assists: row.get(10)?,
        })
    })?;

    let mut rollups = Vec::new();
    for r in iter {
        rollups.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(rollups)
}

pub fn rebuild_daily_rollups_for_identity(
    pool: &DbPool,
    local_primary_id: Option<&str>,
    player_names: &[String],
) -> AppResult<()> {
    let conn = get_conn(pool)?;

    conn.execute("DELETE FROM daily_rollups", [])
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let mut stmt = conn.prepare(
        "SELECT id, start_time, score_blue, score_orange, winner, duration_seconds
         FROM matches
         ORDER BY start_time ASC",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i32>(2)?,
            row.get::<_, i32>(3)?,
            row.get::<_, Option<i32>>(4)?,
            row.get::<_, i32>(5)?,
        ))
    })?;

    for row in rows {
        let (match_id, start_time, score_blue, score_orange, winner, duration_seconds) =
            row.map_err(|e| AppError::StorageError(e.to_string()))?;

        let Some(my_team) =
            get_local_team_num_from_conn(&conn, match_id, local_primary_id, player_names)?
        else {
            continue;
        };

        let (my_goals, their_goals, total_shots, total_saves, total_demos, total_assists): (
            i32,
            i32,
            i32,
            i32,
            i32,
            i32,
        ) = conn
            .query_row(
                "SELECT
                    COALESCE(SUM(CASE WHEN team_num = ?1 THEN goals ELSE 0 END), 0),
                    COALESCE(SUM(CASE WHEN team_num != ?1 THEN goals ELSE 0 END), 0),
                    COALESCE(SUM(shots), 0),
                    COALESCE(SUM(saves), 0),
                    COALESCE(SUM(CASE WHEN team_num = ?1 THEN demos ELSE 0 END), 0),
                    COALESCE(SUM(CASE WHEN team_num = ?1 THEN assists ELSE 0 END), 0)
                 FROM match_players
                 WHERE match_id = ?2",
                params![my_team, match_id],
                |row| {
                    Ok((
                        row.get(0)?,
                        row.get(1)?,
                        row.get(2)?,
                        row.get(3)?,
                        row.get(4)?,
                        row.get(5)?,
                    ))
                },
            )
            .map_err(|e| AppError::StorageError(e.to_string()))?;

        let date = start_time
            .parse::<DateTime<Utc>>()
            .map(|date| date.format("%Y-%m-%d").to_string())
            .unwrap_or_else(|_| Utc::now().format("%Y-%m-%d").to_string());

        let rollup = DailyRollup {
            date,
            matches_played: 1,
            wins: if winner == Some(my_team) { 1 } else { 0 },
            losses: if winner.is_some() && winner != Some(my_team) {
                1
            } else {
                0
            },
            goals_scored: if my_goals == 0 && their_goals == 0 {
                if my_team == 0 {
                    score_blue
                } else {
                    score_orange
                }
            } else {
                my_goals
            },
            goals_conceded: if my_goals == 0 && their_goals == 0 {
                if my_team == 0 {
                    score_orange
                } else {
                    score_blue
                }
            } else {
                their_goals
            },
            total_shots,
            total_saves,
            avg_duration_seconds: duration_seconds,
            total_demos,
            total_assists,
        };

        conn.execute(
            "INSERT INTO daily_rollups (date, matches_played, wins, losses, goals_scored, goals_conceded, total_shots, total_saves, avg_duration_seconds, total_demos, total_assists)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
             ON CONFLICT(date) DO UPDATE SET
             matches_played = matches_played + excluded.matches_played,
             wins = wins + excluded.wins,
             losses = losses + excluded.losses,
             goals_scored = goals_scored + excluded.goals_scored,
             goals_conceded = goals_conceded + excluded.goals_conceded,
             total_shots = total_shots + excluded.total_shots,
             total_saves = total_saves + excluded.total_saves,
             total_demos = total_demos + excluded.total_demos,
             total_assists = total_assists + excluded.total_assists,
             avg_duration_seconds = (avg_duration_seconds + excluded.avg_duration_seconds) / 2",
            params![
                rollup.date,
                rollup.matches_played,
                rollup.wins,
                rollup.losses,
                rollup.goals_scored,
                rollup.goals_conceded,
                rollup.total_shots,
                rollup.total_saves,
                rollup.avg_duration_seconds,
                rollup.total_demos,
                rollup.total_assists,
            ],
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    }

    Ok(())
}

fn get_local_team_num_from_conn(
    conn: &rusqlite::Connection,
    match_id: i64,
    local_primary_id: Option<&str>,
    player_names: &[String],
) -> AppResult<Option<i32>> {
    if let Some(local_primary_id) = local_primary_id {
        let team_num = conn
            .query_row(
                "SELECT mp.team_num
                 FROM match_players mp
                 JOIN players p ON mp.player_id = p.id
                 WHERE mp.match_id = ?1 AND p.primary_id = ?2
                 LIMIT 1",
                params![match_id, local_primary_id],
                |row| row.get(0),
            )
            .optional()
            .map_err(|e| AppError::StorageError(e.to_string()))?;

        if team_num.is_some() {
            return Ok(team_num);
        }
    }

    for player_name in player_names {
        let team_num = conn
            .query_row(
                "SELECT mp.team_num
                 FROM match_players mp
                 JOIN players p ON mp.player_id = p.id
                 WHERE mp.match_id = ?1 AND LOWER(TRIM(p.name)) = LOWER(TRIM(?2))
                 LIMIT 1",
                params![match_id, player_name],
                |row| row.get(0),
            )
            .optional()
            .map_err(|e| AppError::StorageError(e.to_string()))?;

        if team_num.is_some() {
            return Ok(team_num);
        }
    }

    Ok(None)
}

/// Get match count.
pub fn get_match_count(pool: &DbPool) -> AppResult<i64> {
    let conn = get_conn(pool)?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM matches", [], |row| row.get(0))
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(count)
}

/// Get storage stats.
pub fn get_storage_stats(pool: &DbPool) -> AppResult<serde_json::Value> {
    let conn = get_conn(pool)?;
    let match_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM matches", [], |row| row.get(0))
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let player_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM players", [], |row| row.get(0))
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let event_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM match_events", [], |row| row.get(0))
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let database_size_bytes: i64 = conn
        .query_row(
            "SELECT page_count * page_size FROM pragma_page_count(), pragma_page_size()",
            [],
            |row| row.get(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let oldest_match_date = conn
        .query_row("SELECT MIN(start_time) FROM matches", [], |row| {
            row.get::<_, Option<String>>(0)
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?
        .and_then(|value| value.parse::<DateTime<Utc>>().ok())
        .map(|value| value.timestamp());
    let db_path = conn
        .query_row(
            "SELECT file FROM pragma_database_list WHERE name = 'main'",
            [],
            |row| row.get::<_, String>(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    Ok(serde_json::json!({
        "match_count": match_count,
        "total_matches": match_count,
        "player_count": player_count,
        "event_count": event_count,
        "total_events": event_count,
        "database_size_bytes": database_size_bytes,
        "oldest_match_date": oldest_match_date,
        "db_path": db_path,
    }))
}

/// Clear all data (destructive).
pub fn clear_all_data(pool: &DbPool) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute_batch(
        "DELETE FROM match_events;
         DELETE FROM match_players;
         DELETE FROM state_snapshots;
         DELETE FROM sessions;
         DELETE FROM daily_rollups;
         DELETE FROM matches;
         DELETE FROM players;
        ",
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

// ─── Export helpers ──────────────────────────────────────────────────────────

/// Export all players (for backup/restore).
pub fn get_all_players(pool: &DbPool) -> AppResult<Vec<serde_json::Value>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare("SELECT id, primary_id, name FROM players")?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>(0)?,
                "primary_id": row.get::<_, String>(1)?,
                "name": row.get::<_, String>(2)?,
            }))
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(result)
}

/// Export all match_players rows.
pub fn get_all_match_players(pool: &DbPool) -> AppResult<Vec<serde_json::Value>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT mp.match_id, mp.player_id, mp.team_num, mp.score, mp.goals, mp.shots,
                mp.assists, mp.saves, mp.touches, mp.car_touches, mp.demos, mp.speed, mp.boost,
                m.guid, p.primary_id
         FROM match_players mp
         JOIN matches m ON mp.match_id = m.id
         JOIN players p ON mp.player_id = p.id",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "match_guid": row.get::<_, String>(13)?,
                "player_primary_id": row.get::<_, String>(14)?,
                "player_id": row.get::<_, i64>(1)?,
                "team_num": row.get::<_, i32>(2)?,
                "score": row.get::<_, i32>(3)?,
                "goals": row.get::<_, i32>(4)?,
                "shots": row.get::<_, i32>(5)?,
                "assists": row.get::<_, i32>(6)?,
                "saves": row.get::<_, i32>(7)?,
                "touches": row.get::<_, i32>(8)?,
                "car_touches": row.get::<_, i32>(9)?,
                "demos": row.get::<_, i32>(10)?,
                "speed": row.get::<_, f64>(11)?,
                "boost": row.get::<_, i32>(12)?,
            }))
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(result)
}

/// Export all match_events.
pub fn get_all_match_events(pool: &DbPool) -> AppResult<Vec<serde_json::Value>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT me.id, me.match_id, me.event_type, me.event_data, me.occurred_at, m.guid
         FROM match_events me
         JOIN matches m ON me.match_id = m.id",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "match_guid": row.get::<_, String>(5)?,
                "event_type": row.get::<_, String>(2)?,
                "event_data": row.get::<_, String>(3)?,
                "occurred_at": row.get::<_, String>(4)?,
            }))
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(result)
}

/// Export all sessions.
pub fn get_all_sessions(pool: &DbPool) -> AppResult<Vec<serde_json::Value>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT s.id, s.match_id, s.summary_json, s.created_at, m.guid
         FROM sessions s
         JOIN matches m ON s.match_id = m.id",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "match_guid": row.get::<_, String>(4)?,
                "summary_json": row.get::<_, String>(2)?,
                "created_at": row.get::<_, String>(3)?,
            }))
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(result)
}

/// Export all daily_rollups.
pub fn get_all_daily_rollups_all(pool: &DbPool) -> AppResult<Vec<DailyRollup>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT date, matches_played, wins, losses, goals_scored, goals_conceded, total_shots, total_saves, avg_duration_seconds, total_demos, total_assists
         FROM daily_rollups
         ORDER BY date ASC",
    )?;
    let iter = stmt
        .query_map([], |row| {
            Ok(DailyRollup {
                date: row.get(0)?,
                matches_played: row.get(1)?,
                wins: row.get(2)?,
                losses: row.get(3)?,
                goals_scored: row.get(4)?,
                goals_conceded: row.get(5)?,
                total_shots: row.get(6)?,
                total_saves: row.get(7)?,
                avg_duration_seconds: row.get(8)?,
                total_demos: row.get(9)?,
                total_assists: row.get(10)?,
            })
        })
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let mut rollups = Vec::new();
    for r in iter {
        rollups.push(r.map_err(|e| AppError::StorageError(e.to_string()))?);
    }
    Ok(rollups)
}

// ─── Import helpers ──────────────────────────────────────────────────────────

/// Upsert a match by its GUID. Returns the row id.
pub fn upsert_match_by_guid(
    conn: &rusqlite::Connection,
    record: MatchUpsert<'_>,
) -> AppResult<i64> {
    conn.execute(
        "INSERT INTO matches (guid, start_time, end_time, arena, score_blue, score_orange, winner, is_online, is_overtime, duration_seconds, match_type, playlist)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
         ON CONFLICT(guid) DO UPDATE SET
            start_time = excluded.start_time,
            end_time = coalesce(excluded.end_time, matches.end_time),
            arena = coalesce(excluded.arena, matches.arena),
            score_blue = excluded.score_blue,
            score_orange = excluded.score_orange,
            winner = excluded.winner,
            is_online = excluded.is_online,
            is_overtime = excluded.is_overtime,
            duration_seconds = excluded.duration_seconds,
            match_type = coalesce(excluded.match_type, matches.match_type),
            playlist = coalesce(excluded.playlist, matches.playlist)",
        params![
            record.guid,
            record.start_time,
            record.end_time,
            record.arena,
            record.score_blue,
            record.score_orange,
            record.winner,
            record.is_online as i32,
            record.is_overtime as i32,
            record.duration_seconds,
            record.match_type,
            record.playlist,
        ],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;

    // Retrieve the actual id (inserted or existing).
    let id: i64 = conn
        .query_row(
            "SELECT id FROM matches WHERE guid = ?1",
            params![record.guid],
            |row| row.get(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(id)
}

/// Upsert a player by primary_id. Returns the row id.
pub fn upsert_player_by_primary_id(
    conn: &rusqlite::Connection,
    primary_id: &str,
    name: &str,
) -> AppResult<i64> {
    conn.execute(
        "INSERT INTO players (primary_id, name) VALUES (?1, ?2)
         ON CONFLICT(primary_id) DO UPDATE SET name = excluded.name",
        params![primary_id, name],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;

    let id: i64 = conn
        .query_row(
            "SELECT id FROM players WHERE primary_id = ?1",
            params![primary_id],
            |row| row.get(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(id)
}

/// Insert a match_player row (upsert semantics on match_id, player_id).
pub fn upsert_match_player_row(
    conn: &rusqlite::Connection,
    match_id: i64,
    player: MatchPlayerRow,
) -> AppResult<()> {
    conn.execute(
        "INSERT INTO match_players (match_id, player_id, team_num, score, goals, shots, assists, saves, touches, car_touches, demos, speed, boost)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
         ON CONFLICT(match_id, player_id) DO UPDATE SET
            team_num = excluded.team_num,
            score = excluded.score,
            goals = excluded.goals,
            shots = excluded.shots,
            assists = excluded.assists,
            saves = excluded.saves,
            touches = excluded.touches,
            car_touches = excluded.car_touches,
            demos = excluded.demos,
            speed = excluded.speed,
            boost = excluded.boost",
        params![
            match_id,
            player.player_id,
            player.team_num,
            player.stats.score,
            player.stats.goals,
            player.stats.shots,
            player.stats.assists,
            player.stats.saves,
            player.stats.touches,
            player.stats.car_touches,
            player.stats.demos,
            player.stats.speed,
            player.stats.boost,
        ],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(())
}

/// Insert a match_event row only if no duplicate exists (by match_id, event_type, event_data, occurred_at).
pub fn insert_match_event_if_not_exists(
    conn: &rusqlite::Connection,
    match_id: i64,
    event_type: &str,
    event_data: &str,
    occurred_at: &str,
) -> AppResult<()> {
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM match_events
             WHERE match_id = ?1 AND event_type = ?2 AND event_data = ?3 AND occurred_at = ?4",
            params![match_id, event_type, event_data, occurred_at],
            |row| row.get(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    if !exists {
        conn.execute(
            "INSERT INTO match_events (match_id, event_type, event_data, occurred_at) VALUES (?1, ?2, ?3, ?4)",
            params![match_id, event_type, event_data, occurred_at],
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    }
    Ok(())
}

/// Insert a session row if not already present for this match_id.
pub fn insert_session_if_not_exists(
    conn: &rusqlite::Connection,
    match_id: i64,
    summary_json: &str,
    created_at: &str,
) -> AppResult<()> {
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM sessions WHERE match_id = ?1",
            params![match_id],
            |row| row.get(0),
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    if !exists {
        conn.execute(
            "INSERT INTO sessions (match_id, summary_json, created_at) VALUES (?1, ?2, ?3)",
            params![match_id, summary_json, created_at],
        )
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    }
    Ok(())
}

// ─── Session grouping ───────────────────────────────────────────────────────

/// A group of consecutive matches played within a time gap threshold.
#[derive(Clone, Debug, Serialize)]
pub struct MatchSession {
    /// 1-based sequential session number (most recent = 1).
    pub id: i32,
    /// ISO 8601 start time of the session (first match start_time).
    pub start_time: String,
    /// ISO 8601 end time of the session (last match end_time or start_time).
    pub end_time: String,
    /// Total duration from first match start to last match end, in seconds.
    pub duration_seconds: i32,
    /// Number of matches in this session.
    pub match_count: i32,
    /// Wins in this session.
    pub wins: i32,
    /// Losses in this session.
    pub losses: i32,
    /// Matches where local team could not be determined (wins+losses+unknown = match_count).
    pub unknown: i32,
    /// Goals scored by local player in this session.
    pub goals_scored: i32,
    /// Goals conceded by local player in this session.
    pub goals_conceded: i32,
    /// Total shots across all matches in this session.
    pub total_shots: i32,
    /// Total saves across all matches in this session.
    pub total_saves: i32,
}

/// Groups matches into play sessions separated by at most `gap_minutes`.
///
/// A session is defined as a sequence of matches where the gap between
/// consecutive matches (previous match end_time to next match start_time)
/// does not exceed `gap_minutes`. Matches are ordered by start_time
/// descending so session #1 is the most recent.
pub fn get_match_sessions(
    pool: &DbPool,
    gap_minutes: u32,
) -> AppResult<Vec<MatchSession>> {
    let conn = get_conn(pool)?;
    let mut stmt = conn.prepare(
        "SELECT id, guid, start_time, end_time, arena, score_blue, score_orange, winner,
                is_online, is_overtime, duration_seconds, match_type, playlist
         FROM matches
         ORDER BY start_time DESC"
    )?;

    let matches: Vec<Match> = stmt
        .query_map([], map_match_row)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    if matches.is_empty() {
        return Ok(Vec::new());
    }

    let gap = chrono::Duration::minutes(gap_minutes as i64);
    let mut sessions: Vec<Vec<&Match>> = Vec::new();
    let mut current_group: Vec<&Match> = Vec::new();

    // Matches are ordered by start_time DESC (most recent first).
    // We iterate and group: if the previous match in the group started
    // within `gap` of this match's end, they belong to the same session.
    for m in &matches {
        if let Some(last) = current_group.last() {
            // last.end_time is the previous match (more recent), m is the current (older).
            // Check if m ended close enough to last's start.
            let prev_end = last.end_time.unwrap_or(last.start_time);
            let gap_duration = prev_end - m.start_time;
            if gap_duration <= gap {
                current_group.push(m);
            } else {
                sessions.push(std::mem::take(&mut current_group));
                current_group.push(m);
            }
        } else {
            current_group.push(m);
        }
    }
    if !current_group.is_empty() {
        sessions.push(current_group);
    }

    // Build session summaries.
    let mut result = Vec::with_capacity(sessions.len());
    for (idx, group) in sessions.iter().enumerate() {
        let first = group.last().unwrap(); // oldest match in group
        let last = group.first().unwrap(); // newest match in group
        let start_time = first.start_time;
        let end_time = last.end_time.unwrap_or(last.start_time);
        let duration_seconds = (end_time - start_time).num_seconds().max(0) as i32;

        let match_count = group.len() as i32;
        let mut wins = 0i32;
        let mut losses = 0i32;
        let mut unknown = 0i32;
        let mut goals_scored = 0i32;
        let mut goals_conceded = 0i32;
        let mut total_shots = 0i32;
        let mut total_saves = 0i32;

        let settings = crate::core::settings::get_settings(pool)
            .unwrap_or_default();
        let local_id = settings.local_primary_id.clone();

        for m in group.iter() {
            let local_team = if let Some(ref lid) = local_id {
                get_local_team_num(pool, m.id, Some(lid), &[]).unwrap_or(None)
            } else {
                None
            };

            if let Some(lt) = local_team {
                if m.winner == Some(lt) {
                    wins += 1;
                } else {
                    losses += 1;
                }

                goals_scored += if lt == 0 { m.score_blue } else { m.score_orange };
                goals_conceded += if lt == 0 { m.score_orange } else { m.score_blue };
            } else {
                unknown += 1;
            }

            if let Some(ref lid) = local_id {
                if let Ok(mut mp_stmt) = conn.prepare(
                    "SELECT mp.shots, mp.saves
                     FROM match_players mp
                     JOIN players p ON mp.player_id = p.id
                     WHERE mp.match_id = ?1 AND p.primary_id = ?2"
                ) {
                    if let Ok(iter) = mp_stmt.query_map(params![m.id, lid], |row| {
                        Ok((row.get::<_, i32>(0)?, row.get::<_, i32>(1)?))
                    }) {
                        for row in iter.flatten() {
                            total_shots += row.0;
                            total_saves += row.1;
                        }
                    }
                }
            }
        }

        result.push(MatchSession {
            id: (idx + 1) as i32,
            start_time: start_time.to_rfc3339(),
            end_time: end_time.to_rfc3339(),
            duration_seconds,
            match_count,
            wins,
            losses,
            unknown,
            goals_scored,
            goals_conceded,
            total_shots,
            total_saves,
        });
    }

    Ok(result)
}

// ─── Tracker Network cache helpers ───────────────────────────────────────────

pub fn upsert_tracker_cache(
    pool: &DbPool,
    platform: &str,
    username: &str,
    profile_json: &str,
) -> AppResult<()> {
    let conn = get_conn(pool)?;
    conn.execute(
        "INSERT INTO tracker_cache (platform, username, profile_json, fetched_at)
         VALUES (?1, ?2, ?3, datetime('now'))
         ON CONFLICT(platform, username) DO UPDATE SET
         profile_json = excluded.profile_json,
         fetched_at = excluded.fetched_at",
        params![platform, username, profile_json],
    )
    .map_err(|e| AppError::StorageError(e.to_string()))?;
    debug!(platform, username, "Tracker cache updated");
    Ok(())
}

pub fn get_tracker_cache(
    pool: &DbPool,
    platform: &str,
    username: &str,
) -> AppResult<Option<(String, String)>> {
    let conn = get_conn(pool)?;
    let result = conn
        .query_row(
            "SELECT profile_json, fetched_at FROM tracker_cache WHERE platform = ?1 AND username = ?2",
            params![platform, username],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
        )
        .optional()
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    Ok(result)
}

// ─── Insights ──────────────────────────────────────────────────────────────

pub fn get_insights(
    pool: &DbPool,
    local_primary_id: &str,
    start_date: &str,
    end_date: &str,
) -> AppResult<serde_json::Value> {
    let conn = get_conn(pool)?;

    let mut stmt = conn.prepare(
        "SELECT m.winner, mp.team_num, m.playlist, m.start_time,
                m.is_overtime, m.score_blue, m.score_orange,
                mp.score, mp.goals, mp.assists, mp.saves, mp.shots, mp.demos
         FROM matches m
         JOIN match_players mp ON m.id = mp.match_id
         JOIN players p ON mp.player_id = p.id
         WHERE p.primary_id = ?1
           AND m.winner IS NOT NULL
           AND m.start_time >= ?2
           AND m.start_time < date(?3, '+1 day')
         ORDER BY m.start_time ASC",
    )?;

    let rows: Vec<(Option<i32>, i32, Option<String>, String, i32, i32, i32, i32, i32, i32, i32, i32, i32)> = stmt
        .query_map(
            rusqlite::params![local_primary_id, start_date, end_date],
            |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                    row.get(6)?,
                    row.get(7)?,
                    row.get(8)?,
                    row.get(9)?,
                    row.get(10)?,
                    row.get(11)?,
                    row.get(12)?,
                ))
            },
        )?
        .collect::<Result<Vec<_>, _>>()?;

    if rows.is_empty() {
        return Ok(serde_json::json!({ "available": false, "totalMatches": 0 }));
    }

    let mut by_playlist: std::collections::HashMap<String, (i32, i32)> = std::collections::HashMap::new();
    let mut by_hour: std::collections::HashMap<u32, (i32, i32)> = std::collections::HashMap::new();
    let mut ot_games = 0i32;
    let mut ot_wins = 0i32;
    let mut close_games = 0i32;
    let mut close_wins = 0i32;
    let mut blowout_games = 0i32;
    let mut blowout_wins = 0i32;
    let mut total_team_goals = 0i32;
    let mut total_my_goals = 0i32;
    let mut total_my_assists = 0i32;
    let mut total_my_saves = 0i32;
    let mut total_my_shots = 0i32;
    let mut total_my_demos = 0i32;

    for row in &rows {
        let (_winner, _team, playlist, start_time, is_overtime, score_blue, score_orange, _score, goals, assists, saves, shots, demos) = row;
        let playlist_key = playlist.clone().unwrap_or_else(|| "Desconocido".into());
        let entry = by_playlist.entry(playlist_key).or_insert((0, 0));
        entry.0 += 1;

        if let (Some(winner), team) = (_winner, _team) {
            let is_win = *winner == *team;
            if is_win { entry.1 += 1; }

            if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(start_time) {
                let hour = dt.hour();
                let he = by_hour.entry(hour).or_insert((0, 0));
                he.0 += 1;
                if is_win { he.1 += 1; }
            }

            if *is_overtime != 0 {
                ot_games += 1;
                if is_win { ot_wins += 1; }
            }

            let my_score = if *team == 0 { *score_blue } else { *score_orange };
            let their_score = if *team == 0 { *score_orange } else { *score_blue };
            let diff = my_score - their_score;
            if diff.abs() == 1 {
                close_games += 1;
                if is_win { close_wins += 1; }
            }
            if diff.abs() >= 4 {
                blowout_games += 1;
                if is_win { blowout_wins += 1; }
            }
        }

        total_team_goals += if *_team == 0 { *score_blue } else { *score_orange };
        total_my_goals += goals;
        total_my_assists += assists;
        total_my_saves += saves;
        total_my_shots += shots;
        total_my_demos += demos;
    }

    let mut team_stmt = conn.prepare(
        "SELECT SUM(assists), SUM(saves), SUM(shots), SUM(demos)
         FROM match_players mp
         JOIN matches m ON mp.match_id = m.id
         WHERE m.start_time >= ?1 AND m.start_time < date(?2, '+1 day')",
    )?;
    let (total_team_assists, total_team_saves, total_team_shots, total_team_demos): (i32, i32, i32, i32) = team_stmt.query_row(
        rusqlite::params![start_date, end_date],
        |row| Ok((row.get::<_, i32>(0)?, row.get::<_, i32>(1)?, row.get::<_, i32>(2)?, row.get::<_, i32>(3)?)),
    ).unwrap_or((0, 0, 0, 0));

    let mut best_playlist = String::new();
    let mut best_playlist_wr = 0f64;
    let mut playlist_stats = Vec::new();
    for (name, (played, won)) in &by_playlist {
        let wr = if *played > 0 { (*won as f64 / *played as f64) * 100.0 } else { 0.0 };
        if *played >= 3 && wr > best_playlist_wr {
            best_playlist_wr = wr;
            best_playlist = name.clone();
        }
        playlist_stats.push(serde_json::json!({
            "name": name, "played": played, "won": won,
            "winRate": wr.round() as i32,
        }));
    }
    playlist_stats.sort_by(|a, b| b["played"].as_i64().unwrap().cmp(&a["played"].as_i64().unwrap()));

    let mut best_hour = 0u32;
    let mut best_hour_wr = 0f64;
    let mut hour_stats = Vec::new();
    for (&hour, (played, won)) in &by_hour {
        let wr = if *played > 0 { (*won as f64 / *played as f64) * 100.0 } else { 0.0 };
        if *played >= 2 && wr > best_hour_wr {
            best_hour_wr = wr;
            best_hour = hour;
        }
        hour_stats.push(serde_json::json!({
            "hour": hour, "played": played, "won": won,
            "winRate": wr.round() as i32,
        }));
    }
    hour_stats.sort_by_key(|h| h["hour"].as_u64().unwrap());

    let total_matches = rows.len() as i32;

    Ok(serde_json::json!({
        "available": true,
        "totalMatches": total_matches,
        "playlists": playlist_stats,
        "bestPlaylist": if best_playlist.is_empty() { "N/A" } else { &best_playlist },
        "bestPlaylistWR": best_playlist_wr.round() as i32,
        "byHour": hour_stats,
        "bestHour": best_hour,
        "bestHourWR": best_hour_wr.round() as i32,
        "otGames": ot_games,
        "otWinRate": if ot_games > 0 { ((ot_wins as f64 / ot_games as f64) * 100.0).round() as i32 } else { 0 },
        "closeGames": close_games,
        "closeWinRate": if close_games > 0 { ((close_wins as f64 / close_games as f64) * 100.0).round() as i32 } else { 0 },
        "blowoutGames": blowout_games,
        "blowoutWinRate": if blowout_games > 0 { ((blowout_wins as f64 / blowout_games as f64) * 100.0).round() as i32 } else { 0 },
        "contrib": {
            "goalsPct": if total_team_goals > 0 { ((total_my_goals as f64 / total_team_goals as f64) * 100.0).round() as i32 } else { 0 },
            "assistsPct": if total_team_assists > 0 { ((total_my_assists as f64 / total_team_assists as f64) * 100.0).round() as i32 } else { 0 },
            "savesPct": if total_team_saves > 0 { ((total_my_saves as f64 / total_team_saves as f64) * 100.0).round() as i32 } else { 0 },
            "shotsPct": if total_team_shots > 0 { ((total_my_shots as f64 / total_team_shots as f64) * 100.0).round() as i32 } else { 0 },
            "demosPct": if total_team_demos > 0 { ((total_my_demos as f64 / total_team_demos as f64) * 100.0).round() as i32 } else { 0 },
        },
    }))
}
