use crate::core::settings::get_settings;
use crate::core::storage;
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
        // Special value: "session" period — use session grouping.
        return get_session_analytics_inner(state).await;
    }

    let end = chrono::Utc::now();
    let start = end - chrono::Duration::days(period.days as i64);

    match storage::get_daily_rollups(
        pool,
        &start.format("%Y-%m-%d").to_string(),
        &end.format("%Y-%m-%d").to_string(),
    ) {
        Ok(rollups) => Ok(serde_json::json!({ "rollups": rollups })),
        Err(e) => {
            error!(error = %e, "Failed to get analytics");
            Err(e.to_string())
        }
    }
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
    let total_shots: i32 = sessions.iter().map(|s| s.total_shots).sum();
    let total_saves: i32 = sessions.iter().map(|s| s.total_saves).sum();
    let _total_conceded: i32 = sessions.iter().map(|s| s.goals_conceded).sum();
    let avg_duration: f64 = if total_matches > 0 {
        sessions.iter().map(|s| s.duration_seconds as f64).sum::<f64>() / total_matches as f64
    } else {
        0.0
    };

    Ok(serde_json::json!({
        "sessions": sessions,
        "summary": {
            "totalMatches": total_matches,
            "wins": wins,
            "losses": losses,
            "avgScore": if total_matches > 0 { total_goals as f64 / total_matches as f64 } else { 0.0 },
            "avgGoals": if total_matches > 0 { total_goals as f64 / total_matches as f64 } else { 0.0 },
            "avgAssists": 0.0,
            "avgSaves": if total_matches > 0 { total_saves as f64 / total_matches as f64 } else { 0.0 },
            "avgShots": if total_matches > 0 { total_shots as f64 / total_matches as f64 } else { 0.0 },
            "avgBoost": 0.0,
            "totalGoals": total_goals,
            "totalAssists": 0,
            "totalSaves": total_saves,
            "totalShots": total_shots,
            "totalDemos": 0,
            "bestStreak": 0,
            "currentStreak": 0,
            "peakSpeed": 0.0,
            "avgDuration": avg_duration,
        }
    }))
}
