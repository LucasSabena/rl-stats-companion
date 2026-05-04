use crate::core::metrics::{self, StreakData};
use crate::core::settings::get_settings;
use crate::core::storage::{self, get_conn};
use crate::AppState;
use serde::Deserialize;
use tauri::State;
use tracing::error;

#[derive(Deserialize)]
pub struct AnalyticsPeriod {
    pub days: i32,
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
) -> Result<Vec<storage::MatchSession>, String> {
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
