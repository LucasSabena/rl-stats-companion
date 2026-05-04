use crate::core::metrics::{self, StreakData};
use crate::core::settings::get_settings;
use crate::core::storage::{self, get_conn, MatchSession};
use crate::AppState;
use serde::Deserialize;
use tauri::State;
use tracing::error;

#[derive(Deserialize)]
pub struct AnalyticsPeriod {
    pub days: i32,
}

#[derive(Deserialize)]
pub struct SessionMatchesQuery {
    pub start_time: String,
    pub end_time: String,
}

#[tauri::command]
pub async fn get_analytics(
    state: State<'_, AppState>,
    period: AnalyticsPeriod,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;

    if period.days == 0 {
        return get_session_analytics_inner(state).await;
    }

    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(period.days as i64);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();

    let rollups = storage::get_daily_rollups(pool, &start_str, &end_str)
        .map_err(|e| e.to_string())?;

    let settings = get_settings(pool).unwrap_or_default();

    let total_matches: i32 = rollups.iter().map(|r| r.matches_played).sum();
    let wins: i32 = rollups.iter().map(|r| r.wins).sum();
    let losses: i32 = rollups.iter().map(|r| r.losses).sum();
    let total_goals: i32 = rollups.iter().map(|r| r.goals_scored).sum();
    let total_conceded: i32 = rollups.iter().map(|r| r.goals_conceded).sum();
    let total_shots: i32 = rollups.iter().map(|r| r.total_shots).sum();
    let total_saves: i32 = rollups.iter().map(|r| r.total_saves).sum();
    let total_demos: i32 = rollups.iter().map(|r| r.total_demos).sum();
    let total_assists: i32 = rollups.iter().map(|r| r.total_assists).sum();
    let avg_duration: f64 = if total_matches > 0 {
        rollups
            .iter()
            .map(|r| r.avg_duration_seconds as f64 * r.matches_played as f64)
            .sum::<f64>()
            / total_matches as f64
    } else {
        0.0
    };

    let (avg_score, _player_assists, peak_speed) = if let Some(ref local_id) = settings.local_primary_id {
        get_player_period_stats(pool, local_id, &start_str, &end_str).unwrap_or((0.0, 0, 0.0))
    } else {
        (0.0, 0, 0.0)
    };

    let streak = if let Some(ref local_id) = settings.local_primary_id {
        metrics::calculate_streaks(pool, local_id, &start_str, &end_str)
            .unwrap_or(StreakData { best_streak: 0, current_streak: 0 })
    } else {
        StreakData { best_streak: 0, current_streak: 0 }
    };

    let avg_goals = if total_matches > 0 { total_goals as f64 / total_matches as f64 } else { 0.0 };
    let avg_assists = if total_matches > 0 { total_assists as f64 / total_matches as f64 } else { 0.0 };
    let avg_saves = if total_matches > 0 { total_saves as f64 / total_matches as f64 } else { 0.0 };
    let avg_shots = if total_matches > 0 { total_shots as f64 / total_matches as f64 } else { 0.0 };

    Ok(serde_json::json!({
        "rollups": rollups,
        "summary": {
            "period": if period.days == 1 { "day" } else if period.days == 7 { "week" } else { "month" },
            "totalMatches": total_matches,
            "wins": wins,
            "losses": losses,
            "winRate": if total_matches > 0 { ((wins as f64 / total_matches as f64) * 100.0).round() as i32 } else { 0 },
            "avgScore": avg_score,
            "avgGoals": avg_goals,
            "avgAssists": avg_assists,
            "avgSaves": avg_saves,
            "avgShots": avg_shots,
            "avgBoost": 0.0,
            "totalGoals": total_goals,
            "totalAssists": total_assists,
            "totalSaves": total_saves,
            "totalShots": total_shots,
            "totalDemos": total_demos,
            "totalConceded": total_conceded,
            "bestStreak": streak.best_streak,
            "currentStreak": streak.current_streak,
            "peakSpeed": peak_speed,
            "avgDuration": avg_duration,
        }
    }))
}

#[tauri::command]
pub async fn get_sessions(
    state: State<'_, AppState>,
    gap_minutes: Option<u32>,
) -> Result<Vec<MatchSession>, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let minutes = gap_minutes.unwrap_or(settings.session_gap_minutes);

    storage::get_match_sessions(pool, minutes)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_daily_rollups(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    match storage::get_daily_rollups(pool, &start_date, &end_date) {
        Ok(rollups) => Ok(serde_json::json!({ "rollups": rollups })),
        Err(e) => {
            error!(error = %e, "Failed to get daily rollups");
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_session_matches(
    state: State<'_, AppState>,
    query: SessionMatchesQuery,
) -> Result<Vec<serde_json::Value>, String> {
    let pool = &state.db_pool;
    let conn = get_conn(pool).map_err(|e| e.to_string())?;
    let settings = get_settings(pool).unwrap_or_default();

    let mut stmt = conn.prepare(
        "SELECT m.id, m.guid, m.start_time, m.end_time, m.arena,
                m.score_blue, m.score_orange, m.winner,
                m.is_online, m.is_overtime, m.duration_seconds,
                m.match_type, m.playlist
         FROM matches m
         WHERE m.start_time >= ?1 AND m.start_time <= ?2
         ORDER BY m.start_time ASC"
    ).map_err(|e| e.to_string())?;

    let matches: Vec<serde_json::Value> = stmt.query_map(
        rusqlite::params![&query.start_time, &query.end_time],
        |row| {
            let match_id: i64 = row.get(0)?;
            let guid: String = row.get(1)?;
            let start_time: String = row.get(2)?;
            let end_time: Option<String> = row.get(3)?;
            let arena: Option<String> = row.get(4)?;
            let score_blue: i32 = row.get(5)?;
            let score_orange: i32 = row.get(6)?;
            let winner: Option<i32> = row.get(7)?;
            let is_online: i32 = row.get(8)?;
            let is_overtime: i32 = row.get(9)?;
            let duration_seconds: i32 = row.get(10)?;
            let match_type: Option<String> = row.get(11)?;
            let playlist: Option<String> = row.get(12)?;

            Ok(serde_json::json!({
                "id": match_id,
                "guid": guid,
                "start_time": start_time,
                "end_time": end_time,
                "arena": arena,
                "score_blue": score_blue,
                "score_orange": score_orange,
                "winner": winner,
                "is_online": is_online != 0,
                "is_overtime": is_overtime != 0,
                "duration_seconds": duration_seconds,
                "match_type": match_type,
                "playlist": playlist,
            }))
        },
    ).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for m in matches {
        let match_id = m["id"].as_i64().unwrap();
        let mut player_stmt = conn.prepare(
            "SELECT mp.team_num, mp.score, mp.goals, mp.shots, mp.assists,
                    mp.saves, mp.demos, mp.speed, mp.boost,
                    mp.touches, p.name, p.primary_id
             FROM match_players mp
             JOIN players p ON mp.player_id = p.id
             WHERE mp.match_id = ?1"
        ).map_err(|e| e.to_string())?;

        let players: Vec<serde_json::Value> = player_stmt.query_map(
            rusqlite::params![match_id],
            |row| {
                Ok(serde_json::json!({
                    "team_num": row.get::<_, i32>(0)?,
                    "score": row.get::<_, i32>(1)?,
                    "goals": row.get::<_, i32>(2)?,
                    "shots": row.get::<_, i32>(3)?,
                    "assists": row.get::<_, i32>(4)?,
                    "saves": row.get::<_, i32>(5)?,
                    "demos": row.get::<_, i32>(6)?,
                    "speed": row.get::<_, f64>(7)?,
                    "boost": row.get::<_, i32>(8)?,
                    "touches": row.get::<_, i32>(9)?,
                    "name": row.get::<_, String>(10)?,
                    "primary_id": row.get::<_, String>(11)?,
                }))
            },
        ).map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

        let local_team = if let Some(ref lid) = settings.local_primary_id {
            players.iter()
                .find(|p| p["primary_id"].as_str() == Some(lid.as_str()))
                .and_then(|p| p["team_num"].as_i64())
                .map(|t| t as i32)
        } else {
            None
        };

        let is_win = match (m["winner"].as_i64(), local_team) {
            (Some(w), Some(lt)) if w == lt as i64 => true,
            _ => false,
        };

        let my_diffs = local_team.map(|lt| {
            let scored = m[if lt == 0 { "score_blue" } else { "score_orange" }].as_i64().unwrap_or(0);
            let conceded = m[if lt == 0 { "score_orange" } else { "score_blue" }].as_i64().unwrap_or(0);
            scored - conceded
        });

        result.push(serde_json::json!({
            "id": match_id,
            "guid": m["guid"],
            "start_time": m["start_time"],
            "end_time": m["end_time"],
            "arena": m["arena"],
            "score_blue": m["score_blue"],
            "score_orange": m["score_orange"],
            "winner": m["winner"],
            "is_online": m["is_online"],
            "is_overtime": m["is_overtime"],
            "duration_seconds": m["duration_seconds"],
            "match_type": m["match_type"],
            "playlist": m["playlist"],
            "players": players,
            "local_team": local_team,
            "is_win": is_win,
            "goal_diff": my_diffs,
        }));
    }

    Ok(result)
}

#[tauri::command]
pub async fn get_insights(
    state: State<'_, AppState>,
    period: AnalyticsPeriod,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let local_id = match settings.local_primary_id {
        Some(ref id) => id.clone(),
        None => return Ok(serde_json::json!({ "available": false })),
    };

    let days = if period.days == 0 { 365 } else { period.days as i64 };
    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(days);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();

    let insights = storage::get_insights(pool, &local_id, &start_str, &end_str)
        .map_err(|e| e.to_string())?;

    Ok(insights)
}

async fn get_session_analytics_inner(
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let pool = &state.db_pool;
    let settings = get_settings(pool).unwrap_or_default();
    let sessions = storage::get_match_sessions(pool, settings.session_gap_minutes)
        .map_err(|e| e.to_string())?;

    let total_matches: i32 = sessions.iter().map(|s| s.match_count).sum();
    let wins: i32 = sessions.iter().map(|s| s.wins).sum();
    let losses: i32 = sessions.iter().map(|s| s.losses).sum();
    let total_goals: i32 = sessions.iter().map(|s| s.goals_scored).sum();
    let total_conceded: i32 = sessions.iter().map(|s| s.goals_conceded).sum();
    let total_shots: i32 = sessions.iter().map(|s| s.total_shots).sum();
    let total_saves: i32 = sessions.iter().map(|s| s.total_saves).sum();

    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(365);
    let start_str = start.format("%Y-%m-%d").to_string();
    let end_str = end.format("%Y-%m-%d").to_string();

    let (avg_score, total_assists, peak_speed) = if let Some(ref local_id) = settings.local_primary_id {
        get_player_period_stats(pool, local_id, &start_str, &end_str).unwrap_or((0.0, 0, 0.0))
    } else {
        (0.0, 0, 0.0)
    };

    let total_demos = if let Some(ref local_id) = settings.local_primary_id {
        get_player_demos(pool, local_id).unwrap_or(0)
    } else {
        0
    };

    let avg_duration: f64 = if total_matches > 0 {
        sessions.iter().map(|s| s.duration_seconds as f64).sum::<f64>() / total_matches as f64
    } else {
        0.0
    };

    let streak = if let Some(ref local_id) = settings.local_primary_id {
        metrics::calculate_streaks_for_sessions(pool, local_id)
            .unwrap_or(StreakData { best_streak: 0, current_streak: 0 })
    } else {
        StreakData { best_streak: 0, current_streak: 0 }
    };

    let avg_goals = if total_matches > 0 { total_goals as f64 / total_matches as f64 } else { 0.0 };
    let avg_assists = if total_matches > 0 { total_assists as f64 / total_matches as f64 } else { 0.0 };
    let avg_saves = if total_matches > 0 { total_saves as f64 / total_matches as f64 } else { 0.0 };
    let avg_shots = if total_matches > 0 { total_shots as f64 / total_matches as f64 } else { 0.0 };

    Ok(serde_json::json!({
        "sessions": sessions,
        "summary": {
            "totalMatches": total_matches,
            "wins": wins,
            "losses": losses,
            "avgScore": avg_score,
            "avgGoals": avg_goals,
            "avgAssists": avg_assists,
            "avgSaves": avg_saves,
            "avgShots": avg_shots,
            "avgBoost": 0.0,
            "totalGoals": total_goals,
            "totalAssists": total_assists,
            "totalSaves": total_saves,
            "totalShots": total_shots,
            "totalDemos": total_demos,
            "totalConceded": total_conceded,
            "bestStreak": streak.best_streak,
            "currentStreak": streak.current_streak,
            "peakSpeed": peak_speed,
            "avgDuration": avg_duration,
        }
    }))
}

fn get_player_period_stats(
    pool: &crate::core::storage::DbPool,
    local_primary_id: &str,
    start_date: &str,
    end_date: &str,
) -> Result<(f64, i32, f64), String> {
    let conn = get_conn(pool).map_err(|e| e.to_string())?;
    let (avg_score, total_assists, peak_speed): (f64, i32, f64) = conn
        .query_row(
            "SELECT
                COALESCE(AVG(mp.score), 0.0),
                COALESCE(SUM(mp.assists), 0),
                COALESCE(MAX(mp.speed), 0.0)
             FROM match_players mp
             JOIN matches m ON mp.match_id = m.id
             JOIN players p ON mp.player_id = p.id
             WHERE p.primary_id = ?1
               AND m.start_time >= ?2
               AND m.start_time < date(?3, '+1 day')",
            rusqlite::params![local_primary_id, start_date, end_date],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|e| e.to_string())?;
    Ok((avg_score, total_assists, peak_speed))
}

fn get_player_demos(
    pool: &crate::core::storage::DbPool,
    local_primary_id: &str,
) -> Result<i32, String> {
    let conn = get_conn(pool).map_err(|e| e.to_string())?;
    let demos: i32 = conn
        .query_row(
            "SELECT COALESCE(SUM(mp.demos), 0)
             FROM match_players mp
             JOIN players p ON mp.player_id = p.id
             WHERE p.primary_id = ?1",
            rusqlite::params![local_primary_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    Ok(demos)
}
